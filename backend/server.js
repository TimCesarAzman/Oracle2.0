require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const  { OpenAI }  = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SYSTEM_PROMPT = require('./oraclePrompts.js');


const app = express();
const USERS_PATH = path.join(__dirname, "users.json");
const RESET_TOKENS_PATH = path.join(__dirname, "reset-tokens.json");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const PORT = process.env.PORT || 4000;

// Stripe prices
const SUBSCRIPTION_PLANS = {
  starter: 'price_1RSGVSIjxCgqj5fkBcTW67iK',
  seeker: 'price_1RSGVsIjxCgqj5fkTh1sUR0q',
  pathfinder: 'price_1RSzi0IjxCgqj5fkXbIBGhbz',
  unlimited: 'price_1RSGWDIjxCgqj5fkvieUDyeM'
};

// Minutes per plan:
const PLAN_MINUTES = {
  starter: 20,
  seeker: 60,
  pathfinder: 720,   // 12 hours
  unlimited: 1440,   // 24 hours
  None: 0,
};

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
// --- Helper functions ---
function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getPlanMinutes(plan) {
  return PLAN_MINUTES[plan && plan.toLowerCase()] || 0;
}
function maybeResetMinutes(user) {
  const today = getToday();
  if (user.lastChatDate !== today) {
    user.lastChatDate = today;
    user.minutesLeftToday = getPlanMinutes(user.plan);
    user.usedMinutesToday = 0;
    return true;
  }
  if (typeof user.minutesLeftToday !== "number") {
    user.minutesLeftToday = getPlanMinutes(user.plan);
  }
  return false;
}
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}
function loadTokens() {
  if (!fs.existsSync(RESET_TOKENS_PATH)) return [];
  return JSON.parse(fs.readFileSync(RESET_TOKENS_PATH, "utf8"));
}
function saveTokens(tokens) {
  fs.writeFileSync(RESET_TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

// --- Middleware ---
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mysticoracle.com"
  ],
  credentials: true
}));
app.use(express.json());

// --- Session/Passport Setup ---
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// --- Authentication Middleware ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing token" });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

// --- Anti-spam: one pending question per user ---
const chatLocks = new Map();
function antiSpam(req, res, next) {
  const userId = req.user?.id;
  if (chatLocks.get(userId)) {
    return res.status(429).json({ error: "Wait for Oracle's answer before asking again." });
  }
  next();
}

// --- In-memory answer cache (reset on restart) ---
const recentAnswerCache = new Map();

// --- CHAT (AI, streaming, delay, language, anti-spam) ---
app.post("/api/chat", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  let users = loadUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const user = users[idx];
  maybeResetMinutes(user);

  // Only allow if subscribed and has minutes left
  if (!user.plan || user.plan === "None") return res.status(403).json({ error: "No subscription" });
  if ((user.minutesLeftToday || 0) <= 0) return res.status(403).json({ error: "No minutes left today" });

  // --- Anti-spam: Only one question at a time ---
  if (chatLocks.get(userId)) {
    return res.status(429).json({ error: "Oracle is contemplating your last question. Please wait for her reply." });
  }
  chatLocks.set(userId, true);

  try {
    // Get language, default to "en"
    let lang = (req.body.lang || user.language || "en").toLowerCase();
    if (!SYSTEM_PROMPT[lang]) lang = "en";
    user.language = lang;

    user.chatHistory = user.chatHistory || [];

    const message = req.body.message;
    if (!message || !message.trim()) throw new Error("Empty message");

    // Simulate "thinking" delay: 3–5 min
    const delayMs = 1800 + Math.floor(Math.random() * 1200); // 180,000–300,000 ms  180000 + Math.floor(Math.random() * 120000);
    await new Promise(res => setTimeout(res, delayMs));

    user.chatHistory.push({ role: "user", content: message });

    const context = [
      { role: "system", content: SYSTEM_PROMPT[lang] },
      ...user.chatHistory.slice(-10)
    ];

    // OpenAI call (not streaming)
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: context,
      max_tokens: 100,
      temperature: 0.95
    });

    const answer = completion.choices[0].message.content;

    // Save Oracle's answer to history and deduct minute
    user.chatHistory.push({ role: "assistant", content: answer });
    user.questions = user.questions || [];
    user.questions.push({ q: message, a: answer });
    user.minutesLeftToday = Math.max(0, (user.minutesLeftToday || 0) - 1);
    user.usedMinutesToday = (user.usedMinutesToday || 0) + 1;
    saveUsers(users);

    res.json({ answer, minutesLeft: user.minutesLeftToday });

  } catch (err) {
    console.error("Oracle error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Oracle cannot see your fate at this moment." });
    }
  } finally {
    chatLocks.set(userId, false);
  }
});


// --- Registration ---
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });
  let users = loadUsers();
  if (users.find(u => u.email === email)) return res.status(409).json({ error: "Email exists" });
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now(),
    email,
    name: name || "",
    password: hashed,
    plan: "None",
    created: new Date(),
    lastChatDate: getToday(),
    minutesLeftToday: 0,
    usedMinutesToday: 0,
    language: "en"
  };
  users.push(user);
  saveUsers(users);
  res.json({ success: true });
});

