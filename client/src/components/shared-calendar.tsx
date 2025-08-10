import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SharedCalendar() {
  const events = [
    { date: "Today", event: "Yoga class at 6 PM" },
    { date: "Tomorrow", event: "Coffee meetup at 3 PM" },
    { date: "Friday", event: "Weekend squad hunt" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pink-600">Squad Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="p-3 bg-pink-50 rounded-lg">
              <div className="font-medium text-pink-800">{event.date}</div>
              <div className="text-sm text-pink-600">{event.event}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}