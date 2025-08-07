import { Redirect } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useAuth } from "../src/context/AuthContext"

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1CC29F" />
        {/* Optional: Add your app logo here */}
        {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
      </View>
    )
  }
  console.log(isAuthenticated)
  // Redirect based on authentication status
  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  // Optional: If you want to add a logo on the loading screen
  // logo: {
  //   width: 100,
  //   height: 100,
  //   marginBottom: 20,
  //   resizeMode: 'contain',
  // },
})
