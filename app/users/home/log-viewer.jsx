import { useState } from "react"
import { Button, ScrollView, Text, View } from "react-native"
import { Logger } from "../../../src/utility/logger"

export default function LogViewer() {
  const [logs, setLogs] = useState("")

  const loadLogs = async () => {
    const content = await Logger.readLogs()
    setLogs(content)
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Load Logs" onPress={loadLogs} />
      <ScrollView style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 12 }}>{logs}</Text>
      </ScrollView>
    </View>
  )
}
