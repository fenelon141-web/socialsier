import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Crown, Trophy, Users, MapPin, Plus, Target, Medal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNavigation from "@/components/top-navigation";
import BottomNavigation from "@/components/bottom-navigation";

interface Squad {
  id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  totalPoints: number;
  totalSpotsHunted: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

interface SquadMember {
  id: number;
  squadId: number;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: {
    id: number;
    username: string;
    avatar: string;
    level: number;
    totalPoints: number;
  };
}

interface GroupChallenge {
  id: number;
  title: string;
  description: string;
  challengeType: 'spot_hunting' | 'points_collection' | 'badge_collection' | 'social_activity';
  targetValue: number;
  timeLimit: number;
  city?: string;
  country?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function Squads() {
  // Using guest user for now - auth system will be added later
  const user = { id: 1, username: "Guest User" };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createSquadOpen, setCreateSquadOpen] = useState(false);
  const [createChallengeOpen, setCreateChallengeOpen] = useState(false);
  const [newSquad, setNewSquad] = useState({
    name: '',
    description: '',
    city: '',
    country: '',
    isPublic: true
  });
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    challengeType: 'spot_hunting' as const,
    targetValue: 10,
    timeLimit: 7,
    city: '',
    country: ''
  });

  // Query user's squads
  const { data: userSquads = [], isLoading: squadsLoading } = useQuery({
    queryKey: [`/api/user/${user?.id}/squads`],
    enabled: !!user
  });

  // Query active group challenges
  const { data: groupChallenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/group-challenges'],
  });

  // Create squad mutation
  const createSquadMutation = useMutation({
    mutationFn: async (squadData: typeof newSquad) => {
      return apiRequest(`/api/squads`, {
        method: 'POST',
        body: { ...squadData, createdBy: user?.id.toString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user?.id}/squads`] });
      setCreateSquadOpen(false);
      setNewSquad({ name: '', description: '', city: '', country: '', isPublic: true });
      toast({
        title: "Squad Created!",
        description: "Your squad is ready for action",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create squad",
        variant: "destructive",
      });
    },
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: typeof newChallenge) => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + challengeData.timeLimit);
      
      return apiRequest(`/api/group-challenges`, {
        method: 'POST',
        body: {
          ...challengeData,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: true,
          createdBy: user?.id.toString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-challenges'] });
      setCreateChallengeOpen(false);
      setNewChallenge({
        title: '',
        description: '',
        challengeType: 'spot_hunting',
        targetValue: 10,
        timeLimit: 7,
        city: '',
        country: ''
      });
      toast({
        title: "Challenge Created!",
        description: "Get ready to compete!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      });
    },
  });

  const handleCreateSquad = () => {
    if (!newSquad.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a squad name",
        variant: "destructive",
      });
      return;
    }
    createSquadMutation.mutate(newSquad);
  };

  const handleCreateChallenge = () => {
    if (!newChallenge.title.trim()) {
      toast({
        title: "Title Required", 
        description: "Please enter a challenge title",
        variant: "destructive",
      });
      return;
    }
    createChallengeMutation.mutate(newChallenge);
  };

  if (squadsLoading || challengesLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen">
      <TopNavigation />
      <div className="container mx-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Squad Competition
        </h1>
        <p className="text-gray-600">Team up with friends and compete in city challenges</p>
      </div>

      {/* My Squads Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Squads
            </CardTitle>
            <CardDescription>Your squad teams and stats</CardDescription>
          </div>
          <Dialog open={createSquadOpen} onOpenChange={setCreateSquadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Squad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Squad</DialogTitle>
                <DialogDescription>
                  Start a squad and invite friends to compete together
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="squadName">Squad Name</Label>
                  <Input
                    id="squadName"
                    placeholder="The Pink Panthers"
                    value={newSquad.name}
                    onChange={(e) => setNewSquad({ ...newSquad, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="squadDescription">Description</Label>
                  <Textarea
                    id="squadDescription"
                    placeholder="A fierce team of spot hunters..."
                    value={newSquad.description}
                    onChange={(e) => setNewSquad({ ...newSquad, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="London"
                      value={newSquad.city}
                      onChange={(e) => setNewSquad({ ...newSquad, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="UK"
                      value={newSquad.country}
                      onChange={(e) => setNewSquad({ ...newSquad, country: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={newSquad.isPublic}
                    onCheckedChange={(checked) => setNewSquad({ ...newSquad, isPublic: checked })}
                  />
                  <Label htmlFor="public">Public Squad (others can join)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateSquad}
                  disabled={createSquadMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  {createSquadMutation.isPending ? "Creating..." : "Create Squad"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {userSquads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You're not in any squads yet.</p>
              <p className="text-sm">Create or join a squad to start competing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userSquads.map((squadMember: any) => (
                <Card key={squadMember.id} className="border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {squadMember.squad.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {squadMember.squad.name}
                            {squadMember.role === 'admin' && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {squadMember.squad.city}, {squadMember.squad.country}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          {squadMember.squad.totalPoints} pts
                        </div>
                        <div className="text-xs text-gray-500">
                          {squadMember.squad.totalSpotsHunted} spots hunted
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Challenges Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Group Challenges
            </CardTitle>
            <CardDescription>Compete with other squads and individuals</CardDescription>
          </div>
          <Dialog open={createChallengeOpen} onOpenChange={setCreateChallengeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group Challenge</DialogTitle>
                <DialogDescription>
                  Start a new challenge for squads and individuals to compete
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="challengeTitle">Challenge Title</Label>
                  <Input
                    id="challengeTitle"
                    placeholder="Weekend Spot Hunt"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="challengeDescription">Description</Label>
                  <Textarea
                    id="challengeDescription"
                    placeholder="Hunt the most aesthetic spots this weekend..."
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target (spots to hunt)</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      min="1"
                      value={newChallenge.targetValue}
                      onChange={(e) => setNewChallenge({ ...newChallenge, targetValue: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeLimit">Days to Complete</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      max="30"
                      value={newChallenge.timeLimit}
                      onChange={(e) => setNewChallenge({ ...newChallenge, timeLimit: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateChallenge}
                  disabled={createChallengeMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {groupChallenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active challenges right now.</p>
              <p className="text-sm">Create a challenge to get the competition started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupChallenges.map((challenge: GroupChallenge) => (
                <Card key={challenge.id} className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Target: {challenge.targetValue} spots</span>
                          <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50">
                          <Medal className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        <Button size="sm" variant="outline">
                          Join Challenge
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}