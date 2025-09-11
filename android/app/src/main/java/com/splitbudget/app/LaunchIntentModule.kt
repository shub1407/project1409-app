package com.splitbudget.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class LaunchIntentModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "LaunchIntentModule"
    }

    @ReactMethod
    fun getLaunchData(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity != null) {
                val intent = activity.intent
                val result = Arguments.createMap()
                
                // Check if opened from transaction notification
                if (intent.getBooleanExtra("transaction_detected", false)) {
                    result.putBoolean("fromNotification", true)
                    result.putString("transactionAmount", intent.getStringExtra("transaction_amount"))
                    result.putString("transactionType", intent.getStringExtra("transaction_type"))
                } else {
                    result.putBoolean("fromNotification", false)
                }
                
                promise.resolve(result)
            } else {
                promise.reject("No Activity", "No current activity found")
            }
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

    @ReactMethod
    fun clearLaunchData(promise: Promise) {
        try {
            val activity = currentActivity
            activity?.intent?.removeExtra("transaction_detected")
            activity?.intent?.removeExtra("transaction_amount")
            activity?.intent?.removeExtra("transaction_type")
            promise.resolve("Cleared")
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }
}
