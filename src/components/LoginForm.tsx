"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "@/lib/validation/auth.schemas";

interface LoginFormProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  loading: boolean;
  onModeChange?: (mode: "login" | "register" | "reset-password") => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onError, onLoading, loading, onModeChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      onLoading(true);
      onError("");

      // TODO: Implement actual login logic with Supabase Auth
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Login attempt:", data);

      // Simulate success for demo purposes
      // In real implementation, this would redirect to dashboard
      alert("Login functionality will be implemented with Supabase Auth");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Login failed");
    } finally {
      onLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onModeChange) {
      onModeChange("reset-password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          placeholder="your@email.com"
          autoComplete="email"
          {...register("email")}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
            errors.email ? "border-destructive" : "border-border"
          }`}
          disabled={loading}
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
            errors.password ? "border-destructive" : "border-border"
          }`}
          disabled={loading}
        />
        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleForgotPassword}
          className="px-0 text-sm text-muted-foreground hover:text-foreground whitespace-normal"
          disabled={loading}
        >
          Forgot password?
        </Button>
      </div>

      <Button type="submit" size="lg" className="w-full whitespace-normal" disabled={isSubmitting || loading}>
        {isSubmitting || loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

export default LoginForm;
