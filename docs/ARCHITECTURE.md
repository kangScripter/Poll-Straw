# StrawPoll Replica - Mobile Application Architecture

**Project:** StrawPoll Replica  
**Version:** 1.0  
**Date:** January 2026  
**Author:** Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Real-time Architecture](#real-time-architecture)
7. [Screen Flow Diagram](#screen-flow-diagram)
8. [Implementation Phases](#implementation-phases)
9. [Security Measures](#security-measures)
10. [Key Components](#key-components)
11. [Deployment Strategy](#deployment-strategy)

---

## Overview

This document outlines the complete architecture and implementation plan for building a lightweight, mobile app-based real-time polling platform that replicates the key functionality of StrawPoll.com. The application supports poll creation, voting, real-time results, and administrative features.

### Core Objectives

- **Real-time Polling**: Live vote updates with WebSocket connections
- **Cross-platform Mobile**: Single codebase for iOS and Android
- **Scalability**: Handle large numbers of concurrent votes
- **Security**: Protection against spam, bots, and fraud
- **User Experience**: Intuitive, responsive, and accessible UI

---

## Tech Stack

### Frontend (Mobile App)

| Layer | Technology | Reason |
|-------|------------|--------|
| **Framework** | React Native | Cross-platform (iOS + Android), single codebase |
| **State Management** | Redux Toolkit / Zustand (RN) | Scalable state handling for complex app logic |
| **Real-time** | WebSocket / Socket.io | Live poll results and instant updates |
| **Charts** | Victory Native / FL Chart | Real-time result visualization |
| **Navigation** | React Navigation / Go Router | Screen management and deep linking |
| **Styling** | Tailwind CSS (NativeWind) | Consistent, utility-first styling |

### Backend

| Layer | Technology | Reason |
|-------|------------|--------|
| **Runtime** | Node.js with Express/Fastify | Fast, real-time capable, JavaScript ecosystem |
| **Database** | PostgreSQL | Relational data, user accounts, polls, ACID compliance |
| **Cache** | Redis | Real-time vote counting, session management, pub/sub |
| **Real-time** | Socket.io | Live updates and bidirectional communication |
| **Auth** | JWT + OAuth 2.0 | Secure authentication and authorization |
| **File Storage** | Cloudinary | Export files, media storage |
| **ORM** | Prisma | Type-safe database access and migrations |

### Infrastructure

| Service | Technology |
|---------|------------|
| **Hosting** | AWS / Google Cloud / Vercel |
| **CDN** |  Cloudflare |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Sentry, DataDog |
| **Analytics** | Google Analytics|

---

## Project Structure

```
AppVote/
├── mobile/                          # React Native 
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Poll/
│   │   │   │   ├── PollCard.tsx
│   │   │   │   ├── PollOption.tsx
│   │   │   │   ├── PollResults.tsx
│   │   │   │   └── VoteButton.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── BarChart.tsx
│   │   │   │   └── PieChart.tsx
│   │   │   └── Common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Loading.tsx
│   │   │
│   │   ├── screens/                 # App screens
│   │   │   ├── Auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   ├── Home/
│   │   │   │   └── HomeScreen.tsx
│   │   │   ├── Poll/
│   │   │   │   ├── CreatePollScreen.tsx
│   │   │   │   ├── PollDetailScreen.tsx
│   │   │   │   ├── VoteScreen.tsx
│   │   │   │   └── ResultsScreen.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   └── MyPollsScreen.tsx
│   │   │   └── Admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── ModerationScreen.tsx
│   │   │       └── ReportsScreen.tsx
│   │   │
│   │   ├── services/                # API & external services
│   │   │   ├── api/
│   │   │   │   ├── client.ts        # Axios/fetch configuration
│   │   │   │   ├── pollApi.ts
│   │   │   │   ├── authApi.ts
│   │   │   │   └── userApi.ts
│   │   │   ├── socket/
│   │   │   │   └── socketService.ts # WebSocket connection
│   │   │   └── storage/
│   │   │       └── asyncStorage.ts
│   │   │
│   │   ├── store/                   # State management
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── pollSlice.ts
│   │   │   │   ├── voteSlice.ts
│   │   │   │   └── userSlice.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePoll.ts
│   │   │   ├── useRealTimeVotes.ts
│   │   │   └── useExport.ts
│   │   │
│   │   ├── utils/                   # Utilities
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── navigation/              # Navigation setup
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   └── TabNavigator.tsx
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   ├── poll.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   └── theme/                   # Styling
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       └── spacing.ts
│   │
│   ├── App.tsx
│   ├── package.json
│   └── tailwind.config.js           # If using NativeWind
│
├── backend/                         # Node.js API Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── pollController.ts
│   │   │   ├── voteController.ts
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   └── adminController.ts
│   │   │
│   │   ├── models/
│   │   │   ├── Poll.ts
│   │   │   ├── Vote.ts
│   │   │   ├── User.ts
│   │   │   └── Report.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── pollRoutes.ts
│   │   │   ├── voteRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── validation.ts
│   │   │   ├── captcha.ts
│   │   │   └── errorHandler.ts
│   │   │
│   │   ├── services/
│   │   │   ├── pollService.ts
│   │   │   ├── voteService.ts
│   │   │   ├── exportService.ts
│   │   │   ├── emailService.ts
│   │   │   └── analyticsService.ts
│   │   │
│   │   ├── socket/
│   │   │   └── socketHandler.ts     # Real-time vote updates
│   │   │
│   │   ├── utils/
│   │   │   ├── generateId.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   │
│   │   └── app.ts
│   │
│   ├── prisma/                      # Database ORM
│   │   └── schema.prisma
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                          # Shared types/utilities
│   └── types/
│       └── index.ts
│
├── docs/                            # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── ARCHITECTURE.md
│
└── docker-compose.yml               # Local development
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│   User   │─────────│   Poll   │─────────│ PollOption   │
└──────────┘         └──────────┘         └──────────────┘
     │                     │                       │
     │                     │                       │
     │                     ▼                       │
     │              ┌──────────┐                  │
     │              │   Vote   │◄─────────────────┘
     │              └──────────┘
     │                     │
     │                     │
     │                     ▼
     │              ┌──────────┐
     │              │  Report  │
     │              └──────────┘
     │
     └─────────────────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          Role      @default(USER)
  polls         Poll[]
  votes         Vote[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  GUEST
  USER
  ADMIN
}

model Poll {
  id              String       @id @default(cuid())
  title           String
  description     String?
  options         PollOption[]
  votes           Vote[]
  creator         User?        @relation(fields: [creatorId], references: [id])
  creatorId       String?
  
  // Settings
  allowMultiple   Boolean      @default(false)
  requireAuth     Boolean      @default(false)
  showResults     ResultVisibility @default(ALWAYS)
  deadline        DateTime?
  isActive        Boolean      @default(true)
  
  // Anti-fraud
  ipRestriction   Boolean      @default(true)
  captchaRequired Boolean      @default(false)
  
  // Sharing
  shareUrl        String       @unique
  embedCode       String?
  
  // Analytics
  totalVotes      Int          @default(0)
  viewCount       Int          @default(0)
  
  reports         Report[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum ResultVisibility {
  ALWAYS
  AFTER_VOTE
  AFTER_DEADLINE
  NEVER
}

model PollOption {
  id        String   @id @default(cuid())
  text      String
  emoji     String?
  poll      Poll     @relation(fields: [pollId], references: [id], onDelete: Cascade)
  pollId    String
  votes     Vote[]
  voteCount Int      @default(0)
  order     Int      @default(0)
}

model Vote {
  id        String      @id @default(cuid())
  poll      Poll        @relation(fields: [pollId], references: [id], onDelete: Cascade)
  pollId    String
  option    PollOption  @relation(fields: [optionId], references: [id])
  optionId String
  user      User?       @relation(fields: [userId], references: [id])
  userId    String?
  
  // Anti-fraud tracking
  ipAddress String?
  sessionId String?
  deviceId  String?
  
  createdAt DateTime    @default(now())
  
  @@unique([pollId, ipAddress])
  @@unique([pollId, userId])
  @@index([pollId])
  @@index([optionId])
}

model Report {
  id        String       @id @default(cuid())
  poll      Poll         @relation(fields: [pollId], references: [id])
  pollId    String
  reason    ReportReason
  details   String?
  status    ReportStatus @default(PENDING)
  createdAt DateTime     @default(now())
  
  @@index([pollId])
  @@index([status])
}

enum ReportReason {
  SPAM
  INAPPROPRIATE
  FRAUD
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}
```

---

## API Endpoints

### Base URL
```
Production: https://api.pollstraw.com
Development: http://localhost:3000
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Yes |
| POST | `/api/auth/forgot` | Request password reset | No |
| POST | `/api/auth/reset` | Reset password with token | No |

**Request Example (Register):**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Poll Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/polls` | Create new poll | Optional |
| GET | `/api/polls/:id` | Get poll details | No |
| PUT | `/api/polls/:id` | Update poll | Yes (Owner) |
| DELETE | `/api/polls/:id` | Delete poll | Yes (Owner) |
| GET | `/api/polls/:id/results` | Get poll results | No |
| POST | `/api/polls/:id/vote` | Cast vote | No |
| GET | `/api/polls/:id/export` | Export results (CSV/Excel) | Yes (Owner) |
| POST | `/api/polls/:id/report` | Report poll | No |

**Request Example (Create Poll):**
```json
POST /api/polls
{
  "title": "What's your favorite programming language?",
  "description": "Help us decide!",
  "options": [
    { "text": "JavaScript", "emoji": "🟨" },
    { "text": "Python", "emoji": "🐍" },
    { "text": "TypeScript", "emoji": "🔷" },
    { "text": "Rust", "emoji": "🦀" }
  ],
  "settings": {
    "allowMultiple": false,
    "requireAuth": false,
    "showResults": "ALWAYS",
    "deadline": "2026-02-01T00:00:00Z",
    "ipRestriction": true,
    "captchaRequired": false
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "poll": {
      "id": "clx456...",
      "title": "What's your favorite programming language?",
      "shareUrl": "https://pollstraw.com/poll/clx456",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  }
}
```

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/polls` | Get user's polls | Yes |
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |
| DELETE | `/api/user/account` | Delete account | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/reports` | Get all reports | Yes (Admin) |
| PUT | `/api/admin/reports/:id` | Update report status | Yes (Admin) |
| DELETE | `/api/admin/polls/:id` | Remove poll | Yes (Admin) |
| PUT | `/api/admin/polls/:id/votes` | Add/delete votes | Yes (Admin) |
| GET | `/api/admin/analytics` | Platform analytics | Yes (Admin) |

---

## Real-time Architecture

### System Architecture Diagram

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   Mobile App    │◄──────────────────►│   Socket.io     │
│  (React Native) │                    │    Server       │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ REST API                             │ Pub/Sub
         │                                      │
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   API Server    │◄──────────────────►│     Redis       │
│   (Node.js)     │                    │   (Cache/PubSub)│
└────────┬────────┘                    └─────────────────┘
         │
         │ ORM (Prisma)
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘
```

### Socket Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-poll` | `{ pollId: string }` | Subscribe to poll updates |
| `leave-poll` | `{ pollId: string }` | Unsubscribe from poll |
| `cast-vote` | `{ pollId: string, optionId: string }` | Submit vote (optional, can use REST) |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `vote-update` | `{ pollId: string, optionId: string, voteCount: number }` | New vote received |
| `poll-closed` | `{ pollId: string }` | Poll deadline reached |
| `results-update` | `{ pollId: string, results: PollResults }` | Real-time results refresh |

### Real-time Flow

1. **User opens poll** → Mobile app connects to Socket.io
2. **App emits `join-poll`** → Server subscribes to Redis channel for that poll
3. **User votes** → REST API receives vote → Updates database → Publishes to Redis
4. **Redis pub/sub** → Socket.io server receives update → Broadcasts to all connected clients
5. **Mobile app receives** → Updates UI with new results

---

## Screen Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         LANDING SCREEN                            │
│  ┌─────────────┐                    ┌─────────────┐              │
│  │ Create Poll │                    │   Login/    │              │
│  │     (CTA)   │                    │   Register  │              │
│  └──────┬──────┘                    └──────┬──────┘              │
└─────────┼──────────────────────────────────┼──────────────────────┘
          │                                  │
          ▼                                  ▼
┌──────────────┐                    ┌──────────────┐
│ POLL BUILDER │                    │    AUTH      │
│   SCREEN     │                    │   SCREENS    │
│              │                    │              │
│ • Question   │                    │ • Login      │
│ • Options    │                    │ • Register   │
│ • Settings   │                    │ • Forgot PW  │
│ • Deadline   │                    │              │
└──────┬───────┘                    └──────┬───────┘
       │                                     │
       ▼                                     ▼
┌──────────────────────────────────────────────────┐
│                  SHARE SCREEN                     │
│  • Copy Link  • QR Code  • Social Share          │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                  POLL VIEW                       │
│  ┌────────────────┐    ┌────────────────┐        │
│  │   Vote Area    │    │  Live Results  │        │
│  │  (Options)     │    │  (Charts)      │        │
│  └────────────────┘    └────────────────┘        │
└──────────────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌──────────────┐            ┌──────────────┐
│  DASHBOARD   │            │ ADMIN PANEL  │
│  (My Polls)  │            │ (Moderation) │
│              │            │              │
│ • View All   │            │ • Reports    │
│ • Edit       │            │ • Ban Users  │
│ • Export     │            │ • Analytics  │
│ • Delete     │            │              │
└──────────────┘            └──────────────┘
```

### Navigation Structure

```
AppNavigator
├── AuthNavigator (if not authenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── MainNavigator (if authenticated)
    ├── TabNavigator
    │   ├── HomeTab
    │   │   └── HomeScreen
    │   ├── CreateTab
    │   │   └── CreatePollScreen
    │   ├── DashboardTab
    │   │   ├── DashboardScreen
    │   │   └── MyPollsScreen
    │   └── ProfileTab
    │       └── ProfileScreen
    │
    ├── PollStack
    │   ├── PollDetailScreen
    │   ├── VoteScreen
    │   └── ResultsScreen
    │
    └── AdminStack (Admin only)
        ├── AdminDashboard
        ├── ModerationScreen
        └── ReportsScreen
```

---

## Implementation Phases - Feature-wise Story Points

### Story Point Scale
- **1-2 points**: Simple task (4-8 hours)
- **3 points**: Small feature (1 day)
- **5 points**: Medium feature (2-3 days)
- **8 points**: Complex feature (4-5 days)
- **13 points**: Very complex feature (1+ week)

---

### Phase 1: MVP Foundation (Total: 89 points)

#### Infrastructure & Setup (21 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| React Native project setup | 3 | Initialize project with TypeScript, navigation, and basic structure |
| Backend project setup | 3 | Node.js + Express + TypeScript configuration |
| Database setup & Prisma | 5 | PostgreSQL setup, Prisma schema, migrations |
| Docker & local development | 3 | Docker Compose for local PostgreSQL and Redis |
| CI/CD pipeline setup | 5 | GitHub Actions for testing and deployment |
| Environment configuration | 2 | Environment variables and config management |

#### Authentication System (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| User registration API | 3 | Email/password registration with validation |
| User login API | 3 | JWT token generation and validation |
| Password reset flow | 3 | Forgot password email and reset token |
| Mobile auth screens | 3 | Login, Register, Forgot Password UI |
| Token refresh mechanism | 1 | Refresh token implementation |

#### Core UI Components (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Design system setup | 3 | Tailwind/NativeWind configuration, theme setup |
| Common components | 5 | Button, Input, Modal, Loading, Card components |
| Navigation structure | 3 | App navigator, auth navigator, tab navigator |
| Responsive layouts | 2 | Mobile-first responsive design |

#### Poll Creation (21 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Poll creation API | 5 | POST /api/polls with validation |
| Poll creation UI | 5 | Form for question, options, settings |
| Poll options management | 3 | Add/remove/edit poll options with emojis |
| Poll settings UI | 3 | Deadline, visibility, restrictions settings |
| Poll validation | 3 | Frontend and backend validation |
| Share URL generation | 2 | Unique URL generation for polls |

#### Voting Engine (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Vote casting API | 5 | POST /api/polls/:id/vote with duplicate prevention |
| Vote validation logic | 5 | IP, session, device, user-based restrictions |
| Voting UI screens | 3 | Poll detail screen, vote selection interface |

#### Poll Display & Results (8 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Poll detail screen | 3 | Display poll with options and metadata |
| Results display | 3 | Show vote counts and percentages |
| Poll status management | 2 | Active/closed poll states |

#### Real-time Features (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Socket.io server setup | 3 | WebSocket server configuration |
| Real-time vote updates | 5 | Live vote broadcasting via Socket.io |
| Client socket integration | 3 | Mobile app Socket.io client setup |
| Connection management | 2 | Join/leave poll rooms, reconnection handling |

#### Charts & Visualization (8 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Chart library integration | 2 | Victory Native or FL Chart setup |
| Bar chart component | 3 | Real-time bar chart for poll results |
| Pie chart component | 3 | Alternative pie chart visualization |

#### Sharing Features (5 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Share URL copy | 1 | Copy poll link to clipboard |
| QR code generation | 2 | Generate QR code for poll link |
| Social sharing | 2 | Native share functionality |

#### Testing & Quality (8 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Unit tests (critical functions) | 3 | Vote validation, poll creation tests |
| Integration tests | 3 | API endpoint testing |
| Bug fixes & optimization | 2 | Performance improvements |

#### Deployment (5 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Backend deployment | 3 | Production server setup |
| Mobile app build setup | 2 | iOS/Android build configuration |

**Phase 1 Total: 89 Story Points**

---

### Phase 2: Enhanced Features (Total: 55 points)

#### User Dashboard (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Dashboard screen UI | 5 | User dashboard with poll overview |
| My polls list | 3 | Display all user-created polls |
| Poll statistics display | 3 | View count, vote count, participation rate |
| Dashboard navigation | 2 | Navigation to poll management |

#### Poll Management (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Edit poll API | 3 | PUT /api/polls/:id endpoint |
| Edit poll UI | 3 | Edit poll form and validation |
| Delete poll functionality | 2 | Delete poll API and UI |
| Poll analytics view | 5 | Detailed analytics for individual polls |

#### User Profile (8 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Profile screen | 3 | Display user information |
| Profile edit API | 2 | PUT /api/user/profile |
| Profile edit UI | 3 | Edit profile form |

#### Export Functionality (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| CSV export API | 3 | Generate CSV from poll results |
| Excel export API | 5 | Generate Excel file with formatting |
| Export UI | 3 | Export button and file download |
| Export file handling | 2 | File storage and download management |

#### Analytics Dashboard (8 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Analytics API | 3 | Aggregate poll statistics |
| Analytics UI | 3 | Charts and metrics display |
| Analytics data processing | 2 | Data aggregation and calculations |

#### Admin Panel (21 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Admin dashboard UI | 5 | Admin overview with key metrics |
| Report moderation system | 5 | View, review, and resolve reports |
| Content management | 5 | Delete polls, manage content |
| User management | 3 | Ban/unban users, view user details |
| Admin authentication | 3 | Role-based access control for admin |

**Phase 2 Total: 55 Story Points**

---

### Phase 3: Polish & Scale (Total: 34 points)

#### Security Enhancements (13 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| CAPTCHA integration | 5 | Google reCAPTCHA for vote protection |
| Rate limiting | 3 | API rate limiting middleware |
| Security audit | 3 | Security review and fixes |
| Input sanitization | 2 | XSS and injection prevention |

#### Performance Optimization (8 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Database query optimization | 3 | Index optimization, query tuning |
| Caching strategies | 3 | Redis caching for frequently accessed data |
| API response optimization | 2 | Response time improvements |

#### UI/UX Refinements (5 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| UI polish | 3 | Design improvements, animations |
| Accessibility improvements | 2 | Screen reader support, accessibility features |

#### Testing & Documentation (5 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Comprehensive testing | 2 | Full test coverage |
| API documentation | 2 | API endpoint documentation |
| User documentation | 1 | User guide and help docs |

#### Production Deployment (3 points)
| Feature | Story Points | Description |
|---------|--------------|-------------|
| Production deployment | 2 | Final production setup |
| Monitoring setup | 1 | Error tracking and monitoring tools |

**Phase 3 Total: 34 Story Points**

---

### Summary

| Phase | Total Story Points | Estimated Duration |
|-------|-------------------|-------------------|
| **Phase 1: MVP** | 89 points | ~6 weeks |
| **Phase 2: Enhanced Features** | 55 points | ~3 weeks |
| **Phase 3: Polish & Scale** | 34 points | ~2 weeks |
| **Total** | **178 points** | **~11 weeks** |

### Velocity Assumptions
- **Team Size**: 2-3 developers
- **Sprint Duration**: 2 weeks
- **Average Velocity**: 20-30 story points per sprint per developer
- **Team Velocity**: 40-60 story points per sprint

### Sprint Breakdown Estimate
- **Sprint 1-3**: Phase 1 (MVP) - 6 weeks
- **Sprint 4-5**: Phase 2 (Enhanced Features) - 3 weeks  
- **Sprint 6**: Phase 3 (Polish & Scale) - 2 weeks

---

## Security Measures

### Authentication & Authorization

```typescript
// JWT Token Structure
{
  "userId": "clx123...",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1705315200,
  "exp": 1705401600
}
```

### Anti-fraud Vote Validation

```typescript
// services/voteService.ts
const validateVote = async (pollId: string, req: Request) => {
  const poll = await Poll.findById(pollId);
  if (!poll || !poll.isActive) {
    throw new Error('Poll not found or closed');
  }

  // Check deadline
  if (poll.deadline && new Date() > poll.deadline) {
    throw new Error('Poll deadline has passed');
  }

  const checks = {
    // IP-based restriction
    ipExists: poll.ipRestriction 
      ? await redis.exists(`vote:${pollId}:ip:${req.ip}`)
      : false,
    
    // Session-based restriction
    sessionExists: await redis.exists(`vote:${pollId}:session:${req.sessionId}`),
    
    // Device fingerprint
    deviceExists: await redis.exists(`vote:${pollId}:device:${req.deviceId}`),
    
    // User authentication (if required)
    userVoted: poll.requireAuth && req.user 
      ? await Vote.findOne({ pollId, userId: req.user.id })
      : false,
  };
  
  if (Object.values(checks).some(Boolean)) {
    throw new Error('Duplicate vote detected');
  }

  return true;
};
```

### Security Best Practices

1. **Input Validation**: Sanitize all user inputs
2. **SQL Injection Prevention**: Use Prisma ORM (parameterized queries)
3. **XSS Protection**: Escape user-generated content
4. **Rate Limiting**: Limit API requests per IP/user
5. **HTTPS Only**: Enforce SSL/TLS in production
6. **CORS Configuration**: Restrict allowed origins
7. **Password Hashing**: Use bcrypt with salt rounds
8. **Token Expiration**: Short-lived JWT tokens with refresh mechanism
9. **CAPTCHA**: Implement for sensitive operations
10. **Audit Logging**: Log all admin actions

---

## Key Components

### Real-time Vote Hook

```typescript
// hooks/useRealTimeVotes.ts
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface PollResults {
  pollId: string;
  options: {
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
  }[];
  totalVotes: number;
}

export const useRealTimeVotes = (pollId: string) => {
  const [results, setResults] = useState<PollResults | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-poll', { pollId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('vote-update', (data: PollResults) => {
      setResults(data);
    });

    newSocket.on('results-update', (data: PollResults) => {
      setResults(data);
    });

    newSocket.on('poll-closed', () => {
      // Handle poll closure
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-poll', { pollId });
      newSocket.disconnect();
    };
  }, [pollId]);

  return { results, isConnected, socket };
};
```

### Poll Card Component

```typescript
// components/Poll/PollCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRealTimeVotes } from '../../hooks/useRealTimeVotes';
import { PollOption } from './PollOption';

interface PollCardProps {
  poll: {
    id: string;
    title: string;
    description?: string;
    options: Array<{
      id: string;
      text: string;
      emoji?: string;
    }>;
    deadline?: string;
    hasVoted?: boolean;
  };
  onVote: (optionId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onVote }) => {
  const { results, isConnected } = useRealTimeVotes(poll.id);

  const calculatePercentage = (optionId: string) => {
    if (!results || results.totalVotes === 0) return 0;
    const option = results.options.find(opt => opt.id === optionId);
    return option ? option.percentage : 0;
  };

  return (
    <View className="bg-white rounded-2xl shadow-lg p-6 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900 flex-1">
          {poll.title}
        </Text>
        {isConnected && (
          <View className="w-2 h-2 bg-green-500 rounded-full ml-2" />
        )}
      </View>

      {poll.description && (
        <Text className="text-gray-600 mb-4">{poll.description}</Text>
      )}

      {poll.options.map((option) => (
        <PollOption
          key={option.id}
          option={option}
          percentage={calculatePercentage(option.id)}
          onSelect={() => onVote(option.id)}
          showResults={poll.hasVoted || poll.deadline ? true : false}
        />
      ))}

      <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
        <Text className="text-gray-500">
          {results?.totalVotes || 0} votes
        </Text>
        {poll.deadline && (
          <Text className="text-gray-500">
            {formatDeadline(poll.deadline)}
          </Text>
        )}
      </View>
    </View>
  );
};
```

### Vote Service (Backend)

```typescript
// services/voteService.ts
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL);

export const castVote = async (
  pollId: string,
  optionId: string,
  userId: string | null,
  metadata: {
    ipAddress?: string;
    sessionId?: string;
    deviceId?: string;
  }
) => {
  // Validate poll exists and is active
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });

  if (!poll || !poll.isActive) {
    throw new Error('Poll not found or closed');
  }

  // Check deadline
  if (poll.deadline && new Date() > poll.deadline) {
    throw new Error('Poll deadline has passed');
  }

  // Validate option exists
  const option = poll.options.find(opt => opt.id === optionId);
  if (!option) {
    throw new Error('Invalid option');
  }

  // Check duplicate vote
  if (poll.ipRestriction && metadata.ipAddress) {
    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_ipAddress: {
          pollId,
          ipAddress: metadata.ipAddress,
        },
      },
    });

    if (existingVote) {
      throw new Error('You have already voted');
    }
  }

  if (userId) {
    const existingUserVote = await prisma.vote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId,
        },
      },
    });

    if (existingUserVote) {
      throw new Error('You have already voted');
    }
  }

  // Create vote in transaction
  const vote = await prisma.$transaction(async (tx) => {
    // Create vote
    const newVote = await tx.vote.create({
      data: {
        pollId,
        optionId,
        userId,
        ipAddress: metadata.ipAddress,
        sessionId: metadata.sessionId,
        deviceId: metadata.deviceId,
      },
    });

    // Update option vote count
    await tx.pollOption.update({
      where: { id: optionId },
      data: {
        voteCount: {
          increment: 1,
        },
      },
    });

    // Update poll total votes
    await tx.poll.update({
      where: { id: pollId },
      data: {
        totalVotes: {
          increment: 1,
        },
      },
    });

    return newVote;
  });

  // Cache vote for duplicate prevention
  if (metadata.ipAddress) {
    await redis.setex(
      `vote:${pollId}:ip:${metadata.ipAddress}`,
      86400, // 24 hours
      '1'
    );
  }

  // Get updated results
  const results = await getPollResults(pollId);

  // Publish to Redis for real-time updates
  await redis.publish(`poll:${pollId}`, JSON.stringify(results));

  return { vote, results };
};

