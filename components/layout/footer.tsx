"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faFacebookF,
  faInstagram,
  faPinterestP,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-8 ${className}`}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand and About */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-5">
              <div className="text-emerald-500 mr-2">
                <FontAwesomeIcon icon={faGlobe} size="lg" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-emerald-400">Travel</span>Hub
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              AI-powered travel planning for personalized itineraries tailored
              to your preferences and travel style.
            </p>
            {/* Social icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-700 flex items-center justify-center transition-colors duration-300"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-700 flex items-center justify-center transition-colors duration-300"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-700 flex items-center justify-center transition-colors duration-300"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-emerald-700 flex items-center justify-center transition-colors duration-300"
                aria-label="Pinterest"
              >
                <FontAwesomeIcon icon={faPinterestP} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-lg mb-5 relative inline-block">
              Quick Links
              <span className="absolute left-0 bottom-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  Trip History
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="font-medium text-lg mb-5 relative inline-block">
              Support
              <span className="absolute left-0 bottom-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-400 transition-colors inline-flex items-center"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-medium text-lg mb-5 relative inline-block">
              Contact
              <span className="absolute left-0 bottom-0 w-12 h-0.5 bg-emerald-500"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="text-emerald-500 mr-3 mt-0.5">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <span className="block text-sm text-gray-400">Email:</span>
                  <a
                    href="mailto:info@travelhub.com"
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    info@travelhub.com
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <div className="text-emerald-500 mr-3 mt-0.5">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div>
                  <span className="block text-sm text-gray-400">Phone:</span>
                  <a
                    href="tel:+1234567890"
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <div className="text-emerald-500 mr-3 mt-0.5">
                  <FontAwesomeIcon icon={faLocationDot} />
                </div>
                <div>
                  <span className="block text-sm text-gray-400">Address:</span>
                  <span className="text-gray-300">San Francisco, CA</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-12 pt-10 pb-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-center text-lg font-medium mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-center text-gray-400 mb-5">
              Stay updated with the latest travel tips and destination guides
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom part */}
        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} TravelHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
