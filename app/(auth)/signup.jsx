import { Ionicons } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuth } from "../../src/context/AuthContext"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Focus states
  const [nameFocused, setNameFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)

  // Error states
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [termsError, setTermsError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)

  // Refs for input focus
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current

  const { signIn, signUp, signInWithGoogle } = useAuth()

  // Clear all errors
  const clearErrors = () => {
    setNameError("")
    setPhoneError("")
    setEmailError("")
    setPasswordError("")
    setConfirmPasswordError("")
    setTermsError("")
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

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  const validateInputs = () => {
    let isValid = true
    clearErrors()

    if (!formData.name.trim()) {
      setNameError("Full name is required")
      isValid = false
    } else if (formData.name.trim().length < 2) {
      setNameError("Name must be at least 2 characters")
      isValid = false
    }

    if (!formData.phone.trim()) {
      setPhoneError("Phone number is required")
      isValid = false
    } else if (!validatePhone(formData.phone)) {
      setPhoneError("Please enter a valid 10-digit phone number")
      isValid = false
    }

    if (!formData.email.trim()) {
      setEmailError("Email is required")
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setEmailError("Please enter a valid email address")
        isValid = false
      }
    }

    if (!formData.password.trim()) {
      setPasswordError("Password is required")
      isValid = false
    } else if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    }

    if (!formData.confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password")
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      isValid = false
    }

    if (!acceptTerms) {
      setTermsError("Please accept the terms and conditions")
      isValid = false
    }

    if (!isValid) {
      triggerShakeAnimation()
    }

    return isValid
  }

  const handleSignup = async () => {
    if (!validateInputs()) {
      return
    }

    const { name, phone, email, password } = formData

    setLoading(true)
    clearErrors()

    try {
      const response = await signUp({ name, phone, email, password })

      if (response.success) {
        // Auto-login after successful signup
        const loginResult = await signIn(email, password)
        if (loginResult.success) {
          router.replace("/users/home")
        }
      } else {
        triggerShakeAnimation()
        setGeneralError(response.error || "Signup failed. Please try again.")
      }
    } catch (error) {
      triggerShakeAnimation()
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again."
      setGeneralError(errorMessage)
    }
    setLoading(false)
  }

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))

    // Clear specific field error when user types
    switch (key) {
      case "name":
        if (nameError) setNameError("")
        break
      case "phone":
        if (phoneError) setPhoneError("")
        break
      case "email":
        if (emailError) setEmailError("")
        break
      case "password":
        if (passwordError) setPasswordError("")
        break
      case "confirmPassword":
        if (confirmPasswordError) setConfirmPasswordError("")
        break
    }
  }

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, "")
    const limited = cleaned.substring(0, 10)
    updateFormData("phone", limited)
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D9488"
        translucent={false}
      />
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
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
                      <Ionicons name="wallet" size={24} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Join SplitBudget and start managing your finances
                </Text>
              </View>

              {/* General Error Message */}
              {generalError ? (
                <Animated.View style={styles.errorContainer}>
                  <View style={styles.errorIconContainer}>
                    <Ionicons name="warning" size={16} color="#DC2626" />
                  </View>
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorTitle}>Registration Failed</Text>
                    <Text style={styles.errorText}>{generalError}</Text>
                  </View>
                </Animated.View>
              ) : null}

              {/* Terms Error */}
              {termsError ? (
                <Animated.View style={styles.errorContainer}>
                  <View style={styles.errorIconContainer}>
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#DC2626"
                    />
                  </View>
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorTitle}>Terms Required</Text>
                    <Text style={styles.errorText}>{termsError}</Text>
                  </View>
                </Animated.View>
              ) : null}

              {/* Form */}
              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      nameFocused && styles.inputWrapperFocused,
                      formData.name && styles.inputWrapperWithValue,
                      nameError && styles.inputWrapperError,
                    ]}
                    onPress={() => nameRef.current?.focus()}
                    activeOpacity={1}
                  >
                    <View style={styles.inputIconContainer}>
                      <Ionicons
                        name="person"
                        size={18}
                        color={
                          nameError
                            ? "#DC2626"
                            : nameFocused
                            ? "#0D9488"
                            : "#64748B"
                        }
                      />
                    </View>
                    <TextInput
                      ref={nameRef}
                      style={[
                        styles.textInput,
                        nameError && styles.textInputError,
                      ]}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94A3B8"
                      value={formData.name}
                      onChangeText={(value) => updateFormData("name", value)}
                      onFocus={() => {
                        setNameFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setNameFocused(false)}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => phoneRef.current?.focus()}
                    />
                  </TouchableOpacity>
                  {nameError ? (
                    <View style={styles.inputErrorContainer}>
                      <View style={styles.errorDot} />
                      <Text style={styles.inputErrorText}>{nameError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      phoneFocused && styles.inputWrapperFocused,
                      formData.phone && styles.inputWrapperWithValue,
                      phoneError && styles.inputWrapperError,
                    ]}
                    onPress={() => phoneRef.current?.focus()}
                    activeOpacity={1}
                  >
                    <View style={styles.inputIconContainer}>
                      <Ionicons
                        name="call"
                        size={18}
                        color={
                          phoneError
                            ? "#DC2626"
                            : phoneFocused
                            ? "#0D9488"
                            : "#64748B"
                        }
                      />
                    </View>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      ref={phoneRef}
                      style={[
                        styles.phoneInput,
                        phoneError && styles.textInputError,
                      ]}
                      placeholder="Enter phone number"
                      placeholderTextColor="#94A3B8"
                      value={formData.phone}
                      onChangeText={formatPhoneNumber}
                      onFocus={() => {
                        setPhoneFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setPhoneFocused(false)}
                      keyboardType="phone-pad"
                      maxLength={10}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </TouchableOpacity>
                  {phoneError ? (
                    <View style={styles.inputErrorContainer}>
                      <View style={styles.errorDot} />
                      <Text style={styles.inputErrorText}>{phoneError}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                      formData.email && styles.inputWrapperWithValue,
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
                      value={formData.email}
                      onChangeText={(value) => updateFormData("email", value)}
                      onFocus={() => {
                        setEmailFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      passwordFocused && styles.inputWrapperFocused,
                      formData.password && styles.inputWrapperWithValue,
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
                      placeholder="Create a password"
                      placeholderTextColor="#94A3B8"
                      value={formData.password}
                      onChangeText={(value) =>
                        updateFormData("password", value)
                      }
                      onFocus={() => {
                        setPasswordFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputWrapper,
                      confirmPasswordFocused && styles.inputWrapperFocused,
                      formData.confirmPassword && styles.inputWrapperWithValue,
                      confirmPasswordError && styles.inputWrapperError,
                    ]}
                    onPress={() => confirmPasswordRef.current?.focus()}
                    activeOpacity={1}
                  >
                    <View style={styles.inputIconContainer}>
                      <Ionicons
                        name="shield-checkmark"
                        size={18}
                        color={
                          confirmPasswordError
                            ? "#DC2626"
                            : confirmPasswordFocused
                            ? "#0D9488"
                            : "#64748B"
                        }
                      />
                    </View>
                    <TextInput
                      ref={confirmPasswordRef}
                      style={[
                        styles.textInput,
                        confirmPasswordError && styles.textInputError,
                      ]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#94A3B8"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        updateFormData("confirmPassword", value)
                      }
                      onFocus={() => {
                        setConfirmPasswordFocused(true)
                        if (generalError) setGeneralError("")
                      }}
                      onBlur={() => setConfirmPasswordFocused(false)}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSignup}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={18}
                        color={confirmPasswordError ? "#DC2626" : "#64748B"}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {confirmPasswordError ? (
                    <View style={styles.inputErrorContainer}>
                      <View style={styles.errorDot} />
                      <Text style={styles.inputErrorText}>
                        {confirmPasswordError}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Terms & Conditions */}
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => {
                    setAcceptTerms(!acceptTerms)
                    if (termsError) setTermsError("")
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      acceptTerms && styles.checkboxChecked,
                      termsError && styles.checkboxError,
                    ]}
                  >
                    {acceptTerms && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.termsText,
                      termsError && styles.termsTextError,
                    ]}
                  >
                    I agree to the{" "}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.signupButton,
                    loading && styles.signupButtonDisabled,
                  ]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.loadingSpinner}>
                        <Ionicons name="refresh" size={18} color="#FFFFFF" />
                      </View>
                      <Text style={styles.signupButtonText}>
                        Creating Account...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
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

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                  </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.loginLink}>Sign in</Text>
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
    height: screenHeight * 0.35,
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
    width: 180,
    height: 180,
    top: -90,
    right: -40,
  },
  circle2: {
    width: 120,
    height: 120,
    top: 40,
    left: -60,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 120,
    right: 40,
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
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoInner: {
    width: 40,
    height: 40,
    backgroundColor: "#0D9488",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
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
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 1,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  form: {
    marginBottom: 24,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    height: 50,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
    shadowRadius: 6,
    elevation: 2,
  },
  inputIconContainer: {
    width: 18,
    alignItems: "center",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
    paddingVertical: 0,
  },
  textInputError: {
    color: "#DC2626",
  },
  countryCode: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 6,
    marginLeft: 6,
  },
  inputErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorDot: {
    width: 3,
    height: 3,
    backgroundColor: "#DC2626",
    borderRadius: 2,
    marginRight: 6,
  },
  inputErrorText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    marginRight: 10,
    marginTop: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  checkboxError: {
    borderColor: "#DC2626",
  },
  termsText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
    lineHeight: 18,
  },
  termsTextError: {
    color: "#DC2626",
  },
  termsLink: {
    color: "#0D9488",
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#0D9488",
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  signupButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
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
    paddingTop: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerTextContainer: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
  },
  dividerText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  googleIconContainer: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loginText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  loginLink: {
    color: "#0D9488",
    fontSize: 13,
    fontWeight: "700",
  },
})
