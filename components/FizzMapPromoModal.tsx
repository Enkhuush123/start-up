"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FizzMapPromoModal() {
    const [show, setShow] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if the user has seen the promo before
        const hasSeen = localStorage.getItem("hasSeenFizzMapPromo");
        if (!hasSeen) {
            // Add a small delay so it doesn't pop up instantly jarring the user
            const timer = setTimeout(() => {
                setShow(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setShow(false);
        localStorage.setItem("hasSeenFizzMapPromo", "true");
    };

    const handleExplore = () => {
        setShow(false);
        localStorage.setItem("hasSeenFizzMapPromo", "true");
        router.push("/map");
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-neutral-900 border border-emerald-500/30 rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(16,185,129,0.2)] relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <MapPin size={150} className="text-emerald-500" />
                        </div>

                        <button 
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 p-2 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 relative z-10 mx-auto">
                            <MapPin size={32} />
                        </div>
                        
                        <div className="text-center relative z-10">
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-3 flex items-center justify-center gap-2">
                                Fizz Map <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm">New</span>
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed mb-8">
                                Найзуудыгаа яг одоо хаана явж байгааг газрын зураг (Map) дээрээс харах боломжтой.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10">
                            <button 
                                onClick={handleExplore}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(16,185,129,0.4)] transition-all"
                            >
                                Газрын зураг руу орох <ArrowRight size={20} />
                            </button>
                            <button 
                                onClick={handleClose}
                                className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl font-bold transition-all"
                            >
                                Дараа болъё
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
