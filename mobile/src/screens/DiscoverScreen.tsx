import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';

export default function DiscoverScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-black text-pink-500 mb-6">Discover</Text>
        
        <View className="w-full h-96 bg-neutral-100 rounded-3xl border border-neutral-200 justify-center items-center shadow-sm mb-8">
          <Text className="text-neutral-400 font-medium text-lg">Хэрэглэгчийн зураг (Tinder swipe)</Text>
        </View>

        <View className="flex-row gap-6">
          <TouchableOpacity className="w-16 h-16 rounded-full bg-white border-2 border-neutral-200 items-center justify-center shadow-lg shadow-rose-500/20">
            <Text className="text-2xl">❌</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-16 h-16 rounded-full bg-white border-2 border-neutral-200 items-center justify-center shadow-lg shadow-emerald-500/20">
            <Text className="text-2xl">💚</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="mt-10 py-3 px-6 bg-neutral-100 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-neutral-600 font-bold">Буцах</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
