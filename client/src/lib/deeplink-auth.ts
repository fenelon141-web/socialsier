import { App } from '@capacitor/app';

export interface AuthToken {
  token: string;
  userId?: string;
  email?: string;
}

export class DeepLinkAuth {
  private authCallbacks: Array<(token: AuthToken) => void> = [];

  constructor() {
    this.setupDeepLinkListener();
  }

  private setupDeepLinkListener() {
    App.addListener('appUrlOpen', (event) => {
      console.log('Deep link received:', event.url);
      
      if (event.url.startsWith('com.adamfenelon.iykyk://auth/callback')) {
        this.handleAuthCallback(event.url);
      }
    });
  }

  private handleAuthCallback(url: string) {
    try {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      const userId = urlObj.searchParams.get('userId');
      const email = urlObj.searchParams.get('email');

      if (token) {
        const authToken: AuthToken = { token, userId: userId || undefined, email: email || undefined };
        
        // Notify all registered callbacks
        this.authCallbacks.forEach(callback => callback(authToken));
        
        // Store token for API requests
        localStorage.setItem('authToken', token);
        if (userId) localStorage.setItem('userId', userId);
        if (email) localStorage.setItem('userEmail', email);
      }
    } catch (error) {
      console.error('Error parsing auth callback URL:', error);
    }
  }

  public onAuthCallback(callback: (token: AuthToken) => void) {
    this.authCallbacks.push(callback);
  }

  public removeAuthCallback(callback: (token: AuthToken) => void) {
    const index = this.authCallbacks.indexOf(callback);
    if (index > -1) {
      this.authCallbacks.splice(index, 1);
    }
  }

  public getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  public clearStoredAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }
}

export const deepLinkAuth = new DeepLinkAuth();