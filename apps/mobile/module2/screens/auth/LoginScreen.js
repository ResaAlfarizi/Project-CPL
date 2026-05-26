import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, KeyboardAvoidingView, Platform,
    Dimensions, ActivityIndicator, ImageBackground,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Background gedung UINSA full screen
const BG_IMAGE = require('../../assets/uinsa2.jpeg');

export default function LoginScreen({ onLogin }) {
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg,     setErrorMsg]     = useState('');
    const [isLoading,    setIsLoading]    = useState(false);

    const handleLogin = async () => {
        setErrorMsg('');
        const trimmedEmail    = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setErrorMsg('Email dan password harus diisi');
            return;
        }

        setIsLoading(true);
        try {
            await onLogin({ email: trimmedEmail, password: trimmedPassword });
        } catch (err) {
            setErrorMsg(err.message || 'Email atau password salah');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground source={BG_IMAGE} style={styles.bgFull} resizeMode="cover">
            <View style={styles.bgOverlayFull} />

            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.cardContainer}>
                        {/* ── Login Card ── */}
                        <View style={styles.card}>
                            {/* Logo */}
                            <View style={styles.logoBadge}>
                                <MaterialCommunityIcons
                                    name="school-outline"
                                    size={28}
                                    color="#EFF0A3"
                                />
                            </View>

                            <Text style={styles.title}>Sistem CPL</Text>
                            <Text style={styles.subtitle}>
                                Masuk ke akun Anda untuk melanjutkan
                            </Text>

                            {/* Error */}
                            {errorMsg ? (
                                <View style={styles.errorBox}>
                                    <MaterialCommunityIcons
                                        name="alert-circle-outline"
                                        size={16}
                                        color="#EA5455"
                                    />
                                    <Text style={styles.errorText}>{errorMsg}</Text>
                                </View>
                            ) : null}

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={18}
                                        color="#94A3B8"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="nama@email.com"
                                        placeholderTextColor="#94A3B8"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons
                                        name="lock-outline"
                                        size={18}
                                        color="#94A3B8"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        <MaterialCommunityIcons
                                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color="#64748B"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                                activeOpacity={0.85}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Masuk</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <Text style={styles.footerText}>
                            © 2026 Sistem CPL – UIN Sunan Ampel Surabaya
                        </Text>
                    </View>
                </KeyboardAvoidingView>

                {/* N logo pojok kiri bawah */}
                <View style={styles.nLogo}>
                    <Text style={styles.nLogoText}>N</Text>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgFull: {
        flex: 1,
    },
    bgOverlayFull: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(246,245,250,0.82)', 
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
        zIndex: 10,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#2E4E3F', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 24,
        fontWeight: '800',
        color: '#212121',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 17,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEEEE',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
        marginBottom: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FFD1D1',
    },
    errorText: {
        fontFamily: 'Urbanist-SemiBold',
        color: '#EA5455',
        fontSize: 12,
        flex: 1,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 14,
    },
    label: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 6,
        paddingLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#212121',
        fontSize: 14,
        fontFamily: 'Urbanist-Medium',
        padding: 0,
    },
    eyeBtn: {
        padding: 4,
        marginLeft: 6,
    },
    submitBtn: {
        width: '100%',
        height: 50,
        backgroundColor: '#212121',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 5,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    footerText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 10,
        color: '#64748B',
        marginTop: 20,
        textAlign: 'center',
    },
    nLogo: {
        position: 'absolute',
        left: 24,
        bottom: 24,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#212121',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        zIndex: 5,
    },
    nLogoText: {
        fontFamily: 'Urbanist-Bold',
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
    },
});