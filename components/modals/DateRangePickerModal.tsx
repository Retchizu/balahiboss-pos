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
  isAfter,
  isBefore,
  format,
  getYear,
  getMonth,
  setMonth,
  setYear,
} from "date-fns";
import { primary, strongPrimary } from "@/theme/backgroundTheme";

type DateRangePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null) => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const YEAR_ITEM_WIDTH = wp(18);
const YEAR_RANGE_BEFORE = 10;
const YEAR_RANGE_AFTER = 5;

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  visible,
  onClose,
  onApply,
  initialStartDate = null,
  initialEndDate = null,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialStartDate ?? new Date()
  );
  const [rangeStart, setRangeStart] = useState<Date | null>(initialStartDate);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(initialEndDate);
  const [selectingEnd, setSelectingEnd] = useState(
    initialStartDate !== null && initialEndDate === null
  );

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

  const handleDayPress = useCallback(
    (day: Date) => {
      if (!selectingEnd) {
        setRangeStart(day);
        setRangeEnd(null);
        setSelectingEnd(true);
      } else {
        if (rangeStart && isBefore(day, rangeStart)) {
          setRangeStart(day);
          setRangeEnd(rangeStart);
        } else {
          setRangeEnd(day);
        }
        setSelectingEnd(false);
      }
    },
    [selectingEnd, rangeStart]
  );

  const isInRange = useCallback(
    (day: Date) => {
      if (!rangeStart || !rangeEnd) return false;
      return isAfter(day, rangeStart) && isBefore(day, rangeEnd);
    },
    [rangeStart, rangeEnd]
  );

  const isRangeStart = useCallback(
    (day: Date) => (rangeStart ? isSameDay(day, rangeStart) : false),
    [rangeStart]
  );

  const isRangeEnd = useCallback(
    (day: Date) => (rangeEnd ? isSameDay(day, rangeEnd) : false),
    [rangeEnd]
  );

  const handleApply = useCallback(() => {
    const start = rangeStart ? new Date(rangeStart) : null;
    const end = rangeEnd ? new Date(rangeEnd) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
    onApply(start, end);
  }, [rangeStart, rangeEnd, onApply]);

  const handleClear = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelectingEnd(false);
  }, []);

  const handleReset = useCallback(() => {
    setRangeStart(initialStartDate);
    setRangeEnd(initialEndDate);
    setSelectingEnd(false);
    setCurrentMonth(initialStartDate ?? new Date());
    onClose();
  }, [initialStartDate, initialEndDate, onClose]);

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
                <Ionicons
                  name="calendar"
                  size={wp(6)}
                  color={strongPrimary}
                />
                <View style={{ flex: 1, marginLeft: wp(2) }}>
                  <Text style={styles.headerTitle}>Select Date Range</Text>
                  <Text style={styles.headerSubtitle}>
                    {selectingEnd
                      ? "Tap to select end date"
                      : "Tap to select start date"}
                  </Text>
                </View>
              </View>

              {/* Date labels */}
              <View style={styles.dateLabelsRow}>
                <View style={styles.dateLabelContainer}>
                  <Text style={styles.dateLabelTitle}>Start</Text>
                  <Text
                    style={[
                      styles.dateLabelValue,
                      !selectingEnd && styles.dateLabelActive,
                    ]}
                  >
                    {rangeStart ? format(rangeStart, "MMM dd, yyyy") : "—"}
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={wp(5)}
                  color="rgba(0,0,0,0.3)"
                  style={{ marginTop: hp(2) }}
                />
                <View style={styles.dateLabelContainer}>
                  <Text style={styles.dateLabelTitle}>End</Text>
                  <Text
                    style={[
                      styles.dateLabelValue,
                      selectingEnd && styles.dateLabelActive,
                    ]}
                  >
                    {rangeEnd ? format(rangeEnd, "MMM dd, yyyy") : "—"}
                  </Text>
                </View>
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
                      const isStart = isRangeStart(day);
                      const isEnd = isRangeEnd(day);
                      const inRange = isInRange(day);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = isStart || isEnd;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayCell,
                            inRange && styles.dayCellInRange,
                            isStart && styles.dayCellRangeStart,
                            isEnd && styles.dayCellRangeEnd,
                            isSelected && !inRange && styles.dayCellSelected,
                          ]}
                          activeOpacity={0.6}
                          onPress={() => handleDayPress(day)}
                        >
                          <View
                            style={[
                              styles.dayInner,
                              isSelected && styles.dayInnerSelected,
                              isToday && !isSelected && styles.dayInnerToday,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                !inCurrentMonth && styles.dayTextOutside,
                                isSelected && styles.dayTextSelected,
                                isToday && !isSelected && styles.dayTextToday,
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

              {/* Footer buttons */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <View style={styles.footerRight}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleReset}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      !rangeStart && styles.applyButtonDisabled,
                    ]}
                    onPress={handleApply}
                    disabled={!rangeStart}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DateRangePickerModal;

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
  dateLabelsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(4),
    marginBottom: hp(1.5),
    paddingHorizontal: wp(2),
  },
  dateLabelContainer: {
    flex: 1,
    alignItems: "center",
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
  dayCellInRange: {
    backgroundColor: "rgba(255,145,73,0.12)",
  },
  dayCellRangeStart: {
    backgroundColor: "rgba(255,145,73,0.12)",
    borderTopLeftRadius: CELL_SIZE / 2,
    borderBottomLeftRadius: CELL_SIZE / 2,
  },
  dayCellRangeEnd: {
    backgroundColor: "rgba(255,145,73,0.12)",
    borderTopRightRadius: CELL_SIZE / 2,
    borderBottomRightRadius: CELL_SIZE / 2,
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
