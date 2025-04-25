import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialIcons"

// Import screens
import NGOHomeScreen from "../screens/ngo/NGOHomeScreen"
import AvailableDonationsScreen from "../screens/ngo/AvailableDonationsScreen"
import DonationDetailsScreen from "../screens/ngo/DonationDetailsScreen"
import ClaimedDonationsScreen from "../screens/ngo/ClaimedDonationsScreen"
import ProfileScreen from "../screens/ProfileScreen"
import EditProfileScreen from "../screens/EditProfileScreen"

const Tab = createBottomTabNavigator()
const DonationStack = createStackNavigator()
const ClaimedStack = createStackNavigator()
const ProfileStack = createStackNavigator()

const DonationStackNavigator = () => {
  return (
    <DonationStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#252252",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <DonationStack.Screen
        name="AvailableDonations"
        component={AvailableDonationsScreen}
        options={{ title: "Available Donations" }}
      />
      <DonationStack.Screen
        name="DonationDetails"
        component={DonationDetailsScreen}
        options={{ title: "Donation Details" }}
      />
    </DonationStack.Navigator>
  )
}

const ClaimedStackNavigator = () => {
  return (
    <ClaimedStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#252252",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <ClaimedStack.Screen
        name="ClaimedDonations"
        component={ClaimedDonationsScreen}
        options={{ title: "Claimed Donations" }}
      />
      <ClaimedStack.Screen
        name="ClaimedDonationDetails"
        component={DonationDetailsScreen}
        options={{ title: "Donation Details" }}
      />
    </ClaimedStack.Navigator>
  )
}

const ProfileStackNavigator = ({ route }) => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#252252",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: "My Profile" }}
        initialParams={route.params}
      />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
    </ProfileStack.Navigator>
  )
}

const NGONavigator = ({ route }) => {
  const { setUserToken, setUserType } = route.params

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home"
          } else if (route.name === "Available") {
            iconName = focused ? "list" : "list"
          } else if (route.name === "Claimed") {
            iconName = focused ? "check-circle" : "check-circle-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={NGOHomeScreen} initialParams={{ userType: "ngo" }} />
      <Tab.Screen name="Available" component={DonationStackNavigator} options={{ title: "Available" }} />
      <Tab.Screen name="Claimed" component={ClaimedStackNavigator} options={{ title: "Claimed" }} />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        initialParams={{ setUserToken, setUserType, userType: "ngo" }}
      />
    </Tab.Navigator>
  )
}

export default NGONavigator
