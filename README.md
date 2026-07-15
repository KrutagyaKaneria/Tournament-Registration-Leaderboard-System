# Tournament Registration & Leaderboard System API

A RESTful API for managing tournament registrations, player scores, and real-time leaderboards.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Validation:** express-validator

## Setup

```bash
# Clone the repository
git clone <repository-url>
cd tournament-leaderboard-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your PostgreSQL credentials
```

### Database Sync (Development)

```bash
npm run db:sync
```

This runs `sequelize.sync({ alter: true })` to create/update tables to match model definitions. For production, use `sequelize-cli` migrations instead.

### Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts at `http://localhost:5000` (configurable via `PORT` in `.env`).

## API Endpoints

All responses use a consistent envelope:
- **Success:** `{ success: true, data: ... }`
- **Error:** `{ success: false, message: "..." }`

---

### Health Check

#### `GET /health`

Check if the server is running.

**Response (200):**
```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

---

### Player Management

#### `POST /players`

Create a new player.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "country": "USA"
}
```

**Validation Rules:**
- `name` — required, string
- `email` — required, valid email format
- `country` — required, string

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "country": "USA",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Validation error messages |
| 409 | A player with this email already exists |

---

#### `GET /players/:id`

Fetch a single player by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "country": "USA",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 404 | Player not found |

---

#### `GET /players`

List all players.

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "country": "USA",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

> **Note:** Pagination should be added for production use (limit/offset or cursor-based).

---

### Tournament Management

#### `POST /tournaments`

Create a new tournament.

**Request Body:**
```json
{
  "name": "Spring Championship",
  "maxPlayers": 32
}
```

**Validation Rules:**
- `name` — required, string
- `maxPlayers` — required, integer > 0

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Spring Championship",
    "maxPlayers": 32,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Validation error messages |

---

#### `GET /tournaments/:id`

Fetch a single tournament by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Spring Championship",
    "maxPlayers": 32,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 404 | Tournament not found |

---

#### `GET /tournaments`

List all tournaments.

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Spring Championship",
      "maxPlayers": 32,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Tournament Registration

#### `POST /tournaments/:id/register`

Register a player for a tournament.

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validation Rules:**
- `playerId` — required, valid UUID

**Response (201):**
```json
{
  "success": true,
  "data": {
    "tournamentId": "660e8400-e29b-41d4-a716-446655440000",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "registeredAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Tournament is full / validation error |
| 404 | Tournament not found / Player not found |
| 409 | Player already registered for this tournament |

---

### Score Submission

#### `POST /tournaments/:id/score`

Submit or update a player's score for a tournament. Uses upsert: if a score exists, it updates; otherwise creates.

**Request Body:**
```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "score": 1500
}
```

**Validation Rules:**
- `playerId` — required, valid UUID
- `score` — required, integer >= 0

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tournamentId": "660e8400-e29b-41d4-a716-446655440000",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "score": 1500,
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 400 | Validation error |
| 403 | Player is not registered for this tournament |
| 404 | Tournament not found / Player not found |

---

### Leaderboard

#### `GET /tournaments/:id/leaderboard`

Get the full leaderboard for a tournament, sorted by score descending with standard competition ranking (1, 2, 2, 4).

Players who registered but haven't submitted a score appear at the bottom with `score: 0`.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "playerId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "country": "USA",
      "score": 1500
    },
    {
      "rank": 2,
      "playerId": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Smith",
      "country": "UK",
      "score": 1200
    },
    {
      "rank": 2,
      "playerId": "880e8400-e29b-41d4-a716-446655440000",
      "name": "Bob Wilson",
      "country": "Canada",
      "score": 1200
    },
    {
      "rank": 4,
      "playerId": "990e8400-e29b-41d4-a716-446655440000",
      "name": "Alice Brown",
      "country": "Australia",
      "score": 0
    }
  ]
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 404 | Tournament not found |

---

#### `GET /tournaments/:id/player/:playerId`

Get a single player's rank and score in a specific tournament.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "rank": 1,
    "score": 1500
  }
}
```

**Errors:**
| Status | Message |
|--------|---------|
| 404 | Tournament not found / Player not found / Player is not registered for this tournament |

---

## Database Schema & Relationships

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    Player    │       │   Registration   │       │  Tournament  │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (UUID, PK)│──┐    │ tournamentId(FK) │    ┌──│ id (UUID, PK)│
│ name         │  ├───>│ playerId (FK)    │<───┘  │ name         │
│ email        │  │    │ registeredAt     │       │ maxPlayers   │
│ country      │  │    │                  │       │ createdAt    │
│ createdAt    │  │    └──────────────────┘       │ updatedAt    │
│ updatedAt    │  │                               └──────────────┘
└──────────────┘  │
                  │       ┌──────────────────┐
                  │       │      Score       │
                  │       ├──────────────────┤
                  └──────>│ tournamentId(FK) │
                          │ playerId (FK)    │
                          │ score            │
                          │ updatedAt        │
                          └──────────────────┘
```

**Relationships:**
- **Player ↔ Registration:** One-to-Many (a player can register for many tournaments)
- **Tournament ↔ Registration:** One-to-Many (a tournament has many registrations)
- **Player ↔ Tournament:** Many-to-Many through Registration
- **Player ↔ Score:** One-to-Many (a player can have scores in many tournaments)
- **Tournament ↔ Score:** One-to-Many (a tournament has many scores)

**Unique Constraints:**
- `Registration`: composite unique on `(tournamentId, playerId)` — prevents duplicate registrations
- `Score`: composite unique on `(tournamentId, playerId)` — enforces upsert behavior (update, not duplicate)
- `Player.email`: unique — prevents duplicate player accounts

## Project Structure

```
src/
├── config/
│   └── database.js          # Sequelize connection
├── controllers/
│   ├── playerController.js
│   ├── tournamentController.js
│   ├── registrationController.js
│   ├── scoreController.js
│   └── leaderboardController.js
├── middleware/
│   ├── asyncHandler.js      # Wraps async route handlers
│   ├── errorHandler.js      # Centralized error handling
│   └── validate.js          # express-validator wrapper
├── models/
│   ├── index.js             # Associations
│   ├── Player.js
│   ├── Tournament.js
│   ├── Registration.js
│   └── Score.js
├── routes/
│   ├── health.js
│   ├── playerRoutes.js
│   ├── tournamentRoutes.js
│   ├── registrationRoutes.js
│   ├── scoreRoutes.js
│   └── leaderboardRoutes.js
├── utils/
│   ├── AppError.js          # Custom error class
│   ├── rankingHelper.js     # Competition ranking logic
│   └── syncDb.js            # Dev sync script
└── validators/
    ├── playerValidator.js
    ├── tournamentValidator.js
    ├── registrationValidator.js
    └── scoreValidator.js
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with auto-reload (nodemon) |
| `npm start` | Start server in production mode |
| `npm run db:sync` | Sync database schema (development only) |
