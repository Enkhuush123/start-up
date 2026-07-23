"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, User, Info, Check, MessageCircle, ArrowLeft } from "lucide-react";
import { getHighCompatibilityMatches } from "@/app/actions/ai";
import { checkSession } from "@/app/actions/session";
import { recordSwipe } from "@/app/actions/discover";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/ui/AlertProvider";

export default function CupidPage() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const session = await checkSession();
            if (session?.userId) {
                if (!session.onboardingComplete) {
                    router.push("/onboarding");
                    return;
                }
                setUserId(session.userId);
                const data = await getHighCompatibilityMatches(session.userId);
                setMatches(data);
                setLoading(false);
            } else {
                window.location.href = "/login";
            }
        }
        load();
    }, []);

    const handleMatch = async (otherId: string) => {
        if (!userId) return;
        await recordSwipe(userId, otherId, true);
        
        // Remove the liked user from the UI
        setMatches(prev => prev.filter(m => m.id !== otherId));
        
        showAlert({ 
            message: "Таалагдлаа! (Зүрх илгээгдлээ 💖)", 
            type: "success" 
        });
    };

    return (
        <div className="min-h-[100dvh] pt-24 pb-20 bg-neutral-50 dark:bg-neutral-950 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-neutral-500 hover:text-pink-500 transition-colors font-bold">
                    <ArrowLeft size={20} /> Буцах
                </button>
                <div className="flex flex-col items-center justify-center text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(236,72,153,0.4)] animate-pulse">
                        <Heart className="w-10 h-10 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-4">
                        Cupid AI ✨
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-lg">
                        Хиймэл оюун ухаан таны сонирхол, хайрын хэл, ордонд тулгуурлан тантай хамгийн сайн тохирох хүмүүсийг санал болгож байна.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                        <p className="text-neutral-500 font-medium">Тохирох хүмүүсийг хайж байна...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800">
                        <p className="text-neutral-500 font-bold text-lg">Одоогоор тохирох хүн олдсонгүй.</p>
                        <p className="text-neutral-400 text-sm mt-2">Та профайл мэдээллээ илүү дэлгэрэнгүй бөглөөд үзээрэй.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matches.map((user, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={user.id}
                                className="bg-white dark:bg-neutral-900/40 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800/80 shadow-xl overflow-hidden relative group"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                                        <Heart size={14} className="text-pink-500 fill-pink-500" />
                                        <span className="text-pink-500 font-black text-sm">{user.matchPercentage}% Тохирч байна</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 shadow-inner">
                                        {user.photos && user.photos.length > 0 ? (
                                            <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <User className="w-full h-full p-6 text-neutral-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                                            {user.name}, {user.age}
                                            {user.zodiacSign && <span className="text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">{user.zodiacSign}</span>}
                                        </h2>
                                        <p className="text-neutral-500 font-medium text-sm mt-1">{user.lookingFor || "Хайж буй зүйл тодорхойгүй"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {user.loveLanguage && (
                                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3 text-sm">
                                            <span className="text-neutral-400 font-bold block mb-1 uppercase text-[10px]">Хайрын хэл</span>
                                            <span className="text-neutral-700 dark:text-neutral-200 font-medium">{user.loveLanguage}</span>
                                        </div>
                                    )}
                                    
                                    {user.interests && user.interests.length > 0 && (
                                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3">
                                            <span className="text-neutral-400 font-bold block mb-2 uppercase text-[10px]">Нийтлэг сонирхол</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.interests.slice(0, 4).map((i: string) => (
                                                    <span key={i} className="px-2 py-1 bg-pink-500/10 text-pink-500 text-xs font-bold rounded-lg border border-pink-500/10">{i}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => handleMatch(user.id)} className="w-full h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-pink-500 dark:hover:bg-pink-500 hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg">
                                    <Heart size={18} /> Зүрх илгээх
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
