import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <Text className="text-4xl font-black text-pink-500 mb-2">Rizz & Fizz</Text>
          <Text className="text-neutral-500 text-center font-medium">
            Find your perfect match and best dates today.
          </Text>
        </View>

        <View className="space-y-4 mb-6">
          <TextInput
            placeholder="Имэйл хаяг"
            className="w-full bg-neutral-100 px-4 py-4 rounded-2xl font-medium text-neutral-900"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Нууц үг"
            className="w-full bg-neutral-100 px-4 py-4 rounded-2xl font-medium text-neutral-900"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-pink-500 py-4 rounded-full items-center shadow-lg shadow-pink-500/30"
          onPress={() => navigation.replace('Main')}
        >
          <Text className="text-white font-bold text-lg">Нэвтрэх</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="mt-6 items-center">
          <Text className="text-neutral-500 font-bold">Бүртгүүлэх</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
