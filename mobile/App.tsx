import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import ContractScreen from './src/screens/ContractScreen';
import PaymentScreen from './src/screens/PaymentScreen';

// The list of screens and the data each one receives.
export type RootStackParamList = {
  Login: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: number; title: string };
  Contract: { projectId: number };
  Payment: { projectId: number; amount: number; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Projects" component={ProjectsScreen} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          <Stack.Screen name="Contract" component={ContractScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