export const getPollResults = async (pollId: string) => {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  if (!poll) {
    throw new Error('Poll not found');
  }

  const totalVotes = poll.totalVotes;
  const options = poll.options.map(option => ({
    id: option.id,
    text: option.text,
    emoji: option.emoji,
    voteCount: option.voteCount,
    percentage: totalVotes > 0 
      ? Math.round((option.voteCount / totalVotes) * 100) 
      : 0,
  }));

  return {
    pollId,
    options,
    totalVotes,
  };
};
```

---

## Deployment Strategy

### Environment Setup

#### Development
- Local PostgreSQL database
- Local Redis instance
- Development API server (localhost:3000)
- React Native development build

#### Staging
- Cloud PostgreSQL (managed service)
- Cloud Redis (managed service)
- Staging API server
- TestFlight (iOS) / Internal Testing (Android)

#### Production
- Production PostgreSQL with read replicas
- Production Redis cluster
- Load-balanced API servers
- App Store / Play Store releases

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t pollstraw-api .
      - name: Push to registry
        run: docker push pollstraw-api:latest

  deploy:
    needs: [test, build-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deployment commands
```

### Monitoring & Analytics

1. **Application Monitoring**: Sentry for error tracking
2. **Performance Monitoring**: DataDog for APM
3. **User Analytics**: Google Analytics / Mixpanel
4. **Server Monitoring**: CloudWatch / Prometheus
5. **Database Monitoring**: PostgreSQL monitoring tools
6. **Uptime Monitoring**: Pingdom / UptimeRobot

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Daily Active Polls Created**: Target 1,000+ polls/day
2. **Poll Participation Rate**: Target 60%+ participation
3. **System Uptime**: Target 99.9% availability
4. **API Response Time**: Target <200ms for vote casting
5. **Real-time Update Latency**: Target <100ms
6. **User Retention**: Target 40%+ monthly retention
7. **Conversion Rate**: Target 5%+ free to paid conversion

### Analytics Dashboard

Track the following metrics:
- Total polls created
- Total votes cast
- Active users
- Peak concurrent users
- Average votes per poll
- Most popular poll categories
- Geographic distribution
- Device/platform breakdown

---

## Appendix

### Glossary

- **Poll**: A question with multiple options for voting
- **Vote**: A single selection made by a user
- **Guest User**: User who can create polls without account
- **Registered User**: User with account and additional features
- **Admin**: User with moderation and management privileges

### References

- [React Native Documentation](https://reactnative.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Next Review**: February 2026
