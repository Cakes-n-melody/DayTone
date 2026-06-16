import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EMPTY_COLOR = "#3B3937";

function localDate(year, month, day) {
  return new Date(year, month, day, 5, 30, 0, 0);
}

function isoKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toLocalDate(input) {
  if (!input) {
    const d = new Date();
    return localDate(d.getFullYear(), d.getMonth(), d.getDate());
  }
  if (input instanceof Date) {
    return localDate(input.getFullYear(), input.getMonth(), input.getDate());
  }
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    return localDate(y, m - 1, d);
  }
  // fallback: coerce then normalize
  const parsed = new Date(input);
  return localDate(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function buildMonthDates(inputDate) {
  const today = toLocalDate(inputDate);
  const year = today.getFullYear();
  const month = today.getMonth();

  const start = localDate(year, month, 1);
  const end = localDate(year, month + 1, 0);

  const dates = [];
  const total = end.getDate();
  console.log(total);
  for (let d = 1; d <= total; d++) {
    dates.push(localDate(year, month, d));
  }
  console.log({ start, end, dates });
  return { start, end, dates };
}

function datesToWeeks(inputDate) {
  const { start, end } = buildMonthDates(inputDate);
  const year = start.getFullYear();
  const month = start.getMonth();

  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < start.getDay(); i++) currentWeek.push(null);

  const totalDays = end.getDate();
  for (let day = 1; day <= totalDays; day++) {
    currentWeek.push(localDate(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return { weeks, start, end };
}

export default function Heatmap({
  moods = {},
  onDayPress = () => {},
  monthFor = undefined,
}) {
  const { start, end, dates } = useMemo(
    () => buildMonthDates(monthFor),
    [monthFor],
  );
  const { weeks } = useMemo(() => datesToWeeks(monthFor), [monthFor]);

  function getColour(date) {
    if (!date) return EMPTY_COLOR;
    const key = isoKey(date);
    const entry = moods?.[key];
    if (!entry) return EMPTY_COLOR;
    if (entry.moodColor) return entry.moodColor;
    const fallback = {
      1: "#8a241f",
      2: "#b65a3f",
      3: "#cdaa6b",
      4: "#9fb987",
      5: "#6a8c6e",
    };
    return fallback[entry.mood] || EMPTY_COLOR;
  }

  return (
    <View style={styles.row}>
      <View style={styles.weekdayCol}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Text key={d} style={styles.weekdayText}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.weeksRow}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekCol}>
            {week.map((day, di) => {
              const isValid = day !== null;
              const color = getColour(day);
              return (
                <TouchableOpacity
                  key={di}
                  disabled={!isValid}
                  onPress={() => isValid && onDayPress(day)}
                  activeOpacity={0.75}
                  style={[
                    styles.cell,
                    { backgroundColor: color, opacity: isValid ? 1 : 0.35 },
                  ]}
                >
                  {isValid && day.getDate() === 1 ? (
                    <Text style={styles.monthLabel}>
                      {day.toLocaleString("default", { month: "short" })}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  weekdayCol: { marginRight: 10, marginVertical: 15, width: 26 },
  weekdayText: {
    height: 44,
    marginVertical: 3,
    color: "#978F85",
    fontSize: 11,
    textShadow: "0 0 10px #978f854b, 0 0 20px #978f854b, 0 0 30px #978f854b",
  },
  weeksRow: { flexDirection: "row" },
  weekCol: { flexDirection: "column", marginRight: 6 },
  cell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginVertical: 5,
    marginRight: 3,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0)",
    boxShadow: "0 0 20px 5px #2524229a",
  },
  monthLabel: { fontSize: 8, color: "#D0C7C2", fontWeight: "600" },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "serif",
    color: "#EAE3D7",
    letterSpacing: -0.6,
    textShadow: "0 0 10px #eae3d7be, 0 0 20px #eae3d7be, 0 0 30px #eae3d7be",
  },
});
