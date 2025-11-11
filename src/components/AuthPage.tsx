'use client';

import React, { useState } from 'react';
import AuthForm from './AuthForm';

const AuthPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="relative w-full mx-auto min-h-screen p-4 sm:p-8 bg-background">
      {/* Animated background elements - only show in light mode */}
      <div className="absolute inset-0 overflow-hidden dark:hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative max-w-md mx-auto backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border mt-[88px] bg-card/90 text-card-foreground border-border/20">
        {!showSuccess && (
          <div className="text-center space-y-6 mb-8">
            <img
              src="/logotype.png"
              alt="Home Crew Logo"
              className="w-[17rem] md:w-[25rem] h-auto mx-auto"
              style={{ aspectRatio: '731/341' }}
            />

            <p className="text-lg max-w-sm mx-auto leading-relaxed text-muted-foreground">
              Sign in to your account or create a new one to manage household chores.
            </p>
          </div>
        )}

        <AuthForm onSuccessChange={setShowSuccess} />
      </div>

      {/* Welcome image - bottom right corner, desktop only */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-10">
        <img
          src="/welcome_to_home_crew.png"
          alt="Welcome to Home Crew"
          className="w-[23rem] h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>
  );
};

export default AuthPage;
