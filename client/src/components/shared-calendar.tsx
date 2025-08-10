import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, MapPin } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location?: string;
  type: 'workout' | 'spot' | 'social';
}

export default function SharedCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "Squad Workout at SoulCycle",
      date: new Date().toISOString().split('T')[0],
      time: "6:00 PM",
      location: "SoulCycle Studio",
      type: 'workout'
    },
    {
      id: 2,
      title: "Coffee Meetup",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: "2:00 PM", 
      location: "Aesthetic Café",
      type: 'spot'
    }
  ]);

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'spot': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'social': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="ios-calendar-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-pink-600 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Squad Calendar
          </CardTitle>
          <Button
            size="sm"
            className="bg-pink-500 hover:bg-pink-600 text-white ios-tap-highlight"
            style={{
              WebkitTapHighlightColor: 'rgba(236, 72, 153, 0.3)',
              touchAction: 'manipulation'
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Week Display */}
        <div className="flex justify-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Today</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDateForDisplay(new Date())}
            </p>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-100 rounded-lg p-4 ios-tap-highlight hover:shadow-sm transition-shadow"
                style={{
                  WebkitTapHighlightColor: 'rgba(236, 72, 153, 0.1)',
                  touchAction: 'manipulation',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No events scheduled</p>
              <p className="text-sm text-gray-400">
                Squad events will appear here when they're created
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}