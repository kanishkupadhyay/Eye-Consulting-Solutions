"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../LoginForm/LoginForm";
import RegisterForm from "../RegisterForm/RegisterForm";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // ✅ Typewriter state
  const lines = ["Hire faster.", "Build better", "teams."];
  const [displayed, setDisplayed] = useState(["", "", ""]);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;

    const type = () => {
      if (lineIndex >= lines.length) return;

      const current = lines[lineIndex];

      setDisplayed((prev) => {
        const updated = [...prev];
        updated[lineIndex] = current.slice(0, charIndex + 1);
        return updated;
      });

      charIndex++;

      if (charIndex === current.length) {
        lineIndex++;
        charIndex = 0;
      }

      setTimeout(type, 40);
    };

    type();
  }, []);

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left panel */}
      <div className="hidden md:flex relative w-1/2 items-center px-20 overflow-hidden">

        {/* 🎥 Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src="/videos/bg.mp4" type="video/mp4" />
        </video>

        {/* 🌑 Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/60 backdrop-blur-[2px]" />

        {/* ✅ Top Left Branding */}
        <div className="absolute top-6 left-10 z-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>

          <h2 className="text-white text-2xl font-bold tracking-wide">
            Talent<span className="text-blue-400">Flow</span>
          </h2>
        </div>

        <div className="relative z-20 max-w-lg">
          {/* ✅ TYPEWRITER HEADING */}
          <h1 className="text-[70px] leading-[1.05] font-extrabold tracking-tight text-white">
            <div>
              {displayed[0].replace("faster.", "")}
              <span className="text-blue-500">
                {displayed[0].includes("faster.") ? "faster." : ""}
              </span>
            </div>

            <div>
              {displayed[1].replace("better", "")}
              <span className="text-blue-500">
                {displayed[1].includes("better") ? "better" : ""}
              </span>
            </div>

            <div>
              {displayed[2]}
              <span className="animate-pulse">|</span>
            </div>
          </h1>

          <p className="mt-6 text-white text-[18px] leading-[30px] max-w-md">
            A complete recruitment suite – track candidates, manage pipelines,
            collaborate with hiring managers, and close roles 3x faster.
          </p>
        </div>

        {/* ✅ Moving Bottom Text */}
        <div className="absolute bottom-6 left-0 w-full overflow-hidden z-20">
          <motion.div
            className="whitespace-nowrap text-white text-lg font-semibold"
            animate={{ x: ["100%", "-100%"] }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "linear",
            }}
          >
            {"Let's transform recruitment together"}
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative flex flex-1 items-center justify-center bg-[#fff] px-6">
        {/* ✅ Logo */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={250}
          height={250}
          className="absolute top-6 right-6 object-contain"
        />

        <div className="w-full max-w-md">
          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-[40px] text-gray-800 tracking-tight [font-smooth:antialiased]">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="mb-8 text-gray-500 text-sm">
                {isLogin
                  ? "Sign in to your TalentFlow workspace"
                  : "Start hiring smarter today"}
              </p>
            </motion.div>
          </AnimatePresence>

          {isLogin ? (
            <LoginForm />
          ) : (
            <RegisterForm isRegisteredSuccessfully={() => setIsLogin(true)} />
          )}

          {/* Toggle */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-orange-500 font-semibold cursor-pointer hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}