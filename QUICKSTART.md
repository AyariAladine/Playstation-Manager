# PlayStation Shop - Quick Start Guide

## ✅ What's Been Built

A complete full-stack Next.js 14 application with:

### Backend (MongoDB + Mongoose)
- ✅ Database connection helper (`lib/mongoose.ts`)
- ✅ 4 Mongoose models: Player, Game, PlayStation, Session
- ✅ Service layer for all CRUD operations
- ✅ 12 API routes for complete REST API

### Frontend (React + TypeScript + TailwindCSS)
- ✅ App Router layout with sidebar navigation
- ✅ 5 main pages:
  - `/playstations` - Manage consoles and start/stop sessions
  - `/players` - Player database with CRUD
  - `/games` - Game library with pricing configuration
  - `/sessions` - View all session history
  - `/stats` - Daily & monthly statistics dashboard

### Features Implemented
- ✅ Create, Read, Update, Delete for all entities
- ✅ Session start/stop workflow with automatic:
  - PlayStation status tracking (available/occupied)
  - Price calculation (per game or per 15 minutes)
  - Session record creation
- ✅ Statistics page with:
  - Daily earnings (filterable by date)
  - Monthly summary with totals
  - Most played game
  - Most used PlayStation
- ✅ Responsive UI with Tailwind
- ✅ Modal dialogs for session start
- ✅ Real-time form validation

## 🚀 How to Run

### 1. Make Sure MongoDB is Running

**Option A: Local MongoDB**
```powershell
# If you have MongoDB installed locally, start it
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string
- Update `.env.local` with: 
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/playstation-shop
  ```

### 2. Start the App

The dev server is already running at **http://localhost:3000**

If you need to restart:
```powershell
cd c:\Users\alaay\Desktop\playstation-shop\my-playstation-app
npm run dev
```

### 3. Test the Application

1. **Open browser**: http://localhost:3000
2. **Add a Player**: Click "Players" → Fill form → Create
3. **Add a Game**: Click "Games" → Enter title, pricing, price → Create
4. **Add PlayStation**: Click "PlayStations" → Enter name/model → Create
5. **Start a Session**: Click "Start" button → Select player & game → Start
6. **Stop a Session**: Click "Stop" button → Session recorded with calculated price
7. **View Stats**: Click "Stats" → See daily/monthly summaries

## 📁 Project Structure

```
my-playstation-app/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── games/              
│   │   │   ├── route.ts        # GET, POST /api/games
│   │   │   └── [id]/route.ts   # GET, PUT, DELETE /api/games/:id
│   │   ├── players/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── playstations/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── [id]/start/route.ts  # Start session
│   │   │   └── [id]/stop/route.ts   # Stop session
│   │   └── sessions/
│   │       └── route.ts
│   ├── games/page.tsx          # Games management page
│   ├── players/page.tsx        # Players management page
│   ├── playstations/page.tsx   # PlayStations + session control
│   ├── sessions/page.tsx       # Session history
│   ├── stats/page.tsx          # Statistics dashboard
│   ├── layout.tsx              # Root layout with sidebar
│   └── page.tsx                # Home page
├── components/
│   └── Sidebar.tsx             # Navigation menu
├── lib/
│   ├── models/                 # Mongoose schemas
│   │   ├── Player.ts
│   │   ├── Game.ts
│   │   ├── PlayStation.ts
│   │   └── Session.ts
│   ├── services/               # Business logic layer
│   │   ├── playerService.ts
│   │   ├── gameService.ts
│   │   ├── playstationService.ts
│   │   └── sessionService.ts
│   └── mongoose.ts             # DB connection
├── .env.local                  # Environment variables
├── package.json
└── README.md                   # Full documentation
```

## 🎮 Usage Flow

### Typical Session Workflow:

1. **Setup** (one-time):
   - Add players to the database
   - Add games with pricing rules
   - Register PlayStation consoles

2. **Customer Arrives**:
   - Go to PlayStations page
   - Click "Start" on available console
   - Select the customer (player)
   - Select the game they want
   - Click "Start" → Session begins, PlayStation marked "occupied"

3. **Customer Leaves**:
   - Click "Stop" on the occupied PlayStation
   - System automatically:
     - Calculates time played
     - Computes price based on game rules
     - Creates session record
     - Frees PlayStation for next customer

4. **End of Day**:
   - Go to Stats page
   - Select today's date
   - View all sessions and total earnings

## 💰 Pricing Examples

### Per Game Pricing
- FIFA costs 1 DT per game
- Play for 10 minutes → 1 DT
- Play for 60 minutes → Still 1 DT

### Per 15 Minutes Pricing
- COD costs 1 DT per 15 minutes
- Play for 10 minutes → 1 DT (rounds up to 1 interval)
- Play for 20 minutes → 2 DT (rounds up to 2 intervals)
- Play for 30 minutes → 2 DT (exactly 2 intervals)
- Play for 35 minutes → 3 DT (rounds up to 3 intervals)

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: MongoNetworkError
```
**Solution**: 
- Check if MongoDB is running locally
- Verify MONGODB_URI in `.env.local`
- For Atlas: Check IP whitelist and credentials

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**:
```powershell
# Kill process on port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
npm run dev
```

### TypeScript Errors
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

## 🎨 Customization Ideas

- Add user authentication (NextAuth.js)
- Upload game images to Cloudinary
- Add charts with recharts or chart.js
- Export reports to PDF
- Real-time updates with Pusher or WebSockets
- Add loyalty points for players
- Implement reservation system
- Add inventory management for snacks/drinks

## 📝 Notes

- All times are stored in UTC
- Prices are in DT (Tunisian Dinar)
- Sessions are calculated when stopped (not real-time)
- MongoDB connection uses global caching for performance
- All API routes include error handling

## ✨ Key Features

✅ **Clean Architecture**: Services layer separates business logic from API routes
✅ **Type Safety**: Full TypeScript with proper types for all models
✅ **Optimistic Updates**: Forms provide immediate feedback
✅ **Responsive Design**: Works on desktop and mobile
✅ **Error Handling**: All API routes handle errors gracefully
✅ **Modern Stack**: Next.js 14 App Router with React Server Components where beneficial

---

**Status**: ✅ **READY TO USE**

Open http://localhost:3000 and start managing your PlayStation shop!
