import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DosenMainScreen from '../screens/dosen/DosenMainScreen';
import MahasiswaMainScreen from '../screens/mahasiswa/MahasiswaMainScreen';
import AdminNavigation from '../screens/admin-prodi/admin_navigation';
import SuperAdminNavigation from '../screens/super-admin/superadmin_navigation';
import { setSessionExpiredHandler } from '../services/api';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const navigationRef = useRef(null);

    useEffect(() => {
        // Daftarkan handler: saat token expired & refresh gagal, langsung ke Login
        setSessionExpiredHandler(() => {
            console.log('🔒 Sesi habis, redirect ke Login');
            if (navigationRef.current) {
                navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        });
    }, []);

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName="Landing"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {/* Landing Screen */}
                <Stack.Screen name="Landing" component={LandingScreen} />

                {/* Auth Stack */}
                <Stack.Screen name="Login" component={LoginScreen} />
                
                {/* Dosen Stack */}
                <Stack.Screen name="DosenMain" component={DosenMainScreen} />
                
                {/* Mahasiswa Stack */}
                <Stack.Screen name="MahasiswaMain" component={MahasiswaMainScreen} />

                {/* Admin Prodi Stack */}
                <Stack.Screen name="AdminMain" component={AdminNavigation} />

                {/* Super Admin Stack */}
                <Stack.Screen name="SuperAdminMain" component={SuperAdminNavigation} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
