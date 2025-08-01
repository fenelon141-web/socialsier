import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: 'include', // Important for session cookies
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Registration failed" }));
        throw new Error(error.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate auth query to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Socialiser!",
        description: "Your account has been created successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate(formData);
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
            Join Socialiser
          </CardTitle>
          <p className="text-gray-600">Create your profile and start discovering amazing spots</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-pink-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-pink-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                minLength={6}
                className="rounded-xl border-gray-200 focus:border-pink-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-pink-400"
              />
            </div>
            
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl py-3 text-lg font-semibold"
            >
              {registerMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <Separator className="my-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">Already have an account?</span>
            </div>
          </div>
          
          <Link href="/login">
            <Button variant="outline" className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 rounded-xl py-3">
              Sign In
            </Button>
          </Link>
          
          <div className="text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-pink-600 transition-colors">
              Continue as Guest
            </Link>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}