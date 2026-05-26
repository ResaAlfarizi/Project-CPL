/**
 * components/ScreenBackground.js
 * Background foto UINSA yang sangat transparan di belakang semua screen.
 * Dipakai sebagai wrapper di App.js (screenViewport).
 */
import React from 'react';
import { StyleSheet, ImageBackground, View } from 'react-native';

const BG_IMAGE = require('../assets/uinsa2.jpeg');

export default function ScreenBackground({ children }) {
    return (
        <ImageBackground
            source={BG_IMAGE}
            style={styles.bg}
            resizeMode="cover"
            imageStyle={styles.bgImage}
        >
            {/* Overlay putih sangat transparan — gambar terlihat samar di bawah */}
            <View style={styles.overlay} />
            {children}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
    },
    bgImage: {
        opacity: 0.18,  // gambar sangat faded seperti referensi
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(246,245,250,0.0)',
    },
});
