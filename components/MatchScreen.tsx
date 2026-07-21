"use client";

import { motion } from "framer-motion";
import { MessageCircle, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface MatchScreenProps {
  currentUserPhoto: string;
  matchedUser: {
    id: string;
    name: string | null;
    photos: string[];
    avatarUrl: string | null;
  };
  onClose: () => void;
}

const HEART_ANIMATIONS = [...Array(10)].map((_, i) => ({
  id: i,
  left: `${(i * 13 + 7) % 100}%`,
  scale: (i % 5) * 0.1 + 0.5,
  duration: (i % 3) + 3,
  delay: (i % 4) * 0.5,
  size: (i % 4) * 10 + 20
}));

export default function MatchScreen({ currentUserPhoto, matchedUser, onClose }: MatchScreenProps) {
  const router = useRouter();
  const matchedPhoto = matchedUser.photos?.length > 0 ? matchedUser.photos[0] : (matchedUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000");
  const matchedName = matchedUser.name || "Нэргүй";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {HEART_ANIMATIONS.map((anim) => (
              <motion.div
                  key={anim.id}
                  initial={{ y: "100vh", opacity: 0, scale: anim.scale }}
                  animate={{ y: "-10vh", opacity: [0, 1, 0] }}
                  transition={{ duration: anim.duration, repeat: Infinity, delay: anim.delay }}
                  className="absolute"
                  style={{ left: anim.left }}
              >
                  <Heart className="text-pink-500/30" size={anim.size} fill="currentColor" />
              </motion.div>
          ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 italic tracking-tighter mb-4 drop-shadow-[0_0_25px_rgba(236,72,153,0.5)]">
          It&apos;s a Match!
        </h1>
        <p className="text-neutral-300 text-lg md:text-xl font-medium mb-12">
          Та болон <span className="font-bold text-white">{matchedName}</span> бие биедээ таалагдлаа.
        </p>

        <div className="flex items-center justify-center gap-4 md:gap-8 mb-16 relative">
          <motion.div
            initial={{ x: -100, rotate: -20, opacity: 0 }}
            animate={{ x: 0, rotate: -10, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            className="w-32 h-40 md:w-40 md:h-52 rounded-3xl border-4 border-white overflow-hidden shadow-2xl relative z-10"
          >
            <img src={currentUserPhoto} alt="You" className="w-full h-full object-cover" />
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.6 }}
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-black shadow-[0_0_30px_rgba(236,72,153,0.8)]"
            >
              <Heart className="text-white fill-white" size={32} />
            </motion.div>
          </div>

          <motion.div
            initial={{ x: 100, rotate: 20, opacity: 0 }}
            animate={{ x: 0, rotate: 10, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
            className="w-32 h-40 md:w-40 md:h-52 rounded-3xl border-4 border-pink-500 overflow-hidden shadow-2xl relative z-10"
          >
            <img src={matchedPhoto} alt={matchedName} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push("/chat")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] hover:scale-105 transition-all"
          >
            <MessageCircle size={24} /> Зурвас бичих
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all"
          >
            Үргэлжлүүлэн хайх
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
