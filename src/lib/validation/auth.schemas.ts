import { z } from "zod";

/**
 * Zod schemas for authentication forms validation
 */

// Login form schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["admin", "member"]),
    pin: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "member") {
        return data.pin && data.pin.length === 6 && /^\d{6}$/.test(data.pin);
      }
      return true;
    },
    {
      message: "PIN must be 6 digits",
      path: ["pin"],
    }
  );

// Password reset form schema
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Auth mode types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
