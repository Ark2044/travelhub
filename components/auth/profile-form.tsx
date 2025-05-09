"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { updateUserProfile } from "@/lib/appwrite/auth-service";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Update form when user data changes (e.g., on initial load)
  useEffect(() => {
    if (user?.name) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    setIsUpdating(true);

    try {
      // No need to update if name hasn't changed
      if (data.name === user?.name) {
        toast.info("No changes to save");
        setIsUpdating(false);
        return;
      }

      const updatedUser = await updateUserProfile(data.name);
      // Update the user in the store
      useAuthStore.setState({ user: updatedUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <p>Loading your profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white">
          <FontAwesomeIcon icon={faUser} size="2x" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Enter your name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={user?.email}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <h2 className="text-xl font-semibold mb-4">Security</h2>
        <div className="space-y-4">
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
