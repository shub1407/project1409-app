import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { createContext, useContext, useEffect, useState } from "react"
import { baseUrl } from "../utility/constant"
const AuthContext = createContext({})
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken")
      const userData = await SecureStore.getItemAsync("userData")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log("Email & password: ", email, password)
      const response = await axios.post(`${baseUrl}/auth/login`, {
        email,
        password,
      })

      const data = response.data

      // Axios only reaches here for 2xx status codes
      await SecureStore.setItemAsync("userToken", data.token)
      await SecureStore.setItemAsync("userData", JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (error) {
      if (error.response) {
        // Server responded with a status outside 2xx
        return { success: false, error: error.response.data.message }
      } else {
        // Network or other error
        return { success: false, error: "Network error" }
      }
    }
  }

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken")
      await SecureStore.deleteItemAsync("userData")
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
