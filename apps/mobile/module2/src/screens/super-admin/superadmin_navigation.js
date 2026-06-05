import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ─── Import semua screen ───────────────────────────────────────────────────────
import SuperAdminDashboardScreen    from './dashboard';
import SAKelolaProdiScreen          from './sa_kelola_prodi';
import SA_KelolaCPLScreen          from './sa_kelola_cpl';
import SAKelolaMKScreen             from './sa_kelola_mk';
import SAKelolaSubCpmkScreen        from './sa_kelola_subcpmk';
import SAPemetaanMKCPLScreen        from './sa_pemetaan_mk_cpl';
import SAInputNilaiScreen           from './sa_input_nilai';
import SAKelolaUserScreen           from './sa_kelola_user';
import SAHakUserScreen              from './sa_hak_user';
import SAThresholdScreen            from './sa_threshold';
import SAAuditLogScreen             from './sa_audit_log';
import SAProfilScreen               from './sa_profil';
import SAPantauCapaianScreen          from './sa_pantau_capaian';
import SAMahasiswaDosenScreen          from './sa_mahasiswa_dosen';

const Stack = createNativeStackNavigator();

export default function SuperAdminNavigation() {
    return (
        <Stack.Navigator 
            screenOptions={{ 
                headerShown: false, 
                animation: 'slide_from_right' 
            }}
        >
            {/* Dashboard utama */}
            <Stack.Screen name="SuperAdminDashboard"  component={SuperAdminDashboardScreen} />

            {/* Master Data */}
            <Stack.Screen name="SA_KelolaProdi"       component={SAKelolaProdiScreen} />
            <Stack.Screen name="SA_KelolaMK"          component={SAKelolaMKScreen} />
            <Stack.Screen name="SA_KelolaSubCPMK"     component={SAKelolaSubCpmkScreen} />
            <Stack.Screen name="SA_PemetaanMKCPL"     component={SAPemetaanMKCPLScreen} />
            <Stack.Screen name="SAMahasiswaDosen"     component={SAMahasiswaDosenScreen} />


            {/* Operasional */}
            <Stack.Screen name="SA_KelolaCPL"         component={SA_KelolaCPLScreen} />
            <Stack.Screen name="SA_InputNilai"        component={SAInputNilaiScreen} />
            <Stack.Screen name="SA_KelolaUser"        component={SAKelolaUserScreen} />
            <Stack.Screen name="SA_HakUser"           component={SAHakUserScreen} />
            <Stack.Screen name="SA_AuditLog"          component={SAAuditLogScreen} />
            <Stack.Screen name="SA_PantauCapaian"     component={SAPantauCapaianScreen} />

            {/* Pengaturan */}
            <Stack.Screen name="SA_Threshold"         component={SAThresholdScreen} />

            {/* Profil */}
            <Stack.Screen name="SA_Profil"            component={SAProfilScreen} />
        </Stack.Navigator>
    );
}
