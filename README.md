# Missing Items Tracker Frontend

A modern, responsive React/Next.js application for tracking missing items in hospital environments with real-time updates and simulation capabilities.

## 🚀 Features

- **Real-time Tracking**: Live updates on item status and missing items
- **Interactive Map Selection**: Choose hospital wings and days for tracking
- **Equipment Type Filtering**: Filter items by equipment type with search functionality
- **Missing Items Alerts**: Real-time notifications when items go missing
- **Simulation Controls**: Move items between locations to test the tracking system
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API server running on `http://localhost:5001`

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd missing-items-tracker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎯 Usage

### 1. Map Selection
- Select a hospital wing from the available options
- Choose a day (1-60) using the slider or input field
- Click "Next: Select Items" to proceed

### 2. Item Selection
- Configure the days threshold for missing item detection
- Filter items by equipment type or search by name
- Select items to track using checkboxes
- Click "Start Tracking" to begin monitoring

### 3. Tracking Dashboard
- View real-time status of all tracked items
- Monitor missing items with live alerts
- Use simulation controls to move items between locations
- Stop tracking when finished

## 🔌 API Integration

The frontend integrates with the backend API through the following endpoints:

- `GET /api/maps` - Fetch available hospital wings
- `GET /api/items/{mapId}/{day}` - Get items for a specific map and day
- `POST /api/start-tracking` - Start a new tracking session
- `POST /api/stop-tracking` - Stop an active tracking session
- `GET /api/session-status/{sessionId}` - Get session status
- `GET /api/missing-items/{sessionId}` - Get missing items
- `POST /api/move-item` - Move an item (simulation)
- `GET /api/sessions` - Get all sessions

## 🏗️ Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── MapSelection.tsx    # Map selection component
│   ├── ItemSelection.tsx   # Item selection component
│   └── TrackingDashboard.tsx # Tracking dashboard
├── lib/
│   ├── api.ts              # API integration layer
│   ├── store.ts            # Zustand store
│   └── utils.ts            # Utility functions
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Styling

The application uses Tailwind CSS for styling with a custom color palette:
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)

Custom CSS classes are defined in `globals.css` for item cards, status badges, and equipment tabs.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔄 Real-time Updates

The application uses polling to provide real-time updates:
- Session status: Updated every 2 seconds
- Missing items: Updated every 3 seconds
- Automatic cleanup when tracking stops

## 🧪 Simulation Features

The tracking dashboard includes simulation controls to:
- Move items between different hospital wings
- Test the missing item detection logic
- Simulate real-world scenarios

## 🛡️ Error Handling

Comprehensive error handling includes:
- Network error handling
- API response validation
- User-friendly error messages
- Graceful fallbacks

## 📊 Performance Optimizations

- React.memo for component optimization
- useMemo and useCallback for expensive computations
- Efficient state management with Zustand
- Optimized re-renders with selective subscriptions

## 🔧 Configuration

The API base URL can be configured in `lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5001/api';
```

## 🚨 Known Issues

- Items marked as missing may take up to 3 seconds to appear due to polling interval
- Large item lists (>1000 items) may cause performance issues
- Real-time updates stop when the browser tab is not active

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔄 Updates

The application automatically polls for updates but can be manually refreshed using the browser's refresh button. 
