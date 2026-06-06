import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    useFonts,
    Urbanist_300Light,
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    // Load fonts
    const [fontsLoaded] = useFonts({
        'Urbanist-Light':     Urbanist_300Light,
        'Urbanist-Regular':   Urbanist_400Regular,
        'Urbanist-Medium':    Urbanist_500Medium,
        'Urbanist-SemiBold':  Urbanist_600SemiBold,
        'Urbanist-Bold':      Urbanist_700Bold,
        'Urbanist-ExtraBold': Urbanist_800ExtraBold,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#212121" />
            </View>
        );
    }

    // BUNGKUS NAVIGATOR UTAMA DI SINI
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigator />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F5FA',
    },
});