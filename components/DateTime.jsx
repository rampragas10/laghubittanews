"use client";

import { useEffect, useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";

const NEPAL_TIMEZONE = "Asia/Kathmandu";

const NEPALI_DAYS = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहिबार",
  "शुक्रबार",
  "शनिबार",
];

const NEPALI_MONTHS = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "असोज",
  "कात्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फागुन",
  "चैत",
];

const NEPALI_DIGITS = {
  0: "०",
  1: "१",
  2: "२",
  3: "३",
  4: "४",
  5: "५",
  6: "६",
  7: "७",
  8: "८",
  9: "९",
};

function toNepaliDigits(value) {
  return String(value).replace(
    /\d/g,
    (digit) => NEPALI_DIGITS[digit]
  );
}

export default function DateTime() {
  const [date, setDate] = useState(null);

  useEffect(() => {
    const updateDate = () => {
      setDate(new Date());
    };

    updateDate();

    const interval = setInterval(updateDate, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = useMemo(() => {
    if (!date) return null;

    const nepaliDate = new NepaliDate(date);

    const year = nepaliDate.getYear();
    const month = nepaliDate.getMonth();
    const day = nepaliDate.getDate();

    const weekday = NEPALI_DAYS[date.getDay()];

    const bsDate = `${toNepaliDigits(year)} ${
      NEPALI_MONTHS[month - 1]
    } ${toNepaliDigits(day)}`;

    const englishDate = new Intl.DateTimeFormat("en-US", {
      timeZone: NEPAL_TIMEZONE,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);

    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: NEPAL_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);

    return {
      bsDate,
      weekday,
      englishDate,
      time: toNepaliDigits(time),
    };
  }, [date]);

  if (!formattedDate) {
    return (
      <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs md:text-sm">

      {/* Live indicator */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8cf9a9] opacity-60" />

          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8cf9a9]" />
        </span>

        <span className="font-bold tracking-wide text-[#8cf9a9]">
          LIVE
        </span>
      </div>

      {/* Divider */}
      <span className="h-4 w-px bg-white/20" />

      {/* BS Date */}
      <span className="whitespace-nowrap font-medium text-white">
        {formattedDate.bsDate}
      </span>

      {/* Weekday */}
      <span className="hidden text-[#8cf9a9] sm:inline">
        •
      </span>

      <span className="whitespace-nowrap font-medium text-white/80">
        {formattedDate.weekday}
      </span>

      {/* English date */}
      <span className="hidden h-4 w-px bg-white/20 md:block" />

      <span className="hidden whitespace-nowrap text-white/60 md:inline">
        {formattedDate.englishDate}
      </span>

      {/* Time */}
      <span className="h-4 w-px bg-white/20" />

      <span className="whitespace-nowrap font-bold tabular-nums text-[#8cf9a9]">
        {formattedDate.time}
      </span>

    </div>
  );
}