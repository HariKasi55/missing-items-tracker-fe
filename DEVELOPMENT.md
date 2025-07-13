# Development Guide

## Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Open in browser**:
```
http://localhost:3000
```

## Backend Requirements

Make sure your backend API is running on `http://localhost:5001` with the following endpoints:

### Required Endpoints:
- `GET /api/maps` - Returns list of hospital wings
- `GET /api/items/{mapId}/{day}` - Returns items for a specific map and day
- `POST /api/start-tracking` - Start tracking session
- `POST /api/stop-tracking` - Stop tracking session
- `GET /api/session-status/{sessionId}` - Get session status
- `GET /api/missing-items/{sessionId}` - Get missing items
- `POST /api/move-item` - Move item (simulation)

### CORS Configuration:
The backend must have CORS enabled for `http://localhost:3000`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Testing the Application

### 1. Map Selection
- Should load and display available hospital wings
- Day slider should work (1-60)
- "Next" button should be enabled only when map and valid day selected

### 2. Item Selection
- Should load items for selected map and day
- Equipment type filtering should work
- Search functionality should filter items
- Item selection with checkboxes should work
- "Start Tracking" should create a new session

### 3. Tracking Dashboard
- Should show real-time status updates
- Missing items alerts should appear
- Simulation controls should move items
- "Stop Tracking" should end the session

## Common Issues

### Backend Not Running
**Error**: "No response from server"
**Solution**: Start your backend server on `http://localhost:5001`

### CORS Errors
**Error**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: Configure CORS in your backend to allow `http://localhost:3000`

### Port Already in Use
**Error**: "Port 3000 is already in use"
**Solution**: Kill the process or use a different port:
```bash
npx kill-port 3000
# or
npm run dev -- --port 3001
```

### Build Errors
**Error**: TypeScript compilation errors
**Solution**: Check the specific error message and fix TypeScript issues

## File Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── MapSelection.tsx  # Map selection page
│   ├── ItemSelection.tsx # Item selection page
│   └── TrackingDashboard.tsx # Tracking dashboard
├── lib/                   # Utility libraries
│   ├── api.ts            # API integration
│   ├── store.ts          # Global state management
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## State Management

The application uses Zustand for state management. The store is defined in `lib/store.ts` and includes:

- Navigation state (current page)
- Selected map and day
- Items and tracking data
- UI state (loading, errors)

## API Integration

All API calls are centralized in `lib/api.ts`:

- Axios instance with timeout and base URL
- Error handling wrapper
- TypeScript interfaces for API responses
- Polling utilities for real-time updates

## Styling

- **Framework**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **Custom styles**: `app/globals.css`
- **Responsive**: Mobile-first approach

## Performance Optimizations

- React.memo for expensive components
- useMemo/useCallback for computed values
- Efficient state selectors
- Optimized re-renders

## Debugging

1. **Check console** for errors
2. **Network tab** for API issues
3. **React DevTools** for component issues
4. **Zustand DevTools** for state debugging

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Or deploy to Vercel:
```bash
npx vercel
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Test on multiple screen sizes
5. Update this guide if needed 