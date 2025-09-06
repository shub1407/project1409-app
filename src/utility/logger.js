import * as FileSystem from "expo-file-system"

const LOG_FILE = FileSystem.documentDirectory + "app.log"

async function writeLogToFile(level, message, ...args) {
  try {
    const timestamp = new Date().toISOString()
    const fullMessage =
      `[${level}] ${timestamp} - ${message} ` +
      args.map((a) => JSON.stringify(a)).join(" ") +
      "\n"

    await FileSystem.writeAsStringAsync(LOG_FILE, fullMessage, {
      encoding: FileSystem.EncodingType.UTF8,
      append: true,
    })
  } catch (err) {
    console.error("Failed to write log to file:", err)
  }
}

export class Logger {
  static info(message, ...args) {
    console.log(`ℹ️ [INFO] ${message}`, ...args)
    writeLogToFile("INFO", message, ...args)
  }

  static debug(message, ...args) {
    console.log(`🐛 [DEBUG] ${message}`, ...args)
    writeLogToFile("DEBUG", message, ...args)
  }

  static error(message, error, ...args) {
    console.error(`❌ [ERROR] ${message}`, error, ...args)
    if (error?.stack) console.error(error.stack)
    writeLogToFile("ERROR", message, error, ...args)
  }

  static sync(message, ...args) {
    console.log(`🔄 [SYNC] ${message}`, ...args)
    writeLogToFile("SYNC", message, ...args)
  }

  static network(message, ...args) {
    console.log(`📡 [NETWORK] ${message}`, ...args)
    writeLogToFile("NETWORK", message, ...args)
  }

  // Utility to read logs (for debugging / export button)
  static async readLogs() {
    try {
      return await FileSystem.readAsStringAsync(LOG_FILE)
    } catch (err) {
      return "No logs found."
    }
  }

  // Utility to clear logs
  static async clearLogs() {
    try {
      await FileSystem.writeAsStringAsync(LOG_FILE, "")
    } catch (err) {
      console.error("Failed to clear logs:", err)
    }
  }
}
