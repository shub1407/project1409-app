package com.koiny.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments
import android.content.SharedPreferences

class SharedPrefsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "SharedPrefsModule"
    }

    @ReactMethod
    fun getPendingTransactions(promise: Promise) {
        try {
            val prefs: SharedPreferences = reactApplicationContext.getSharedPreferences("PendingTransactions", 0)
            val allEntries: Map<String, *> = prefs.all
            
            val transactions = Arguments.createArray()
            
            for ((key, value) in allEntries) {
                if (key.startsWith("transaction_")) {
                    val transaction = Arguments.createMap()
                    transaction.putString("key", key)
                    transaction.putString("data", value.toString())
                    transactions.pushMap(transaction)
                }
            }
            
            promise.resolve(transactions)
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

    @ReactMethod
    fun clearTransaction(key: String, promise: Promise) {
        try {
            val prefs: SharedPreferences = reactApplicationContext.getSharedPreferences("PendingTransactions", 0)
            val editor = prefs.edit()
            editor.remove(key)
            editor.apply()
            promise.resolve("Transaction cleared")
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

    @ReactMethod
    fun clearAllTransactions(promise: Promise) {
        try {
            val prefs: SharedPreferences = reactApplicationContext.getSharedPreferences("PendingTransactions", 0)
            val editor = prefs.edit()
            editor.clear()
            editor.apply()
            promise.resolve("All transactions cleared")
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }
}
