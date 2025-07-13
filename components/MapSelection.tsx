import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useStore } from '../lib/store';
import { getMaps, handleApiError } from '../lib/api';
import { MapPin, Calendar, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const MapSelection: React.FC = () => {
    const {
        maps,
        selectedMap,
        selectedDay,
        loading,
        error,
        setMaps,
        setSelectedMap,
        setSelectedDay,
        setCurrentPage,
        setLoading,
        setError,
    } = useStore();

    const [dayInput, setDayInput] = useState(selectedDay.toString());

    // Keep dayInput in sync with selectedDay from store
    useEffect(() => {
        setDayInput(selectedDay.toString());
    }, [selectedDay]);

    useEffect(() => {
        const fetchMaps = async () => {
            setLoading(true);
            setError(null);
            try {
                const mapsData = await getMaps();
                setMaps(mapsData);
            } catch (err) {
                const errorMessage = handleApiError(err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchMaps();
    }, []);

    const handleMapSelect = (map: any) => {
        setSelectedMap(map);
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDayInput(value);

        const dayNum = parseInt(value);
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 60) {
            setSelectedDay(dayNum);
        }
    };

    const handleNext = () => {
        if (selectedMap && selectedDay >= 1 && selectedDay <= 60) {
            setCurrentPage('items');
        }
    };

    const handleReset = () => {
        setSelectedMap(null);
        setSelectedDay(1);
        setError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            const newDay = Math.min(selectedDay + 1, 60);
            setSelectedDay(newDay);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            const newDay = Math.max(selectedDay - 1, 1);
            setSelectedDay(newDay);
        } else if (e.key === 'Home') {
            e.preventDefault();
            setSelectedDay(1);
        } else if (e.key === 'End') {
            e.preventDefault();
            setSelectedDay(60);
        }
    };

    const isValidDay = selectedDay >= 1 && selectedDay <= 60;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading maps...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()} className="w-full">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Missing Items Tracker</h1>
                <p className="text-muted-foreground">
                    Select a hospital wing and day to start tracking missing items
                </p>

            </div>

            {/* Day Selection */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Select Day
                    </CardTitle>
                    <CardDescription>
                        Choose a day between 1-60 for tracking. Use the slider, input field, or preset buttons below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="day-input" className="text-sm font-medium">
                                    Day:
                                </label>
                                <Input
                                    id="day-input"
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={dayInput}
                                    onChange={handleDayChange}
                                    className="w-20"
                                    placeholder="1-60"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    value={selectedDay}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const dayNum = parseInt(value);
                                        setSelectedDay(dayNum);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedDay - 1) / 59) * 100}%, #e5e7eb ${((selectedDay - 1) / 59) * 100}%, #e5e7eb 100%)`
                                    }}
                                    aria-label="Select day"
                                    title="Use arrow keys to navigate, Home/End for min/max"
                                />
                                {/* Day indicator */}
                                <div
                                    className="absolute -top-8 bg-primary text-primary-foreground text-xs px-2 py-1 rounded transform -translate-x-1/2 pointer-events-none"
                                    style={{
                                        left: `${((selectedDay - 1) / 59) * 100}%`
                                    }}
                                >
                                    Day {selectedDay}
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground min-w-[100px]">
                                <span className="font-medium text-primary">Day {selectedDay}</span>
                                <div className="text-xs">of 60 days</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Day 1</span>
                                <span className="mx-2">•</span>
                                <span>Day 60</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDay(1)}
                                >
                                    Day 1
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDay(15)}
                                >
                                    Day 15
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDay(30)}
                                >
                                    Day 30
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDay(60)}
                                >
                                    Day 60
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const randomDay = Math.floor(Math.random() * 60) + 1;
                                        setSelectedDay(randomDay);
                                    }}
                                >
                                    Random
                                </Button>
                            </div>
                        </div>
                    </div>
                    {!isValidDay && (
                        <p className="text-red-500 text-sm mt-2">
                            Please select a day between 1 and 60
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Map Selection */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Select Hospital Wing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {maps.map((map) => (
                        <Card
                            key={map.id}
                            className={`map-card cursor-pointer ${selectedMap?.id === map.id
                                ? 'selected ring-2 ring-primary bg-primary/5'
                                : ''
                                }`}
                            onClick={() => handleMapSelect(map)}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{map.name}</CardTitle>
                                <CardDescription>
                                    Wing ID: {map.id}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Click to select
                                    </span>
                                    {selectedMap?.id === map.id && (
                                        <div className="flex items-center gap-1 text-primary">
                                            <span className="text-sm font-medium">Selected</span>
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        {selectedMap && isValidDay ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-600 font-medium">
                                    Ready: {selectedMap.name} - Day {selectedDay}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-muted-foreground">
                                    {!selectedMap ? 'Select a hospital wing' : 'Select a valid day (1-60)'}
                                </span>
                            </div>
                        )}
                    </div>
                    {(selectedMap || selectedDay !== 1) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset All
                        </Button>
                    )}
                </div>
                <Button
                    onClick={handleNext}
                    disabled={!selectedMap || !isValidDay}
                    className="flex items-center gap-2"
                >
                    Next: Select Items
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default MapSelection; 