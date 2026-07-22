import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

export default function MatchesScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2 border-b border-neutral-100">
        <Text className="text-3xl font-black text-pink-500">Чат & Тааралтууд</Text>
      </View>
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Mock Matches List */}
        <TouchableOpacity 
          className="flex-row items-center p-4 bg-neutral-50 rounded-2xl mb-4"
          onPress={() => navigation.navigate('Chat')}
        >
          <View className="w-14 h-14 bg-neutral-200 rounded-full mr-4" />
          <View className="flex-1">
            <Text className="font-bold text-lg">Хэрэглэгч 1</Text>
            <Text className="text-neutral-500">Сайн уу? Юу байна даа.</Text>
          </View>
          <View className="w-3 h-3 bg-pink-500 rounded-full" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
