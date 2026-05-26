import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import ProdiListScreen from '../screens/ProdiListScreen';
import CPLListScreen from '../screens/CPLListScreen';
import MKListScreen from '../screens/MKListScreen';
import MKDetailScreen from '../screens/MKDetailScreen';
import MappingScreen from '../screens/MappingScreen';
import SubCPMKScreen from '../screens/SubCPMKScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: Colors.eerieBlack,
  },
  headerTintColor: Colors.ghostWhite,
  headerTitleStyle: {
    fontFamily: 'Urbanist_700Bold',
    fontSize: 17,
  },
  headerBackTitleVisible: false,
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: Colors.screenBg,
  },
  animation: 'slide_from_right',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'CPL System',
            headerTitleStyle: {
              fontFamily: 'Urbanist_700Bold',
              fontSize: 18,
            },
          }}
        />
        <Stack.Screen
          name="ProdiList"
          component={ProdiListScreen}
          options={{ title: 'Daftar Prodi' }}
        />
        <Stack.Screen
          name="CPLList"
          component={CPLListScreen}
          options={{ title: 'Daftar CPL' }}
        />
        <Stack.Screen
          name="MKList"
          component={MKListScreen}
          options={{ title: 'Daftar Mata Kuliah' }}
        />
        <Stack.Screen
          name="MKDetail"
          component={MKDetailScreen}
          options={({ route }) => ({
            title: route.params?.mk?.kode_mk || 'Detail MK',
          })}
        />
        <Stack.Screen
          name="MappingList"
          component={MappingScreen}
          options={{ title: 'Pemetaan MK–CPL' }}
        />
        <Stack.Screen
          name="SubCPMKList"
          component={SubCPMKScreen}
          options={{ title: 'Sub-CPMK' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
