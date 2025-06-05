import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SubscribePage from "./pages/SubscribePage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import FAQPage from "./pages/FAQPage";
import MysticHeader from "./components/MysticHeader";
import StarBackground from "./components/StarBackground";
import { AnimatePresence } from "framer-motion";
import AuthTest from "./components/AuthTest";
import ResetPassword from "./pages/ResetPassword";

// A wrapper to get location inside BrowserRouter
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/subscribe" element={<SubscribePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserProfilePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/authtest" element={<AuthTest />} />
        <Route path="/reset" element={<ResetPassword />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-[#321354] text-gold-100 overflow-hidden">
        <StarBackground />
        <div className="relative z-10">
          <MysticHeader />
          <AnimatedRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}
