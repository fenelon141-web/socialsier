import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

// Check if we're in iOS native app
const isIOSNative = typeof window !== 'undefined' && (window as any).Capacitor;

export default function SimpleRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    acceptTerms: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms & Conditions",
        variant: "destructive",
      });
      return;
    }

    // Check age (must be 13+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        actualAge = age - 1;
      }
      
      if (actualAge < 13) {
        toast({
          title: "Age Requirement",
          description: "You must be at least 13 years old to use Socialiser",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    
    // Simulate account creation for iOS compatibility
    setTimeout(() => {
      // Save user data locally for iOS
      const userData = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_token', 'token_' + Date.now());
      
      toast({
        title: "Welcome to Socialiser! ✨",
        description: `Hi ${formData.firstName}! Your account has been created successfully`,
      });
      
      setLocation("/home");
      setIsLoading(false);
    }, isIOSNative ? 1000 : 1500);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4 ios-safe-area">
      <Card className="w-full max-w-md card-gradient rounded-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
            S
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Join Socialiser
          </CardTitle>
          <p className="text-gray-600">Create your profile and start discovering wellness spots</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-pink-400 text-base"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  autoCorrect="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-pink-400 text-base"
                  autoComplete="family-name"
                  autoCapitalize="words"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-pink-400 text-base"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-pink-400 text-base"
                max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">You must be at least 13 years old</p>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-3 py-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                className="mt-1"
                required
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                I accept the{" "}
                <a href="/terms" className="text-pink-600 hover:text-pink-800 underline">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-pink-600 hover:text-pink-800 underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !formData.acceptTerms}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl py-3 text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-pink-600 hover:text-pink-800 underline font-medium"
              >
                Sign In
              </button>
            </p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              By creating an account, you confirm you are at least 13 years old
            </p>
            <p className="text-xs text-gray-400">
              {isIOSNative ? "Account data is stored locally on your device" : "Socialiser respects your privacy and follows all data protection laws"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}