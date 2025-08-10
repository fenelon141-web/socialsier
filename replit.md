# Socialiser - Location-Based Discovery Mobile App

## Overview
Socialiser is a mobile-first web application designed to gamify location discovery. It allows users to find trendy cafes, restaurants, gym classes, and other locations, earning points and badges, and completing daily challenges. The project aims to provide a "valley girl" themed experience, combining social features with an engaging gamified exploration of the user's surroundings. The business vision is to create a vibrant community around location-based discovery and social interaction, with potential for market expansion in the lifestyle and fitness sectors.

## Recent Changes (January 2025)
✅ **iOS Production Ready**: All network configurations updated for iOS compatibility  
✅ **Server Deployment**: Live at https://hot-girl-hunt-fenelon141.replit.app  
✅ **iOS Scaling Fixed**: Proper viewport and safe area handling implemented  
✅ **WebSocket iOS Support**: Real-time features working with auto-reconnection  
✅ **Complete iOS Setup**: All files pre-configured for iOS development  
✅ **iOS Optimizations**: Touch scrolling, safe areas, input zoom prevention  
✅ **Connection Testing**: WebSocket and API connectivity verified for iOS  
✅ **Production Deployment**: Full iOS deployment package ready for App Store

## User Preferences
Preferred communication style: Simple, everyday language.
App name: "Socialiser" (finalized name change from "Socialise")

## System Architecture
### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **UI Theme**: "Valley Girl" aesthetic (pink/purple gradients, playful design)
- **Responsiveness**: Mobile-first design for all devices
- **UI Components**: Radix UI primitives, custom components for navigation, spot cards, badge displays, and toast notifications.
- **Mobile Integration**: Capacitor for iOS/Android native app deployment, including location services, camera integration, and push notifications.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API Pattern**: RESTful JSON API
- **Deployment**: Single production server serving both API and static files.

### Database
- **ORM**: Drizzle ORM (PostgreSQL dialect)
- **Database**: PostgreSQL (optimized for Neon serverless)
- **Schema**: Users, Spots, Badges, SpotHunts, DailyChallenges, Rewards, Squads, Squad Members, Group Challenges, Challenge Participants, City Leaderboards, Taste Makers, Endorsements, Follows.
- **Migrations**: Drizzle Kit

### Core Features
- **Location Discovery**: Trending spots, interactive map, real-time OpenStreetMap integration for accurate location data and directions.
- **Gamification**: Spot hunting (check-ins with proximity verification), points, levels, badges (dynamic, category-specific, and milestone-based), daily challenges, and rewards.
- **Social Features**: Activity feeds, friend management, photo sharing, social API endpoints (posts, likes, comments, reviews), squad competition system with group challenges and city leaderboards.
- **Influencer System**: "Taste Maker" profiles with tiers, endorsements, and follower system to drive spot discovery.
- **Search & Filters**: Advanced search bar with server-side filtering (keywords, price, dietary, ambiance), quick actions for common searches (coffee, workout).
- **Push Notifications**: Real-time location tracking for nearby trendy spots (cafes, restaurants, fitness), instant alerts via WebSockets.
- **Authentication**: Mandatory email and name registration, session management, user profiles.
- **Workout Integration**: Comprehensive detection and descriptions for various "valley girl" workout types, location-aware gym endpoint.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight React router
- **tailwindcss**: Utility-first CSS framework
- **Vite**: Build tool and dev server
- **TypeScript**: Language
- **tsx**: TypeScript execution
- **drizzle-kit**: Database migration tool
- **Capacitor**: Mobile app development (iOS/Android)
- **OpenStreetMap**: Map data and geocoding (via Overpass API and Nominatim API)
- **Capacitor Camera plugin**: Native photo capture and library access