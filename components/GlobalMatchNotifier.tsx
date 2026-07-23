"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MatchScreen from "@/components/MatchScreen";
import { getUnseenMatch, markMatchAsSeen } from "@/app/actions/matchNotifier";

export default function GlobalMatchNotifier() {
    const [matchData, setMatchData] = useState<any>(null);
    const pathname = usePathname();

    // Check for unseen matches when the component mounts or when the pathname changes (user navigates)
    useEffect(() => {
        const checkForMatches = async () => {
            const data = await getUnseenMatch();
            if (data) {
                setMatchData(data);
                // Mark as seen immediately so it doesn't pop up again
                await markMatchAsSeen(data.matchId);
            }
        };

        // Don't show the global match screen if they are already on the onboarding or welcome page
        if (pathname !== "/" && pathname !== "/onboarding") {
            checkForMatches();
        }
    }, [pathname]);

    if (!matchData) return null;

    return (
        <MatchScreen
            currentUserPhoto={matchData.currentUserPhoto}
            matchedUser={matchData.matchedUser}
            onClose={() => setMatchData(null)}
        />
    );
}
