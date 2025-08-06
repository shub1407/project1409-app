import { Text, View, Button } from "react-native"

import { useState, useEffect } from "react"
import { router } from "expo-router"
import { baseUrl } from "../src/utility/constant"
import axios from "axios"
export default function Index() {
  const [data, setData] = useState(null)
  async function fetchData() {
    try {
      const response = await axios.get(baseUrl)
      const data = response?.data?.message
      setData(data)
      console.log(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Om Namah Shivay!!</Text>
      <Text>{data}</Text>
      <Button title="Go to Details" onPress={() => router.push("/home")} />
    </View>
  )
}
