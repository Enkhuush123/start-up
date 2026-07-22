import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import "./global.css";

import LoginScreen from './src/screens/LoginScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ec4899', // pink-500
        tabBarInactiveTintColor: '#a3a3a3', // neutral-400
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f5f5f5',
          elevation: 0,
          shadowOpacity: 0,
        }
      }}
    >
      <Tab.Screen 
        name="DiscoverTab" 
        component={DiscoverScreen} 
        options={{ title: 'Хайх', tabBarIcon: () => <></> }}
      />
      <Tab.Screen 
        name="MatchesTab" 
        component={MatchesScreen} 
        options={{ title: 'Чат', tabBarIcon: () => <></> }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Профайл', tabBarIcon: () => <></> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
