import { createContext, useContext, useState } from "react"

const StyleContext = createContext()

export const StyleProvider = ({ children }) => {
  const [styles, setStyles] = useState({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
  })
  const [statusBarStyle, setStatusBarStyle] = useState({
    backgroundColor: "#0D9488",
    barStyle: "light",
  })
  const value = { styles, setStyles, statusBarStyle, setStatusBarStyle }

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>
}

export const useStyles = () => {
  const context = useContext(StyleContext)
  if (!context) {
    throw new Error("useStyles must be used within a StyleProvider")
  }
  return context
}
