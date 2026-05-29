import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboardScreen from './dashboard';
import ProfilAdminScreen from './profil_admin';
import KelolaCPLScreen from './kelola_cpl';
import KelolaMKScreen from './kelola_mk';
import KelolaSubCpmkScreen from './kelola_subcpmk';
import KelolaUserScreen from './kelola_user';
import PantauNilaiScreen from './pantau_nilai';
import LaporanCPLScreen from './pantau_capaian';
import AuditLogScreen from './audit_log';

const Stack = createNativeStackNavigator();

export default function AdminNavigation() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminProfil" component={ProfilAdminScreen} />
            <Stack.Screen name="AdminKelolaCPL" component={KelolaCPLScreen} />
            <Stack.Screen name="AdminKelolaMK" component={KelolaMKScreen} />
            <Stack.Screen name="AdminKelolaSubCpmk" component={KelolaSubCpmkScreen} />
            <Stack.Screen name="AdminKelolaUser" component={KelolaUserScreen} />
            <Stack.Screen name="AdminPantauNilai" component={PantauNilaiScreen} />
            <Stack.Screen name="AdminPantauCapaian" component={LaporanCPLScreen} />
            <Stack.Screen name="AdminAuditLog" component={AuditLogScreen} />
        </Stack.Navigator>
    );
}