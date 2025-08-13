# Socialiser - Location-Based Discovery App

## Overview

Socialiser is a mobile-first location-based discovery app designed to help users find trendy spots and connect with their community. The app combines social features with location discovery, allowing users to hunt for spots, earn badges, share experiences, and connect with friends. Built with a modern React frontend and Express backend, the application is optimized for both web and native mobile platforms using Capacitor for iOS and Android deployment.

## Recent Changes for App Store Submission (Aug 2025)

### Female-Inspired Wellness Focus (Aug 13, 2025)
- **Targeted Categories**: Refined OpenStreetMap queries for coffee shops, matcha spots, poki/acai bowls, reformer pilates, spin classes, hot yoga, gentle yoga
- **Removed Restaurants**: Eliminated restaurant queries to focus purely on wellness, fitness, and aesthetic beverage spots
- **Female Trends**: Prioritized reformer pilates, SoulCycle-style spin, hot yoga, gentle yoga, and boutique fitness studios
- **Wellness Beverages**: Specialized searches for matcha cafes, chai spots, juice bars, and specialty coffee shops
- **Bulletproof System**: Simplified to direct OpenStreetMap queries without complex fallbacks
- **Status**: App now targets female-inspired wellness trends and aesthetic lifestyle spots

### Authentication Simplified for iOS Compatibility (Aug 13, 2025)
- **Login/Logout/Registration**: Converted to simplified bypass system for Xcode/iOS testing
- **Fixed Registration Route**: Added missing `/register` route to App.tsx for "Create Account" button
- **Native Registration Form**: Built SimpleRegister component that works offline in iOS
- **Local Account Storage**: User accounts stored in device localStorage for iOS compatibility
- **Age Verification**: 13+ age validation built-in for App Store compliance
- **Reason**: Complex Replit OAuth authentication fails in iOS environment due to session/network restrictions
- **Status**: Account creation now works seamlessly in iOS without network dependencies

### Native iOS Story Support (Aug 13, 2025)
- **Local Storage**: Stories now save directly to device localStorage in iOS native app
- **No API Dependencies**: Eliminates network failures that were causing story upload issues
- **Dual Mode**: Web uses API upload, iOS uses local storage for reliability
- **24-Hour Expiry**: Local stories automatically expire after 24 hours
- **Base64 Support**: Photos stored as data URLs directly on device without conversion
- **Status**: Story uploads now work seamlessly in iOS without API route dependencies

### Production API Configuration (Aug 12, 2025)
- **API URL**: Updated queryClient.ts to use production Replit domain
- **Development**: Uses localhost:5000 for local development
- **Production**: Uses https://hot-girl-hunt-fenelon141.replit.app for deployment
- **Status**: Ready for mobile app deployment with correct API endpoint

### Code Cleanup & Optimization (Aug 12, 2025)
- **iOS Compatibility**: Consolidated duplicate iOS detection logic across components
- **API Layer**: Simplified queryClient with centralized fallback system for offline functionality
- **Component Cleanup**: Removed duplicate loading skeleton components and unnecessary debug logs
- **Geolocation**: Streamlined location detection with unified helper functions
- **Error Handling**: Improved error boundaries while removing verbose console logging
- **Status**: Cleaner, more maintainable codebase ready for App Store submission

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI with type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **TailwindCSS + shadcn/ui**: Utility-first CSS framework with accessible component system
- **Capacitor**: Native mobile app deployment for iOS and Android
- **Leaflet/Google Maps**: Interactive mapping with location-based features
- **TanStack Query**: Server state management with caching and background updates

### Backend Architecture
- **Express.js**: RESTful API server with middleware support
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Session-based Authentication**: Secure user sessions with bcrypt password hashing
- **Real-time Features**: WebSocket support for live updates and notifications

### Data Storage
- **PostgreSQL**: Primary database with Neon serverless hosting
- **Drizzle Schema**: Type-safe database schema definition shared between client and server
- **Database Tables**: Users, spots, badges, challenges, friendships, posts, notifications, and more
- **Session Storage**: PostgreSQL-backed session store for authentication

### Mobile Optimization
- **iOS-Specific Features**: Native camera, geolocation, and push notifications via Capacitor
- **Touch Interactions**: iOS-compliant touch targets (44px minimum) with haptic feedback
- **Offline Support**: Embedded spot data for offline functionality
- **Performance**: Optimized for iOS Safari with proper viewport and touch handling

### Location Services
- **Real-time Geolocation**: HTML5 Geolocation API with Capacitor native fallback
- **Location Tracking**: Background location monitoring for proximity notifications
- **Distance Calculations**: Accurate distance calculations between users and spots
- **Map Integration**: Interactive maps with custom markers and spot clustering

### Social Features
- **User Profiles**: Customizable profiles with avatars and stats
- **Friend System**: Friend requests, connections, and activity feeds
- **Squad System**: Group functionality for coordinated activities
- **Stories**: Ephemeral content sharing with photos and captions
- **Challenges**: Daily and group challenges with progress tracking

### Authentication & Security
- **Email/Password Authentication**: Secure registration and login flow
- **Session Management**: Express sessions with PostgreSQL storage
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Zod schema validation for all user inputs
- **CORS**: Configured for mobile app and web access

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting for production data
- **OpenStreetMap**: Primary mapping data source with Nominatim geocoding
- **Google Maps API**: Optional enhanced mapping features (configurable)

### Mobile Platform
- **Capacitor Plugins**: Native device access (camera, geolocation, device info)
- **iOS/Android SDKs**: Native app compilation and deployment

### Development Tools
- **Replit**: Development environment with integrated database provisioning
- **ESBuild**: Fast JavaScript bundling for production builds
- **Drizzle Kit**: Database migration and schema management

### Optional Integrations
- **Push Notification Service**: For real-time spot alerts and social notifications
- **Image Storage**: For user-generated content and spot photos
- **Analytics**: User behavior tracking and app performance monitoring

The application is designed with a mobile-first approach, ensuring excellent performance on iOS and Android devices while maintaining web compatibility. The architecture supports real-time features, offline functionality, and scalable social interactions.