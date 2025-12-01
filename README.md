# PlayStation Shop Admin

A full-stack Next.js 14 application for managing a PlayStation gaming shop. Track consoles, players, games, play sessions, and earnings.

## Features

- **PlayStation Management**: Create, update, delete PlayStations and track their availability status
- **Player Management**: Maintain a database of players with contact information
- **Game Management**: Add games with pricing models (per game or per 15 minutes)
- **Session Tracking**: Start/stop sessions with automatic price calculation
- **Statistics**: Daily and monthly earnings reports with insights

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Mongoose ODM
- **Database**: MongoDB

## Prerequisites

- Node.js 18+ 
- MongoDB (local or remote instance)

## Setup Instructions

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment Variables

Create or update `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/playstation-shop
```

For a remote MongoDB instance (MongoDB Atlas), use:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/playstation-shop
```

### 3. Start MongoDB (if using local instance)

Make sure MongoDB is running locally on port 27017, or update the connection string in `.env.local`.

### 4. Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Add Players
Navigate to `/players` and create player profiles with name, age, phone, and notes.

### 2. Add Games
Go to `/games` and add games with:
- Title
- Image URL (optional)
- Pricing type: "Per Game" or "Per 15 Minutes"
- Price value in DT (Dinars)

### 3. Add PlayStations
Visit `/playstations` and register your consoles with name and model.

### 4. Start a Session
1. Go to `/playstations`
2. Click "Start" on an available PlayStation
3. Select a player and a game
4. The session begins automatically

### 5. Stop a Session
Click "Stop" on an occupied PlayStation. The app will:
- Calculate total price based on game pricing
- Create a session record
- Free the PlayStation for the next player

### 6. View Statistics
Navigate to `/stats` to see:
- Daily earnings (filterable by date)
- Monthly summaries
- Most played game
- Most used PlayStation

## Project Structure

```
my-playstation-app/
├── app/
│   ├── api/              # API routes
│   │   ├── games/
│   │   ├── players/
│   │   ├── playstations/
│   │   └── sessions/
│   ├── games/            # Games page
│   ├── players/          # Players page
│   ├── playstations/     # PlayStations page
│   ├── sessions/         # Sessions page
│   ├── stats/            # Statistics page
│   ├── layout.tsx        # Root layout with sidebar
│   └── page.tsx          # Home page
├── components/
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/
│   ├── models/           # Mongoose models
│   ├── services/         # Service layer for DB operations
│   └── mongoose.ts       # MongoDB connection helper
├── .env.local            # Environment variables
└── package.json
```

## API Endpoints

### Players
- `GET /api/players` - List all players
- `POST /api/players` - Create a player
- `GET /api/players/[id]` - Get player by ID
- `PUT /api/players/[id]` - Update player
- `DELETE /api/players/[id]` - Delete player

### Games
- `GET /api/games` - List all games
- `POST /api/games` - Create a game
- `GET /api/games/[id]` - Get game by ID
- `PUT /api/games/[id]` - Update game
- `DELETE /api/games/[id]` - Delete game

### PlayStations
- `GET /api/playstations` - List all PlayStations
- `POST /api/playstations` - Create a PlayStation
- `GET /api/playstations/[id]` - Get PlayStation by ID
- `PUT /api/playstations/[id]` - Update PlayStation
- `DELETE /api/playstations/[id]` - Delete PlayStation
- `POST /api/playstations/[id]/start` - Start a session
- `POST /api/playstations/[id]/stop` - Stop a session

### Sessions
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create a session (manual)

## Models

### Player
```typescript
{
  name: string;
  age?: number;
  phone?: string;
  notes?: string;
}
```

### Game
```typescript
{
  title: string;
  image?: string;
  pricingType: "perGame" | "per15min";
  priceValue: number;
}
```

### PlayStation
```typescript
{
  name: string;
  model?: string;
  status: "available" | "occupied";
  currentPlayer?: ObjectId;
  currentGame?: ObjectId;
  startTime?: Date;
}
```

### Session
```typescript
{
  playStation: ObjectId;
  player: ObjectId;
  game: ObjectId;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
}
```

## Pricing Logic

- **Per Game**: Fixed price per session regardless of duration
- **Per 15 Minutes**: Price multiplied by number of 15-minute intervals (rounded up)

Example: If a game costs 1 DT per 15 minutes and a session lasts 23 minutes, the price is 2 DT (2 intervals).

## Future Enhancements

- Image upload with Cloudinary integration
- Advanced charts for statistics
- User authentication and authorization
- Session editing and manual adjustments
- Export reports to PDF/Excel
- Real-time updates with WebSockets

## License

MIT

