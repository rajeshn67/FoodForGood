"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../config"
import Icon from "react-native-vector-icons/MaterialIcons"

const EditProfileScreen = () => {
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    userType: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          "x-auth-token": token,
        },
      })

      setProfile(response.data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      Alert.alert("Error", "Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value,
    })
  }

  const handleSubmit = async () => {
    if (!profile.fullName) {
      Alert.alert("Error", "Name is required")
      return
    }

    setIsSaving(true)

    try {
      const token = await AsyncStorage.getItem("userToken")

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        {
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      )

      // Update fullName in AsyncStorage if it changed
      if (profile.fullName !== (await AsyncStorage.getItem("fullName"))) {
        await AsyncStorage.setItem("fullName", profile.fullName)
      }

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={profile.fullName}
            onChangeText={(value) => handleChange("fullName", value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email (Cannot be changed)</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={profile.email} editable={false} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>User Type (Cannot be changed)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile.userType === "donor" ? "Food Donor" : "NGO Partner"}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={profile.phone}
            onChangeText={(value) => handleChange("phone", value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your address"
            value={profile.address}
            onChangeText={(value) => handleChange("address", value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  disabledInput: {
    backgroundColor: "#e9e9e9",
    color: "#666",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
})

export default EditProfileScreen
