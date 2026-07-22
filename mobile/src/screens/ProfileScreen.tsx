import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen({ navigation }: any) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2 border-b border-neutral-100">
        <Text className="text-3xl font-black text-pink-500">Профайл</Text>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="items-center mb-8">
          <View className="w-32 h-32 bg-neutral-200 rounded-full mb-4" />
          <Text className="text-2xl font-bold">Хэрэглэгч</Text>
          <Text className="text-neutral-500">Улаанбаатар, Монгол</Text>
        </View>
        
        <View className="space-y-4">
          <TouchableOpacity className="bg-neutral-50 p-4 rounded-2xl flex-row justify-between items-center">
            <Text className="font-medium text-lg">Зураг солих</Text>
            <Text className="text-neutral-400">{">"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-neutral-50 p-4 rounded-2xl flex-row justify-between items-center">
            <Text className="font-medium text-lg">Тохиргоо</Text>
            <Text className="text-neutral-400">{">"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-red-50 p-4 rounded-2xl flex-row justify-center items-center mt-6"
            onPress={handleLogout}
          >
            <Text className="font-bold text-red-500 text-lg">Гарах</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
