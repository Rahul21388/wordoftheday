import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "../screens/HomeScreen";
import ArchiveScreen from "../screens/ArchiveScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useColors, useTheme } from "../storage/ThemeContext";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: "book-open",
  Archive: "archive",
  Favourites: "heart",
  Settings: "settings",
};

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.bg,
      card: colors.bg,
      text: colors.text,
      border: colors.divider,
      primary: colors.teal,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            height: 64 + insets.bottom,
            paddingTop: 6,
            paddingBottom: 8 + insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.5,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={TAB_ICONS[route.name] || "circle"}
              color={color}
              size={focused ? size + 2 : size}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Archive" component={ArchiveScreen} />
        <Tab.Screen name="Favourites" component={FavouritesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return <TabNavigator />;
}
