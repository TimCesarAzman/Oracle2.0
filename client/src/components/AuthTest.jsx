import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState(null);

  async function register() {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw, name }),
    });
    setStatus(JSON.stringify(await res.json()));
  }

  async function login() {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });
    const data = await res.json();
    setStatus(JSON.stringify(data));
    if (data.token) localStorage.setItem("token", data.token);
  }

  async function getMyProfile() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/profile`, {
      headers: { Authorization: "Bearer " + token },
    });
    setProfile(await res.json());
  }

  return (
    <div className="flex flex-col gap-3 max-w-xs mx-auto mt-10">
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={pw} onChange={e => setPw(e.target.value)} />
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>
      <button onClick={getMyProfile}>Get Profile</button>
      <div>Status: {status}</div>
      <pre>{profile && JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
