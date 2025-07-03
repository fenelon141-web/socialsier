# Hot Girl Hunt - Location-Based Discovery Mobile App

## Overview

Hot Girl Hunt is a modern mobile-first web application that gamifies location discovery. Built as a "valley girl" themed spot hunting game, users can discover trendy cafes, restaurants, gym classes, and other locations while earning points, badges, and completing daily challenges. The application features a React frontend with Express backend, using PostgreSQL for data persistence.

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
  - Added 3 trending gym spots (Pure Barre Paradise, SoulCycle Vibes, Pilates Princess)
  - Added fitness badges (Workout Warrior, Barre Babe, Hot Girl Summer)
  - Added "Hot Girl Workouts" section on home page with trending gym classes
  - Added new API endpoint /api/spots/gym for gym class discovery
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```