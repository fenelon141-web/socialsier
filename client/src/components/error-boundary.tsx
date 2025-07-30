import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md card-gradient rounded-2xl shadow-2xl border-0">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-gray-600">
                Don't worry, this happens sometimes. Let's get you back to discovering amazing spots!
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {this.state.error?.message || "An unexpected error occurred"}
                </p>
              </div>
              
              <Button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl py-3 text-lg font-semibold"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reload App
              </Button>
              
              <p className="text-center text-sm text-gray-500">
                If this problem persists, please contact support through the app settings.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;