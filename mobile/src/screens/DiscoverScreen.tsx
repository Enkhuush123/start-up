import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { supabase } from '../../lib/supabase';

// Use computer's local IP for API in development, or fallback to localhost
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function DiscoverScreen({ navigation }: any) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndMatches();
  }, []);

  const fetchUserAndMatches = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        // Try fetching real data from local API
        try {
          const response = await fetch(`${API_URL}/api/discover?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setCards(data);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.log("Could not fetch API, falling back to mock data");
        }
      }
      
      // Fallback Mock Data if API fails or empty
      setCards([
        {
          id: '1',
          name: 'Анужин',
          age: 23,
          bio: 'Аялах дуртай, кофенд нугасгүй ☕️',
          distanceKm: 5,
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop'
        },
        {
          id: '2',
          name: 'Хулан',
          age: 21,
          bio: 'Ном унших дуртай 📚',
          distanceKm: 12,
          image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=500&fit=crop'
        },
        {
          id: '3',
          name: 'Тэмүүлэн',
          age: 25,
          bio: 'Бизнес, стартап сонирхдог 🚀',
          distanceKm: 2,
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=500&fit=crop'
        }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSwipeRight = async (cardIndex: number) => {
    if (!userId) return;
    const targetUserId = cards[cardIndex].id;
    try {
      await fetch(`${API_URL}/api/discover/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetUserId, isLike: true })
      });
    } catch (e) {
      console.log('Swipe right failed:', e);
    }
  };

  const onSwipeLeft = async (cardIndex: number) => {
    if (!userId) return;
    const targetUserId = cards[cardIndex].id;
    try {
      await fetch(`${API_URL}/api/discover/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetUserId, isLike: false })
      });
    } catch (e) {
      console.log('Swipe left failed:', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#ec4899" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2 border-b border-neutral-100 flex-row justify-between items-center">
        <Text className="text-3xl font-black text-pink-500">Discover</Text>
      </View>

      <View className="flex-1 -mt-4 relative">
        {cards.length > 0 ? (
          <Swiper
            cards={cards}
            renderCard={(card) => {
              return (
                <View className="bg-white rounded-3xl h-[65vh] shadow-xl shadow-black/10 border border-neutral-100 overflow-hidden relative">
                  {card.image ? (
                    <Image source={{ uri: card.image }} className="w-full h-full absolute" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full absolute bg-neutral-200" />
                  )}
                  {/* Gradient Overlay for Text */}
                  <View className="absolute bottom-0 w-full p-6 bg-black/40">
                    <Text className="text-3xl font-bold text-white mb-1">
                      {card.name || 'Нэргүй'}, {card.age || '20'}
                    </Text>
                    {card.bio && (
                      <Text className="text-white/90 text-base mb-2">{card.bio}</Text>
                    )}
                    {card.distanceKm !== undefined && card.distanceKm !== null && (
                      <View className="bg-white/20 self-start px-3 py-1 rounded-full">
                        <Text className="text-white text-sm font-medium">📍 {card.distanceKm} км зайд</Text>
                      </View>
                    )}
                  </View>
                </View>
              )
            }}
            onSwipedRight={onSwipeRight}
            onSwipedLeft={onSwipeLeft}
            cardIndex={0}
            backgroundColor={'#ffffff'}
            stackSize={3}
            disableBottomSwipe
            disableTopSwipe
            animateOverlayLabelsOpacity
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    backgroundColor: 'transparent',
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    borderWidth: 4,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30
                  }
                }
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: 'transparent',
                    borderColor: '#10b981',
                    color: '#10b981',
                    borderWidth: 4,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30
                  }
                }
              }
            }}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-xl font-bold text-neutral-400">Хүн дууссан байна!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
