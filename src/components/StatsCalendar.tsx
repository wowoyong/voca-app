"use client";

import { useState, useMemo } from "react";

interface DayData {
  date: string;
  count: number;
  todayCompleted?: boolean;
  reviewCompleted?: boolean;
  quizCompleted?: boolean;
}

interface StatsCalendarProps {
  data: DayData[];
}

/** 월별 학습 현황 캘린더 컴포넌트 */
export default function StatsCalendar({ data }: StatsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const dataMap = new Map(data.map((d) => [d.date, d]));
  
  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    
    const monthData = data.filter(d => d.date >= monthStart && d.date <= monthEnd);
    
    const totalDays = monthData.filter(d => d.count > 0).length;
    const tier1Days = monthData.filter(d => 
      d.todayCompleted && !d.reviewCompleted
    ).length;
    const tier2Days = monthData.filter(d => 
      d.todayCompleted && d.reviewCompleted && !d.quizCompleted
    ).length;
    const tier3Days = monthData.filter(d => 
      d.todayCompleted && d.reviewCompleted && d.quizCompleted
    ).length;
    
    return { totalDays, tier1Days, tier2Days, tier3Days };
  }, [data, year, month, daysInMonth]);
  
  // 학습 완료 단계에 따른 배경색 반환
  const getColor = (dayData: DayData | undefined) => {
    if (!dayData || dayData.count === 0) return "bg-gray-200";
    
    const { todayCompleted, reviewCompleted, quizCompleted } = dayData;
    
    if (todayCompleted && reviewCompleted && quizCompleted) {
      return "bg-green-700";
    }
    
    if (todayCompleted && reviewCompleted) {
      return "bg-green-500";
    }
    
    if (todayCompleted) {
      return "bg-green-300";
    }
    
    return "bg-green-200";
  };
  
  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const calendarDays: (number | null)[] = [];
  
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-base font-semibold text-foreground">
          {year}년 {month + 1}월
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Monthly Statistics Summary */}
      {monthlyStats.totalDays > 0 && (
        <div className="bg-secondary/50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{monthlyStats.totalDays}</div>
              <div className="text-xs text-muted-foreground">총 학습</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-300">{monthlyStats.tier1Days}</div>
              <div className="text-xs text-muted-foreground">단어</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">{monthlyStats.tier2Days}</div>
              <div className="text-xs text-muted-foreground">+복습</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-700">{monthlyStats.tier3Days}</div>
              <div className="text-xs text-muted-foreground">+퀴즈</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayData = dataMap.get(dateStr);
          const isToday = dateStr === today;
          
          return (
            <div
              key={dateStr}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${getColor(dayData)} ${isToday ? "ring-2 ring-primary ring-offset-1" : ""} ${dayData && dayData.count > 0 ? "text-white" : "text-muted-foreground"}`}
              title={dayData ? `${dateStr}: ${dayData.count}개 학습` : dateStr}
            >
              {day}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>미학습</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-300" />
          <span>오늘의 단어</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>+복습</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-700" />
          <span>+퀴즈</span>
        </div>
      </div>
    </div>
  );
}
