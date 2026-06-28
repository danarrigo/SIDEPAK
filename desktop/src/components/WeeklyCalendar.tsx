"use client";

import React, { useState } from "react";
import EventCard from "./EventCard";

type EventType = {
  id: number;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  cooperativeId: number;
  creatorId: number | null;
  createdAt: Date;
};

interface WeeklyCalendarProps {
  events: EventType[];
  joinedEventIds: number[];
  memberId: number;
}

export default function WeeklyCalendar({ events, joinedEventIds, memberId }: WeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Generate current week's days starting from today
  const getWeekDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const joinedSet = new Set(joinedEventIds);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Filter events for the selected date
  const eventsForSelectedDate = events.filter(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const selected = new Date(selectedDate);
    // Normalize to midnight for comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    selected.setHours(0, 0, 0, 0);
    
    return selected.getTime() >= start.getTime() && selected.getTime() <= end.getTime();
  });

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="glass-card border border-outline-variant rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-on-surface">Kalender Event Mingguan</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {weekDays[0].toLocaleDateString("id-ID", { day: "numeric", month: "long" })} - {weekDays[6].toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button 
          onClick={() => setSelectedDate(new Date())}
          className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
        >
          Hari Ini
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          // Check if there are any events on this day
          const hasEvents = events.some(event => {
             const start = new Date(event.startDate);
             const end = new Date(event.endDate);
             const current = new Date(day);
             start.setHours(0, 0, 0, 0);
             end.setHours(23, 59, 59, 999);
             current.setHours(0, 0, 0, 0);
             return current.getTime() >= start.getTime() && current.getTime() <= end.getTime();
          });

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                isSelected 
                  ? "bg-primary text-on-primary shadow-md" 
                  : isToday 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-surface-container hover:bg-surface-container-highest text-on-surface"
              }`}
            >
              <span className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? "text-on-primary/80" : "text-on-surface-variant"}`}>
                {dayNames[day.getDay()]}
              </span>
              <span className="text-lg font-black leading-none mb-1">
                {day.getDate()}
              </span>
              {/* Event Indicator Dot */}
              <div className={`w-1.5 h-1.5 rounded-full ${hasEvents ? (isSelected ? "bg-on-primary" : "bg-tertiary") : "opacity-0"}`} />
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 border-b border-outline-variant/30 pb-2">
          Jadwal: {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
        </h4>
        
        {eventsForSelectedDate.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventsForSelectedDate.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                isJoined={joinedSet.has(event.id)}
                memberId={memberId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-surface-container-highest rounded-xl border border-dashed border-outline-variant/50">
            <span className="material-symbols-outlined text-3xl text-outline mb-2">event_busy</span>
            <p className="text-sm font-medium text-on-surface-variant">Tidak ada event di hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
