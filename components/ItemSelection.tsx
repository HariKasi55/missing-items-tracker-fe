import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '../lib/store';
import { getItems, getItemsRaw, startTracking, startTrackingMock, handleApiError, getMaps, testHealthCheck, testGetItems } from '../lib/api';
import {
    Package,
    Search,
    CheckCircle2,
    Circle,
    ArrowLeft,
    Play,
    Loader2,
    Settings,
    Filter
} from 'lucide-react';

const ItemSelection: React.FC = () => {
    const {
        selectedMap,
        selectedDay,
        items,
        selectedItems,
        daysThreshold,
        selectedEquipmentType,
        searchTerm,
        loading,
        error,
        setItems,
        setSelectedItems,
        setDaysThreshold,
        setSelectedEquipmentType,
        setSearchTerm,
        setCurrentPage,
        setLoading,
        setError,
        setCurrentSession,
        setIsTracking,
        toggleItemSelection,
        clearSelection,
        getFilteredItems,
        getEquipmentTypes,
        getSelectedItemsCount,
    } = useStore();

    const [thresholdInput, setThresholdInput] = useState(daysThreshold.toString());
    const [isStarting, setIsStarting] = useState(false);

    const equipmentTypes = useMemo(() => getEquipmentTypes(), [items]);
    const filteredItems = useMemo(() => getFilteredItems(), [items, selectedEquipmentType, searchTerm]);
    const selectedItemsCount = useMemo(() => getSelectedItemsCount(), [selectedItems]);

    useEffect(() => {
        const fetchItems = async () => {
            if (!selectedMap || !selectedDay) return;

            setLoading(true);
            setError(null);
            try {
                console.log('🔍 Attempting to fetch items...');
                const itemsData = await getItems(selectedMap.id, selectedDay);
                setItems(itemsData);
                console.log('✅ Items loaded successfully');
            } catch (err) {
                console.error('❌ getItems failed, trying raw fetch:', err);

                // Try raw fetch as fallback
                try {
                    console.log('🔄 Attempting raw fetch fallback...');
                    const itemsData = await getItemsRaw(selectedMap.id, selectedDay);
                    setItems(itemsData);
                    console.log('✅ Raw fetch fallback succeeded');
                    setError(null);
                } catch (fallbackErr) {
                    console.error('❌ Both methods failed:', fallbackErr);
                    const errorMessage = handleApiError(err);
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [selectedMap, selectedDay]);

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setThresholdInput(value);

        const threshold = parseInt(value);
        if (!isNaN(threshold) && threshold >= 1 && threshold <= 30) {
            setDaysThreshold(threshold);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectAll = () => {
        const allIds = filteredItems.map(item => item.id);
        setSelectedItems(allIds);
    };

    const handleDeselectAll = () => {
        clearSelection();
    };

    const handleStartTracking = async () => {
        if (!selectedMap || selectedItems.length === 0) return;

        setIsStarting(true);
        setError(null);

        try {
            const session = await startTracking(
                selectedMap.id,
                selectedDay,
                selectedItems,
                daysThreshold
            );
            setCurrentSession(session);
            setIsTracking(true);
            setCurrentPage('tracking');
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
        } finally {
            setIsStarting(false);
        }
    };

    const handleBack = () => {
        setCurrentPage('maps');
    };

    const isValidThreshold = daysThreshold >= 1 && daysThreshold <= 30;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading items...</span>
                </div>
            </div>
        );
    }

    const testBackendConnection = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🧪 Testing backend connection...');

            // Test with all methods
            console.log('1. Testing raw fetch...');
            const rawFetchWorking = await testHealthCheck();

            console.log('2. Testing items fetch...');
            const itemsFetchWorking = await testGetItems(selectedMap?.id, selectedDay);

            console.log('3. Testing raw items fetch...');
            if (selectedMap && selectedDay) {
                const rawItemsData = await getItemsRaw(selectedMap.id, selectedDay);
                setItems(rawItemsData);
                setError(null);
                console.log('✅ All tests passed - items loaded');
            }
        } catch (err) {
            console.error('❌ Connection test failed:', err);
            setError('Backend server is not responding. Please check if the API server is accessible.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card className="w-full max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle className="text-red-600">Connection Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">{error}</p>

                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">🔍 Debug Information:</h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p>• API Base URL: <code>{process.env.NEXT_PUBLIC_API_BASE_URL || 'https://wmc-wam.onrender.com/api'}</code></p>
                                    <p>• Selected Map: {selectedMap?.name} (ID: {selectedMap?.id})</p>
                                    <p>• Selected Day: {selectedDay}</p>
                                    <p>• Selected Items: {selectedItems.length} items</p>
                                    <p>• Days Threshold: {daysThreshold}</p>
                                    <p>• Check your browser console for more details</p>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium text-yellow-800 mb-2">💡 Troubleshooting:</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>1. ✅ <strong>Connection working</strong> - Frontend can reach backend</li>
                                    <li>2. ❌ <strong>Backend error</strong> - Python logic error in tracking start</li>
                                    <li>3. Check if all required fields are properly sent</li>
                                    <li>4. Verify backend handles the tracking request correctly</li>
                                    <li>5. Try with different items or parameters</li>
                                    <li>6. Check backend logs for more details</li>
                                </ul>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleBack} variant="outline" className="flex-1">
                                    Back
                                </Button>
                                <Button onClick={testBackendConnection} className="flex-1" disabled={loading}>
                                    Test Connection
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (!selectedMap || selectedItems.length === 0) return;

                                        setIsStarting(true);
                                        try {
                                            const session = await startTrackingMock(
                                                selectedMap.id,
                                                selectedDay,
                                                selectedItems,
                                                daysThreshold
                                            );
                                            setCurrentSession(session);
                                            setIsTracking(true);
                                            setCurrentPage('tracking');
                                        } catch (err) {
                                            console.error('Mock tracking failed:', err);
                                        } finally {
                                            setIsStarting(false);
                                        }
                                    }}
                                    className="flex-1"
                                    disabled={selectedItems.length === 0 || loading}
                                >
                                    Try Mock Tracking
                                </Button>
                                <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                                    Reload Page
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
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
                <h1 className="text-3xl font-bold mb-2">Select Items to Track</h1>
                <p className="text-muted-foreground">
                    {selectedMap?.name} - Day {selectedDay} | {items.length} items available
                </p>
            </div>

            {/* Configuration */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Tracking Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <label htmlFor="threshold-input" className="text-sm font-medium">
                                Days Threshold:
                            </label>
                            <Input
                                id="threshold-input"
                                type="number"
                                min="1"
                                max="30"
                                value={thresholdInput}
                                onChange={handleThresholdChange}
                                className="w-20"
                                placeholder="1-30"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Selected: {selectedItemsCount} items
                            </span>
                        </div>
                    </div>
                    {!isValidThreshold && (
                        <p className="text-red-500 text-sm mt-2">
                            Please select a threshold between 1 and 30 days
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Equipment Type Tabs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Equipment Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {equipmentTypes.map((type) => (
                            <Button
                                key={type}
                                variant={selectedEquipmentType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedEquipmentType(type)}
                                className="text-sm"
                            >
                                {type}
                                {type !== 'All' && (
                                    <span className="ml-1 text-xs opacity-60">
                                        ({items.filter(item => item.equipment_type === type).length})
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Items List */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Items ({filteredItems.length})
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                disabled={filteredItems.length === 0}
                            >
                                Select All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeselectAll}
                                disabled={selectedItems.length === 0}
                            >
                                Deselect All
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No items found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`item-card ${selectedItems.includes(item.id) ? 'selected' : ''
                                            }`}
                                        onClick={() => toggleItemSelection(item.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                {selectedItems.includes(item.id) ? (
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {item.equipment_type}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Location: {item.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Start Tracking Button */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {selectedItemsCount > 0 ? (
                        <span>
                            {selectedItemsCount} items selected for tracking with {daysThreshold} day threshold
                        </span>
                    ) : (
                        <span>Please select items to track</span>
                    )}
                </div>
                <Button
                    onClick={handleStartTracking}
                    disabled={selectedItems.length === 0 || !isValidThreshold || isStarting}
                    className="flex items-center gap-2"
                >
                    {isStarting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Starting...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            Start Tracking
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default ItemSelection; 