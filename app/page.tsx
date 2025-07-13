'use client';

import React from 'react';
import { useStore } from '../lib/store';
import MapSelection from '../components/MapSelection';
import ItemSelection from '../components/ItemSelection';
import TrackingDashboard from '../components/TrackingDashboard';

const HomePage: React.FC = () => {
    const { currentPage } = useStore();

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'maps':
                return <MapSelection />;
            case 'items':
                return <ItemSelection />;
            case 'tracking':
                return <TrackingDashboard />;
            default:
                return <MapSelection />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {renderCurrentPage()}
        </div>
    );
};

export default HomePage; 