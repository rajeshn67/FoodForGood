"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Import screens
import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import DonorNavigator from "./navigation/DonorNavigator"
import NGONavigator from "./navigation/NGONavigator"
import SplashScreen from "./screens/SplashScreen"

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState(null)
  const [userType, setUserType] = useState(null)

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const type = await AsyncStorage.getItem("userType")

      if (token && type) {
        setUserToken(token)
        setUserType(type)
      }

      setIsLoading(false)
    } catch (error) {
      console.log("Error checking login status:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkLoginStatus()
  }, [])

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#252252",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {userToken === null ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Food For Good - Login" }}
              initialParams={{ setUserToken, setUserType }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Food For Good - Register" }}
              initialParams={{ setUserToken, setUserType }}
            />
          </>
        ) : (
          // App screens based on user type
          <>
            {userType === "donor" ? (
              <Stack.Screen
                name="DonorHome"
                component={DonorNavigator}
                options={{ headerShown: false }}
                initialParams={{ setUserToken, setUserType }}
              />
            ) : (
              <Stack.Screen
                name="NGOHome"
                component={NGONavigator}
                options={{ headerShown: false }}
                initialParams={{ setUserToken, setUserType }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
