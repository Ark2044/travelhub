import "./globals.css";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/auth/auth-initializer";
import ItinerarySavePrompt from "@/components/auth/itinerary-save-prompt";
import AppwriteInitializer from "@/components/appwrite-initializer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata = {
  title: "TravelHub - AI Travel Planner",
  description: "Create personalized travel itineraries with AI",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        {/* Initialize Appwrite resources on app startup */}
        <AppwriteInitializer />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer>
            <div className="flex-1 flex flex-col w-full mx-auto">
              {children}
            </div>
            <ItinerarySavePrompt />
            <Toaster position="top-center" />
          </AuthInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
