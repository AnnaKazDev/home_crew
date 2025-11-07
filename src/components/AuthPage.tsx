"use client";

import React, { useEffect, useState } from "react";
import AuthForm from "./AuthForm";

const AuthPage: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      setIsDark(hasDarkClass);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`relative w-full mx-auto min-h-screen p-4 sm:p-8 ${
        isDark
          ? "bg-black"
          : "bg-gradient-to-br from-indigo-50 via-blue-50/80 to-purple-50"
      }`}
      style={{
        backgroundColor: isDark ? '#000000' : undefined,
        background: isDark
          ? '#000000'
          : 'linear-gradient(to bottom right, rgb(248 250 252), rgb(239 246 255 / 0.3), rgb(238 242 255 / 0.4))'
      }}
    >
      {/* Animated background elements - only show in light mode */}
      {!isDark && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-float"
          >
          </div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          >
          </div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "4s" }}
          >
          </div>
        </div>
      )}

      <div
        className={`relative max-w-md mx-auto backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border mt-16 ${
          isDark
            ? "bg-gray-900/90 text-white border-gray-700/50"
            : "bg-white/90 text-gray-900 border-white/20"
        }`}
        style={{
          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: isDark ? '#ffffff' : '#111827',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.2)'
        }}
      >
        {!showSuccess && (
          <div className="text-center space-y-6 mb-8">
            <img
              src="/logotype.png"
              alt="Home Crew Logo"
              className="w-[17rem] md:w-[25rem] h-auto mx-auto"
            />

            <p className={`text-lg max-w-sm mx-auto leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}>
              Sign in to your account or create a new one to manage household chores.
            </p>
          </div>
        )}

        <AuthForm onSuccessChange={setShowSuccess} />
      </div>
    </div>
  );
};

export default AuthPage;
