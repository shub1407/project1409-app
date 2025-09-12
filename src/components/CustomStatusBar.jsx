import { StatusBar } from "expo-status-bar"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useStyles } from "../context/StyleContext"
export default function CustomStatusBar({ children }) {
  const { styles, statusBarStyle, setStatusBarStyle } = useStyles()

  return (
    <View style={{ flex: 1, backgroundColor: statusBarStyle.backgroundColor }}>
      <StatusBar
        style={statusBarStyle.barStyle}
        backgroundColor={statusBarStyle.backgroundColor}
      />
      <SafeAreaView
        style={{ flex: 0, backgroundColor: statusBarStyle.backgroundColor }}
        edges={["top"]}
      />
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        {children}
      </SafeAreaView>
    </View>
  )
}
