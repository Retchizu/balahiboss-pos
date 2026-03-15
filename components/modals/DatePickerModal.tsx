import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  FlatList,
  TextInput,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
  getYear,
  getMonth,
  setMonth,
  setYear,
} from "date-fns";
import { primary, strongPrimary } from "@/theme/backgroundTheme";

type DatePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (date: Date | null) => void;
  initialDate?: Date | null;
  /** When true, show time picker and apply time (hours/minutes) to the selected date */
  showTimePicker?: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const YEAR_ITEM_WIDTH = wp(18);
const YEAR_RANGE_BEFORE = 10;
const YEAR_RANGE_AFTER = 5;

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onApply,
  initialDate = null,
  showTimePicker = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ?? new Date()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedHour, setSelectedHour] = useState(
    initialDate ? initialDate.getHours() : 0
  );
  const [selectedMinute, setSelectedMinute] = useState(
    initialDate ? initialDate.getMinutes() : 0
  );

  const [hourText, setHourText] = useState(
    String(initialDate ? initialDate.getHours() : 0).padStart(2, "0")
  );
  const [minuteText, setMinuteText] = useState(
    String(initialDate ? initialDate.getMinutes() : 0).padStart(2, "0")
  );
  const [hourFocused, setHourFocused] = useState(false);
  const [minuteFocused, setMinuteFocused] = useState(false);

  const [step, setStep] = useState<"date" | "time">("date");
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(getYear(currentMonth));
  const yearListRef = useRef<FlatList<number>>(null);

  const years = useMemo(() => {
    const now = new Date();
    const base = getYear(now);
    const list: number[] = [];
    for (let y = base - YEAR_RANGE_BEFORE; y <= base + YEAR_RANGE_AFTER; y++) {
      list.push(y);
    }
    return list;
  }, []);

  const openMonthYearPicker = useCallback(() => {
    setPickerYear(getYear(currentMonth));
    setShowMonthYearPicker(true);
  }, [currentMonth]);

  useEffect(() => {
    if (showMonthYearPicker && yearListRef.current) {
      const idx = years.indexOf(pickerYear);
      if (idx >= 0) {
        setTimeout(() => {
          yearListRef.current?.scrollToIndex({
            index: idx,
            animated: false,
            viewPosition: 0.5,
          });
        }, 50);
      }
    }
  }, [showMonthYearPicker, pickerYear, years]);

  useEffect(() => {
    if (!hourFocused) {
      setHourText(String(selectedHour).padStart(2, "0"));
    }
  }, [selectedHour, hourFocused]);

  useEffect(() => {
    if (!minuteFocused) {
      setMinuteText(String(selectedMinute).padStart(2, "0"));
    }
  }, [selectedMinute, minuteFocused]);

  useEffect(() => {
    if (visible && showTimePicker) {
      if (initialDate) {
        setSelectedHour(initialDate.getHours());
        setSelectedMinute(initialDate.getMinutes());
      } else {
        setSelectedHour(0);
        setSelectedMinute(0);
      }
      setStep("date");
    }
  }, [visible, showTimePicker, initialDate]);

  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      let next = setMonth(currentMonth, monthIndex);
      next = setYear(next, pickerYear);
      setCurrentMonth(next);
      setShowMonthYearPicker(false);
    },
    [currentMonth, pickerYear]
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handleDayPress = useCallback((day: Date) => {
    setSelectedDate(day);
  }, []);

  const isSelected = useCallback(
    (day: Date) => (selectedDate ? isSameDay(day, selectedDate) : false),
    [selectedDate]
  );

  const handleApply = useCallback(() => {
    const date = selectedDate ? new Date(selectedDate) : null;
    if (date) {
      if (showTimePicker) {
        date.setHours(selectedHour, selectedMinute, 0, 0);
      } else {
        date.setHours(0, 0, 0, 0);
      }
    }
    onApply(date);
  }, [selectedDate, showTimePicker, selectedHour, selectedMinute, onApply]);

  const handleClear = useCallback(() => {
    setSelectedDate(null);
    if (showTimePicker) {
      setSelectedHour(0);
      setSelectedMinute(0);
    }
  }, [showTimePicker]);

  const handleReset = useCallback(() => {
    setSelectedDate(initialDate);
    setCurrentMonth(initialDate ?? new Date());
    setStep("date");
    if (showTimePicker && initialDate) {
      setSelectedHour(initialDate.getHours());
      setSelectedMinute(initialDate.getMinutes());
    } else if (showTimePicker) {
      setSelectedHour(0);
      setSelectedMinute(0);
    }
    onClose();
  }, [initialDate, showTimePicker, onClose]);

  const goToTimeStep = useCallback(() => {
    if (selectedDate && showTimePicker) setStep("time");
  }, [selectedDate, showTimePicker]);

  const goBackToDateStep = useCallback(() => setStep("date"), []);

  const hour12 = (selectedHour % 12 === 0 ? 12 : selectedHour % 12) as number;
  const isPM = selectedHour >= 12;

  const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const CLOCK_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const setHourFromClock = useCallback((h12: number, pm: boolean) => {
    const h = h12 === 12 ? (pm ? 12 : 0) : (pm ? h12 + 12 : h12);
    setSelectedHour(h);
  }, []);

  const setMinuteFromClock = useCallback((stepIndex: number) => {
    setSelectedMinute(Math.min(55, stepIndex * 5));
  }, []);

  const handleHourInput = useCallback((text: string) => {
    const digits = text.replace(/\D/g, "");
    setHourText(digits);
    const n = parseInt(digits, 10);
    if (!Number.isNaN(n)) {
      setSelectedHour(Math.min(23, Math.max(0, n)));
    }
  }, []);

  const handleHourBlur = useCallback(() => {
    setHourFocused(false);
    const n = parseInt(hourText.replace(/\D/g, ""), 10);
    const val = Number.isNaN(n) ? 0 : Math.min(23, Math.max(0, n));
    setSelectedHour(val);
    setHourText(String(val).padStart(2, "0"));
  }, [hourText]);

  const handleMinuteInput = useCallback((text: string) => {
    const digits = text.replace(/\D/g, "");
    setMinuteText(digits);
    const n = parseInt(digits, 10);
    if (!Number.isNaN(n)) {
      setSelectedMinute(Math.min(59, Math.max(0, n)));
    }
  }, []);

  const handleMinuteBlur = useCallback(() => {
    setMinuteFocused(false);
    const n = parseInt(minuteText.replace(/\D/g, ""), 10);
    const val = Number.isNaN(n) ? 0 : Math.min(59, Math.max(0, n));
    setSelectedMinute(val);
    setMinuteText(String(val).padStart(2, "0"));
  }, [minuteText]);

  const hourStepIndex = hour12 === 12 ? 0 : hour12;
  const minuteStepIndex = Math.min(11, Math.round(selectedMinute / 5));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleReset}
    >
      <TouchableWithoutFeedback onPress={handleReset}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                {step === "time" && showTimePicker ? (
                  <TouchableOpacity
                    onPress={goBackToDateStep}
                    style={styles.headerBackButton}
                    hitSlop={12}
                  >
                    <Ionicons name="chevron-back" size={wp(6)} color={strongPrimary} />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="calendar" size={wp(6)} color={strongPrimary} />
                )}
                <View style={{ flex: 1, marginLeft: wp(2) }}>
                  <Text style={styles.headerTitle}>
                    {step === "time" && showTimePicker ? "Select time" : "Select Date"}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {step === "time" && showTimePicker
                      ? "Tap hour and minute on the clock"
                      : "Tap a day to select"}
                  </Text>
                </View>
              </View>

              {step === "date" ? (
                <>
                  {/* Selected date label */}
                  <View style={styles.dateLabelRow}>
                    <Text style={styles.dateLabelTitle}>Selected</Text>
                    <Text
                      style={[
                        styles.dateLabelValue,
                        selectedDate && styles.dateLabelActive,
                      ]}
                    >
                      {selectedDate
                        ? format(selectedDate, "MMM dd, yyyy")
                        : "—"}
                    </Text>
                  </View>

                  {/* Month navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity
                  onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  hitSlop={12}
                >
                  <Ionicons
                    name="chevron-back"
                    size={wp(6)}
                    color={strongPrimary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showMonthYearPicker ? () => setShowMonthYearPicker(false) : openMonthYearPicker}
                  activeOpacity={0.6}
                  style={styles.monthTextButton}
                >
                  <Text style={styles.monthText}>
                    {format(currentMonth, "MMMM yyyy")}
                  </Text>
                  <Ionicons
                    name={showMonthYearPicker ? "chevron-up" : "chevron-down"}
                    size={wp(4)}
                    color={strongPrimary}
                    style={{ marginLeft: wp(1) }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  hitSlop={12}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={wp(6)}
                    color={strongPrimary}
                  />
                </TouchableOpacity>
              </View>

              {showMonthYearPicker ? (
                <View style={styles.monthYearPickerContainer}>
                  {/* Year slider */}
                  <FlatList
                    ref={yearListRef}
                    data={years}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.toString()}
                    snapToInterval={YEAR_ITEM_WIDTH}
                    decelerationRate="fast"
                    contentContainerStyle={styles.yearListContent}
                    getItemLayout={(_, index) => ({
                      length: YEAR_ITEM_WIDTH,
                      offset: YEAR_ITEM_WIDTH * index,
                      index,
                    })}
                    renderItem={({ item: year }) => {
                      const isActive = year === pickerYear;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.yearItem,
                            isActive && styles.yearItemActive,
                          ]}
                          onPress={() => setPickerYear(year)}
                          activeOpacity={0.6}
                        >
                          <Text
                            style={[
                              styles.yearItemText,
                              isActive && styles.yearItemTextActive,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />

                  {/* Month grid 4x3 */}
                  <View style={styles.monthGrid}>
                    {MONTHS.map((m, idx) => {
                      const isActive =
                        idx === getMonth(currentMonth) &&
                        pickerYear === getYear(currentMonth);
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.monthGridItem,
                            isActive && styles.monthGridItemActive,
                          ]}
                          onPress={() => handleMonthSelect(idx)}
                          activeOpacity={0.6}
                        >
                          <Text
                            style={[
                              styles.monthGridText,
                              isActive && styles.monthGridTextActive,
                            ]}
                          >
                            {m}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <>
                  {/* Weekday headers */}
                  <View style={styles.weekdayRow}>
                    {WEEKDAYS.map((d) => (
                      <Text key={d} style={styles.weekdayText}>
                        {d}
                      </Text>
                    ))}
                  </View>

                  {/* Calendar grid */}
                  <View style={styles.calendarGrid}>
                    {calendarDays.map((day, index) => {
                      const inCurrentMonth = isSameMonth(day, currentMonth);
                      const selected = isSelected(day);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayCell,
                            selected && styles.dayCellSelected,
                          ]}
                          activeOpacity={0.6}
                          onPress={() => handleDayPress(day)}
                        >
                          <View
                            style={[
                              styles.dayInner,
                              selected && styles.dayInnerSelected,
                              isToday && !selected && styles.dayInnerToday,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                !inCurrentMonth && styles.dayTextOutside,
                                selected && styles.dayTextSelected,
                                isToday && !selected && styles.dayTextToday,
                              ]}
                            >
                              {format(day, "d")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
                </>
              ) : (
                /* Time step: 1 clock + 2 inputs */
                <View style={styles.timeStepContainer}>
                  {selectedDate && (
                    <Text style={styles.timeStepDateLabel}>
                      {format(selectedDate, "EEE, MMM d, yyyy")}
                    </Text>
                  )}
                  <View style={styles.clockFace}>
                    {/* Outer ring: tappable hours (12 positions) */}
                    {CLOCK_HOURS.map((h, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const r = wp(18);
                      const cx = wp(22);
                      const size = wp(10);
                      const x = cx + r * Math.cos(angle) - size / 2;
                      const y = cx + r * Math.sin(angle) - size / 2;
                      const active = (h === 12 ? 0 : h) === hourStepIndex;
                      return (
                        <TouchableOpacity
                          key={`h-${h}`}
                          style={[
                            styles.clockSegment,
                            { left: x, top: y, width: size, height: size, borderRadius: size / 2 },
                            active && styles.clockSegmentActive,
                          ]}
                          onPress={() => setHourFromClock(h, isPM)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.clockSegmentText,
                              active && styles.clockSegmentTextActive,
                            ]}
                          >
                            {h}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {/* Inner ring: tappable minutes (0, 5, ..., 55) */}
                    {CLOCK_MINUTES.map((m, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const r = wp(11);
                      const cx = wp(22);
                      const size = wp(8);
                      const x = cx + r * Math.cos(angle) - size / 2;
                      const y = cx + r * Math.sin(angle) - size / 2;
                      const active = i === minuteStepIndex;
                      return (
                        <TouchableOpacity
                          key={`m-${m}`}
                          style={[
                            styles.clockSegment,
                            styles.clockSegmentInner,
                            { left: x, top: y, width: size, height: size, borderRadius: size / 2 },
                            active && styles.clockSegmentActive,
                          ]}
                          onPress={() => setMinuteFromClock(i)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.clockSegmentText,
                              styles.clockSegmentTextSmall,
                              active && styles.clockSegmentTextActive,
                            ]}
                          >
                            {String(m).padStart(2, "0")}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.ampmToggle}>
                    <TouchableOpacity
                      style={[styles.ampmButton, !isPM && styles.ampmButtonActive]}
                      onPress={() => setHourFromClock(hour12, false)}
                    >
                      <Text style={[styles.ampmButtonText, !isPM && styles.ampmButtonTextActive]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.ampmButton, isPM && styles.ampmButtonActive]}
                      onPress={() => setHourFromClock(hour12, true)}
                    >
                      <Text style={[styles.ampmButtonText, isPM && styles.ampmButtonTextActive]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeInputRow}>
                    <View style={styles.timeInputGroup}>
                      <Text style={styles.timeInputLabel}>Hours</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={hourText}
                        onChangeText={handleHourInput}
                        onFocus={() => setHourFocused(true)}
                        onBlur={handleHourBlur}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="00"
                        selectTextOnFocus
                      />
                    </View>
                    <View style={styles.timeInputGroup}>
                      <Text style={styles.timeInputLabel}>Minutes</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={minuteText}
                        onChangeText={handleMinuteInput}
                        onFocus={() => setMinuteFocused(true)}
                        onBlur={handleMinuteBlur}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="00"
                        selectTextOnFocus
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Footer buttons */}
              <View style={styles.footer}>
                {step === "date" ? (
                  <>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                    <View style={styles.footerRight}>
                      <TouchableOpacity style={styles.cancelButton} onPress={handleReset}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      {showTimePicker ? (
                        <TouchableOpacity
                          style={[
                            styles.applyButton,
                            !selectedDate && styles.applyButtonDisabled,
                          ]}
                          onPress={goToTimeStep}
                          disabled={!selectedDate}
                        >
                          <Text style={styles.applyButtonText}>Next</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.applyButton,
                            !selectedDate && styles.applyButtonDisabled,
                          ]}
                          onPress={handleApply}
                          disabled={!selectedDate}
                        >
                          <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.clearButton} onPress={goBackToDateStep}>
                      <Text style={styles.clearButtonText}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.footerRight}>
                      <TouchableOpacity style={styles.cancelButton} onPress={handleReset}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DatePickerModal;

const CELL_SIZE = wp(12.5);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: primary,
    borderRadius: wp(4),
    padding: wp(4),
    width: wp(92),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 10 },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  headerTitle: {
    fontFamily: "Gantari-Bold",
    fontSize: wp(4.5),
    color: "#111827",
  },
  headerSubtitle: {
    fontFamily: "Gantari-Regular",
    fontSize: wp(3.2),
    color: "#6B7280",
    marginTop: hp(0.2),
  },
  dateLabelRow: {
    alignItems: "center",
    marginBottom: hp(1.5),
    paddingHorizontal: wp(2),
  },
  dateLabelTitle: {
    fontFamily: "Gantari-Medium",
    fontSize: wp(3),
    color: "#6B7280",
    marginBottom: hp(0.3),
  },
  dateLabelValue: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4),
    color: "#111827",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    textAlign: "center",
    overflow: "hidden",
  },
  dateLabelActive: {
    borderColor: strongPrimary,
    color: strongPrimary,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
    paddingHorizontal: wp(1),
  },
  monthTextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
  },
  monthText: {
    fontFamily: "Gantari-Bold",
    fontSize: wp(4.2),
    color: "#111827",
  },
  monthYearPickerContainer: {
    paddingVertical: hp(1),
  },
  yearListContent: {
    paddingHorizontal: wp(2),
  },
  yearItem: {
    width: YEAR_ITEM_WIDTH,
    paddingVertical: hp(1),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2),
    marginHorizontal: wp(0.5),
  },
  yearItemActive: {
    backgroundColor: strongPrimary,
  },
  yearItemText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.8),
    color: "#6B7280",
  },
  yearItemTextActive: {
    color: "#FFFFFF",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: hp(1.5),
    paddingHorizontal: wp(1),
  },
  monthGridItem: {
    width: "24%",
    paddingVertical: hp(1.5),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2.5),
    marginBottom: hp(1),
  },
  monthGridItemActive: {
    backgroundColor: "rgba(255,145,73,0.15)",
    borderWidth: 1.5,
    borderColor: strongPrimary,
  },
  monthGridText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.8),
    color: "#374151",
  },
  monthGridTextActive: {
    color: strongPrimary,
    fontFamily: "Gantari-Bold",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: hp(0.5),
  },
  weekdayText: {
    width: CELL_SIZE,
    textAlign: "center",
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3),
    color: "#9CA3AF",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellSelected: {
    backgroundColor: "transparent",
  },
  dayInner: {
    width: CELL_SIZE * 0.82,
    height: CELL_SIZE * 0.82,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: CELL_SIZE * 0.41,
  },
  dayInnerSelected: {
    backgroundColor: strongPrimary,
  },
  dayInnerToday: {
    borderWidth: 1.5,
    borderColor: strongPrimary,
  },
  dayText: {
    fontFamily: "Gantari-Medium",
    fontSize: wp(3.5),
    color: "#111827",
  },
  dayTextOutside: {
    color: "#D1D5DB",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontFamily: "Gantari-Bold",
  },
  dayTextToday: {
    color: strongPrimary,
    fontFamily: "Gantari-Bold",
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    gap: wp(3),
  },
  timePickerControls: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
  },
  timePickerGroup: {
    alignItems: "center",
    minWidth: wp(20),
  },
  timePickerLabel: {
    fontFamily: "Gantari-Medium",
    fontSize: wp(3),
    color: "#6B7280",
    marginBottom: hp(0.5),
  },
  timeStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  timeStepperButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
  },
  timeStepperValue: {
    fontFamily: "Gantari-Bold",
    fontSize: wp(4),
    color: "#111827",
    minWidth: wp(10),
    textAlign: "center",
  },
  timePickerColon: {
    fontFamily: "Gantari-Bold",
    fontSize: wp(5),
    color: "#9CA3AF",
    marginTop: hp(2.5),
  },
  headerBackButton: {
    padding: wp(1),
  },
  timeStepContainer: {
    marginTop: hp(0.5),
    alignItems: "center",
  },
  timeStepDateLabel: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.5),
    color: "#6B7280",
    marginBottom: hp(1),
  },
  clockFace: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "#FAFAFA",
    alignSelf: "center",
    marginBottom: hp(2),
    position: "relative",
  },
  clockSegment: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  clockSegmentInner: {
    backgroundColor: "#FFFFFF",
  },
  clockSegmentActive: {
    backgroundColor: strongPrimary,
  },
  clockSegmentText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.5),
    color: "#374151",
  },
  clockSegmentTextSmall: {
    fontSize: wp(2.8),
  },
  clockSegmentTextActive: {
    color: "#FFFFFF",
    fontFamily: "Gantari-Bold",
  },
  ampmToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: wp(2),
    padding: wp(0.5),
    alignSelf: "center",
    marginBottom: hp(1.5),
  },
  ampmButton: {
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(4),
    borderRadius: wp(1.5),
  },
  ampmButtonActive: {
    backgroundColor: strongPrimary,
  },
  ampmButtonText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.5),
    color: "#6B7280",
  },
  ampmButtonTextActive: {
    color: "#FFFFFF",
  },
  timeInputRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(6),
  },
  timeInputGroup: {
    alignItems: "center",
    minWidth: wp(24),
  },
  timeInputLabel: {
    fontFamily: "Gantari-Medium",
    fontSize: wp(3),
    color: "#6B7280",
    marginBottom: hp(0.5),
  },
  timeInput: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(4.5),
    color: "#111827",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    minWidth: wp(18),
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  clearButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  clearButtonText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.5),
    color: "#EF4444",
  },
  footerRight: {
    flexDirection: "row",
    gap: wp(2),
  },
  cancelButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.5),
    color: "#374151",
  },
  applyButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
    backgroundColor: strongPrimary,
  },
  applyButtonDisabled: {
    opacity: 0.4,
  },
  applyButtonText: {
    fontFamily: "Gantari-SemiBold",
    fontSize: wp(3.5),
    color: "#FFFFFF",
  },
});
