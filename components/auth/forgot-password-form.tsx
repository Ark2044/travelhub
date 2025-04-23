import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "@/lib/store/auth-store";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

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
    setError(null);
    setSuccess(false);

    try {
      const success = await forgotPassword(data.email);
      if (success) {
        setSuccess(true);
      } else {
        setError("Failed to send password reset link. Please try again.");
      }
    } catch (error) {
      console.error("Password recovery error:", error);
      setError("Failed to send password reset link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Enter your email to receive a password reset link
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Password reset link has been sent to your email. Please check your
            inbox.
          </div>
          <div className="text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Return to login
            </Link>
          </div>
        </div>
      ) : (
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
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
