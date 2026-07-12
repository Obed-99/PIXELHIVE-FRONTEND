import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import ContractScreen from './src/screens/ContractScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import UploadScreen from './src/screens/UploadScreen';
import ChatScreen from './src/screens/ChatScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SignupScreen from './src/screens/SignupScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import MessagesScreen from './src/screens/MessagesScreen';

// The list of screens and the data each one receives.
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Projects: undefined;
  ProjectDetail: { projectId: number; title: string };
  Contract: { projectId: number };
  Payment: { projectId: number; amount: number; title: string };
  Upload: { projectId: number };
  Chat: { projectId: number; title: string };
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
  AccountSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Projects" component={ProjectsScreen} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          <Stack.Screen name="Contract" component={ContractScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
