import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SharedCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pink-600">Squad Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-3">No events scheduled</p>
          <p className="text-sm text-gray-400">
            Squad events will appear here when they're created
          </p>
        </div>
      </CardContent>
    </Card>
  );
}