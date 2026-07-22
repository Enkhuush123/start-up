import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import "./global.css"; // Required for NativeWind v4

import LoginScreen from './src/screens/LoginScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Discover" component={DiscoverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
