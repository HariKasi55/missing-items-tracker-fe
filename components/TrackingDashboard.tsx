import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '../lib/store';
import {
    getSessionStatus,
    getMissingItems,
    stopTracking,
    moveItem,
    getMaps,
    handleApiError,
    pollSessionStatus,
    pollMissingItems,
    MAP_IDS
} from '../lib/api';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Package,
    Play,
    Square,
    Settings,
    RefreshCw,
    ArrowLeft,
    Zap,
    MapPin,
    Timer,
    Target,
    Loader2,
    Calendar
} from 'lucide-react';
import { formatDate, formatTime, getStatusColor, getStatusIcon } from '../lib/utils';
import Image from 'next/image';
import { getEquipmentTypeIconPath } from '../lib/equipmentIcons';

const TrackingDashboard: React.FC = () => {
    const {
        currentSession,
        sessionStatus,
        missingItems,
        selectedMap,
        selectedDay,
        daysThreshold,
        maps,
        loading,
        error,
        isTracking,
        showSimulation,
        setSessionStatus,
        setMissingItems,
        setCurrentSession,
        setIsTracking,
        setShowSimulation,
        setCurrentPage,
        setLoading,
        setError,
        setMaps,
    } = useStore();

    const [pollStoppers, setPollStoppers] = useState<(() => void)[]>([]);
    const [selectedItemForMove, setSelectedItemForMove] = useState<number | null>(null);
    const [selectedTargetMap, setSelectedTargetMap] = useState<number | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [isStopping, setStopping] = useState(false);
    const [alertsVisible, setAlertsVisible] = useState(true);

    // Initialize polling for real-time updates
    useEffect(() => {
        if (!currentSession?.session_id || !isTracking) return;

        const statusPoller = pollSessionStatus(currentSession.session_id, (status) => {
            setSessionStatus(status);
        });

        const missingItemsPoller = pollMissingItems(currentSession.session_id, (missing) => {
            setMissingItems(missing);
        });

        setPollStoppers([statusPoller, missingItemsPoller]);

        return () => {
            statusPoller();
            missingItemsPoller();
        };
    }, [currentSession, isTracking]);

    // Load maps for simulation
    useEffect(() => {
        const fetchMaps = async () => {
            try {
                const mapsData = await getMaps();
                setMaps(mapsData);
            } catch (err) {
                console.error('Error loading maps:', err);
            }
        };

        if (maps.length === 0) {
            fetchMaps();
        }
    }, []);

    const handleStopTracking = async () => {
        if (!currentSession?.session_id) return;

        setStopping(true);
        setError(null);

        try {
            await stopTracking(currentSession.session_id);
            setIsTracking(false);
            setCurrentSession(null);
            setSessionStatus(null);
            setMissingItems(null);

            // Stop polling
            pollStoppers.forEach(stop => stop());
            setPollStoppers([]);

            setCurrentPage('maps');
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
        } finally {
            setStopping(false);
        }
    };

    const handleMoveItem = async () => {
        if (!selectedItemForMove || !selectedTargetMap) return;

        setIsMoving(true);
        setError(null);

        try {
            await moveItem(selectedItemForMove, selectedTargetMap);
            setSelectedItemForMove(null);
            setSelectedTargetMap(null);

            // Force refresh of status
            if (currentSession?.session_id) {
                const status = await getSessionStatus(currentSession.session_id);
                setSessionStatus(status);
                const missing = await getMissingItems(currentSession.session_id);
                setMissingItems(missing);
            }
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
        } finally {
            setIsMoving(false);
        }
    };

    const handleBack = () => {
        // Stop polling
        pollStoppers.forEach(stop => stop());
        setPollStoppers([]);

        setCurrentPage('maps');
    };

    const trackingStats = useMemo(() => {
        if (!sessionStatus) return null;

        return {
            total: sessionStatus.total_items,
            tracking: sessionStatus.tracked_items,
            missing: sessionStatus.missing_items,
            found: sessionStatus.found_items,
        };
    }, [sessionStatus]);

    const missingItemsCount = useMemo(() => {
        return missingItems?.total_missing || 0;
    }, [missingItems]);

    const trackedItems = useMemo(() => {
        return sessionStatus?.items || [];
    }, [sessionStatus]);

    const missingItemsList = useMemo(() => {
        return missingItems?.missing_items || [];
    }, [missingItems]);

    if (!currentSession) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>No Active Session</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            No tracking session is currently active.
                        </p>
                        <Button onClick={() => setCurrentPage('maps')} className="w-full">
                            Start New Session
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-600 font-medium">Live Tracking</span>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleStopTracking}
                            disabled={isStopping}
                            className="flex items-center gap-2"
                        >
                            {isStopping ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Stopping...
                                </>
                            ) : (
                                <>
                                    <Square className="h-4 w-4" />
                                    Stop Tracking
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">Tracking Dashboard</h1>
                <p className="text-muted-foreground">
                    {selectedMap?.name} - Day {selectedDay} | Session: {currentSession.session_id}
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Card className="mb-6 border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4" />
                            Total Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{trackingStats?.total || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-blue-500" />
                            Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{trackingStats?.tracking || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Missing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{trackingStats?.missing || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{trackingStats?.found || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Missing Items Alert */}
            {missingItemsCount > 0 && alertsVisible && (
                <Card className="mb-6 border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Missing Items Alert
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAlertsVisible(false)}
                            >
                                ×
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600 mb-4">
                            {missingItemsCount} items are currently missing from their assigned locations!
                        </p>
                        <div className="space-y-2">
                            {missingItemsList.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-muted-foreground">({item.equipment_type})</span>
                                    {item.missing_since && (
                                        <span className="text-red-500">
                                            Missing since: {formatTime(item.missing_since)}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {missingItemsCount > 3 && (
                                <p className="text-sm text-muted-foreground">
                                    And {missingItemsCount - 3} more items...
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Configuration Info */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Session Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">{selectedMap?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Day</p>
                                <p className="text-sm text-muted-foreground">{selectedDay}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Threshold</p>
                                <p className="text-sm text-muted-foreground">{daysThreshold} days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Started</p>
                                <p className="text-sm text-muted-foreground">
                                    {currentSession.created_at && formatTime(currentSession.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Simulation Controls */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Simulation Controls
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSimulation(!showSimulation)}
                        >
                            {showSimulation ? 'Hide' : 'Show'} Controls
                        </Button>
                    </CardTitle>
                </CardHeader>
                {showSimulation && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Select Item to Move:</label>
                                    <select
                                        value={selectedItemForMove || ''}
                                        onChange={(e) => setSelectedItemForMove(Number(e.target.value) || null)}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    >
                                        <option value="">Choose an item...</option>
                                        {trackedItems.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.equipment_type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Move to Location:</label>
                                    <select
                                        value={selectedTargetMap || ''}
                                        onChange={(e) => setSelectedTargetMap(Number(e.target.value) || null)}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    >
                                        <option value="">Choose a location...</option>
                                        {maps.map((map) => (
                                            <option key={map.id} value={map.id}>
                                                {map.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleMoveItem}
                                        disabled={!selectedItemForMove || !selectedTargetMap || isMoving}
                                        className="flex items-center gap-2"
                                    >
                                        {isMoving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Moving...
                                            </>
                                        ) : (
                                            <>
                                                <Target className="h-4 w-4" />
                                                Move Item
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Use these controls to simulate moving items between locations to test the tracking system.
                            </p>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Items List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Tracked Items ({trackedItems.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {trackedItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No items being tracked</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {trackedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-4 border rounded-lg ${item.status === 'missing' ? 'border-red-200 bg-red-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-lg">{getStatusIcon(item.status)}</div>
                                            <div>
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {(() => {
                                                        const iconPath = getEquipmentTypeIconPath(item.equipment_type);
                                                        return <><Image src={iconPath} alt={item.equipment_type + ' icon'} width={16} height={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: 4, objectFit: 'contain'}} />{item.equipment_type}</>;
                                                    })()} • {item.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`status-badge ${item.status}`}>
                                                {item.status}
                                            </div>
                                            {item.status === 'missing' && item.missing_since && (
                                                <span className="text-sm text-red-500">
                                                    Missing since: {formatTime(item.missing_since)}
                                                </span>
                                            )}
                                            {item.last_seen && (
                                                <span className="text-sm text-muted-foreground">
                                                    Last seen: {formatTime(item.last_seen)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TrackingDashboard; 