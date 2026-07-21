"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Map, MessageCircle, ArrowRight } from "lucide-react";
import { checkSession } from "@/app/actions/session";

export default function WelcomePage() {
  const [session, setSession] = useState<{ userId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession().then((payload) => {
      setSession(payload);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] overflow-hidden bg-transparent z-10 px-6 py-12">

      <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative flex items-center justify-center mb-8"
        >
          <div className="absolute inset-0 bg-pink-500 blur-[60px] opacity-40 rounded-full"></div>
          <Heart className="w-24 h-24 text-pink-500 fill-pink-500 relative z-10 drop-shadow-2xl" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-extrabold text-white tracking-tight text-center mb-4 leading-tight drop-shadow-lg"
        >
          Match.<br />Chat.<br />Map.
        </motion.h1>


      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center gap-8 mb-16 w-full"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30 backdrop-blur-md">
            <Heart className="text-pink-400 w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Discover</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 backdrop-blur-md">
            <MessageCircle className="text-purple-400 w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Chat</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
            <Map className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Zenly Map</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 120 }}
        className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20 h-[72px]"
      >
        {!loading && (
          session ? (
            <Link href="/discover" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-lg font-bold text-white shadow-[0_10px_30px_rgba(236,72,153,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3">
                Үргэлжлүүлэх <ArrowRight size={22} />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-lg font-bold text-white shadow-[0_10px_30px_rgba(236,72,153,0.4)] hover:scale-105 transition-all">
                  Шинээр бүртгүүлэх
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-neutral-900 border-2 border-neutral-800 rounded-full text-lg font-bold text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all">
                  Нэвтрэх
                </button>
              </Link>
            </>
          )
        )}
      </motion.div>

    </div>
  );
}
