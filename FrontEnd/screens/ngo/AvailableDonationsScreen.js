"use client"

import React, { useState } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../../config"
import Icon from "react-native-vector-icons/MaterialIcons"

const AvailableDonationsScreen = () => {
  const navigation = useNavigation()
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDonations = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await axios.get(`${API_URL}/api/donations`, {
        headers: {
          "x-auth-token": token,
        },
      })

      setDonations(response.data)
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchDonations()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchDonations()
  }

  const renderDonationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.donationItem}
      onPress={() => navigation.navigate("DonationDetails", { donationId: item._id })}
    >
      <View style={styles.donationHeader}>
        <Text style={styles.donationTitle} numberOfLines={1}>
          {item.foodName}
        </Text>
      </View>

      <Text style={styles.donationDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.donationDetails}>
        <View style={styles.detailItem}>
          <Icon name="access-time" size={16} color="#666" />
          <Text style={styles.detailText}>{item.pickupTime}</Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="event" size={16} color="#666" />
          <Text style={styles.detailText}>Expires: {new Date(item.expiryDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>
      </View>

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
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : donations.length > 0 ? (
        <FlatList
          data={donations}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="inbox" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No available donations found</Text>
          <Text style={styles.emptySubText}>Check back later for new donations</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 15,
  },
  donationItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  donationHeader: {
    marginBottom: 10,
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  donationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  donationDetails: {
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  donorName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  donationQuantity: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
})

export default AvailableDonationsScreen
