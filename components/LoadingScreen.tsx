import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "0.5s" }} />
            
            <motion.div
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10 w-24 h-24 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.5)] border border-white/20 backdrop-blur-xl"
            >
                <Heart size={48} className="text-white fill-white drop-shadow-lg" />
            </motion.div>
            
            <motion.h1 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 mt-8 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 tracking-widest uppercase"
            >
                Start-UO
            </motion.h1>
            <motion.p 
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="relative z-10 mt-2 text-sm font-bold text-neutral-500 dark:text-neutral-400 tracking-wide"
            >
                Уншиж байна...
            </motion.p>
        </div>
    );
}
