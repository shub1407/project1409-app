import { StatusBar } from "expo-status-bar"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useStyles } from "../context/StyleContext"

export default function CustomStatusBar({ children }) {
  const { styles, statusBarStyle } = useStyles()

  return (
    <View style={{ flex: 1, backgroundColor: statusBarStyle.backgroundColor }}>
      {/* Only control text/icons with `style`, not backgroundColor */}
      <StatusBar style={statusBarStyle.barStyle} translucent />

      {/* Top safe area colored background */}
      <SafeAreaView
        style={{ flex: 0, backgroundColor: statusBarStyle.backgroundColor }}
        edges={["top"]}
      />

      {/* Main app container */}
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        {children}
      </SafeAreaView>
    </View>
  )
}
