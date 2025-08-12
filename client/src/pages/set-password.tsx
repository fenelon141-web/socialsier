import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function SetPassword() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  const setPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const response = await fetch("https://hot-girl-hunt-fenelon141.replit.app/api/auth/set-password", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to set password" }));
        throw new Error(error.message || "Failed to set password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Password Set Successfully!",
        description: "You can now access your Socialiser account",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to set password",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setPasswordMutation.mutate({
      email: formData.email,
      newPassword: formData.newPassword
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-gradient rounded-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
            S
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Set Your Password
          </CardTitle>
          <p className="text-gray-600">Complete your account setup to access Socialiser</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                placeholder="Create a secure password"
                className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm your password"
                className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              disabled={setPasswordMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-semibold py-3 rounded-xl text-lg transition-all shadow-lg"
            >
              {setPasswordMutation.isPending ? "Setting Password..." : "Set Password & Sign In"}
            </Button>
          </form>
          
          <div className="text-center space-y-4">
            <div className="text-gray-500 text-sm">
              Already have your password set?
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}