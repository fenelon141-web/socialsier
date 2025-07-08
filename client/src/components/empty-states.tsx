import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Trophy, Users, Target } from "lucide-react";
import { Link } from "wouter";

export function NoSpotsNearby() {
  return (
    <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardContent className="space-y-4">
        <MapPin className="w-12 h-12 mx-auto text-purple-400" />
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">No trendy spots nearby</h3>
          <p className="text-sm text-gray-600 mb-4">
            Try exploring the map or check back later for new discoveries!
          </p>
          <Link href="/map">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Explore Map
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoBadgesYet() {
  return (
    <Card className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardContent className="space-y-4">
        <Trophy className="w-12 h-12 mx-auto text-yellow-500" />
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Start your collection!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Check into trendy spots to earn your first badge
          </p>
          <Link href="/map">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              Find Spots
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoFriendsYet() {
  return (
    <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="space-y-4">
        <Users className="w-12 h-12 mx-auto text-blue-400" />
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Your social circle awaits</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add friends to share spots and compete for badges
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            Invite Friends
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LocationPermissionNeeded() {
  return (
    <Card className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50">
      <CardContent className="space-y-4">
        <Target className="w-12 h-12 mx-auto text-red-400" />
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Location access needed</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable location to discover trendy spots near you
          </p>
          <Button 
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
            onClick={() => navigator.geolocation.getCurrentPosition(() => {})}
          >
            Enable Location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}