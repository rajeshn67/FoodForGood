"use client"

import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../config"
import Icon from "react-native-vector-icons/MaterialIcons"
import React from "react"

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation()
  const { setUserToken, setUserType, userType } = route.params

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
  })

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          "x-auth-token": token,
        },
      })

      setProfile(response.data)

      // Fetch donation stats
      if (userType === "donor") {
        const donationsResponse = await axios.get(`${API_URL}/api/donations`, {
          headers: {
            "x-auth-token": token,
          },
        })

        const donations = donationsResponse.data
        const totalDonations = donations.length
        const activeDonations = donations.filter((d) => d.status === "available").length
        const completedDonations = donations.filter((d) => d.status === "completed").length

        setStats({
          totalDonations,
          activeDonations,
          completedDonations,
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      Alert.alert("Error", "Failed to load profile data")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchProfile()
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken")
            await AsyncStorage.removeItem("userType")
            await AsyncStorage.removeItem("fullName")

            setUserToken(null)
            setUserType(null)
          } catch (error) {
            console.error("Error logging out:", error)
          }
        },
      },
    ])
  }

  const handleEditProfile = () => {
    navigation.navigate("EditProfile")
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />}
    >
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileInitials}>{profile?.fullName?.charAt(0).toUpperCase() || "U"}</Text>
        </View>
        <Text style={styles.profileName}>{profile?.fullName}</Text>
        <Text style={styles.profileType}>{userType === "donor" ? "Food Donor" : "NGO Partner"}</Text>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Icon name="edit" size={16} color="#fff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {userType === "donor" && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.activeDonations}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completedDonations}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoItem}>
          <Icon name="email" size={20} color="#4CAF50" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{profile?.email}</Text>
        </View>

        {profile?.phone && (
          <View style={styles.infoItem}>
            <Icon name="phone" size={20} color="#4CAF50" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{profile?.phone}</Text>
          </View>
        )}

        {profile?.address && (
          <View style={styles.infoItem}>
            <Icon name="location-on" size={20} color="#4CAF50" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{profile?.address}</Text>
          </View>
        )}

        <View style={styles.infoItem}>
          <Icon name="date-range" size={20} color="#4CAF50" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Joined:</Text>
          <Text style={styles.infoValue}>{new Date(profile?.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-to-app" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // light gray background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#6c7ba1", // dark indigo
    padding: 30,
    alignItems: "center",
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#252252",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  profileType: {
    fontSize: 16,
    color: "#dddddd",
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#ffffff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 15,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00bfa5", // teal accent
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  infoContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    margin: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#252252",
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    width: 70,
  },
  infoValue: {
    fontSize: 16,
    color: "#252252",
    flex: 1,
  },
  logoutButton: {
    backgroundColor: "#e53935", // soft red
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    margin: 15,
    borderRadius: 5,
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
})


export default ProfileScreen
