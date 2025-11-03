"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema, type RegisterFormData } from "@/lib/validation/auth.schemas";

interface RegisterFormProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  loading: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onError, onLoading, loading }) => {
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

      // Success - redirect to profile page
      window.location.href = '/daily_chores';
    } catch (error) {
      onError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      onLoading(false);
    }
  };

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
