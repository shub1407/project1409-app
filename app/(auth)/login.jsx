import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuth } from "../../src/context/AuthContext"
import { useStyles } from "../../src/context/StyleContext"
import { Logger } from "../../src/utility/logger"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Error states
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")

  // Refs for input focus
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current
  const { setStatusBarStyle } = useStyles()
  useEffect(() => {
    setStatusBarStyle({
      backgroundColor: "#0D9488",
      barStyle: "light",
    })
  }, [])

  // Clear all errors
  const clearErrors = () => {
    setEmailError("")
    setPasswordError("")
    setGeneralError("")
  }

  // Shake animation for errors
  const triggerShakeAnimation = () => {
    shakeAnimation.setValue(0)
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Validate inputs
  const validateInputs = () => {
    let isValid = true
    clearErrors()

    if (!email.trim()) {
      setEmailError("Email is required")
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setEmailError("Please enter a valid email address")
        isValid = false
      }
    }

    if (!password.trim()) {
      setPasswordError("Password is required")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    }

    if (!isValid) {
      triggerShakeAnimation()
    }

    return isValid
  }

  const handleLogin = async () => {
    if (!validateInputs()) {
      return
    }

    Logger.info(`Mode is:: Dev:${__DEV__}`)
    setLoading(true)
    clearErrors()

    const result = await signIn(email.trim(), password)

    if (result.success) {
      router.replace("/users/home")
    } else {
      triggerShakeAnimation()
      // Handle different types of errors
      if (
        result.error?.toLowerCase().includes("email") ||
        result.error?.toLowerCase().includes("user not found") ||
        result.error?.toLowerCase().includes("password") ||
        result.error?.toLowerCase().includes("invalid credentials")
      ) {
        setEmailError("Invalid credentials")
        setPasswordError("Invalid credentials")
      } else {
        setGeneralError(result.error || "Login failed. Please try again.")
      }
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    clearErrors()

    const result = await signInWithGoogle()

    if (result.success) {
      router.replace("/users/home")
    } else {
      if (result.type === "SIGN_IN_CANCELLED") {
        console.log("Google sign-in was cancelled")
      } else {
        setGeneralError(result.error || "Google sign in failed")
        triggerShakeAnimation()
      }
    }
    setGoogleLoading(false)
  }

  // Handle email input changes
  const handleEmailChange = (text) => {
    setEmail(text)
    if (emailError) {
      setEmailError("")
    }
  }

  // Handle password input changes
  const handlePasswordChange = (text) => {
    setPassword(text)
    if (passwordError) {
      setPasswordError("")
    }
  }

  return (
    <>
      {/* <StatusBar
        barStyle="light-content"
        backgroundColor="#0D9488"
        translucent={false}
      /> */}
      <SafeAreaView style={styles.container}>
        <View style={styles.gradientBackground}>
          <View style={styles.backgroundPattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -100}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                { transform: [{ translateX: shakeAnimation }] },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <View style={styles.logoInner}>
                      <Ionicons name="wallet" size={28} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue managing your finances
                </Text>
              </View>

              {/* General Error Message */}
              {generalError ? (
                <Animated.View style={styles.errorContainer}>
                  <View style={styles.errorIconContainer}>
                    <Ionicons name="warning" size={16} color="#DC2626" />
                  </View>
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorTitle}>Authentication Failed</Text>
                    <Text style={styles.errorText}>{generalError}</Text>
                  </View>
                </Animated.View>
              ) : null}

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                      email && styles.inputWrapperWithValue,
                      emailError && styles.inputWrapperError,
                    ]}
                    onPress={() => emailRef.current?.focus()}
                    activeOpacity={1}
                  >
                    <View style={styles.inputIconContainer}>
                      <Ionicons
                        name="mail"
                        size={18}
                        color={
                          emailError
                            ? "#DC2626"
                            : emailFocused
                            ? "#0D9488"
                            : "#64748B"
                        }
                      />
                    </View>
                    <TextInput
                      ref={emailRef}
                      style={[
                        styles.textInput,
                        emailError && styles.textInputError,
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => {
                        setEmailFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!loading && !googleLoading}
                      selectTextOnFocus={true}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </TouchableOpacity>
                  {emailError ? (
                    <View style={styles.inputErrorContainer}>
                      <View style={styles.errorDot} />
                      <Text style={styles.inputErrorText}>{emailError}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      passwordFocused && styles.inputWrapperFocused,
                      password && styles.inputWrapperWithValue,
                      passwordError && styles.inputWrapperError,
                    ]}
                    onPress={() => passwordRef.current?.focus()}
                    activeOpacity={1}
                  >
                    <View style={styles.inputIconContainer}>
                      <Ionicons
                        name="lock-closed"
                        size={18}
                        color={
                          passwordError
                            ? "#DC2626"
                            : passwordFocused
                            ? "#0D9488"
                            : "#64748B"
                        }
                      />
                    </View>
                    <TextInput
                      ref={passwordRef}
                      style={[
                        styles.textInput,
                        passwordError && styles.textInputError,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={handlePasswordChange}
                      onFocus={() => {
                        setPasswordFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      autoCorrect={false}
                      editable={!loading && !googleLoading}
                      selectTextOnFocus={true}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? "eye" : "eye-off"}
                        size={18}
                        color={passwordError ? "#DC2626" : "#64748B"}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {passwordError ? (
                    <View style={styles.inputErrorContainer}>
                      <View style={styles.errorDot} />
                      <Text style={styles.inputErrorText}>{passwordError}</Text>
                    </View>
                  ) : null}
                </View>

                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity
                    style={styles.forgotPassword}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    (loading || googleLoading) && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading || googleLoading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingSpinner}>
                        <Ionicons name="refresh" size={18} color="#FFFFFF" />
                      </View>
                      <Text style={styles.loginButtonText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerTextContainer}>
                    <Text style={styles.dividerText}>or continue with</Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    (loading || googleLoading) && styles.googleButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                  disabled={loading || googleLoading}
                  onPress={handleGoogleSignIn}
                >
                  {googleLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingSpinner}>
                        <Ionicons name="refresh" size={18} color="#4285F4" />
                      </View>
                      <Text style={styles.googleButtonText}>Connecting...</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.googleIconContainer}>
                        <Ionicons
                          name="logo-google"
                          size={18}
                          color="#4285F4"
                        />
                      </View>
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Link href="/(auth)/signup" asChild>
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.signupLink}>Sign up</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.4,
    backgroundColor: "#0D9488",
  },
  backgroundPattern: {
    flex: 1,
    position: "relative",
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: 50,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 150,
    right: 50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: "center",
    minHeight: screenHeight * 0.9,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoInner: {
    width: 48,
    height: 48,
    backgroundColor: "#0D9488",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  // Enhanced Error Styles
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFEAEA",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  form: {
    marginBottom: 32,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    height: 56,
    paddingHorizontal: 16,
    transition: "all 0.2s",
  },
  inputWrapperFocused: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  inputWrapperWithValue: {
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIconContainer: {
    width: 20,
    alignItems: "center",
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    paddingVertical: 0,
  },
  textInputError: {
    color: "#DC2626",
  },
  inputErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorDot: {
    width: 4,
    height: 4,
    backgroundColor: "#DC2626",
    borderRadius: 2,
    marginRight: 8,
  },
  inputErrorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: "#0D9488",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#0D9488",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  loginButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingSpinner: {
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerTextContainer: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },
  dividerText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  signupText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  signupLink: {
    color: "#0D9488",
    fontSize: 14,
    fontWeight: "700",
  },
})
