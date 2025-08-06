import { View, Text, StyleSheet, Button } from "react-native"
import { router } from "expo-router"

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{"Hello bhai kaise ho?\n Sabb badhiya"}</Text>
      <Button title="Go to home" onPress={() => router.push("/")} />
    </View>
  )
}
const styles = StyleSheet.create({
  container: { height: "100%", justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, color: "#333" },
})

export default Home
