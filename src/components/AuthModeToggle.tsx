"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { AuthMode } from "./AuthForm";

interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const AuthModeToggle: React.FC<AuthModeToggleProps> = ({ mode, onModeChange }) => {
  const getButtonVariant = (buttonMode: AuthMode) => {
    return mode === buttonMode ? "default" : "ghost";
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-lg bg-secondary p-1 shadow-sm">
        <Button
          type="button"
          variant={getButtonVariant("login")}
          size="sm"
          onClick={() => onModeChange("login")}
          className="px-4 py-2 text-sm font-medium transition-all duration-200 dark:text-black dark:hover:text-black"
        >
          Sign in
        </Button>
        <Button
          type="button"
          variant={getButtonVariant("register")}
          size="sm"
          onClick={() => onModeChange("register")}
          className="px-4 py-2 text-sm font-medium transition-all duration-200 dark:text-black dark:hover:text-black"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default AuthModeToggle;
