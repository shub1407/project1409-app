// services/feedbackService.js
import { ENDPOINTS } from "../../constants/api"
import apiClient from "./apiClient"

class FeedbackService {
  async submitFeedback(feedbackData) {
    try {
      return await apiClient.post(ENDPOINTS.FEEDBACK.BASE, feedbackData)
    } catch (error) {
      console.error("Submit feedback error:", error)
      return {
        success: false,
        error: error.message || "Failed to submit feedback",
      }
    }
  }

  async getUserFeedback(page = 1, limit = 10) {
    try {
      return await apiClient.get(ENDPOINTS.FEEDBACK.MY_FEEDBACK, {
        params: { page, limit },
      })
    } catch (error) {
      console.error("Get user feedback error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch feedback history",
      }
    }
  }

  async getFeedbackById(feedbackId) {
    try {
      return await apiClient.get(ENDPOINTS.FEEDBACK.BY_ID(feedbackId))
    } catch (error) {
      console.error("Get feedback by ID error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch feedback",
      }
    }
  }

  async updateFeedback(feedbackId, updateData) {
    try {
      return await apiClient.put(
        ENDPOINTS.FEEDBACK.BY_ID(feedbackId),
        updateData
      )
    } catch (error) {
      console.error("Update feedback error:", error)
      return {
        success: false,
        error: error.message || "Failed to update feedback",
      }
    }
  }
}

export default new FeedbackService()
export const {
  submitFeedback,
  getUserFeedback,
  getFeedbackById,
  updateFeedback,
} = new FeedbackService()
