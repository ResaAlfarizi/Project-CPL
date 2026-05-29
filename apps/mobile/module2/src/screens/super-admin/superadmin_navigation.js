import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SuperAdminDashboardScreen from './dashboard';
import SAKelolaProdiCPLScreen from './sa_kelola_prodi_cpl';
import SAKelolaMKScreen from './sa_kelola_mk';
import SAKelolaSubCpmkScreen from './sa_kelola_subcpmk';
import SAInputNilaiScreen from './sa_input_nilai';
import SAPantauCapaianScreen from './sa_pantau_capaian';
import SAKelolaUserScreen from './sa_kelola_user';
import SAAuditLogScreen from './sa_audit_log';
import SAProfilScreen from './sa_profil';

const Stack = createNativeStackNavigator();

export default function SuperAdminNavigation() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
            
            <Stack.Screen name="SA_KelolaProdiCPL" component={SAKelolaProdiCPLScreen} />
            
            <Stack.Screen name="SA_KelolaMK" component={SAKelolaMKScreen} />
            
            <Stack.Screen name="SA_KelolaSubCPMK" component={SAKelolaSubCpmkScreen} />
            
            <Stack.Screen name="SA_InputNilai" component={SAInputNilaiScreen} />
            
            <Stack.Screen name="SA_PantauCapaian" component={SAPantauCapaianScreen} />
            
            <Stack.Screen name="SA_KelolaUser" component={SAKelolaUserScreen} />
            
            <Stack.Screen name="SA_AuditLog" component={SAAuditLogScreen} />

            <Stack.Screen name="SA_Profil" component={SAProfilScreen} />
            
        </Stack.Navigator>
    );
}