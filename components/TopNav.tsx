"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, MessageCircle, User, Moon, Sun, Globe, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkSession } from "@/app/actions/session";
import { getUnreadMessageCount } from "@/app/actions/chat";
import { getPendingRequestCount } from "@/app/actions/map";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { getLoveFact } from "@/app/actions/ai";

export default function TopNav() {
    const pathname = usePathname();
    const [session, setSession] = useState<{ userId: string } | null>(null);
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mapRequestCount, setMapRequestCount] = useState(0);
    const [loveFact, setLoveFact] = useState("Хайрын баримтууд...");
    const [showFactModal, setShowFactModal] = useState(false);

    useEffect(() => {
        getLoveFact().then(fact => setLoveFact(fact));
        const factInterval = setInterval(() => {
            getLoveFact().then(fact => setLoveFact(fact));
        }, 30000); // 30 seconds

        checkSession().then((payload) => {
            setSession(payload);
        }).catch(err => console.error("checkSession failed:", err));
    }, [pathname]);

    useEffect(() => {
        if (!session?.userId) return;

        const fetchCount = async () => {
            const msgs = await getUnreadMessageCount(session.userId);
            setUnreadCount(msgs);
            const reqs = await getPendingRequestCount(session.userId);
            setMapRequestCount(reqs);
        };

        fetchCount();
        const interval = setInterval(fetchCount, 5000); 

        return () => clearInterval(interval);
    }, [session?.userId, pathname]); 


    const isAuthPage = pathname === "/login" || pathname === "/onboarding";

    if (isAuthPage) return null;

    const navItems = [
        { name: t("nav.discover"), href: "/discover", icon: Heart },
        { name: t("nav.fizz"), href: "/map", icon: Map },
        { name: t("nav.messages"), href: "/chat", icon: MessageCircle },
    ];

    return (
        <>
        <nav className="fixed top-0 w-full h-20 bg-neutral-50 dark:bg-neutral-950/80 backdrop-blur-2xl border-b border-neutral-200 dark:border-neutral-800 z-50 flex items-center justify-between px-4 md:px-10 transition-colors">

            <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                    <Heart className="w-5 h-5 text-neutral-900 dark:text-white fill-white" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white hidden sm:block">Rizz & Fizz</span>
            </Link>

            <button 
                onClick={() => setShowFactModal(true)}
                className="flex items-center gap-2 max-w-xs cursor-pointer hover:bg-pink-500/20 transition-colors bg-pink-500/10 p-2 lg:px-4 lg:py-2 rounded-full border border-pink-500/20 shadow-inner"
            >
                <Heart size={16} className="text-pink-500 flex-shrink-0 animate-pulse" fill="currentColor" />
                <p className="hidden lg:block text-xs text-neutral-600 dark:text-neutral-300 truncate font-medium">{loveFact}</p>
            </button>

            <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`relative flex items-center gap-2 text-sm font-bold transition-all ${isActive ? "text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white"
                                }`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            {item.name}
                            {item.name === "Messages" && unreadCount > 0 && (
                                <span className="absolute -top-2 -right-3 min-w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-900 dark:text-white px-1 shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                                    {unreadCount}
                                </span>
                            )}
                            {item.name === "Fizz" && mapRequestCount > 0 && (
                                <span className="absolute -top-2 -right-3 min-w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-900 dark:text-white px-1 shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                                    {mapRequestCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
                <Link
                    href="/cupid"
                    className="relative flex items-center gap-2 text-sm font-bold transition-all text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                >
                    <Heart size={18} strokeWidth={2.5} fill="currentColor" className="animate-pulse" />
                    Cupid AI
                </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={toggleLang} className="flex items-center gap-1 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 px-3 py-2 rounded-full transition-all border border-neutral-200 dark:border-neutral-800">
                    <Globe size={14} /> {lang}
                </button>
                
                <button onClick={toggleTheme} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 p-2.5 rounded-full transition-all border border-neutral-200 dark:border-neutral-800">
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {session ? (
                    <Link href="/profile" className="ml-2 w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-700 hover:border-pink-500 flex items-center justify-center overflow-hidden transition-all shadow-lg">
                        <User size={18} className="text-neutral-600 dark:text-neutral-300" />
                    </Link>
                ) : (
                    <>
                        <Link href="/login" className="hidden sm:block text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-900 dark:text-white transition-colors ml-2">
                            {t("nav.login")}
                        </Link>
                        <Link href="/login">
                            <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-sm font-bold text-white shadow-[0_5px_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-all">
                                {t("nav.signup")}
                            </button>
                        </Link>
                    </>
                )}
            </div>

        </nav>

        <AnimatePresence>
            {showFactModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
                    >
                        <button 
                            onClick={() => setShowFactModal(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                            <Heart size={32} fill="currentColor" className="animate-pulse" />
                        </div>
                        <h3 className="text-xl font-black text-center text-neutral-900 dark:text-white mb-4">Хайрын баримт 💡</h3>
                        <p className="text-center text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                            {loveFact}
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        
        {}
        {!isAuthPage && session && (
            <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-neutral-50 dark:bg-neutral-950/90 backdrop-blur-2xl border-t border-neutral-200 dark:border-neutral-800 z-50 flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center w-16 h-full transition-all ${isActive ? "text-pink-500" : "text-neutral-500 hover:text-neutral-900 dark:text-white"
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {item.name === "Messages" && unreadCount > 0 && (
                                <span className="absolute top-2 right-2 min-w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-900 dark:text-white px-1 shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                                    {unreadCount}
                                </span>
                            )}
                            {item.name === "Fizz" && mapRequestCount > 0 && (
                                <span className="absolute top-2 right-2 min-w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-900 dark:text-white px-1 shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                                    {mapRequestCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
                <Link
                    href="/cupid"
                    className={`relative flex flex-col items-center justify-center w-16 h-full transition-all ${pathname === "/cupid" ? "text-pink-500" : "text-neutral-500 hover:text-pink-500"}`}
                >
                    <Heart size={24} strokeWidth={pathname === "/cupid" ? 2.5 : 2} className={pathname === "/cupid" ? "fill-current animate-pulse" : ""} />
                </Link>
            </div>
        )}
        </>
    );
}