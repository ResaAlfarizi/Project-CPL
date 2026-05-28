import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Dosen Screens
import DosenMainScreen from '../screens/dosen/DosenMainScreen';

// Mahasiswa Screens
import MahasiswaMainScreen from '../screens/mahasiswa/MahasiswaMainScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {/* Auth Stack */}
                <Stack.Screen name="Login" component={LoginScreen} />
                
                {/* Dosen Stack */}
                <Stack.Screen name="DosenMain" component={DosenMainScreen} />
                
                {/* Mahasiswa Stack */}
                <Stack.Screen name="MahasiswaMain" component={MahasiswaMainScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
