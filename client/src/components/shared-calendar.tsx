import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserAvailability, User } from "@shared/schema";

interface SharedCalendarProps {
  userId: string;
}

export default function SharedCalendar({ userId }: SharedCalendarProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get current user's availability for the month
  const { data: userAvailability } = useQuery<UserAvailability[]>({
    queryKey: [`/api/user/${userId}/availability/${currentMonth}`],
  });

  // Get friends availability for selected date
  const { data: friendsAvailability } = useQuery<(UserAvailability & { user: User })[]>({
    queryKey: [`/api/user/${userId}/friends-availability/${selectedDate}`],
    enabled: !!selectedDate,
  });

  // Set availability mutation
  const setAvailabilityMutation = useMutation({
    mutationFn: async ({ date, isAvailable }: { date: string; isAvailable: boolean }) => {
      const response = await fetch(`/api/user/${userId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, isAvailable }),
      });
      if (!response.ok) throw new Error("Failed to set availability");
      return response.json();
    },
    onSuccess: (_, { isAvailable }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}/availability/${currentMonth}`] });
      toast({
        title: isAvailable ? "Added to calendar! 💗" : "Removed from calendar",
        description: isAvailable 
          ? "Your squad can see you're free for meetups!" 
          : "Updated your availability",
      });
    },
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = parseInt(currentMonth.split('-')[0]);
    const month = parseInt(currentMonth.split('-')[1]) - 1; // JS months are 0-indexed
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentMonth}-${day.toString().padStart(2, '0')}`;
      const isAvailable = userAvailability?.some(a => a.date === date && a.isAvailable);
      const isToday = date === new Date().toISOString().split('T')[0];
      
      days.push({
        day,
        date,
        isAvailable,
        isToday,
      });
    }
    
    return days;
  };

  const handleDateClick = (date: string, currentlyAvailable: boolean) => {
    setAvailabilityMutation.mutate({
      date,
      isAvailable: !currentlyAvailable,
    });
    setSelectedDate(date);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonthName = monthNames[parseInt(currentMonth.split('-')[1]) - 1];
  const currentYear = currentMonth.split('-')[0];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="card-gradient rounded-2xl shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Calendar className="w-6 h-6 text-pink-500" />
            Squad Calendar
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Highlight dates when you're free for meetups! 💕
          </p>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const [year, month] = currentMonth.split('-');
                const prevMonth = new Date(parseInt(year), parseInt(month) - 2);
                setCurrentMonth(prevMonth.toISOString().slice(0, 7));
              }}
              className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              ←
            </Button>
            <h3 className="text-lg font-semibold text-gray-800">
              {currentMonthName} {currentYear}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const [year, month] = currentMonth.split('-');
                const nextMonth = new Date(parseInt(year), parseInt(month));
                setCurrentMonth(nextMonth.toISOString().slice(0, 7));
              }}
              className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              →
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {generateCalendarDays().map((dayData, index) => (
              <div key={index} className="aspect-square">
                {dayData && (
                  <button
                    onClick={() => handleDateClick(dayData.date, dayData.isAvailable)}
                    className={`
                      w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                      ${dayData.isAvailable 
                        ? 'bg-pink-100 text-pink-600 ring-2 ring-pink-300' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }
                      ${dayData.isToday ? 'ring-2 ring-purple-300' : ''}
                    `}
                  >
                    {dayData.day}
                    {dayData.isAvailable && (
                      <div className="text-xs">💗</div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500 text-center">
            Tap dates to mark yourself as available • Pink = Free for squad hangs!
          </div>
        </CardContent>
      </Card>

      {/* Friends Availability for Selected Date */}
      {selectedDate && friendsAvailability && friendsAvailability.length > 0 && (
        <Card className="card-gradient rounded-2xl shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Users className="w-5 h-5 text-pink-500" />
              Squad Free on {new Date(selectedDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendsAvailability.map((availability) => (
                <div key={availability.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {availability.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{availability.user.username}</p>
                    {availability.note && (
                      <p className="text-sm text-gray-600">{availability.note}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-600">
                    Available
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Perfect time to plan a workout date or brunch!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}