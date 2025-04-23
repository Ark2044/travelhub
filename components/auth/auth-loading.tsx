import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-emerald-500 mb-4"
        >
          <FontAwesomeIcon icon={faGlobe} size="3x" />
        </motion.div>
        <h2 className="mt-6 text-center text-2xl font-bold">
          <span className="text-emerald-400">Travel</span>Hub
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
