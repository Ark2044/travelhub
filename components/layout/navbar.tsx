"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faVolumeUp,
  faVolumeMute,
  faBars,
  faTimes,
  faGlobe,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

interface NavbarProps {
  isVoiceEnabled?: boolean;
  toggleVoice?: () => void;
  transparent?: boolean;
  showBackButton?: boolean;
}

export default function Navbar({
  isVoiceEnabled,
  toggleVoice,
  transparent = false,
  showBackButton = false,
}: NavbarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
    router.push("/login");
  };

  const navbarClasses = transparent
    ? `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-2 backdrop-blur-lg bg-black/30 shadow-lg" : "py-4"
      }`
    : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800";

  return (
    <div className={`${navbarClasses} px-4 md:px-6`}>
      <div className="container max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="text-emerald-500 mr-2 group-hover:rotate-12 transition-transform duration-300">
                <FontAwesomeIcon icon={faGlobe} size="lg" />
              </span>
              <span
                className={`font-bold text-2xl ${
                  transparent ? "text-white" : "text-gray-900 dark:text-white"
                } flex items-center`}
              >
                <span className="text-emerald-400">Travel</span>
                <span className="relative">
                  Hub
                  {scrolled && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-[2px] bg-emerald-400 opacity-70"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex space-x-8">
              <Link
                href="/"
                className={`${
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                } transition-colors font-medium text-sm relative group`}
              >
                HOME
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-emerald-400 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300"></span>
              </Link>
              <Link
                href="/history"
                className={`${
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                } transition-colors font-medium text-sm relative group`}
              >
                TRIP HISTORY
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-emerald-400 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300"></span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "200px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="relative"
                  >
                    <Input
                      className={`pl-8 ${
                        transparent
                          ? "bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/70 focus:ring-emerald-400/50"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      } rounded-full`}
                      placeholder="Search destinations..."
                      autoFocus
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className={`absolute left-3 top-2.5 ${
                        transparent ? "text-white/70" : "text-gray-400"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className={`${
                  transparent ? "text-white hover:bg-white/10" : ""
                } rounded-full px-3`}
              >
                <FontAwesomeIcon icon={faSearch} className="mr-1" />
                <span className="text-sm">Search</span>
              </Button>

              {toggleVoice && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoice}
                  className={`${
                    transparent ? "text-white hover:bg-white/10" : ""
                  } rounded-full px-3`}
                >
                  <FontAwesomeIcon
                    icon={isVoiceEnabled ? faVolumeUp : faVolumeMute}
                    className="mr-1"
                  />
                  <span className="text-sm">
                    {isVoiceEnabled ? "Voice On" : "Voice Off"}
                  </span>
                </Button>
              )}

              {showBackButton && (
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      transparent
                        ? "bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full"
                        : "border-gray-200 dark:border-gray-700 rounded-full"
                    }
                  >
                    Back to Home
                  </Button>
                </Link>
              )}

              {/* Authentication UI */}
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`${
                      transparent ? "text-white hover:bg-white/10" : ""
                    } rounded-full px-3`}
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    <span className="text-sm truncate max-w-[100px]">
                      {user?.name}
                    </span>
                  </Button>

                  {showUserDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      onMouseLeave={() => setShowUserDropdown(false)}
                    >
                      <div className="py-1">
                        <Link
                          href={user?.$id ? `/user/${user.$id}` : "/profile"}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Your Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FontAwesomeIcon
                            icon={faSignOutAlt}
                            className="mr-2"
                          />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${
                        transparent ? "text-white hover:bg-white/10" : ""
                      } rounded-full px-3`}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {showBackButton && (
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    transparent
                      ? "bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full"
                      : "border-gray-200 dark:border-gray-700 rounded-full"
                  }
                >
                  Back
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${
                transparent ? "text-white hover:bg-white/10" : ""
              } rounded-full`}
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`md:hidden fixed left-0 right-0 top-[56px] p-4 ${
                transparent
                  ? "bg-black/80 backdrop-blur-lg"
                  : "bg-white dark:bg-gray-900"
              } border-b border-gray-200 dark:border-gray-800 shadow-xl z-40`}
            >
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className={`text-lg px-4 py-3 ${
                    transparent
                      ? "text-white hover:bg-white/10"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  } rounded-lg transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/history"
                  className={`text-lg px-4 py-3 ${
                    transparent
                      ? "text-white hover:bg-white/10"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  } rounded-lg transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trip History
                </Link>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="relative mt-3">
                    <Input
                      className={`pl-9 ${
                        transparent
                          ? "bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-white/70"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      } rounded-full`}
                      placeholder="Search destinations..."
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className={`absolute left-3 top-2.5 ${
                        transparent ? "text-white/70" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>

                {toggleVoice && (
                  <Button
                    variant={transparent ? "outline" : "secondary"}
                    onClick={toggleVoice}
                    className={`flex items-center justify-center gap-2 w-full rounded-full ${
                      transparent
                        ? "bg-white/10 border-white/20 text-white"
                        : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isVoiceEnabled ? faVolumeUp : faVolumeMute}
                    />
                    {isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
                  </Button>
                )}

                {/* Mobile Authentication UI */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-2 mt-3">
                      <div className="flex items-center px-4 py-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-3">
                          <FontAwesomeIcon icon={faUser} size="sm" />
                        </div>
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={user?.$id ? `/user/${user.$id}` : "/profile"}
                        className={`text-lg px-4 py-3 ${
                          transparent
                            ? "text-white hover:bg-white/10"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        } rounded-lg transition-colors`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Button
                        variant={transparent ? "outline" : "secondary"}
                        onClick={async () => {
                          await handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-center gap-2 w-full rounded-full ${
                          transparent
                            ? "bg-white/10 border-white/20 text-white"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 mt-3">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant={transparent ? "outline" : "secondary"}
                          className={`w-full ${
                            transparent
                              ? "bg-white/10 border-white/20 text-white"
                              : ""
                          }`}
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
