"use client";

interface DayData {
  date: string;
  count: number;
}

interface StatsCalendarProps {
  data: DayData[];
  months?: number;
}

export default function StatsCalendar({ data, months = 3 }: StatsCalendarProps) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const dataMap = new Map(data.map((d) => [d.date, d.count]));
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const weeks: { date: Date; count: number }[][] = [];
  let currentWeek: { date: Date; count: number }[] = [];
  const cursor = new Date(startDate);

  while (cursor <= today) {
    const dateStr = cursor.toISOString().split("T")[0];
    const count = dataMap.get(dateStr) || 0;
    currentWeek.push({ date: new Date(cursor), count });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getColor = (count: number) => {
    if (count === 0) return "bg-secondary";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-green-200";
    if (ratio <= 0.5) return "bg-green-300";
    if (ratio <= 0.75) return "bg-green-500";
    return "bg-green-700";
  };

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-[3px] p-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                title={`${day.date.toISOString().split("T")[0]}: ${day.count}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
