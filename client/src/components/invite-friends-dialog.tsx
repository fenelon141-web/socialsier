import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InviteFriendsDialogProps {
  children: React.ReactNode;
}

export default function InviteFriendsDialog({ children }: InviteFriendsDialogProps) {
  const { toast } = useToast();

  const handleInvite = () => {
    toast({
      title: "Invitation sent! 🎉",
      description: "Your friends will receive an invite to join Socialiser",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p>Invite your friends to join Socialiser and discover amazing spots together!</p>
          <Button onClick={handleInvite} className="w-full">
            Send Invitations
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}