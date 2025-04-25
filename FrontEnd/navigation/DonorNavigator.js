import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/MaterialIcons"

// Import screens
import DonorHomeScreen from "../screens/donor/DonorHomeScreen"
import DonationListScreen from "../screens/donor/DonationListScreen"
import AddDonationScreen from "../screens/donor/AddDonationScreen"
import DonationDetailsScreen from "../screens/donor/DonationDetailsScreen"
import EditDonationScreen from "../screens/donor/EditDonationScreen"
import ProfileScreen from "../screens/ProfileScreen"
import EditProfileScreen from "../screens/EditProfileScreen"

const Tab = createBottomTabNavigator()
const DonationStack = createStackNavigator()
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
      <DonationStack.Screen name="DonationList" component={DonationListScreen} options={{ title: "My Donations" }} />
      <DonationStack.Screen
        name="DonationDetails"
        component={DonationDetailsScreen}
        options={{ title: "Donation Details" }}
      />
      <DonationStack.Screen name="EditDonation" component={EditDonationScreen} options={{ title: "Edit Donation" }} />
    </DonationStack.Navigator>
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

const DonorNavigator = ({ route }) => {
  const { setUserToken, setUserType } = route.params

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home"
          } else if (route.name === "Donations") {
            iconName = focused ? "list" : "list"
          } else if (route.name === "AddDonation") {
            iconName = focused ? "add-circle" : "add-circle-outline"
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
      <Tab.Screen name="Home" component={DonorHomeScreen} initialParams={{ userType: "donor" }} />
      <Tab.Screen name="Donations" component={DonationStackNavigator} />
      <Tab.Screen name="AddDonation" component={AddDonationScreen} options={{ title: "Donate Food" }} />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        initialParams={{ setUserToken, setUserType, userType: "donor" }}
      />
    </Tab.Navigator>
  )
}

export default DonorNavigator
