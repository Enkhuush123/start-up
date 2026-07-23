"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MatchScreen from "@/components/MatchScreen";
import { getUnseenMatch, markMatchAsSeen } from "@/app/actions/matchNotifier";
import { supabase } from "@/lib/supabase";
import { checkSession } from "@/app/actions/session";

export default function GlobalMatchNotifier() {
    const [matchData, setMatchData] = useState<any>(null);
    const pathname = usePathname();

    // Check for unseen matches when the component mounts or when the pathname changes (user navigates)
    useEffect(() => {
        let isMounted = true;
        let channel: any;

        const initRealtime = async () => {
            const session = await checkSession();
            if (!session?.userId || !isMounted) return;

            const checkForMatches = async () => {
                const data = await getUnseenMatch();
                if (data && isMounted) {
                    setMatchData(data);
                    // Mark as seen immediately so it doesn't pop up again
                    await markMatchAsSeen(data.matchId);
                }
            };

            // Don't show the global match screen if they are already on the onboarding or welcome page
            if (pathname !== "/" && pathname !== "/onboarding") {
                checkForMatches();
            }

            // Subscribing to ANY Match updates
            channel = supabase
              .channel('global-match')
              .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Match' },
                (payload: any) => {
                   if (payload.new?.status === 'accepted' && 
                      (payload.new?.user1Id === session.userId || payload.new?.user2Id === session.userId)) {
                       checkForMatches();
                   }
                }
              )
              .subscribe();
        };

        initRealtime();

        return () => {
            isMounted = false;
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
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
