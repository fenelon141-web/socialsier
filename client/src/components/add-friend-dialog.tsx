import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AddFriendDialogProps {
  children: React.ReactNode;
}

export default function AddFriendDialog({ children }: AddFriendDialogProps) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  const handleAddFriend = () => {
    if (!username.trim()) return;
    
    // Simulate friend request
    toast({
      title: "Friend request sent! 💕",
      description: `Sent friend request to @${username}`,
    });
    setUsername("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleAddFriend} className="w-full">
            Send Friend Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}