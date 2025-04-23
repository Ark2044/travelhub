import { Metadata } from "next";
import ProfileForm from "@/components/auth/profile-form";

export const metadata: Metadata = {
  title: "Profile - TravelHub",
  description: "Manage your TravelHub account",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your account and preferences
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
