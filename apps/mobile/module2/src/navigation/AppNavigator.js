import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';

import DosenMainScreen from '../screens/dosen/DosenMainScreen';

import MahasiswaMainScreen from '../screens/mahasiswa/MahasiswaMainScreen';

import AdminNavigation from '../screens/admin-prodi/admin_navigation';

import SuperAdminNavigation from '../screens/super-admin/superadmin_navigation';

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

                {/* Admin Prodi Stack */}
                <Stack.Screen name="AdminMain" component={AdminNavigation} />

                {/* Super Admin Stack */}
                <Stack.Screen name="SuperAdminMain" component={SuperAdminNavigation} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
