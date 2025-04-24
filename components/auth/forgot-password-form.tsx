"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-green-500 dark:text-green-400 text-xl"
            />
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            We&apos;ve sent a password reset link to your email address. Please
            check your inbox and follow the instructions.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-500 text-center">
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <Link
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              try again
            </Link>
          </p>
        </div>

        <div className="pt-4 text-center">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-sm text-gray-500">
          Remembered your password?{" "}
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
