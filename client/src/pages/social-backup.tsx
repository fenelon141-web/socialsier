import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopNavigation from "@/components/top-navigation";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Camera, UserPlus, Users, Star, ImageIcon, UserSearch, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useCamera } from "@/hooks/use-camera";
import { useToast } from "@/hooks/use-toast";
import AddFriendDialog from "@/components/add-friend-dialog";
import InviteFriendsDialog from "@/components/invite-friends-dialog";
import SharedCalendar from "@/components/shared-calendar";
import type { Post, User, Spot } from "@shared/schema";

interface FeedPost extends Post {
  user: User;
  spot?: Spot;
  likes: any[];
  comments: any[];
}

export default function Social() {
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { choosePhotoSource, isLoading: cameraLoading } = useCamera();
  const { toast } = useToast();

  // Get user's social feed
  const { data: feedPosts, isLoading: feedLoading } = useQuery<FeedPost[]>({
    queryKey: ["/api/user/1/feed"]
  });

  // Get user's friends
  const { data: friends } = useQuery<User[]>({
    queryKey: ["/api/user/1/friends"]
  });

  // Get friend requests
  const { data: friendRequests } = useQuery<any[]>({
    queryKey: ["/api/user/1/friend-requests"]
  });

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/1"]
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/feed"] });
      setPostContent("");
      setImageUrl("");
      setSelectedSpot(null);
      setShowCreatePost(false);
      toast({
        title: "Post shared! ✨",
        description: "Your post has been shared with your squad!",
      });
    }
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: number; userId: string }) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to like post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1/feed"] });
    }
  });

  const handleCreatePost = () => {
    const postData = {
      userId: "1",
      content: postContent,
      imageUrl: imageUrl || null,
      spotId: selectedSpot,
      type: selectedSpot ? "checkin" : "photo"
    };

    createPostMutation.mutate(postData);
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate({ postId, userId: "1" });
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await choosePhotoSource();
      if (photo) {
        setImageUrl(photo);
        toast({
          title: "Photo captured! 📸",
          description: "Your photo is ready to share!",
        });
      }
    } catch (error) {
      toast({
        title: "Photo failed 😢",
        description: "Couldn't capture photo. Try again!",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'just now';
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      
      <div className="p-4 space-y-4 pb-20">
        {/* Tabs for Feed and Calendar */}
        <Tabs defaultValue="feed" className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-2xl p-1">
            <TabsTrigger 
              value="feed" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            {/* Quick Stats */}
            <div className="flex space-x-4 mb-6">
              <Card className="flex-1 card-gradient rounded-2xl shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold text-gray-800">{friends?.length || 0}</p>
                  <p className="text-xs text-gray-600">Friends</p>
                </CardContent>
              </Card>
              
              <Card className="flex-1 card-gradient rounded-2xl shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <UserPlus className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold text-gray-800">{friendRequests?.length || 0}</p>
                  <p className="text-xs text-gray-600">Requests</p>
                </CardContent>
              </Card>
            </div>

            {/* Create Post Button */}
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogTrigger asChild>
            <Card className="card-gradient rounded-2xl shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Camera className="w-8 h-8 text-pink-500" />
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold">Share your latest spot discovery!</p>
                    <p className="text-xs text-gray-600">Add photos, reviews, and tag locations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Post ✨</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts about this amazing spot..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={cameraLoading}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    {cameraLoading ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {imageUrl && (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => setImageUrl("")}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleCreatePost}
                disabled={!postContent.trim() || createPostMutation.isPending}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white"
              >
                {createPostMutation.isPending ? "Posting..." : "Share Post 📸"}
              </Button>
            </div>
          </DialogContent>
            </Dialog>

            {/* Friends Section */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-pink-500" />
                <h2 className="font-semibold text-gray-800">Your Squad</h2>
              </div>
              <div className="flex space-x-2">
                <AddFriendDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <UserSearch className="w-4 h-4 mr-1" />
                    Find Friends
                  </Button>
                </AddFriendDialog>
                
                <InviteFriendsDialog user={user || { id: 1, username: "Guest User", email: "guest@example.com", level: 1, totalPoints: 0, spotsHunted: 0, avatar: null, createdAt: new Date() }}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-pink-400 to-purple-500 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Invite
                  </Button>
                </InviteFriendsDialog>
              </div>
            </div>
            
            {(!friends || friends.length === 0) ? (
              <div className="text-center py-4">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-3">No friends yet! Start building your squad</p>
                <div className="text-xs text-gray-400">
                  Find friends by username or invite them to join IYKYK
                </div>
              </div>
            ) : (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex flex-col items-center space-y-1 min-w-[70px]">
                    <img
                      src={friend.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face"}
                      alt={friend.username}
                      className="w-12 h-12 rounded-full border-2 border-pink-300"
                    />
                    <span className="text-xs text-gray-700 truncate w-full text-center">
                      {friend.username}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
            </Card>

            {/* Social Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Squad Updates 👯‍♀️</h2>
              
              {feedLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                <Card key={i} className="card-gradient rounded-2xl shadow-lg border-0">
                  <CardContent className="p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feedPosts && feedPosts.length > 0 ? (
            <div className="space-y-4">
              {feedPosts.map(post => (
                <Card key={post.id} className="card-gradient rounded-2xl shadow-lg border-0">
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={post.user.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face"}
                        alt={post.user.username}
                        className="w-10 h-10 rounded-full border-2 border-pink-300"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{post.user.username}</p>
                        {post.spot && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-600">📍 at</span>
                            <span className="text-xs font-medium text-pink-600">{post.spot.name}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt!)}</p>
                      </div>
                      
                      {post.rating && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < post.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 mb-3">{post.content}</p>
                    
                    {/* Post Image */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-48 object-cover rounded-xl mb-3"
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${post.likes.length > 0 ? 'text-pink-500 fill-current' : ''}`} />
                          <span className="text-sm">{post.likes.length}</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-500 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments.length}</span>
                        </button>
                      </div>
                      
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-gradient rounded-2xl shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Posts Yet</h3>
                <p className="text-gray-600 mb-4">Add friends and start sharing your spot discoveries to see your feed come alive!</p>
                <Button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                  Find Friends 👯‍♀️
                </Button>
              </CardContent>
            </Card>
          )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <SharedCalendar userId="1" />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}