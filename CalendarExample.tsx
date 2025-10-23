"use client"

import React, { useState } from "react"
import Calendar, { calendarEvent } from "./Calendar"

// Example usage component
export default function CalendarExample() {
  const [events, setEvents] = useState<calendarEvent[]>([
    {
      id: "1",
      title: "Team Meeting",
      start: new Date(2024, 11, 15, 10, 0), // December 15, 2024, 10:00 AM
      end: new Date(2024, 11, 15, 11, 0), // December 15, 2024, 11:00 AM
      description: "Weekly team sync meeting",
      location: "Conference Room A",
      color: "blue",
      category: "work",
    },
    {
      id: "2",
      title: "Lunch with Client",
      start: new Date(2024, 11, 16, 12, 0), // December 16, 2024, 12:00 PM
      end: new Date(2024, 11, 16, 13, 30), // December 16, 2024, 1:30 PM
      description: "Business lunch discussion",
      location: "Downtown Restaurant",
      color: "green",
      category: "business",
    },
    {
      id: "3",
      title: "All Day Conference",
      start: new Date(2024, 11, 18, 0, 0), // December 18, 2024
      end: new Date(2024, 11, 18, 23, 59), // December 18, 2024
      description: "Annual tech conference",
      location: "Convention Center",
      color: "purple",
      category: "conference",
      allDay: true,
    },
  ])

  const [loading, setLoading] = useState(false)

  // Handle event selection
  const handleSelectEvent = (event: calendarEvent) => {
    console.log("Selected event:", event)
    alert(
      `Selected: ${event.title}\nTime: ${event.start.toLocaleString()} - ${event.end.toLocaleString()}`,
    )
  }

  // Handle slot selection (for creating new events)
  const handleSelectSlot = (slotInfo: {
    start: Date
    end: Date
    slots: Date[]
  }) => {
    console.log("Selected slot:", slotInfo)

    const title = prompt("Enter event title:")
    if (title) {
      const newEvent: calendarEvent = {
        id: Date.now().toString(),
        title,
        start: slotInfo.start,
        end: slotInfo.end,
        color: "blue",
        category: "personal",
      }

      setEvents((prev) => [...prev, newEvent])
    }
  }

  // Handle event drag and drop (if implemented)
  const handleEventDrop = (info: {
    event: calendarEvent
    start: Date
    end: Date
  }) => {
    console.log("Event dropped:", info)

    setEvents((prev) =>
      prev.map((event) =>
        event.id === info.event.id
          ? { ...event, start: info.start, end: info.end }
          : event,
      ),
    )
  }

  // Handle event resize (if implemented)
  const handleEventResize = (info: {
    event: calendarEvent
    start: Date
    end: Date
  }) => {
    console.log("Event resized:", info)

    setEvents((prev) =>
      prev.map((event) =>
        event.id === info.event.id
          ? { ...event, start: info.start, end: info.end }
          : event,
      ),
    )
  }

  return (
    <div style={{ height: "600px", padding: "20px" }}>
      <h2>Calendar Example</h2>
      <p>
        • <strong>Click and drag</strong> to select time slots and create events
        <br />• <strong>Drag events</strong> to move them to different times
        <br />• <strong>Resize events</strong> by dragging the edges (in
        week/day view)
        <br />• <strong>Click on events</strong> to view details
        <br />• <strong>Use the toolbar</strong> to switch between Month, Week,
        Day, and Agenda views
      </p>

      <Calendar
        events={events}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        loading={loading}
        defaultView="month"
        defaultDate={new Date(2024, 11, 15)} // December 15, 2024
      />
    </div>
  )
}
