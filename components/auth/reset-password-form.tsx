"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

// Schema with password confirmation
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get userId and secret from URL params
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if we have required URL parameters
  useEffect(() => {
    if (!userId || !secret) {
      setError(
        "Invalid password reset link. Please request a new password reset."
      );
    }
  }, [userId, secret]);

  const onSubmit = async (data: FormData) => {
    if (!userId || !secret) {
      setError(
        "Missing required information. Please request a new password reset."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword({
        userId,
        secret,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success(
        "Password has been reset successfully. Please sign in with your new password."
      );

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to reset password. The reset link may have expired.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (isSuccess) {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-500 dark:text-green-400 text-xl"
            />
          </div>
          <h1 className="text-2xl font-bold">Password reset successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your password has been reset successfully. You will be redirected to
            the login page shortly.
          </p>
        </div>

        <div className="pt-4 text-center">
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show error if missing parameters
  if (error && (!userId || !secret)) {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-red-500 dark:text-red-400 text-xl"
            />
          </div>
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
        </div>

        <div className="pt-4 text-center">
          <Link href="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create new password</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Enter a new password for your account
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your new password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting password..." : "Reset Password"}
        </Button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
