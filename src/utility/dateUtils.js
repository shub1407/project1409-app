/**
 * Calculate the next occurrence date for a scheduled transaction
 * @param {number} startDate - Timestamp in ms of the start date
 * @param {string} recurrenceRule - Recurrence pattern (daily, weekly, monthly, yearly, etc.)
 * @param {number} [fromDate] - Date to calculate from (defaults to current time)
 * @returns {number} Timestamp in ms of the next run date
 */
export function calculateNextRunDate(
  startDate,
  recurrenceRule,
  fromDate = Date.now()
) {
  const start = new Date(startDate)
  const from = new Date(fromDate)

  // If start date is in the future, return it
  if (start > from) {
    return start.getTime()
  }

  // Parse recurrence rule
  const rule = parseRecurrenceRule(recurrenceRule)
  let nextDate = new Date(start)

  switch (rule.type) {
    case "daily":
      const daysDiff = Math.ceil((from - start) / (1000 * 60 * 60 * 24))
      const nextDayOccurrence =
        Math.ceil(daysDiff / rule.interval) * rule.interval
      nextDate.setDate(start.getDate() + nextDayOccurrence)
      break

    case "weekly":
      const weeksDiff = Math.ceil((from - start) / (1000 * 60 * 60 * 24 * 7))
      const nextWeekOccurrence =
        Math.ceil(weeksDiff / rule.interval) * rule.interval
      nextDate.setDate(start.getDate() + nextWeekOccurrence * 7)
      break

    case "monthly":
      let monthsToAdd = 0
      while (nextDate <= from) {
        monthsToAdd += rule.interval
        nextDate = new Date(start)
        nextDate.setMonth(start.getMonth() + monthsToAdd)

        // Handle month-end dates (e.g., Jan 31 -> Feb 28)
        if (nextDate.getDate() !== start.getDate()) {
          nextDate.setDate(0) // Last day of previous month
        }
      }
      break

    case "yearly":
      let yearsToAdd = 0
      while (nextDate <= from) {
        yearsToAdd += rule.interval
        nextDate = new Date(start)
        nextDate.setFullYear(start.getFullYear() + yearsToAdd)
      }
      break

    default:
      // Fallback: return start date if future, otherwise now
      return Math.max(start.getTime(), from.getTime())
  }

  return nextDate.getTime()
}

/**
 * Parse recurrence rule string into structured format
 * @param {string} recurrenceRule - Rule like "daily", "weekly", "monthly:2", "yearly"
 * @returns {Object} Parsed rule with type and interval
 */
// utility/dateUtils.js
function parseRecurrenceRule(recurrenceRule) {
  // Add safety check for undefined/null values
  if (!recurrenceRule || typeof recurrenceRule !== "string") {
    console.warn("Invalid recurrenceRule provided:", recurrenceRule)
    return { type: "monthly", interval: 1 } // Default fallback
  }

  const rule = recurrenceRule.toLowerCase().trim()

  // Handle interval-based rules (e.g., "daily:2", "weekly:3")
  if (rule.includes(":")) {
    const [type, intervalStr] = rule.split(":")
    const interval = parseInt(intervalStr) || 1
    return { type, interval }
  }

  // Handle simple rules
  const simpleRules = {
    daily: { type: "daily", interval: 1 },
    weekly: { type: "weekly", interval: 1 },
    biweekly: { type: "weekly", interval: 2 },
    monthly: { type: "monthly", interval: 1 },
    bimonthly: { type: "monthly", interval: 2 },
    quarterly: { type: "monthly", interval: 3 },
    yearly: { type: "yearly", interval: 1 },
    annually: { type: "yearly", interval: 1 },
    "one-time": { type: "monthly", interval: 1 }, // Handle one-time
  }

  return simpleRules[rule] || { type: "monthly", interval: 1 }
}

/**
 * Get human-readable description of recurrence rule
 * @param {string} recurrenceRule - Recurrence pattern
 * @returns {string} Human-readable description
 */
