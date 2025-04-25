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

const DonorHomeScreen = () => {
  const navigation = useNavigation()
  const [userName, setUserName] = useState("")
  const [recentDonations, setRecentDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const name = await AsyncStorage.getItem("fullName")
      setUserName(name || "User")

      const token = await AsyncStorage.getItem("userToken")
      const response = await axios.get(`${API_URL}/api/donations`, {
        headers: {
          "x-auth-token": token,
        },
      })

      // Get only the 5 most recent donations
      setRecentDonations(response.data.slice(0, 5))
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
        navigation.navigate("Donations", {
          screen: "DonationDetails",
          params: { donationId: item._id },
        })
      }
    >
      <View style={styles.donationHeader}>
        <Text style={styles.donationTitle} numberOfLines={1}>
          {item.foodName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.donationDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.donationFooter}>
        <Text style={styles.donationDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
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

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("AddDonation")}>
          <View style={styles.actionIconContainer}>
            <Icon name="add" size={30} color="#fff" />
          </View>
          <Text style={styles.actionText}>Donate Food</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Donations")}>
          <View style={styles.actionIconContainer}>
            <Icon name="list" size={30} color="#fff" />
          </View>
          <Text style={styles.actionText}>My Donations</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Donations</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Donations")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : recentDonations.length > 0 ? (
          <FlatList
            data={recentDonations}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No donations yet</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate("AddDonation")}>
              <Text style={styles.emptyButtonText}>Make Your First Donation</Text>
            </TouchableOpacity>
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
            <Text style={styles.infoStepTitle}>Donate Food</Text>
            <Text style={styles.infoStepDescription}>
              Add details about the food you want to donate, including quantity and pickup information.
            </Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>2</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>NGO Claims</Text>
            <Text style={styles.infoStepDescription}>NGOs will see your donation and can claim it for pickup.</Text>
          </View>
        </View>

        <View style={styles.infoStep}>
          <View style={styles.infoStepNumber}>
            <Text style={styles.infoStepNumberText}>3</Text>
          </View>
          <View style={styles.infoStepContent}>
            <Text style={styles.infoStepTitle}>Food Delivered</Text>
            <Text style={styles.infoStepDescription}>
              The NGO will pick up the food from your location and distribute it to those in need.
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
  actionContainer: {
    flexDirection: "row",
    marginTop: -30,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  actionButton: {
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
  actionIconContainer: {
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  recentContainer: {
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
    marginBottom: 5,
  },
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  donationDate: {
    fontSize: 12,
    color: "#999",
  },
  donationQuantity: {
    fontSize: 12,
    color: "#666",
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
    marginVertical: 10,
  },
  emptyButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
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

export default DonorHomeScreen
