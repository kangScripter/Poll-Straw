# PollStraw - Real-time Polling Platform

A lightweight, mobile app-based real-time polling platform that allows users to create, share, vote, and analyze polls.

**Website**: [pollstraw.com](https://pollstraw.com)

## 🚀 Features

- **Real-time Polling**: Live vote updates with WebSocket connections
- **Poll Creation**: Create polls with multiple options, emojis, and settings
- **Vote Protection**: IP, session, and device-based duplicate prevention
- **User Accounts**: Register, login, manage polls
- **Results Export**: Export poll results to CSV/Excel
- **Admin Panel**: Moderate polls and manage content
- **Deep Linking**: Share polls via QR codes and direct links

## 📁 Project Structure

```
PollStraw/
├── backend/          # Node.js + Express API
├── mobile/           # React Native App (coming soon)
├── docs/             # Documentation
└── docker-compose.yml
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Auth**: JWT

### Mobile (Coming Soon)
- **Framework**: React Native
- **State**: Redux Toolkit
- **Styling**: NativeWind (Tailwind CSS)

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Install

```bash
cd AppVote

# Install backend dependencies
cd backend
npm install
```

### 2. Start Database Services

```bash
# From project root
docker-compose up -d
```

### 3. Configure Environment

```bash
# In backend folder
cp .env.example .env
# Edit .env with your settings
```

### 4. Setup Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be running at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout |

### Polls
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/polls` | Create poll |
| GET | `/api/polls/:id` | Get poll |
| GET | `/api/polls/share/:shareUrl` | Get poll by share URL |
| PUT | `/api/polls/:id` | Update poll |
| DELETE | `/api/polls/:id` | Delete poll |
| GET | `/api/polls/:id/results` | Get results |

### Voting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/polls/:id/vote` | Cast vote |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/polls` | Get user's polls |

## 🔒 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appvote"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
```

## 📊 Story Points Progress

See [docs/Story_Points_Matrix.csv](docs/Story_Points_Matrix.csv) for detailed progress tracking.

| Phase | Story Points | Status |
|-------|-------------|--------|
| Phase 1: MVP | 89 pts | 🟡 In Progress |
| Phase 2: Enhanced | 55 pts | ⚪ Pending |
| Phase 3: Polish | 34 pts | ⚪ Pending |

## 🧪 Testing

```bash
cd backend
npm test
```

## 📝 License

MIT

---

**Built with ❤️ by the AppVote Team**
