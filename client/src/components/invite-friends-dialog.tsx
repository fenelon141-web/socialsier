import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, MessageSquare, Mail, Users, QrCode } from "lucide-react";
import type { User } from "@shared/schema";

interface InviteFriendsDialogProps {
  user: User;
  children: React.ReactNode;
}

export default function InviteFriendsDialog({ user, children }: InviteFriendsDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'share' | 'username' | 'message'>('share');
  const { toast } = useToast();

  const profileUrl = `${window.location.origin}/profile/${user.id}`;
  const inviteText = `Hey! I'm using IYKYK to discover the most aesthetic spots in the city! Join me and let's hunt for trendy cafes and cute workouts together 💕 Download the app and find me @${user.username}`;

  const handleCopyProfile = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Profile link copied! 📋",
        description: "Share this link to invite friends to your profile",
      });
    } catch (error) {
      toast({
        title: "Copy failed 😢",
        description: "Couldn't copy link. Try sharing manually!",
        variant: "destructive",
      });
    }
  };

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(`@${user.username}`);
      toast({
        title: "Username copied! 📋",
        description: "Share your username so friends can find you",
      });
    } catch (error) {
      toast({
        title: "Copy failed 😢",
        description: "Couldn't copy username. Try sharing manually!",
        variant: "destructive",
      });
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on IYKYK!',
          text: inviteText,
          url: profileUrl,
        });
        toast({
          title: "Invite shared! ✨",
          description: "Your friend should receive the invitation soon",
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying text
      try {
        await navigator.clipboard.writeText(`${inviteText}\n\n${profileUrl}`);
        toast({
          title: "Invite copied! 📋",
          description: "Paste this anywhere to invite friends",
        });
      } catch (error) {
        toast({
          title: "Share failed 😢",
          description: "Couldn't share invite. Try copying manually!",
          variant: "destructive",
        });
      }
    }
  };

  const handleSMS = () => {
    const smsText = encodeURIComponent(`${inviteText}\n\n${profileUrl}`);
    window.open(`sms:?body=${smsText}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Join me on IYKYK!');
    const body = encodeURIComponent(`${inviteText}\n\nClick here to check out my profile: ${profileUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Invite Friends 👯‍♀️</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Share */}
          <Card className="card-gradient rounded-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Share2 className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-gray-800">Quick Share</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Share your profile and invite friends to join IYKYK
              </p>
              <Button
                onClick={handleShareNative}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Invite
              </Button>
            </CardContent>
          </Card>

          {/* Share Methods */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleSMS}
              className="flex flex-col items-center space-y-1 h-16"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Text Message</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEmail}
              className="flex flex-col items-center space-y-1 h-16"
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs">Email</span>
            </Button>
          </div>

          {/* Profile Link */}
          <Card className="border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Your Profile Link</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyProfile}
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-600 break-all">{profileUrl}</p>
              </div>
            </CardContent>
          </Card>

          {/* Username */}
          <Card className="border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Your Username</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUsername}
                  className="h-6 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-mono text-gray-800">@{user.username}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Friends can search for this username to find you
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Placeholder */}
          <Card className="border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <QrCode className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">QR Code</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <QrCode className="w-16 h-16 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  QR code sharing coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}