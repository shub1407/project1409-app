package com.koiny.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.telephony.SmsMessage
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.os.Build
import androidx.core.app.NotificationCompat
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.*
import java.util.regex.Pattern

class SMSReceiver : BroadcastReceiver() {
    
    companion object {
        private const val CHANNEL_ID = "transaction_channel"
    }

override fun onReceive(context: Context, intent: Intent) {
    android.util.Log.d("SMSReceiver", "📱 SMS BroadcastReceiver triggered!")
    
    val bundle: Bundle? = intent.extras
    
    bundle?.let {
        val pdus = it["pdus"] as Array<*>?
        android.util.Log.d("SMSReceiver", "📝 SMS PDUs received: ${pdus?.size}")
        
        pdus?.forEach { pdu ->
            val smsMessage = SmsMessage.createFromPdu(pdu as ByteArray)
            val messageBody = smsMessage.messageBody
            val phoneNumber = smsMessage.originatingAddress ?: ""
            
            android.util.Log.d("SMSReceiver", "📧 SMS Content: $messageBody")
            android.util.Log.d("SMSReceiver", "📞 From: $phoneNumber")
            
            // Check if it's a transaction SMS
            if (isTransactionSMS(messageBody) && isFromBankOrFinancialService(phoneNumber)) {
                val amount = parseAmount(messageBody)
                val type = parseTransactionType(messageBody)
                
                android.util.Log.d("SMSReceiver", "💳 Transaction detected - Amount: $amount, Type: $type")
                
                // Show notification
                showTransactionNotification(context, amount, type, messageBody)
                
                // Store for later (when app opens)
                storeTransaction(context, phoneNumber, messageBody, amount, type)
            } else {
                android.util.Log.d("SMSReceiver", "📝 Not a transaction SMS")
            }
        }
    }
}

private fun isTransactionSMS(message: String): Boolean {
    val lowerMessage = message.lowercase()
    
    // Must contain amount with rupee symbol
    val amountPattern = Pattern.compile("(?:rs\\.?|₹)\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?)", Pattern.CASE_INSENSITIVE)
    val hasAmount = amountPattern.matcher(message).find()
    
    if (!hasAmount) return false
    
    // Must contain transaction keywords
    val transactionKeywords = arrayOf(
        "debited", "credited", "spent", "received", "transaction", 
        "payment", "upi", "withdrawn", "deposited", "transferred"
    )
    
    val hasTransactionKeyword = transactionKeywords.any { 
        lowerMessage.contains("\\b$it\\b".toRegex()) 
    }
    
    if (!hasTransactionKeyword) return false
    
    // Must contain account/bank context
    val contextKeywords = arrayOf(
        "account", "a/c", "bank", "card", "wallet", 
        "balance", "available", "paytm", "gpay", "phonepe"
    )
    
    val hasContext = contextKeywords.any { 
        lowerMessage.contains("\\b$it\\b".toRegex()) 
    }
    
    if (!hasContext) return false
    
    // Exclude common false positives
    val excludePatterns = arrayOf(
        "otp", "verify", "verification", "confirm", "login",
        "birthday", "congratulations", "offer", "discount",
        "recharge", "talk time", "validity", "expires"
    )
    
    val isFalsePositive = excludePatterns.any { 
        lowerMessage.contains("\\b$it\\b".toRegex()) 
    }
    
    if (isFalsePositive) return false
    
    // Additional validation: Check for common bank patterns
    val bankPatterns = arrayOf(
        "hdfc", "icici", "sbi", "axis", "kotak", "pnb", "bob", "canara",
        "union bank", "yes bank", "indusind", "idbi", "indian bank"
    )
    
    val upiPatterns = arrayOf("upi", "bhim", "paytm", "gpay", "phonepe", "amazon pay")
    
    val hasBankContext = bankPatterns.any { lowerMessage.contains(it) } ||
                        upiPatterns.any { lowerMessage.contains(it) } ||
                        lowerMessage.contains("\\d{4}".toRegex()) // Account ending digits
    
    return hasBankContext
}
private fun isFromBankOrFinancialService(phoneNumber: String): Boolean {
    if (phoneNumber.isBlank()) return false
    
    // Clean the phone number (remove spaces, dashes, etc.)
    val cleanNumber = phoneNumber.replace(Regex("[\\s\\(\\)\\+]"), "")
    
    // Enhanced Indian bank/financial service patterns
    val bankPatterns = arrayOf(
        // Allow optional suffix like "JK-BOBSMS-S"
        "^[A-Z]{2}-[A-Z]{3,10}(-[A-Z])?$",    // e.g., "AD-HDFCBK", "JK-BOBSMS-S"
        
        // Allow multiple dash-separated segments
        "^[A-Z]{2}-[A-Z]{3,10}-[A-Z]$",       // e.g., "JK-BOBSMS-S"
        
        // Original patterns
        "^[A-Z]{6}$",                          // e.g., "HDFCBK", "ICICIB" 
        "^[A-Z]{2}[A-Z0-9]{4,8}$",           // e.g., "HDFC01", "ICICI2"
        
        // Short codes (5-6 digits) - very common for banks
        "^\\d{5,6}$",                         // e.g., "56767", "567676"
        
        // Toll-free numbers used by banks
        "^1800\\d{6,7}$",                     // e.g., "1800123456"
        
        // Service codes starting with specific prefixes
        "^(?:56|57|58|59)\\d{4}$",           // Common SMS service prefixes
        
        // DLT (Distributed Ledger Technology) format
        "^[A-Z]{2}-\\d{6}$",                 // e.g., "AD-123456"
        
        // Complex alphanumeric patterns with multiple segments
        "^[A-Z]{2}-[A-Z]{2,10}[0-9]*-[A-Z]$" // e.g., "VM-ICICIB2-X"
    )
    
    // Check against patterns
    val matchesPattern = bankPatterns.any { pattern ->
        Pattern.compile(pattern).matcher(phoneNumber).matches()
    }
    
    // Known Indian bank sender IDs (case insensitive)
    val knownBankSenders = arrayOf(
        "hdfcbank", "icicibk", "sbiin", "axisbk", "kotakbk", "pnbsms",
        "unionbank", "yesbank", "indusindbk", "idbibk", "canarabk",
        "bobbank", "bobsms", "centralbk", "indianbk", "barobank", "ubibk",
        "paytm", "paytmbank", "gpay", "phonepe", "amazonpay", "mobikwik",
        "freecharge", "jiopay", "bhimupi", "upi"
    )
    
    val isKnownSender = knownBankSenders.any { sender ->
        phoneNumber.lowercase().contains(sender.lowercase())
    }
    
    // Short numeric codes are typically used by financial services
    val isShortCode = cleanNumber.length <= 6 && cleanNumber.all { it.isDigit() }
    
    // Log for debugging
    android.util.Log.d("SMSReceiver", "📞 Checking sender: '$phoneNumber'")
    android.util.Log.d("SMSReceiver", "📞 Pattern match: $matchesPattern, Known sender: $isKnownSender, Short code: $isShortCode")
    
    return matchesPattern || isKnownSender || isShortCode
}




