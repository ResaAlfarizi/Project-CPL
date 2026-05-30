import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function LandingScreen() {
    const navigation = useNavigation();

    const features = [
        { icon: 'account-school', title: 'Portal Mahasiswa', desc: 'Akses capaian CPL dan nilai Anda' },
        { icon: 'teach', title: 'Portal Dosen', desc: 'Kelola mata kuliah dan input nilai' },
        { icon: 'school', title: 'Admin Prodi', desc: 'Manajemen program studi dan CPL' },
        { icon: 'shield-account', title: 'Super Admin', desc: 'Kontrol penuh sistem' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ExpoStatusBar style="light" />

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <ImageBackground
                    source={require('../../assets/uinsa2.jpeg')}
                    style={styles.hero}
                    imageStyle={styles.heroImage}
                >
                    <View style={styles.heroOverlay}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <MaterialCommunityIcons name="school" size={48} color="#EFF0A3" />
                            </View>
                        </View>

                        <Text style={styles.heroTitle}>Sistem Capaian{'\n'}Pembelajaran Lulusan</Text>
                        <Text style={styles.heroSubtitle}>
                            Platform terintegrasi untuk monitoring dan evaluasi capaian pembelajaran mahasiswa
                        </Text>

                        <TouchableOpacity 
                            style={styles.btnPrimary}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnPrimaryText}>Masuk ke Sistem</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#212121" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Fitur Unggulan</Text>
                    <Text style={styles.sectionSubtitle}>
                        Sistem yang dirancang untuk memudahkan pengelolaan capaian pembelajaran
                    </Text>

                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <View style={styles.featureIconContainer}>
                                    <MaterialCommunityIcons 
                                        name={feature.icon} 
                                        size={36} 
                                        color="#212121" 
                                    />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>4</Text>
                            <Text style={styles.statLabel}>Portal</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>100%</Text>
                            <Text style={styles.statLabel}>Terintegrasi</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24/7</Text>
                            <Text style={styles.statLabel}>Online</Text>
                        </View>
                    </View>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>Siap Memulai?</Text>
                    <Text style={styles.ctaSubtitle}>
                        Masuk ke sistem untuk mengakses portal sesuai role Anda
                    </Text>
                    <TouchableOpacity 
                        style={styles.btnSecondary}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="login" size={20} color="#FFFFFF" />
                        <Text style={styles.btnSecondaryText}>Masuk Sekarang</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2024 Sistem CPL</Text>
                    <Text style={styles.footerSubtext}>All rights reserved</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F5FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 0,
    },

    // Hero Section
    hero: {
        minHeight: 600,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    heroImage: {
        opacity: 0.15,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 40, 25, 0.92)',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 32,
    },
    logoIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(33, 44, 33, 0.8)',
        borderWidth: 3,
        borderColor: '#EFF0A3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontFamily: 'Urbanist-ExtraBold',
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 44,
    },
    heroSubtitle: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF0A3',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    btnPrimaryText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
    },

    // Features Section
    featuresSection: {
        paddingHorizontal: 24,
        paddingVertical: 60,
        backgroundColor: '#F6F5FA',
    },
    sectionTitle: {
        fontFamily: 'Urbanist-ExtraBold',
        fontSize: 28,
        fontWeight: '800',
        color: '#212121',
        textAlign: 'center',
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    featuresGrid: {
        gap: 16,
    },
    featureCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.03)',
    },
    featureIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#EFF0A3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 8,
        textAlign: 'center',
    },
    featureDesc: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 19,
    },

    // Stats Section
    statsSection: {
        backgroundColor: '#212121',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    statNumber: {
        fontFamily: 'Urbanist-ExtraBold',
        fontSize: 32,
        fontWeight: '800',
        color: '#EFF0A3',
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // CTA Section
    ctaSection: {
        paddingHorizontal: 24,
        paddingVertical: 60,
        backgroundColor: '#CFDECA',
        alignItems: 'center',
    },
    ctaTitle: {
        fontFamily: 'Urbanist-ExtraBold',
        fontSize: 28,
        fontWeight: '800',
        color: '#212121',
        marginBottom: 12,
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    btnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#212121',
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    btnSecondaryText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Footer
    footer: {
        backgroundColor: '#212121',
        paddingVertical: 32,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    footerSubtext: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
