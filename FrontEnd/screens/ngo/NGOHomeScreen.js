"use client"

import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../../config"
import Icon from "react-native-vector-icons/MaterialIcons"
import React from "react"

const NGOHomeScreen = () => {
  const navigation = useNavigation()
  const [userName, setUserName] = useState("")
  const [availableDonations, setAvailableDonations] = useState([])
  const [claimedDonations, setClaimedDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const name = await AsyncStorage.getItem("fullName")
      setUserName(name || "User")

      const token = await AsyncStorage.getItem("userToken")

      // Fetch available donations
      const availableResponse = await axios.get(`${API_URL}/api/donations`, {
        headers: {
          "x-auth-token": token,
        },
      })

      setAvailableDonations(availableResponse.data.slice(0, 3))

      // Fetch claimed donations
      const claimedResponse = await axios.get(`${API_URL}/api/donations/claimed`, {
        headers: {
          "x-auth-token": token,
        },
      })

      setClaimedDonations(claimedResponse.data.slice(0, 3))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchData()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#4CAF50"
      case "claimed":
        return "#2196F3"
      case "completed":
        return "#9E9E9E"
      default:
        return "#9E9E9E"
    }
  }

  const renderDonationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.donationItem}
      onPress={() =>
        navigation.navigate("Available", {
          screen: "DonationDetails",
          params: { donationId: item._id },
        })
      }
    >
      <View style={styles.donationHeader}>
        <Text style={styles.donationTitle} numberOfLines={1}>
          {item.foodName}
        </Text>
        {item.status && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={styles.donationDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.donationFooter}>
        <View style={styles.donorInfo}>
          <Icon name="person" size={14} color="#666" />
          <Text style={styles.donorName}>{item.donor?.fullName}</Text>
        </View>
        <Text style={styles.donationQuantity}>{item.quantity}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{availableDonations.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{claimedDonations.length}</Text>
          <Text style={styles.statLabel}>Claimed</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Donations</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Available")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : availableDonations.length > 0 ? (
          <FlatList
            data={availableDonations}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No available donations</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Claimed Donations</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Claimed")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : claimedDonations.length > 0 ? (
          <FlatList
            data={claimedDonations}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No claimed donations</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How It Works</Text>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>1</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Browse Donations</Text>
            <Text style={styles.infoStepDescription}>
              Browse through available food donations from generous donors.
            </Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>2</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Claim Food</Text>
            <Text style={styles.infoStepDescription}>
              Claim the food donations that you can collect and distribute.
            </Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>3</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Collect & Distribute</Text>
            <Text style={styles.infoStepDescription}>
              Collect the food from the donor and distribute it to those in need.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#252252",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: "#e0e0e0",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: -20,
    marginHorizontal: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  donationItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 15,
  },
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  donationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  donationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  donorName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  donationQuantity: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    padding: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoStep: {
    flexDirection: "row",
    marginBottom: 15,
  },
  infoStepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoStepNumberText: {
    color: "#fff",
    fontWeight: "bold",
  },
  infoStepContent: {
    flex: 1,
  },
  infoStepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  infoStepDescription: {
    fontSize: 14,
    color: "#666",
  },
})

export default NGOHomeScreen
