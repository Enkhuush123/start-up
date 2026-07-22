import React from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function ChatScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-neutral-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-pink-500 font-bold">Буцах</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">Хэрэглэгч 1</Text>
      </View>
      
      <ScrollView className="flex-1 px-4 py-4">
        {/* Mock Messages */}
        <View className="mb-4 items-start">
          <View className="bg-neutral-100 px-4 py-3 rounded-2xl max-w-[80%]">
            <Text>Сайн уу? Юу байна даа.</Text>
          </View>
        </View>
        
        <View className="mb-4 items-end">
          <View className="bg-pink-500 px-4 py-3 rounded-2xl max-w-[80%]">
            <Text className="text-white">Сайн сайн, өөрөөрөө юу байна?</Text>
          </View>
        </View>
      </ScrollView>

      {/* AI Action Buttons */}
      <View className="flex-row px-4 py-2 gap-2 bg-neutral-50 border-t border-neutral-100">
        <TouchableOpacity className="flex-1 bg-white border border-pink-200 py-2 rounded-full items-center">
          <Text className="text-pink-500 font-medium text-xs">✨ Cupid AI</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white border border-pink-200 py-2 rounded-full items-center">
          <Text className="text-pink-500 font-medium text-xs">💬 Яриа дүгнэх</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 py-4 flex-row items-center border-t border-neutral-100">
        <TextInput 
          placeholder="Зурвас бичих..."
          className="flex-1 bg-neutral-100 px-4 py-3 rounded-full mr-2"
        />
        <TouchableOpacity className="bg-pink-500 w-12 h-12 rounded-full items-center justify-center">
          <Text className="text-white font-bold">{">"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