// --- Login ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  let users = loadUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return res.status(401).json({ error: "Invalid email or password" });
  const user = users[idx];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid email or password" });
  maybeResetMinutes(user);
  saveUsers(users);
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan: user.plan }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan, minutesLeftToday: user.minutesLeftToday }
  });
});

// --- Password Reset: Request Link ---
app.post("/api/request-reset", async (req, res) => {
  const { email } = req.body;
  let users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.json({ success: true }); // privacy

  // Generate reset token
  const token = Math.random().toString(36).substring(2) + Date.now();
  let tokens = loadTokens();
  tokens.push({ email, token, expires: Date.now() + 15 * 60 * 1000 });
  saveTokens(tokens);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const resetUrl = `http://localhost:5173/reset?token=${token}`;
  await transporter.sendMail({
    from: '"Mystic Oracle" <oracle@example.com>',
    to: email,
    subject: "Reset your Mystic Oracle password",
    html: `Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 15 minutes.`
  });
  res.json({ success: true });
});

// --- Password Reset: Perform Reset ---
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  let tokens = loadTokens();
  const tokenData = tokens.find(t => t.token === token && t.expires > Date.now());
  if (!tokenData) return res.status(400).json({ error: "Invalid or expired token." });

  let users = loadUsers();
  const idx = users.findIndex(u => u.email === tokenData.email);
  if (idx === -1) return res.status(404).json({ error: "User not found." });
  users[idx].password = await bcrypt.hash(newPassword, 10);
  saveUsers(users);

  tokens = tokens.filter(t => t.token !== token);
  saveTokens(tokens);
  res.json({ success: true });
});

// --- Stripe checkout ---
app.post("/api/create-checkout-session", async (req, res) => {
  const { plan, email } = req.body;
  const priceId = SUBSCRIPTION_PLANS[plan];
  if (!priceId) return res.status(400).json({ error: "Invalid plan name" });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.FRONTEND_SUCCESS_URL,
      cancel_url: process.env.FRONTEND_CANCEL_URL
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Stripe session creation failed", details: err.message });
  }
});

// --- Stripe webhook handler ---
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      endpointSecret
    );
  } catch (err) {
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;
    const subscriptionId = session.subscription;
    let users = loadUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx !== -1) {
      users[idx].plan = "starter"; // You may need to determine actual plan!
      users[idx].lastChatDate = getToday();
      users[idx].minutesLeftToday = getPlanMinutes(users[idx].plan);
      users[idx].subscriptionId = subscriptionId;
      saveUsers(users);
    }
  }
  res.sendStatus(200);
});

// --- Email/Password update ---
app.post("/api/update-email", authMiddleware, async (req, res) => {
  const { newEmail, password } = req.body;
  if (!newEmail || !password) return res.status(400).json({ error: "Missing fields" });
  let users = loadUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const match = await bcrypt.compare(password, users[idx].password);
  if (!match) return res.status(403).json({ error: "Invalid password" });
  if (users.some(u => u.email === newEmail && u.id !== req.user.id))
    return res.status(409).json({ error: "Email already in use" });
  users[idx].email = newEmail;
  saveUsers(users);
  res.json({ success: true });
});
app.post("/api/update-password", authMiddleware, async (req, res) => {
  const { newPassword, password } = req.body;
  if (!newPassword || !password) return res.status(400).json({ error: "Missing fields" });
  let users = loadUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const match = await bcrypt.compare(password, users[idx].password);
  if (!match) return res.status(403).json({ error: "Invalid password" });
  users[idx].password = await bcrypt.hash(newPassword, 10);
  saveUsers(users);
  res.json({ success: true });
});

// --- Google OAuth2 ---
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, function(accessToken, refreshToken, profile, cb) {
  let users = loadUsers();
  let user = users.find(u => u.email === profile.emails[0].value);
  if (!user) {
    user = {
      id: Date.now(),
      email: profile.emails[0].value,
      name: profile.displayName,
      plan: "None",
      created: new Date(),
      lastChatDate: getToday(),
      minutesLeftToday: 0,
      usedMinutesToday: 0,
      language: "en"
    };
    users.push(user);
    saveUsers(users);
  } else {
    if (!("lastChatDate" in user)) user.lastChatDate = getToday();
    if (!("minutesLeftToday" in user)) user.minutesLeftToday = getPlanMinutes(user.plan);
    saveUsers(users);
  }
  cb(null, user);
}));
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    const user = req.user;
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, plan: user.plan }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`http://localhost:5173/login?token=${token}`);
  }
);

// --- User Profile (refreshes minutes) ---
app.get("/api/profile", authMiddleware, (req, res) => {
  let users = loadUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  maybeResetMinutes(users[idx]);
  saveUsers(users);
  const user = users[idx];
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    created: user.created,
    minutesLeftToday: user.minutesLeftToday || 0,
    usedMinutesToday: user.usedMinutesToday || 0,
    renewal: user.renewal || "-", // fill as needed
    usage: user.usedMinutesToday ? `${user.usedMinutesToday} min used today` : "-",
    questions: user.questions || [],
    language: user.language || "en"
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Mystic Oracle Backend running on port ${PORT}`);
});
