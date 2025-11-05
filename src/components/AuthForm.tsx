"use client";

import React, { useState } from "react";
import AuthModeToggle from "./AuthModeToggle";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ResetPasswordForm from "./ResetPasswordForm";
import AuthErrorDisplay from "./AuthErrorDisplay";

export type AuthMode = "login" | "register" | "reset-password";

interface AuthFormProps {
  onSuccessChange?: (showSuccess: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccessChange }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleSuccess = (isSuccess: boolean) => {
    setShowSuccess(isSuccess);
    onSuccessChange?.(isSuccess);
  };

  const renderForm = () => {
    switch (mode) {
      case "login":
        return <LoginForm onError={handleError} onLoading={handleLoading} loading={loading} onModeChange={handleModeChange} />;
      case "register":
        return <RegisterForm onError={handleError} onLoading={handleLoading} loading={loading} onSuccess={handleSuccess} />;
      case "reset-password":
        return <ResetPasswordForm onError={handleError} onLoading={handleLoading} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" suppressHydrationWarning={true}>
      {!showSuccess && <AuthModeToggle mode={mode} onModeChange={handleModeChange} />}

      {error && <AuthErrorDisplay error={error} />}

      {renderForm()}
    </div>
  );
};

export default AuthForm;
