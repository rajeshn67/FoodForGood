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
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleEdit = () => {
    navigation.navigate("EditDonation", { donation })
  }

  const handleDelete = () => {
    Alert.alert("Delete Donation", "Are you sure you want to delete this donation?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: confirmDelete,
        style: "destructive",
      },
    ])
  }

  const confirmDelete = async () => {
    setIsDeleting(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      await axios.delete(`${API_URL}/api/donations/${donationId}`, {
        headers: {
          "x-auth-token": token,
        },
      })

      Alert.alert("Success", "Donation deleted successfully")
      navigation.goBack()
    } catch (error) {
      console.error("Error deleting donation:", error)
      Alert.alert("Error", "Failed to delete donation")
      setIsDeleting(false)
    }
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

        {donation.status === "claimed" && donation.claimedBy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claimed By</Text>

            <View style={styles.detailRow}>
              <Icon name="person" size={20} color="#4CAF50" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>NGO:</Text>
              <Text style={styles.detailValue}>{donation.claimedBy.fullName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="email" size={20} color="#4CAF50" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{donation.claimedBy.email}</Text>
            </View>

            {donation.claimedBy.phone && (
              <View style={styles.detailRow}>
                <Icon name="phone" size={20} color="#4CAF50" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{donation.claimedBy.phone}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={20} color="#4CAF50" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Posted On:</Text>
            <Text style={styles.detailValue}>{new Date(donation.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {donation.status === "available" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="delete" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
})

export default DonationDetailsScreen
