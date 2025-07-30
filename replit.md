# Socialiser - Location-Based Discovery Mobile App

## Overview

Socialiser is a modern mobile-first web application that gamifies location discovery. Built as a "valley girl" themed spot hunting game, users can discover trendy cafes, restaurants, gym classes, and other locations while earning points, badges, and completing daily challenges. The application features a React frontend with Express backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Theme**: "Valley Girl" aesthetic with pink/purple gradients and playful design
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture  
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful JSON API
- **Development**: TSX for TypeScript execution
- **Build**: ESBuild for production bundling

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless driver

## Key Components

### Database Schema
The application uses a comprehensive schema with the following main entities:

- **Users**: Profile management with levels, points, and avatar
- **Spots**: Location data with coordinates, ratings, and categories (including gym classes)
- **Badges**: Achievement system with rarity levels
- **SpotHunts**: User check-ins and point tracking
- **DailyChallenges**: Gamification with progress tracking
- **Rewards**: Point redemption system

### API Endpoints
- User management (`/api/user/:id`)
- Spot discovery (`/api/spots`, `/api/spots/trending`, `/api/spots/gym`)
- Spot hunting/check-ins (`/api/spots/:id/hunt`)
- Badge system (`/api/badges`, `/api/user/:id/badges`)
- Challenge tracking (`/api/challenges`)
- Activity feeds (`/api/activity`)

### Frontend Pages
- **Home**: Main dashboard with trending spots and quick actions
- **Map**: Interactive location discovery interface
- **Badges**: Achievement gallery and progress tracking
- **Profile**: User stats, level progression, and settings
- **404**: Error handling for undefined routes

### UI Components
- Comprehensive component library using Radix UI primitives
- Custom components for spot cards, badge displays, and navigation
- Bottom navigation for mobile-optimized UX
- Toast notifications for user feedback

## Data Flow

1. **User Discovery**: Users browse trending spots or explore the map view
2. **Spot Hunting**: Users can "hunt" spots to earn points and progress
3. **Achievement System**: Points unlock badges and level progression
4. **Daily Challenges**: Time-limited goals encourage regular engagement
5. **Social Features**: Activity feeds and shared achievements

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight React router
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and developer experience
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- TSX execution for backend development
- Replit-specific plugins for development environment

### Production Build
- Vite builds static assets to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single production server serves both API and static files

### Database
- Drizzle migrations in `./migrations` directory
- Environment variable `DATABASE_URL` for connection
- PostgreSQL dialect with Neon serverless optimization

### Environment Configuration
- Development: NODE_ENV=development with live reload
- Production: NODE_ENV=production with optimized builds
- Database: Automatic connection via environment variables

