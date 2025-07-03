import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Users } from "lucide-react";

interface AddFriendDialogProps {
  children: React.ReactNode;
}

export default function AddFriendDialog({ children }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search for user by username or email
  const searchUser = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          setFoundUser(users[0]);
        } else {
          setFoundUser(null);
          toast({
            title: "No user found",
            description: "Try searching by exact username or email",
          });
        }
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Couldn't search for users. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterId: "1", // Current user
          addresseeId: userId,
        }),
      });
      if (!response.ok) throw new Error("Failed to send friend request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/friend-requests"] });
      toast({
        title: "Friend request sent! ✨",
        description: "Your friend request has been sent successfully",
      });
      setFoundUser(null);
      setSearchQuery("");
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Request failed",
        description: "Couldn't send friend request. Try again!",
        variant: "destructive",
      });
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchUser(searchQuery.trim());
    }
  };

  const handleSendRequest = () => {
    if (foundUser) {
      sendFriendRequestMutation.mutate(foundUser.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Add Friends 👯‍♀️</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Form */}
          <Card className="border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="space-y-3">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium">
                    Find by username or email
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="@username or email@example.com"
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      size="sm"
                      className="px-3"
                    >
                      {isSearching ? (
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {foundUser && (
            <Card className="card-gradient rounded-xl border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={foundUser.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face"}
                    alt={foundUser.username}
                    className="w-12 h-12 rounded-full border-2 border-pink-300"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{foundUser.username}</h3>
                    <p className="text-sm text-gray-600">Level {foundUser.level || 1} Spot Hunter</p>
                    {foundUser.email && (
                      <p className="text-xs text-gray-500">{foundUser.email}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleSendRequest}
                    disabled={sendFriendRequestMutation.isPending}
                    size="sm"
                    className="bg-pink-400 hover:bg-pink-500 text-white"
                  >
                    {sendFriendRequestMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Helper Text */}
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Find Your Squad</h3>
                <p className="text-sm text-gray-600">
                  Search for friends by their exact username (like @sarah) or email address. 
                  You can also invite new friends to join IYKYK!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}