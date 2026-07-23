"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Loader2, User, MessageCircle, Sparkles, MapPin } from "lucide-react";
import { checkSession, logoutUser } from "@/app/actions/session";
import LoadingScreen from "@/components/LoadingScreen";
import { getMatches, getMessages, sendMessage } from "@/app/actions/chat";
import { evaluateChat, suggestDateIdeas, suggestIcebreaker } from "@/app/actions/ai";
import { supabase } from "@/lib/supabase";

type MatchType = {
  id: string;
  createdAt: Date;
  otherUser: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    photos: string[];
    lastActive: Date | null;
    isBlindDateMode: boolean;
  };
  currentUser: {
    isBlindDateMode: boolean;
  };
  lastMessage: {
    id: string;
    createdAt: Date;
    content: string;
    matchId: string;
    senderId: string;
    isRead: boolean;
  } | null;
  _count: {
    messages: number;
  };
};

type MessageType = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date | string;
};


export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [activeMatch, setActiveMatch] = useState<MatchType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const [chatEmoji, setChatEmoji] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [dateIdeas, setDateIdeas] = useState<string | null>(null);
  const [suggestingDate, setSuggestingDate] = useState(false);
  
  const [icebreakers, setIcebreakers] = useState<string | null>(null);
  const [generatingIcebreaker, setGeneratingIcebreaker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      const session = await checkSession();
      if (!session?.userId) {
        router.push("/login");
        return;
      }
      setUserId(session.userId);
      const data = await getMatches(session.userId);
      setMatches(data);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!activeMatch || !userId) return;

    let isMounted = true;
    const fetchMsgs = async () => {
      const msgs = await getMessages(activeMatch.id, userId);
      if (isMounted) setMessages(msgs);
    };

    fetchMsgs();
    
    // Supabase Realtime Subscription for new messages
    const channel = supabase
      .channel(`chat-${activeMatch.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter: `matchId=eq.${activeMatch.id}` },
        (payload) => {
          if (isMounted) {
            const newMsg = payload.new as MessageType;
            // Prevent duplicate message rendering (we already add optimistic messages on send)
            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();
      
    // Fallback polling just in case Realtime isn't fully configured
    const interval = setInterval(fetchMsgs, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activeMatch, userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeMatch || !userId) return;

    setSending(true);
    const text = newMessage;
    setNewMessage("");
    if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
    }

    const tempMsg = {
      id: Date.now().toString(),
      senderId: userId,
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const res = await sendMessage(activeMatch.id, userId, text);
    if (res && 'error' in res) {
      setErrorModal(res.error);
      setTimeout(async () => {
        await logoutUser();
        window.location.href = "/login";
      }, 3000);
    }
    setSending(false);
  };

  const handleIcebreaker = async () => {
    if (!activeMatch) return;
    setGeneratingIcebreaker(true);
    const res = await suggestIcebreaker(activeMatch.id);
    setIcebreakers(res.icebreakers || res.error || "Алдаа гарлаа.");
    setGeneratingIcebreaker(false);
  };

  const handleEvaluate = async () => {
    if (!activeMatch) return;
    setEvaluating(true);
    const res = await evaluateChat(activeMatch.id);
    setChatEmoji(res.emoji);
    setEvaluating(false);
  };

  const handleDateIdeas = async () => {
    if (!activeMatch) return;
    setSuggestingDate(true);
    const res = await suggestDateIdeas(activeMatch.id);
    setDateIdeas(res.ideas || res.error || "Алдаа гарлаа.");
    setSuggestingDate(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative w-full min-h-[100dvh] pt-20 bg-neutral-50 dark:bg-neutral-950 flex overflow-hidden">
      <div
        className={`w-full md:w-96 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col transition-transform duration-300 ${activeMatch ? "-translate-x-full md:translate-x-0 absolute md:relative z-10 h-[calc(100dvh-5rem)]" : "h-[calc(100dvh-5rem)]"}`}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Мессеж</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {matches.length === 0 ? (
            <p className="text-neutral-500 text-center mt-10">
              Танд одоогоор харилцсан хүн алга байна.
            </p>
          ) : (
            matches.map((match) => {
              const otherUser = match.otherUser;
              const isSelected = activeMatch?.id === match.id;
              const avatar =
                otherUser.photos?.length > 0
                  ? otherUser.photos[0]
                  : otherUser.avatarUrl;

              const messageCount = match._count.messages;
              let listBlurClass = "blur-none";
              if (otherUser.isBlindDateMode || match.currentUser?.isBlindDateMode) {
                  listBlurClass = "blur-2xl";
                  if (messageCount >= 10) listBlurClass = "blur-none";
                  else if (messageCount >= 5) listBlurClass = "blur-md";
                  else if (messageCount >= 2) listBlurClass = "blur-sm";
              }

              return (
                <div
                  key={match.id}
                  onClick={() => setActiveMatch(match)}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${isSelected ? "bg-pink-500/10 border border-pink-500/20" : "hover:bg-white dark:bg-neutral-900 border border-transparent"}`}
                >
                  <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={otherUser.name || ""}
                        className={`w-full h-full object-cover transition-all duration-1000 ${listBlurClass}`}
                      />
                    ) : (
                      <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-neutral-900 dark:text-white font-bold truncate">
                      {otherUser.name || "Нэргүй"}
                    </h3>
                    <p className="text-neutral-500 text-sm truncate">
                      {match.lastMessage?.content || "Чатлаж эхлэх"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
            if (offset.x > 100 || velocity.x > 500) {
                setActiveMatch(null);
            }
        }}
        className={`flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 absolute md:relative w-full h-[calc(100dvh-5rem)] transition-transform duration-300 z-20 ${activeMatch ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        {(() => {
          if (!activeMatch) return null;
          
          const messageCount = messages.length;
          let blurClass = "blur-none";
          
          if (activeMatch.currentUser?.isBlindDateMode || activeMatch.otherUser?.isBlindDateMode) {
              blurClass = "blur-2xl";
              if (messageCount >= 10) blurClass = "blur-none";
              else if (messageCount >= 5) blurClass = "blur-md";
              else if (messageCount >= 2) blurClass = "blur-sm";
          }

          return (
            <>
            <div className="h-20 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 backdrop-blur-md flex items-center px-4 md:px-8 gap-4 flex-shrink-0 z-30">
              <button
                onClick={() => setActiveMatch(null)}
                className="md:hidden p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 relative">
                {activeMatch.otherUser.photos?.[0] ||
                activeMatch.otherUser.avatarUrl ? (
                  <img
                    src={
                      activeMatch.otherUser.photos?.[0] ||
                      activeMatch.otherUser.avatarUrl || undefined
                    }
                    className={`w-full h-full object-cover transition-all duration-1000 ${blurClass}`}
                    alt=""
                  />
                ) : (
                  <User className={`w-6 h-6 m-2 text-neutral-500 transition-all duration-1000 ${blurClass}`} />
                )}
                {blurClass !== "blur-none" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-[10px] text-white font-bold">
                    {10 - messageCount}
                  </div>
                )}
              </div>
              <div className="flex-1 flex justify-between items-center pr-2 md:pr-0">
                <div>
                  <h3 className="text-neutral-900 dark:text-white font-bold flex items-center gap-2 leading-tight">
                    {activeMatch.otherUser.name || "Нэргүй"}
                    {chatEmoji && <span className="text-xl animate-bounce">{chatEmoji}</span>}
                  </h3>
                  {activeMatch.otherUser.lastActive && (
                      <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5 mt-1">
                          {(() => {
                              const diffMins = Math.floor((Date.now() - new Date(activeMatch.otherUser.lastActive).getTime()) / 60000);
                              if (diffMins < 5) return <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Одоо идэвхтэй (Online)</>;
                              if (diffMins < 60) return `Сүүлд орсон: ${diffMins} минутын өмнө`;
                              const diffHours = Math.floor(diffMins / 60);
                              if (diffHours < 24) return `Сүүлд орсон: ${diffHours} цагийн өмнө`;
                              return `Сүүлд орсон: ${Math.floor(diffHours / 24)} өдрийн өмнө`;
                          })()}
                      </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {evaluating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span className="hidden sm:inline">Дүгнэх</span>
                  </button>
                  <button
                    onClick={handleDateIdeas}
                    disabled={suggestingDate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {suggestingDate ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    <span className="hidden sm:inline">Болзоо</span>
                  </button>
                  {messages.length < 5 && (
                    <button
                      onClick={handleIcebreaker}
                      disabled={generatingIcebreaker}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {generatingIcebreaker ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span className="hidden sm:inline">Wingman</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative">
              {icebreakers && (
                <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-2xl border border-blue-500/20 shadow-xl mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-blue-500 flex items-center gap-2">
                      <Sparkles size={16} /> Wingman
                    </h4>
                    <button onClick={() => setIcebreakers(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
                       ✕
                    </button>
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-medium leading-relaxed">
                    {icebreakers}
                  </div>
                </div>
              )}

              {dateIdeas && (
                <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-2xl border border-pink-500/20 shadow-xl mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-pink-500 flex items-center gap-2">
                      <Sparkles size={16} /> Болзооны санаанууд
                    </h4>
                    <button onClick={() => setDateIdeas(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
                       ✕
                    </button>
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-medium leading-relaxed">
                    {dateIdeas}
                  </div>
                </div>
              )}
              
              {messages.map((msg, i) => {
                const isMe = msg.senderId === userId;
                
                // Format time HH:MM
                const date = new Date(msg.createdAt);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Basic seen indicator for the last message if I sent it
                const isLast = i === messages.length - 1;
                const showSeen = isLast && isMe && activeMatch?.lastMessage?.isRead;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id || i}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-5 py-3 rounded-2xl relative group ${isMe ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-tr-sm shadow-[0_5px_20px_rgba(236,72,153,0.3)]" : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white rounded-tl-sm border border-neutral-700/50"}`}
                    >
                      <p className="font-medium text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <span className={`text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${isMe ? "right-1 text-neutral-400" : "left-1 text-neutral-400"}`}>
                        {timeStr}
                      </span>
                    </div>
                    {showSeen && (
                      <span className="text-[10px] text-neutral-400 font-bold mt-1 pr-1">Уншсан</span>
                    )}
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-6 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 pb-safe">
              <form onSubmit={handleSend} className="flex gap-3 items-end">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    e.target.style.height = '56px';
                    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                    }
                  }}
                  placeholder="Мессеж бичих..."
                  rows={1}
                  className="flex-1 min-h-[56px] max-h-[150px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl py-4 px-6 text-neutral-900 dark:text-white focus:outline-none focus:border-pink-500 transition-colors resize-none overflow-y-auto leading-tight"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center text-neutral-900 dark:text-white disabled:opacity-50 disabled:bg-neutral-100 dark:bg-neutral-800 transition-colors flex-shrink-0"
                >
                  <Send
                    size={20}
                    className={newMessage.trim() ? "translate-x-0.5" : ""}
                  />
                </button>
              </form>
            </div>
          </>
          );
        })() || (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4">
            <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
            </div>
            <p className="text-neutral-500 font-medium">Чатлах хүнээ сонгоно уу</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {errorModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-neutral-900 border border-red-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_10px_40px_rgba(239,68,68,0.2)]"
            >
              <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-extrabold leading-none mb-1">!</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Эрх хаагдлаа</h3>
              <p className="text-neutral-300 font-medium mb-6 leading-relaxed">{errorModal}</p>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-red-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
