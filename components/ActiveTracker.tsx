"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pingActive } from "@/app/actions/activity";

export default function ActiveTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Ping immediately on mount/navigation
        pingActive();

        // And ping every 1 minute if the tab is open
        const interval = setInterval(() => {
            pingActive();
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [pathname]);

    return null;
}
