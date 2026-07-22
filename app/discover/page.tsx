"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo, animate } from "framer-motion";
import { X, Heart, Sparkles, MapPin } from "lucide-react";
import { checkSession } from "@/app/actions/session";
import { getPotentialMatches, recordSwipe } from "@/app/actions/discover";
import { updateLocation } from "@/app/actions/map";
import { getUserProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import MatchScreen from "@/components/MatchScreen";
import { useLanguage } from "@/components/LanguageProvider";

type UserType = {
    id: string;
    name: string | null;
    age: number | null;
    gender: string | null;
    interests: string[];
    avatarUrl: string | null;
    photos: string[];
    distanceKm?: number | null;
};

const DUMMY_IMAGE = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000";

export default function DiscoverPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserType[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<UserType | null>(null);
    const { t } = useLanguage();

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

    useEffect(() => {
        async function loadUsers() {
            const session = await checkSession();
            if (session?.userId) {
                setCurrentUserId(session.userId);
                
                const profile = await getUserProfile(session.userId);
                if (profile) {
                    setCurrentUserPhoto(profile.photos?.[0] || profile.avatarUrl || DUMMY_IMAGE);
                }
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            await updateLocation(session.userId, position.coords.latitude, position.coords.longitude);
                            const matches = (await getPotentialMatches(session.userId)) as unknown as UserType[];
                            setUsers(matches);
                            setLoading(false);
                        },
                        async () => {
                            const matches = (await getPotentialMatches(session.userId)) as unknown as UserType[];
                            setUsers(matches);
                            setLoading(false);
                        },
                        { timeout: 5000, maximumAge: 60000 }
                    );
                } else {
                    const matches = (await getPotentialMatches(session.userId)) as unknown as UserType[];
                    setUsers(matches);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    const processSwipe = async (targetUser: UserType, isLike: boolean) => {
        if (!currentUserId) return;
        
        // Optimistic update - handle next user immediately
        handleNextUser();
        
        const res = await recordSwipe(currentUserId, targetUser.id, isLike);
        if (res.isMatch) {
            setMatchData(targetUser);
        }
    };

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!currentUserId || users.length === 0) return;

        const threshold = 100;
        const targetUser = users[0];

        if (info.offset.x > threshold) {
            await animate(x, 500, { duration: 0.3 });
            processSwipe(targetUser, true);
            x.set(0);
        } else if (info.offset.x < -threshold) {
            await animate(x, -500, { duration: 0.3 });
            processSwipe(targetUser, false);
            x.set(0);
        }
    };

    const manualSwipe = async (isLike: boolean) => {
        if (!currentUserId || users.length === 0) return;
        const targetUser = users[0];
        await animate(x, isLike ? 500 : -500, { duration: 0.4 });
        processSwipe(targetUser, isLike);
        x.set(0);
    };

    const handleNextUser = () => {
        setUsers(prev => prev.slice(1));
        setActivePhotoIndex(0);
    };

    const nextPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (users.length === 0) return;
        const targetUser = users[0];
        const max = targetUser.photos.length > 0 ? targetUser.photos.length : 1;
        if (activePhotoIndex < max - 1) {
            setActivePhotoIndex(prev => prev + 1);
        }
    };

    const prevPhoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activePhotoIndex > 0) {
            setActivePhotoIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-[100dvh] pt-20 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 overflow-hidden px-4">
            <AnimatePresence>
                {matchData && currentUserPhoto && (
                    <MatchScreen
                        currentUserPhoto={currentUserPhoto}
                        matchedUser={matchData}
                        onClose={() => setMatchData(null)}
                    />
                )}
            </AnimatePresence>
            {users.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center flex flex-col items-center bg-white/[0.02] p-10 rounded-[3rem] border border-white/[0.05] shadow-2xl backdrop-blur-3xl"
                >
                    <div className="w-24 h-24 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Sparkles size={40} className="text-pink-500 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2">Одоогоор хүн алга байна</h2>
                    <p className="text-sm font-medium mt-2">{t("discover.empty")}</p>
                </motion.div>
            ) : (
                <div className="relative w-full max-w-[420px] h-[65vh] max-h-[600px] min-h-[420px] perspective-1000">
                    <AnimatePresence>
                        {users.slice(0, 2).map((user, index) => {
                            const isFront = index === 0;
                            const photoArray = user.photos && user.photos.length > 0 ? user.photos : [user.avatarUrl || DUMMY_IMAGE];
                            const currentPhoto = isFront ? photoArray[activePhotoIndex] : photoArray[0];

                            return (
                                <motion.div
                                    key={user.id}
                                    style={isFront ? { x, rotate, opacity } : {}}
                                    drag={isFront ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDragEnd={isFront ? handleDragEnd : undefined}
                                    initial={isFront ? {} : { scale: 0.92, opacity: 0.8, y: 30, z: -50 }}
                                    animate={{ scale: isFront ? 1 : 0.92, opacity: isFront ? 1 : 0.8, y: isFront ? 0 : 30, z: isFront ? 0 : -50 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className={`absolute inset-0 rounded-[2.5rem] overflow-hidden bg-white dark:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/[0.05] ${isFront ? "z-20 cursor-grab active:cursor-grabbing" : "z-10"}`}
                                >
                                    <div className="relative w-full h-full bg-neutral-50 dark:bg-neutral-950">
                                        <img 
                                            src={currentPhoto} 
                                            alt={user.name || "Хэрэглэгч"} 
                                            className="w-full h-full object-cover select-none pointer-events-none"
                                        />

                                        {/* Photo indicators */}
                                        {isFront && photoArray.length > 1 && (
                                            <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
                                                {photoArray.map((_, i) => (
                                                    <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                                        <div className={`h-full bg-white transition-all duration-300 ${i === activePhotoIndex ? 'w-full' : 'w-0'}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Tap zones for photo navigation */}
                                        {isFront && photoArray.length > 1 && (
                                            <>
                                                <div onClick={prevPhoto} className="absolute top-0 left-0 w-1/2 h-full z-20 cursor-pointer" />
                                                <div onClick={nextPhoto} className="absolute top-0 right-0 w-1/2 h-full z-20 cursor-pointer" />
                                            </>
                                        )}

                                        {isFront && (
                                            <>
                                                <motion.div style={{ opacity: likeOpacity }} className="absolute top-16 left-8 border-[6px] border-emerald-500 text-emerald-500 text-5xl font-black px-6 py-2 rounded-2xl rotate-[-15deg] z-40 bg-white/20 dark:bg-black/20 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.3)] pointer-events-none">
                                                    {t("discover.like")}
                                                </motion.div>
                                                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-16 right-8 border-[6px] border-rose-500 text-rose-500 text-5xl font-black px-6 py-2 rounded-2xl rotate-[15deg] z-40 bg-white/20 dark:bg-black/20 backdrop-blur-sm shadow-[0_0_30px_rgba(244,63,94,0.3)] pointer-events-none">
                                                    {t("discover.nope")}
                                                </motion.div>
                                            </>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 pb-10 pointer-events-none">
                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <h1 className="text-4xl font-black text-white flex items-center gap-3 drop-shadow-lg">
                                                        {user.name || t("discover.anon")} <span className="text-2xl font-medium text-white/80">{user.age}</span>
                                                    </h1>
                                                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg mt-2">
                                                        <MapPin size={16} className="text-purple-400" />
                                                        <span className="text-white text-sm font-bold tracking-wider">
                                                            {user.distanceKm != null ? `${user.distanceKm} ${t("discover.dist")}` : `< 5 ${t("discover.dist")}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pointer-events-auto mb-3">
                                                {user.height && (
                                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20 shadow-sm flex items-center gap-1">
                                                        📏 {user.height} см
                                                    </span>
                                                )}
                                                {user.zodiacSign && (
                                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20 shadow-sm">
                                                        {user.zodiacSign}
                                                    </span>
                                                )}
                                                {user.loveLanguage && (
                                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20 shadow-sm">
                                                        {user.loveLanguage}
                                                    </span>
                                                )}
                                                {user.lookingFor && (
                                                    <span className="px-3 py-1 bg-pink-500/30 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-pink-500/30 shadow-sm">
                                                        🎯 {user.lookingFor}
                                                    </span>
                                                )}
                                                {user.drinking && (
                                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20 shadow-sm">
                                                        🍻 {user.drinking}
                                                    </span>
                                                )}
                                                {user.smoking && (
                                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/20 shadow-sm">
                                                        🚬 {user.smoking}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 pointer-events-auto">
                                                {user.interests.slice(0, 5).map((interest, i) => (
                                                    <span key={i} className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20 shadow-lg">
                                                        {interest}
                                                    </span>
                                                ))}
                                                {user.interests.length > 5 && (
                                                    <span className="px-3.5 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-xs font-bold text-white/70 border border-white/10">
                                                        +{user.interests.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {users.length > 0 && (
                <div className="flex gap-6 sm:gap-8 mt-6 sm:mt-12 relative z-30">
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => manualSwipe(false)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-rose-500 shadow-[0_15px_35px_-10px_rgba(244,63,94,0.4)] hover:border-rose-500/50 transition-colors"
                    >
                        <X className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={3} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => manualSwipe(true)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-emerald-500 shadow-[0_15px_35px_-10px_rgba(16,185,129,0.4)] hover:border-emerald-500/50 transition-colors"
                    >
                        <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-emerald-500" strokeWidth={3} />
                    </motion.button>
                </div>
            )}

        </div>
    );
}