"use client"

import { useState } from "react"
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../../config"
import DateTimePicker from "@react-native-community/datetimepicker"
import Icon from "react-native-vector-icons/MaterialIcons"

const AddDonationScreen = () => {
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    description: "",
    expiryDate: new Date(),
    pickupAddress: "",
    pickupTime: "",
  })

  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setFormData({
        ...formData,
        expiryDate: selectedDate,
      })
    }
  }

  const validateForm = () => {
    if (
      !formData.foodName ||
      !formData.quantity ||
      !formData.description ||
      !formData.pickupAddress ||
      !formData.pickupTime
    ) {
      Alert.alert("Error", "Please fill in all required fields")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await axios.post(`${API_URL}/api/donations`, formData, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      })

      Alert.alert("Success", "Your donation has been added successfully", [
        {
          text: "OK",
          onPress: () => {
            // Reset form after success
            setFormData({
              foodName: "",
              quantity: "",
              description: "",
              expiryDate: new Date(),
              pickupAddress: "",
              pickupTime: "",
            })

            navigation.navigate("Donations")
          },
        },
      ])
    } catch (error) {
      console.error("Error adding donation:", error)
      Alert.alert("Error", error.response?.data?.msg || "Failed to add donation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Donate Food</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Food Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Food Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter food name"
            value={formData.foodName}
            onChangeText={(value) => handleChange("foodName", value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 5 kg, 10 packets, 3 boxes"
            value={formData.quantity}
            onChangeText={(value) => handleChange("quantity", value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the food, its condition, etc."
            value={formData.description}
            onChangeText={(value) => handleChange("description", value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiry Date *</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{formData.expiryDate.toLocaleDateString()}</Text>
            <Icon name="calendar-today" size={20} color="#666" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.expiryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Pickup Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pickup Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter the address for food pickup"
            value={formData.pickupAddress}
            onChangeText={(value) => handleChange("pickupAddress", value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pickup Time *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., 2 PM - 5 PM, After 6 PM"
            value={formData.pickupTime}
            onChangeText={(value) => handleChange("pickupTime", value)}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Donation</Text>
          )}
        </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default AddDonationScreen
