import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, User, Mail, Shield } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 13;
    }
    return age >= 13;
  }, "You must be at least 13 years old to use Socialiser"),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthLoginProps {
  onAuthSuccess: () => void;
}

export default function AuthLogin({ onAuthSuccess }: AuthLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      acceptTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Socialiser!",
        description: "Your account has been created successfully.",
      });
      onAuthSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4 ios-safe-area">
      <Card className="w-full max-w-md card-gradient rounded-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4">
            S
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Join Socialiser
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Discover amazing spots and connect with your community
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-base"
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                        <User className="w-4 h-4" />
                        <span>First Name</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="First name"
                          className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-base"
                          autoComplete="given-name"
                          autoCapitalize="words"
                          autoCorrect="off"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Last name"
                          className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-base"
                          autoComplete="family-name"
                          autoCapitalize="words"
                          autoCorrect="off"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-gray-700 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Date of Birth</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="rounded-xl border-gray-200 focus:border-pink-400 focus:ring-pink-400 text-base ios-date-picker"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                        autoComplete="bday"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none'
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Terms & Conditions */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-pink-600 hover:text-pink-700 underline font-medium"
                          onClick={() => window.open("/terms", "_blank")}
                        >
                          Terms & Conditions
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-pink-600 hover:text-pink-700 underline font-medium"
                          onClick={() => window.open("/privacy", "_blank")}
                        >
                          Privacy Policy
                        </button>
                      </FormLabel>
                      <FormMessage className="text-red-500" />
                    </div>
                  </FormItem>
                )}
              />

              {/* Data Collection Notice */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Data Collection Notice</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      We collect your email for account access, name for personalization, 
                      date of birth for age verification, and location data to find nearby spots. 
                      Your data is never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl py-3 text-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              By creating an account, you confirm you are at least 13 years old
            </p>
            <p className="text-xs text-gray-400">
              Socialiser respects your privacy and follows all applicable data protection laws
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}