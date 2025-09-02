export class Logger {
  static info(message, ...args) {
    if (__DEV__) {
      console.log(`ℹ️ [INFO] ${message}`, ...args)
    }
  }

  static error(message, error, ...args) {
    if (__DEV__) {
      console.error(`❌ [ERROR] ${message}`, error, ...args)
    }
  }

  static sync(message, ...args) {
    if (__DEV__) {
      console.log(`🔄 [SYNC] ${message}`, ...args)
    }
  }

  static network(message, ...args) {
    if (__DEV__) {
      console.log(`📡 [NETWORK] ${message}`, ...args)
    }
  }
}
