export const handleApiError = (error) => {
  console.error("API Error:", error)

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response

    switch (status) {
      case 400:
        return {
          success: false,
          error: data.message || "Invalid request data",
        }
      case 401:
        return {
          success: false,
          error: "Authentication required",
        }
      case 403:
        return {
          success: false,
          error: "Access denied",
        }
      case 404:
        return {
          success: false,
          error: "Resource not found",
        }
      case 409:
        return {
          success: false,
          error: data.message || "Account already exists",
        }
      case 500:
        return {
          success: false,
          error: "Server error. Please try again later.",
        }
      default:
        return {
          success: false,
          error: data.message || "An error occurred",
        }
    }
  } else if (error.request) {
    // Network error
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  } else {
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
