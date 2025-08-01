// Simple authentication that works immediately
export class SimpleAuth {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';

  static login(email: string, password: string) {
    // Simulate successful login - replace with real API call
    const user = { id: '1', email, name: 'Test User' };
    const token = 'simple_auth_token_' + Date.now();
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    return { user, token };
  }

  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  // Handle deep link authentication
  static handleDeepLink(url: string) {
    if (url.includes('auth/callback')) {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      const email = urlObj.searchParams.get('email') || 'deeplink@example.com';
      
      if (token) {
        const user = { id: '1', email, name: 'Deep Link User' };
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        return true;
      }
    }
    return false;
  }
}