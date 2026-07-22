"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, MessageCircle, User, Moon, Sun, Globe } from "lucide-react";
import { checkSession } from "@/app/actions/session";
import { getUnreadMessageCount } from "@/app/actions/chat";
import { getPendingRequestCount } from "@/app/actions/map";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function TopNav() {
    const pathname = usePathname();
    const [session, setSession] = useState<{ userId: string } | null>(null);
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mapRequestCount, setMapRequestCount] = useState(0);

    useEffect(() => {
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

            <div className="hidden md:flex items-center gap-10">
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
                            <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-sm font-bold text-neutral-900 dark:text-white shadow-[0_5px_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-all">
                                {t("nav.signup")}
                            </button>
                        </Link>
                    </>
                )}
            </div>

        </nav>
        
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
            </div>
        )}
        </>
    );
}