    private fun parseAmount(message: String): String {
        return try {
            // Common patterns for Indian banks
            val pattern = Pattern.compile("(?:Rs\\.?|₹)\\s?(\\d+(?:,\\d+)*(?:\\.\\d{2})?)")
            val matcher = pattern.matcher(message)
            
            if (matcher.find()) {
                matcher.group(1)?.replace(",", "") ?: "0"
            } else "0"
        } catch (e: Exception) {
            e.printStackTrace()
            "0"
        }
    }

    private fun parseTransactionType(message: String): String {
        val lowerMessage = message.lowercase()
        return when {
            lowerMessage.contains("debited") || lowerMessage.contains("spent") -> "expense"
            lowerMessage.contains("credited") || lowerMessage.contains("received") -> "income"
            else -> "expense" // default
        }
    }
private fun showTransactionNotification(context: Context, amount: String, type: String, message: String) {
    try {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel (Android 8.0+) - MUST be created FIRST
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Transaction Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for detected financial transactions"
                enableLights(true)
                enableVibration(true)
                setBypassDnd(true)
                setShowBadge(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        // Create intent to open app
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("transaction_detected", true)
            putExtra("transaction_amount", amount)
            putExtra("transaction_type", type)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context, 
            System.currentTimeMillis().toInt(), // Use unique request code
            intent, 
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Build notification with more explicit settings
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("💳 Transaction Detected!")
            .setContentText("₹$amount $type - Tap to add to SplitBudget")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        
        // Use unique notification ID to avoid overwriting
        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, builder.build())
        
        // Log for debugging
        android.util.Log.d("SMSReceiver", "Notification sent with ID: $notificationId")
        
    } catch (e: Exception) {
        android.util.Log.e("SMSReceiver", "Error showing notification: ${e.message}")
        e.printStackTrace()
    }
}


    private fun storeTransaction(context: Context, phone: String, message: String, amount: String, type: String) {
        val prefs: SharedPreferences = context.getSharedPreferences("PendingTransactions", Context.MODE_PRIVATE)
        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
        
        // Store as JSON-like string
        val transactionData = """{
            "phone":"$phone",
            "amount":"$amount",
            "type":"$type",
            "message":"${message.replace("\"", "\\\"")}",
            "timestamp":"$timestamp"
        }"""
        
        // Store with timestamp as key
        prefs.edit().putString("transaction_${System.currentTimeMillis()}", transactionData).apply()
    }
}
