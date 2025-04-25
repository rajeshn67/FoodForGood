"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../../config"
import Icon from "react-native-vector-icons/MaterialIcons"

const DonationDetailsScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { donationId } = route.params

  const [donation, setDonation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    fetchDonationDetails()
  }, [donationId])

  const fetchDonationDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await axios.get(`${API_URL}/api/donations/${donationId}`, {
        headers: {
          "x-auth-token": token,
        },
      })

      setDonation(response.data)
    } catch (error) {
      console.error("Error fetching donation details:", error)
      Alert.alert("Error", "Failed to load donation details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaim = () => {
    Alert.alert("Claim Donation", "Are you sure you want to claim this donation?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Claim",
        onPress: confirmClaim,
      },
    ])
  }

  const confirmClaim = async () => {
    setIsClaiming(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      await axios.put(
        `${API_URL}/api/donations/${donationId}/claim`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      Alert.alert("Success", "Donation claimed successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (error) {
      console.error("Error claiming donation:", error)
      Alert.alert("Error", "Failed to claim donation")
      setIsClaiming(false)
    }
  }

  const handleComplete = () => {
    Alert.alert("Complete Donation", "Mark this donation as completed?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Complete",
        onPress: confirmComplete,
      },
    ])
  }

  const confirmComplete = async () => {
    setIsCompleting(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      await axios.put(
        `${API_URL}/api/donations/${donationId}/complete`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      Alert.alert("Success", "Donation marked as completed", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (error) {
      console.error("Error completing donation:", error)
      Alert.alert("Error", "Failed to complete donation")
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (!donation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Donation not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
   

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{donation.foodName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(donation.status) }]}>
            <Text style={styles.statusText}>{donation.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Information</Text>

          <View style={styles.detailRow}>
            <Icon name="restaurant" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{donation.quantity}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="description" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Description:</Text>
          </View>
          <Text style={styles.descriptionText}>{donation.description}</Text>

          <View style={styles.detailRow}>
            <Icon name="event" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Expiry Date:</Text>
            <Text style={styles.detailValue}>{new Date(donation.expiryDate).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Information</Text>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Address:</Text>
          </View>
          <Text style={styles.descriptionText}>{donation.pickupAddress}</Text>

          <View style={styles.detailRow}>
            <Icon name="access-time" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Pickup Time:</Text>
            <Text style={styles.detailValue}>{donation.pickupTime}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donor Information</Text>

          <View style={styles.detailRow}>
            <Icon name="person" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{donation.donor?.fullName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="email" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{donation.donor?.email}</Text>
          </View>

          {donation.donor?.phone && (
            <View style={styles.detailRow}>
              <Icon name="phone" size={20} color="#4CAF50" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{donation.donor?.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Posted On:</Text>
            <Text style={styles.detailValue}>{new Date(donation.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {donation.status === "available" && (
          <TouchableOpacity style={styles.claimButton} onPress={handleClaim} disabled={isClaiming}>
            {isClaiming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.claimButtonText}>Claim This Donation</Text>
            )}
          </TouchableOpacity>
        )}

        {donation.status === "claimed" && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete} disabled={isCompleting}>
            {isCompleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
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
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    paddingLeft: 30,
  },
  claimButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  claimButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default DonationDetailsScreen
