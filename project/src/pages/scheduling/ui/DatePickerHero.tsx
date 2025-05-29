import { DateRangePicker } from "@heroui/date-picker";
import { useState } from "react";
import type {CalendarDate } from "@internationalized/date";
import { RangeValue } from "@heroui/react";
export default function DatePickerHero() {
  const [dateRange, setDateRange] = useState<RangeValue<CalendarDate> | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dateRange) {
      // Use dateRange.start and dateRange.end for your database input
      console.log("Start:", dateRange.start.toString());
      console.log("End:", dateRange.end.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DateRangePicker
        label="Select date range"
        value={dateRange}
        onChange={setDateRange}
        isRequired
      />
      <button type="submit">Submit</button>
    </form>
  );
}