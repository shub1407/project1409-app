// components/DatePickerModal.js
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const DatePickerModal = ({
  visible,
  onClose,
  onDateSelect,
  initialDate = new Date(),
  primaryColor = "#1CC29F",
  title = "Select Date",
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate))
  const [displayMonth, setDisplayMonth] = useState(new Date(initialDate))

  // Update selected date when initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      const newDate = new Date(initialDate)
      setSelectedDate(newDate)
      setDisplayMonth(newDate)
    }
  }, [initialDate])

  // Helper functions
  // Enhanced helper functions for DatePickerModal
  const formatDateDisplay = (date) => {
    // Ensure we have a valid date object
    const validDate = new Date(date)
    if (isNaN(validDate.getTime())) {
      return formatDateDisplay(new Date()) // Fallback to today
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]

    return {
      dayName: days[validDate.getDay()],
      day: validDate.getDate(),
      month: months[validDate.getMonth()],
      monthFull: validDate.toLocaleDateString("en-US", { month: "long" }),
      year: validDate.getFullYear(),
      formatted: validDate.toISOString().slice(0, 10),
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(displayMonth)
    const firstDay = getFirstDayOfMonth(displayMonth)
    const days = []

    // Empty cells for days before month starts
    // If firstDay is 0 (Sunday), we don't need any empty cells
    // If firstDay is 6 (Saturday), we need 6 empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    // Fill remaining cells to complete the last row (optional)
    const totalCells = Math.ceil(days.length / 7) * 7
    while (days.length < totalCells) {
      days.push(null)
    }

    return days
  }

  const handleDateSelect = (day) => {
    if (!day || isNaN(day)) return

    try {
      const newDate = new Date(
        displayMonth.getFullYear(),
        displayMonth.getMonth(),
        day
      )
      // Validate the new date
      if (!isNaN(newDate.getTime())) {
        setSelectedDate(newDate)
        console.log("Selected new date:", newDate)
      }
    } catch (error) {
      console.error("Error selecting date:", error)
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(displayMonth)
    newDate.setMonth(newDate.getMonth() + direction)
    setDisplayMonth(newDate)
  }

  const handleQuickSelect = (daysOffset) => {
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + daysOffset)
    setSelectedDate(newDate)
    setDisplayMonth(newDate)
  }

  const handleConfirm = () => {
    onDateSelect(selectedDate)
    onClose()
  }

  const handleCancel = () => {
    // Reset to initial date
    setSelectedDate(new Date(initialDate))
    setDisplayMonth(new Date(initialDate))
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleCancel}
          activeOpacity={1}
        />
        <View style={styles.container}>
          {/* Header with Selected Date Display */}
          <View style={[styles.header, { backgroundColor: primaryColor }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.selectedDateDisplay}>
              <Text style={styles.selectedDayName}>
                {formatDateDisplay(selectedDate).dayName}
              </Text>
              <Text style={styles.selectedDateText}>
                {formatDateDisplay(selectedDate).day}{" "}
                {formatDateDisplay(selectedDate).monthFull}
              </Text>
              <Text style={styles.selectedYearText}>
                {formatDateDisplay(selectedDate).year}
              </Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={handleConfirm}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Date Selection */}
          <View style={styles.quickDateSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickDateContainer}
            >
              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  selectedDate.toDateString() === new Date().toDateString() && {
                    backgroundColor: `${primaryColor}20`,
                    borderColor: primaryColor,
                  },
                ]}
                onPress={() => handleQuickSelect(0)}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    selectedDate.toDateString() ===
                      new Date().toDateString() && {
                      color: primaryColor,
                      fontWeight: "700",
                    },
                  ]}
                >
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  selectedDate.toDateString() ===
                    new Date(Date.now() - 86400000).toDateString() && {
                    backgroundColor: `${primaryColor}20`,
                    borderColor: primaryColor,
                  },
                ]}
                onPress={() => handleQuickSelect(-1)}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    selectedDate.toDateString() ===
                      new Date(Date.now() - 86400000).toDateString() && {
                      color: primaryColor,
                      fontWeight: "700",
                    },
                  ]}
                >
                  Yesterday
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  selectedDate.toDateString() ===
                    new Date(Date.now() + 86400000).toDateString() && {
                    backgroundColor: `${primaryColor}20`,
                    borderColor: primaryColor,
                  },
                ]}
                onPress={() => handleQuickSelect(1)}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    selectedDate.toDateString() ===
                      new Date(Date.now() + 86400000).toDateString() && {
                      color: primaryColor,
                      fontWeight: "700",
                    },
                  ]}
                >
                  Tomorrow
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={() => navigateMonth(-1)}
            >
              <Ionicons name="chevron-back" size={20} color={primaryColor} />
            </TouchableOpacity>

            <Text style={styles.monthYearText}>
              {formatDateDisplay(displayMonth).monthFull}{" "}
              {formatDateDisplay(displayMonth).year}
            </Text>

            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={() => navigateMonth(1)}
            >
              <Ionicons name="chevron-forward" size={20} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {/* Calendar Days Header */}
          <View style={styles.daysHeader}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text key={index} style={styles.dayHeaderText}>
                {day + "mk"}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((day, index) => {
              const isSelected =
                day === selectedDate.getDate() &&
                displayMonth.getMonth() === selectedDate.getMonth() &&
                displayMonth.getFullYear() === selectedDate.getFullYear()

              const isToday =
                day === new Date().getDate() &&
                displayMonth.getMonth() === new Date().getMonth() &&
                displayMonth.getFullYear() === new Date().getFullYear()

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDayBtn,
                    isSelected && [
                      styles.selectedDay,
                      { backgroundColor: primaryColor },
                    ],
                    isToday && !isSelected && styles.todayDay,
                  ]}
                  onPress={() => handleDateSelect(day)}
                  disabled={!day}
                >
                  {day && (
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.selectedDayText,
                        isToday && !isSelected && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>
    </Modal>
  )
}

// Styles for the component
const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  doneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateDisplay: {
    alignItems: "center",
  },
  selectedDayName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },
  selectedDateText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 4,
  },
  selectedYearText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },
  quickDateSection: {
    paddingVertical: 16,
  },
  quickDateContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickDateBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  daysHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  calendarDayBtn: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedDay: {
    borderRadius: 8,
  },
  todayDay: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  todayDayText: {
    color: "#F59E0B",
    fontWeight: "700",
  },
}

export default DatePickerModal
