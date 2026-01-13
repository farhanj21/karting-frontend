# Karting Dashboard - Next.js Frontend

A modern, dark-themed dashboard for karting lap time analysis with interactive leaderboards, tier rankings, and data visualizations for Lahore's premier karting tracks.

## Features

- **Interactive Leaderboards**: Real-time rankings with search, filters, and pagination
- **Tier System**: S+ to D tier classification based on z-score analysis
- **Data Visualizations**: Time distribution histograms and tier distribution charts
- **Track Statistics**: World records, percentiles, median times, and more
- **Responsive Design**: Mobile-first design with dark racing theme
- **Real-time Search**: Debounced search with instant results

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Connection string from your MongoDB cluster

## Installation

### 1. Install Dependencies

```bash
cd karting-dashboard
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/karting-analysis?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Ensure Data is Synced

Make sure you've run the Python sync script from the `sportzilla-laptime-analysis` repository to populate the MongoDB database with data.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
karting-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts and theme
│   │   ├── page.tsx            # Home page with track selection
│   │   ├── globals.css         # Global styles and theme
│   │   ├── tracks/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Track leaderboard page
│   │   └── api/
│   │       ├── tracks/         # Track API endpoints
│   │       └── search/         # Search API endpoint
│   ├── components/
│   │   ├── LeaderboardTable.tsx
│   │   ├── TierBadge.tsx
│   │   ├── StatCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TimeDistributionChart.tsx
│   │   └── TierDistributionChart.tsx
│   ├── lib/
│   │   ├── mongodb.ts          # MongoDB connection
│   │   ├── models/             # Mongoose schemas
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── public/
├── package.json
├── tailwind.config.ts          # Tailwind with custom theme
└── tsconfig.json
```

## API Endpoints

### Tracks

- `GET /api/tracks` - List all tracks
- `GET /api/tracks/[slug]` - Get track details
- `GET /api/tracks/[slug]/leaderboard` - Get leaderboard with filters
  - Query params: `page`, `limit`, `search`, `tier`, `sort`
- `GET /api/tracks/[slug]/stats` - Get tier and time distribution

### Search

- `GET /api/search?q=[query]` - Search drivers by name

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/karting-dashboard.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL (e.g., https://karting-dashboard.vercel.app)
5. Click "Deploy"

### 3. Update Environment Variables

After deployment, update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL and redeploy.

## Development

### Building for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize colors:

```typescript
colors: {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  primary: '#ff3333',
  accent: '#00ff88',
  // ... tier colors
}
```

### Tier Thresholds

Tier thresholds are calculated in the Python sync script. To modify tier ranges, edit `scraper/calculations.py` in the analysis repository.

## Troubleshooting

### MongoDB Connection Error

- Verify your `MONGODB_URI` is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure database user has read/write permissions

### No Data Displayed

- Ensure the Python sync script has run successfully
- Check that data exists in MongoDB collections: `tracks`, `drivers`, `laprecords`
- Verify collection names match in Mongoose models

### Build Errors

- Clear Next.js cache: `rm -rf .next`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Contributing

When adding new features:

1. Keep the dark racing theme consistent
2. Ensure mobile responsiveness
3. Use TypeScript for type safety
4. Follow existing component patterns
5. Test with real MongoDB data

## License

MIT

## Credits

- Built with Next.js and MongoDB
- Data sourced from RaceFacer
- Racing theme inspired by motorsport aesthetics
