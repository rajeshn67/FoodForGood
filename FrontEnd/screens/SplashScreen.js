import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native"

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} defaultSource={require("../assets/logo.png")} />
      <Text style={styles.title}>Food For Good</Text>
      <Text style={styles.subtitle}>Connecting Donors with NGOs</Text>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
})

export default SplashScreen