export function getRecurrenceDescription(recurrenceRule) {
  const rule = parseRecurrenceRule(recurrenceRule)

  const descriptions = {
    daily: rule.interval === 1 ? "Daily" : `Every ${rule.interval} days`,
    weekly: rule.interval === 1 ? "Weekly" : `Every ${rule.interval} weeks`,
    monthly: rule.interval === 1 ? "Monthly" : `Every ${rule.interval} months`,
    yearly: rule.interval === 1 ? "Yearly" : `Every ${rule.interval} years`,
  }

  return descriptions[rule.type] || "Custom schedule"
}

/**
 * Check if a scheduled transaction is overdue
 * @param {number} nextRunDate - Next scheduled run timestamp
 * @param {number} [currentDate] - Current date timestamp (defaults to now)
 * @returns {boolean} True if overdue
 */
export function isOverdue(nextRunDate, currentDate = Date.now()) {
  return nextRunDate < currentDate
}

/**
 * Get days until next run date
 * @param {number} nextRunDate - Next scheduled run timestamp
 * @param {number} [currentDate] - Current date timestamp (defaults to now)
 * @returns {number} Days until next run (negative if overdue)
 */
export function getDaysUntilNextRun(nextRunDate, currentDate = Date.now()) {
  const diffMs = nextRunDate - currentDate
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Format date for display
 * @param {number} timestamp - Date timestamp
 * @param {string} [format] - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp, format = "short") {
  const date = new Date(timestamp)

  switch (format) {
    case "short":
      return date.toLocaleDateString()
    case "long":
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    case "time":
      return date.toLocaleTimeString()
    case "datetime":
      return date.toLocaleString()
    default:
      return date.toLocaleDateString()
  }
}

/**
 * Get relative time description (e.g., "in 3 days", "2 days ago")
 * @param {number} timestamp - Target timestamp
 * @param {number} [currentDate] - Reference date (defaults to now)
 * @returns {string} Relative time description
 */
export function getRelativeTime(timestamp, currentDate = Date.now()) {
  const diffMs = timestamp - currentDate
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"
  if (diffDays > 1) return `In ${diffDays} days`
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`

  return formatDate(timestamp)
}

/**
 * Get all upcoming dates for a scheduled transaction within a period
 * @param {number} startDate - Start date timestamp
 * @param {string} recurrenceRule - Recurrence pattern
 * @param {number} [days] - Number of days to look ahead (default 365)
 * @param {number} [limit] - Maximum number of dates to return (default 50)
 * @returns {number[]} Array of upcoming timestamps
 */
export function getUpcomingDates(
  startDate,
  recurrenceRule,
  days = 365,
  limit = 50
) {
  const dates = []
  const endDate = Date.now() + days * 24 * 60 * 60 * 1000
  let currentDate = calculateNextRunDate(startDate, recurrenceRule)

  while (currentDate <= endDate && dates.length < limit) {
    dates.push(currentDate)
    currentDate = calculateNextRunDate(
      startDate,
      recurrenceRule,
      currentDate + 1000
    )
  }

  return dates
}

/**
 * Validate recurrence rule format
 * @param {string} recurrenceRule - Recurrence pattern to validate
 * @returns {boolean} True if valid
 */
export function isValidRecurrenceRule(recurrenceRule) {
  if (!recurrenceRule || typeof recurrenceRule !== "string") {
    return false
  }

  const validRules = [
    "daily",
    "weekly",
    "biweekly",
    "monthly",
    "bimonthly",
    "quarterly",
    "yearly",
    "annually",
  ]

  const rule = recurrenceRule.toLowerCase().trim()

  // Check simple rules
  if (validRules.includes(rule)) return true

  // Check interval rules (e.g., "daily:2", "monthly:3")
  if (rule.includes(":")) {
    const [type, intervalStr] = rule.split(":")
    const interval = parseInt(intervalStr)
    return (
      ["daily", "weekly", "monthly", "yearly"].includes(type) &&
      !isNaN(interval) &&
      interval > 0 &&
      interval <= 100
    )
  }

  return false
}

/**
 * Get default recurrence rules for UI selection
 * @returns {Array} Array of recurrence rule options
 */
export function getRecurrenceOptions() {
  return [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "bimonthly", label: "Bi-monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ]
}
