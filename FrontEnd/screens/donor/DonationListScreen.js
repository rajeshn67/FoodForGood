"use client"

import React, { useState } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../../config"
import Icon from "react-native-vector-icons/MaterialIcons"

const DonationListScreen = () => {
  const navigation = useNavigation()
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState("all")

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

  const getFilteredDonations = () => {
    if (filter === "all") {
      return donations
    }
    return donations.filter((donation) => donation.status === filter)
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
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
      </View>

      <View style={styles.donationFooter}>
        <Text style={styles.donationDate}>Posted: {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.donationQuantity}>{item.quantity}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "available" && styles.activeFilter]}
          onPress={() => setFilter("available")}
        >
          <Text style={[styles.filterText, filter === "available" && styles.activeFilterText]}>Available</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "claimed" && styles.activeFilter]}
          onPress={() => setFilter("claimed")}
        >
          <Text style={[styles.filterText, filter === "claimed" && styles.activeFilterText]}>Claimed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "completed" && styles.activeFilter]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterText, filter === "completed" && styles.activeFilterText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : getFilteredDonations().length > 0 ? (
        <FlatList
          data={getFilteredDonations()}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="inbox" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No donations found</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddDonation")}>
            <Text style={styles.addButtonText}>Add New Donation</Text>
          </TouchableOpacity>
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
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeFilter: {
    borderBottomColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterText: {
    color: "#4CAF50",
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  donationTitle: {
    fontSize: 18,
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
  donationDate: {
    fontSize: 12,
    color: "#999",
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
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})

export default DonationListScreen
