"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerSchema, type RegisterFormData } from "@/lib/validation/auth.schemas";

interface RegisterFormProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  loading: boolean;
}

interface RegistrationSuccess {
  pin: string;
  householdName: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onError, onLoading, loading }) => {
  const [successData, setSuccessData] = useState<RegistrationSuccess | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "admin", // Default to admin
    },
  });

  const selectedRole = watch("role");

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      onLoading(true);
      onError("");

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Success - show PIN for admin or redirect for member
      if (data.role === 'admin') {
        setSuccessData({
          pin: result.pin,
          householdName: result.household.name
        });
      } else {
        // For members, redirect immediately
        window.location.href = '/daily_chores';
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      onLoading(false);
    }
  };

  // Show success screen for admin registration
  if (successData) {
    return (
      <Card className="w-full max-w-md mx-auto bg-green-50 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-green-800 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Registration Successful!
          </CardTitle>
          <CardDescription className="text-green-700">
            Your household <strong>{successData.householdName}</strong> has been created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-green-700 mb-2">
              Share this PIN with your family members so they can join your household:
            </p>
            <p className="text-xs text-green-600 mb-2">
              You can also find this PIN later in the Household settings
            </p>
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="text-2xl font-mono font-bold text-green-800 tracking-wider">
                {successData.pin}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => copyToClipboard(successData.pin)}
            >
              Copy PIN
            </Button>
            <Button
              type="button"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/daily_chores'}
            >
              Continue to App
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Full name *
        </label>
        <input
          type="text"
          id="name"
          placeholder="John Doe"
          autoComplete="name"
          {...register("name")}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
            errors.name ? "border-destructive" : "border-border"
          }`}
          disabled={loading}
          maxLength={100}
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email address *
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
          Password *
        </label>
        <input
          type="password"
          id="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          {...register("password")}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
            errors.password ? "border-destructive" : "border-border"
          }`}
          disabled={loading}
        />
        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
          Confirm password *
        </label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Repeat your password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
            errors.confirmPassword ? "border-destructive" : "border-border"
          }`}
          disabled={loading}
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
          Household role *
        </label>
        <Select
          value={selectedRole}
          onValueChange={(value: "admin" | "member") => setValue("role", value)}
          disabled={loading}
        >
          <SelectTrigger className={`w-full focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground ${
            errors.role ? "border-destructive" : "border-border"
          }`}>
            <SelectValue placeholder="">
              {selectedRole === "admin" && "Administrator"}
              {selectedRole === "member" && "Family member"}
            </SelectValue>
            {!selectedRole && (
              <span className="text-muted-foreground whitespace-normal">Select role</span>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin" className="whitespace-normal [&:hover_.description-text]:text-black">
              <div>
                <div className="font-medium">Administrator</div>
                <div className="description-text text-xs text-muted-foreground">creating new household</div>
              </div>
            </SelectItem>
            <SelectItem value="member" className="whitespace-normal [&:hover_.description-text]:text-black">
              <div>
                <div className="font-medium">Family member</div>
                <div className="description-text text-xs text-muted-foreground">joining existing household</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="mt-1 text-sm text-destructive">{errors.role.message}</p>}
      </div>

      {selectedRole === "admin" && (
        <div className="space-y-2">
          <label htmlFor="householdName" className="block text-sm font-medium text-foreground mb-1">
            Household name *
          </label>
          <input
            type="text"
            id="householdName"
            placeholder="e.g., Smith Family"
            {...register("householdName")}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
              errors.householdName ? "border-destructive" : "border-border"
            }`}
            disabled={loading}
            maxLength={100}
          />
          {errors.householdName && <p className="mt-1 text-sm text-destructive">{errors.householdName.message}</p>}
        </div>
      )}

      {selectedRole === "member" && (
        <div className="space-y-2">
          <label htmlFor="pin" className="block text-sm font-medium text-foreground mb-1">
            Household PIN *
          </label>
          <input
            type="text"
            id="pin"
            placeholder="6-digit PIN code"
            {...register("pin")}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground ${
              errors.pin ? "border-destructive" : "border-border"
            }`}
            disabled={loading}
            maxLength={6}
            suppressHydrationWarning
          />
          <p className="text-xs text-muted-foreground">Ask the household administrator for the 6-digit PIN code</p>
          {errors.pin && <p className="mt-1 text-sm text-destructive">{errors.pin.message}</p>}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full whitespace-normal !mt-[40px]" disabled={isSubmitting || loading}>
        {isSubmitting || loading ? "Registering..." : "Sign up"}
      </Button>
    </form>
  );
};

export default RegisterForm;
