"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import mn from "@/locales/mn.json";
import en from "@/locales/en.json";

type Lang = "MN" | "EN";
type Dictionary = Record<string, string>;

interface LanguageContextType {
    lang: Lang;
    toggleLang: () => void;
    t: (key: string) => string;
}

const dictionaries: Record<Lang, Dictionary> = {
    MN: mn as Dictionary,
    EN: en as Dictionary
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>("MN");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("lang") as Lang;
        if (stored === "MN" || stored === "EN") {
            setLang(stored);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("lang", lang);
        }
    }, [lang, mounted]);

    const t = (key: string) => {
        const dict = dictionaries[lang];
        return dict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLang: () => setLang(prev => prev === "MN" ? "EN" : "MN"), t }}>
            {mounted ? children : <div style={{ display: "contents", visibility: "hidden" }}>{children}</div>}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) throw new Error("useLanguage must be used within LanguageProvider");
    return context;
};
