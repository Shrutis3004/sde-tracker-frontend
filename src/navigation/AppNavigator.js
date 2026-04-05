import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TopicsScreen from '../screens/TopicsScreen';
import ProblemsScreen from '../screens/ProblemsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SheetTopicsScreen from '../screens/SheetTopicsScreen';
import BlogScreen from '../screens/BlogScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import GoalsScreen from '../screens/GoalsScreen';
import MockInterviewScreen from '../screens/MockInterviewScreen';
import HeaderSearch from '../components/HeaderSearch';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Dashboard', icon: 'home', iconOutline: 'home-outline' },
  { name: 'Topics', label: 'SDE Sheet', icon: 'list', iconOutline: 'list-outline' },
  { name: 'Profile', label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS[index];
        if (!tab) return null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.7}
            style={styles.tabItem}
          >
            {focused ? (
              <LinearGradient
                colors={['#3BA8D4', '#62c1e5', '#a0d9ef']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activePill}
              >
                <Ionicons name={tab.icon} size={18} color="#fff" />
                <Text style={styles.activePillText}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.inactivePill, { backgroundColor: theme.isDark ? '#2A2A3D' : '#EEEEF4' }]}>
                <Ionicons name={tab.iconOutline} size={18} color={theme.textMuted} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerBackground: () => (
          <LinearGradient
            colors={['#3BA8D4', '#62c1e5', '#a0d9ef']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ),
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={({ navigation: nav }) => ({
        title: 'Dashboard',
        headerRight: () => <HeaderSearch navigation={nav} />,
      })} />
      <Tab.Screen name="Topics" component={TopicsScreen} options={{ title: 'SDE Sheet' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="SheetTopics" component={SheetTopicsScreen} options={({ route }) => ({ title: route.params.name })} />
          <Stack.Screen name="Problems" component={ProblemsScreen} options={({ route }) => ({ title: route.params.topicName })} />
          <Stack.Screen name="Blog" component={BlogScreen} options={({ route }) => ({ title: route.params.category })} />
          <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ title: 'Theme Settings' }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ title: 'Bookmarks' }} />
          <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Daily Goals' }} />
          <Stack.Screen name="MockInterview" component={MockInterviewScreen} options={{ title: 'Mock Interview' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingBottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#62c1e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  activePillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  inactivePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