## Changelog
```
Changelog:
- July 03, 2025. Initial setup - SpotHunt app created with Valley Girl theme
- July 03, 2025. App renamed to "Hot Girl Hunt" and added gym classes section
- July 03, 2025. App renamed to "IYKYK" 
- July 30, 2025. App renamed to "Socialise" - Updated branding across all components and configuration files
- July 30, 2025. App renamed to "Socialiser" - Final branding update across all platform configurations
  - Added 3 trending gym spots (Pure Barre Paradise, SoulCycle Vibes, Pilates Princess)
  - Added fitness badges (Workout Warrior, Barre Babe, Hot Girl Summer)
  - Added "Hot Girl Workouts" section on home page with trending gym classes
  - Added new API endpoint /api/spots/gym for gym class discovery
- July 30, 2025. Complete authentication system for App Store deployment
  - Mandatory email and name registration required for all users
  - Guest access removed in favor of proper user profiles
  - Authentication required for all app features and API endpoints
  - Login/register flow with session management using PostgreSQL session store
  - Profile page includes logout functionality with authentication state management
  - App Store compliant user registration system
- July 03, 2025. Added PostgreSQL database with Drizzle ORM
  - Replaced in-memory storage with DatabaseStorage class
  - Created database schema with proper relations
  - Seeded database with initial data (users, spots, badges, challenges, rewards)
  - Database now persists all user data and spot information
- July 03, 2025. Mobile app conversion with Capacitor
  - Added Capacitor for iOS and Android native app deployment
  - Integrated location services with geolocation hooks
  - Added PWA manifest for installable web app
  - Mobile-optimized with status bar, splash screen, and native features
  - Ready for Apple App Store and Google Play Store deployment
- July 03, 2025. Pokémon Go-style location verification
  - Check-ins now require physical proximity (100m range)
  - Real GPS distance calculations using Haversine formula
  - Visual indicators for in-range vs out-of-range spots
  - Nearby spots API shows spots within 1km radius
  - Location-based error handling and user feedback
- July 03, 2025. Free OpenStreetMap integration and directions functionality
  - Replaced Google Maps with free OpenStreetMap and Leaflet integration
  - Real nearby spots from OpenStreetMap data via Overpass API
  - Enhanced filtering to exclude fast food and focus on trendy, aesthetic spots
  - Updated spot descriptions to highlight trendy drinks (matcha lattes, boba tea, oat milk lattes)
  - Updated spot descriptions to highlight aesthetic foods (açaí bowls, avocado toast, poke bowls)
  - Added directions functionality with native mobile app integration
  - One-tap navigation to Google Maps, Apple Maps, or OpenStreetMap
- July 03, 2025. Unique user profiles and genuine location display
  - All new users start with zero stats (level 1, 0 points, 0 spots hunted, no badges)
  - Added genuine location display using reverse geocoding with OpenStreetMap Nominatim API
  - Home page top-left shows user's real city/town/country location
  - Enhanced user creation process to ensure proper initialization
- July 03, 2025. Removed all hardcoded mock data and added real-time workout classes
  - Eliminated all hardcoded spots, badges, challenges, and rewards
  - All data now comes from real-time OpenStreetMap API queries
  - Enhanced OpenStreetMap integration to include fitness studios and workout classes
  - Added support for yoga studios, pilates centers, barre classes, and sports centers
  - Activity feed now generates from actual user interactions instead of mock data
  - Fitness spots show appropriate descriptions (yoga, pilates, barre, aerobics)
  - Added aesthetic fitness studio images for each workout type
- July 03, 2025. Comprehensive social features and camera integration
  - Added complete social feed with friend management and photo sharing
  - Implemented comprehensive social API endpoints (posts, likes, comments, reviews)
  - Integrated Capacitor Camera plugin for native photo capture
  - Added camera functionality to profile picture editing
  - Enhanced social post creation with camera and photo preview
  - Social navigation tab added to bottom navigation
  - Full photo sharing workflow from capture to social feed display
- July 04, 2025. Enhanced search filters and push notifications system
  - Added advanced search filters: price range ($/$$/$$$), dietary preferences (vegan, keto, etc.), ambiance (trendy, cozy, etc.)
  - Implemented comprehensive filtering for nearby spots with dietary, price, and ambiance options
  - Created interactive search filters UI component with real-time filtering
  - Added push notifications schema and API endpoints for friend activity, nearby spots, and challenge reminders
  - Enhanced spot descriptions with more variety: matcha lattes, boba tea, açaí bowls, avocado toast, poke bowls
  - Improved OpenStreetMap queries to target more diverse trendy food and fitness spots
- July 04, 2025. Enhanced photo library integration and nearby spots location accuracy
  - Improved profile photo editing with dedicated Photo Library and Take Photo buttons
  - Enhanced camera hook to support direct photo library access via Capacitor Camera plugin
  - Added better UI for photo selection with clear visual feedback and loading states
  - Fixed nearby spots distance sorting to prioritize proximity over rating/trendiness
  - Updated OpenStreetMap queries to return spots sorted by actual distance from user
  - Added debugging logs to track location accuracy and distance calculations
- July 04, 2025. Dynamic achievements and real-time Valley Vibes system
  - Replaced all hardcoded achievements with dynamic system based on actual user activity
  - Created getUserStats and getUserAchievements methods calculating real-time data from user hunts
  - Valley Vibes now shows actual favorite categories, active times, hunting streaks, and aesthetic scores
  - Achievements earned from real spot hunting milestones (first hunt, 5+ spots, social activity)
  - Profile page displays authentic user progress instead of placeholder data
  - Added loading states for dynamic content and proper fallbacks for new users
- July 04, 2025. Comprehensive girly badge collection for food, drinks, and fitness
  - Expanded badge system from 10 basic badges to 48 unique, girly and cute collectibles
  - Added 10 drink badges: Boba Princess, Matcha Mermaid, Pink Latte Lover, Golden Milk Goddess, etc.
  - Added 12 food badges: Açaí Bowl Babe, Avo Toast Angel, Poke Bowl Princess, Rainbow Salad Fairy, etc.
  - Added 10 fitness badges: Pilates Princess, Yoga Yogi, Barre Bestie, HIIT Honey, Hot Girl Walk, etc.
  - Added 8 aesthetic/lifestyle badges: Pink Paradise, Marble Counter Muse, Neon Sign Angel, Plant Parent, etc.
  - Added 8 achievement badges: First Hunt Cutie, Weekend Warrior, Early Bird Babe, Trendsetter, Local Legend, etc.
  - All badges feature valley girl themed names and descriptions with cute emojis and rarity levels
  - Seeded database with complete collection and updated memory storage initialization
  - Guest user showcases sample badges: First Hunt Cutie, Boba Princess, Avo Toast Angel, Barre Bestie, Pink Paradise
- July 05, 2025. Enhanced directions with place names instead of coordinates
  - Updated directions functionality to use actual place names and addresses for navigation
  - Navigation now searches for "Chai Spot, King's Road" instead of just latitude/longitude coordinates
  - Improved user experience with more intuitive and readable navigation queries
  - Enhanced mobile and desktop direction handling with proper fallbacks
- July 05, 2025. Fixed check-in functionality and enhanced badge system
  - Enhanced check-in functionality with proper badge awarding and 50 points per check-in
  - Automatic badge detection based on spot categories (boba, matcha, avocado, fitness)
  - First Hunt Cutie badge awarded for first check-in with duplicate prevention
  - Better user feedback showing points earned and new badges
  - Fixed photo upload functionality for profile pictures and post creation
  - Enhanced camera integration with proper data URL handling and error management
- July 06, 2025. Fixed hunt button functionality with OpenStreetMap integration
  - Resolved hunt button failures when users are within range of real spots
  - Updated hunt endpoint to dynamically create spots from OpenStreetMap data
  - Enhanced spot hunting to work with real-time location-based spots
  - Improved error handling and debugging for hunt operations
  - Hunt button now successfully awards points and badges for nearby spot check-ins
- July 06, 2025. Enhanced location descriptions with accurate real-world information
  - Replaced generic "valley girl" themed descriptions with accurate business descriptions
  - Added brand-specific descriptions for known chains (Starbucks, Costa, Pret, etc.)
  - Incorporated actual OpenStreetMap tags for precise service descriptions
  - Enhanced descriptions include practical amenities (WiFi, outdoor seating, takeaway)
  - Descriptions now accurately reflect what each location actually offers
- July 08, 2025. Complete trendy workout class integration and UX improvements
  - Enhanced fitness detection with comprehensive valley girl workout descriptions
  - Added all requested workout types: Reformer Pilates, SoulCycle, Barry's Bootcamp, Hot Yoga, Vinyasa Flow, F45, HIIT, Barre, Pole Fitness, Dance Cardio, Zumba, Aqua Spin, etc.
  - Implemented smart workout spot generation when real locations are limited
  - Added 15 trendy workout classes with authentic "that girl" descriptions
  - Enhanced OpenStreetMap queries to capture fitness centres, yoga studios, and sports centres
  - Integrated location-aware gym endpoint for personalized workout recommendations
  - Added 5 major UX improvements: smart loading skeletons, haptic feedback, pull-to-refresh, quick actions, and progress hints
  - Created engaging empty states and search functionality for better user experience
- July 21, 2025. Comprehensive squad competition system with group challenges and city leaderboards
  - Added complete database schema for squads, squad members, group challenges, challenge participants, and city leaderboards
  - Implemented comprehensive squad management with creation, joining, leaving, and admin roles
  - Added group challenge system supporting spot hunting, points collection, badge collection, and social activity challenges
  - Integrated city-based leaderboards with weekly, monthly, and all-time rankings for individuals and squads
  - Created comprehensive API endpoints for all squad and leaderboard functionality
  - Added squad competition tab to social page with three-tab navigation (Feed, Squads, Calendar)
  - Designed engaging UI for squad creation, challenge participation, and leaderboard viewing
  - Squad system supports public/private squads, location-based discovery, and competitive progression
  - Group challenges include time limits, target values, and real-time leaderboard tracking
  - Ready for friend groups to create squads and compete in location-based challenges together
- July 21, 2025. Taste maker influencer system with social proof and spot discovery influence
  - Added comprehensive database schema for taste makers, endorsements, follows, and trending influence
  - Created taste maker tiers: rising, established, elite, legendary based on influence scores and follower counts
  - Implemented taste maker profiles with specialties, bio, social handles, and verification status
  - Added endorsement system where taste makers can recommend spots with captions and photos
  - Created following system for users to follow influential taste makers and get personalized recommendations
  - Added trending influence tracking to measure how taste maker endorsements drive user visits
  - Built comprehensive taste makers page with tier filtering, follower counts, and endorsement previews
  - Integrated taste maker section on home page showcasing top influencers with high leaderboard points
  - System designed to create social proof and drive spot discovery through influential user recommendations
  - Taste makers with high points influence others in spot discovery, creating viral discovery loops
- July 22, 2025. Enhanced search functionality and Quick Actions improvements
  - Updated Quick Actions to properly filter map results: Find Coffee shows coffee spots, Find Workout shows fitness spots
  - Enhanced Share Moment to auto-open camera for instant photo sharing via social page
  - Implemented comprehensive search bar functionality specifically for spot keywords (matcha, ice coffee, pilates)
  - Added server-side search filtering across spot names, descriptions, categories, dietary options, and amenities
  - Enhanced map page to parse URL parameters for both filter and search functionality
  - Search now navigates from home page to map with proper query parameters and filtering
  - Improved user feedback with toast notifications confirming each action
- July 22, 2025. Complete push notifications system for nearby trendy spots
  - Implemented real-time location tracking with automatic spot discovery every 2 minutes
  - Smart notification system detecting trendy cafes, restaurants, and fitness spots within 800m radius
  - WebSocket integration for instant push notifications when trending spots are found
  - Enhanced notification messages customized for different categories (coffee, food, fitness)
  - Auto-tracking toggle allowing continuous monitoring or manual spot checks
  - Beautiful test dashboard showing notification status, recent alerts, and service metrics
  - Simplified home page by removing cluttered sections (squad activity, latest badges, nearby spots) as they exist in dedicated tabs
  - Push notification service tracks active users and sends personalized alerts based on location and preferences
- July 22, 2025. Fixed directions functionality for better Google Maps routing
  - Updated navigation to use spot names and addresses instead of raw coordinates
  - Enhanced mobile navigation with native app integration (Apple Maps on iOS, Google Maps on Android)
  - Improved search queries with city context for better route plotting
  - Fixed map page directions to use proper place names for accurate routing
  - Added error handling and user feedback for navigation actions
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
App name: "Socialiser" (finalized name change from "Socialise")
```