import axios from 'axios';

// Updated API Base URL to match backend specification
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Configure axios with default settings
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Increased timeout for production
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request and response interceptors for debugging
api.interceptors.request.use(
    (config) => {
        console.log('🚀 Making API request:', config.method?.toUpperCase(), `${API_BASE_URL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('✅ API response:', response.status, `${API_BASE_URL}${response.config.url}`);
        console.log('📦 Response data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.data || error.message);
        if (error.response?.status === 500) {
            console.error('🔥 Server error - check backend logs');
        } else if (error.response?.status === 404) {
            console.error('🔍 Endpoint not found - check API URL');
        } else if (error.response?.status >= 400 && error.response?.status < 500) {
            console.error('📝 Client error - check request format');
        }
        return Promise.reject(error);
    }
);

// Health Check Test
export const testHealthCheck = async (): Promise<boolean> => {
    try {
        console.log('🏥 Testing health check...');
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Health check successful:', data);
        return true;
    } catch (error: any) {
        console.error('❌ Health check failed:', error);
        return false;
    }
};

// Test Items Endpoint
export const testGetItems = async (mapId: number = 18, day: number = 1): Promise<boolean> => {
    try {
        console.log(`🧪 Testing get items for map ${mapId}, day ${day}...`);
        const url = `${API_BASE_URL}/items/${mapId}/${day}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Get items test successful:', data);
        return true;
    } catch (error: any) {
        console.error('❌ Get items test failed:', error);
        return false;
    }
};

// Test Start Tracking
export const testStartTracking = async (): Promise<boolean> => {
    try {
        console.log('🎯 Testing start tracking...');
        const testPayload = {
            map_id: 18,
            day: 1,
            selected_items: [1, 2, 3],
            days_threshold: 3
        };

        const response = await fetch(`${API_BASE_URL}/tracking/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Start tracking test successful:', data);
        return true;
    } catch (error: any) {
        console.error('❌ Start tracking test failed:', error);
        return false;
    }
};

// Test Get Missing Items
export const testGetMissingItems = async (sessionId: string = 'test-session'): Promise<boolean> => {
    try {
        console.log(`🔍 Testing get missing items for session ${sessionId}...`);
        const url = `${API_BASE_URL}/missing-items/${sessionId}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Get missing items test successful:', data);
        return true;
    } catch (error: any) {
        console.error('❌ Get missing items test failed:', error);
        return false;
    }
};

// Comprehensive connection test
export const testAllEndpoints = async (): Promise<void> => {
    console.log('🧪 Running comprehensive API tests...');

    const tests = [
        { name: 'Health Check', test: testHealthCheck },
        { name: 'Get Items', test: () => testGetItems(18, 1) },
        { name: 'Start Tracking', test: testStartTracking },
        { name: 'Get Missing Items', test: () => testGetMissingItems('test-session') },
    ];

    for (const { name, test } of tests) {
        console.log(`\n--- Testing ${name} ---`);
        try {
            await test();
        } catch (error) {
            console.error(`❌ ${name} failed:`, error);
        }
    }

    console.log('\n🏁 All tests completed!');
};

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).testHealthCheck = testHealthCheck;
    (window as any).testGetItems = testGetItems;
    (window as any).testStartTracking = testStartTracking;
    (window as any).testGetMissingItems = testGetMissingItems;
    (window as any).testAllEndpoints = testAllEndpoints;
    (window as any).API_BASE_URL = API_BASE_URL;
}

// Types for API responses
export interface Map {
    id: number;
    name: string;
}

export interface Item {
    id: number;
    name: string;
    equipment_type: string;
    location: string;
    status: 'tracking' | 'missing' | 'found';
    last_seen?: string;
    missing_since?: string;
}

export interface TrackingSession {
    session_id: string;
    map_id: number;
    day: number;
    items: number[];
    days_threshold: number;
    created_at: string;
    status: 'active' | 'stopped';
}

export interface SessionStatus {
    session_id: string;
    map_id: number;
    day: number;
    total_items: number;
    tracked_items: number;
    missing_items: number;
    found_items: number;
    items: Item[];
    created_at: string;
    status: 'active' | 'stopped';
}

export interface MissingItemsResponse {
    session_id: string;
    missing_items: Item[];
    total_missing: number;
}

export interface SimulationRequest {
    item_id: number;
    new_map_id: number;
}

// API Functions

// 1. Get all maps
export const getMaps = async (): Promise<Map[]> => {
    try {
        const response = await api.get('/maps');
        console.log('Maps API response:', response.data);

        // Handle new backend format: {"maps": [...]}
        const mapsArray = response.data.maps || response.data;

        // Transform the response to match frontend interface
        const transformedMaps = mapsArray.map((map: any) => ({
            id: map.id || map.map_id, // Handle both id and map_id
            name: map.title || map.name // Handle both title and name
        }));

        console.log('Transformed maps:', transformedMaps);
        return transformedMaps;
    } catch (error: any) {
        console.error('Error fetching maps:', error);
        // Fallback: return mock maps if API call fails
        return [
            { id: 1, name: 'North Wing' },
            { id: 2, name: 'South Wing' },
            { id: 3, name: 'East Wing' },
            { id: 4, name: 'West Wing' }
        ];
    }
};

// 2. Get items for a specific map and day
export const getItems = async (mapId: number, day: number): Promise<Item[]> => {
    try {
        const url = `/items/${mapId}/${day}`;
        console.log(`🔍 Fetching items from: ${API_BASE_URL}${url}`);

        // Try axios first
        const response = await api.get(url);
        console.log('📦 Raw response data:', response.data);

        // Transform the backend response to frontend format
        const equipmentTypes = response.data.equipment_types || {};
        const items: Item[] = [];

        Object.entries(equipmentTypes).forEach(([equipmentType, equipmentItems]) => {
            (equipmentItems as any[]).forEach((item: any) => {
                items.push({
                    id: item.tag_id,
                    name: item.item_title,
                    equipment_type: equipmentType,
                    location: item.current_area,
                    status: 'tracking' as const,
                    last_seen: item.last_seen_time,
                    missing_since: undefined
                });
            });
        });

        console.log(`✅ Transformed ${items.length} items:`, items);
        return items;
    } catch (error: any) {
        console.error('❌ Axios failed, trying raw fetch:', error);

        // Fallback to raw fetch
        try {
            const fetchUrl = `${API_BASE_URL}/items/${mapId}/${day}`;
            console.log(`🔄 Fallback fetch from: ${fetchUrl}`);

            const response = await fetch(fetchUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📦 Raw fetch response data:', data);

            // Transform the backend response to frontend format
            const equipmentTypes = data.equipment_types || {};
            const items: Item[] = [];

            Object.entries(equipmentTypes).forEach(([equipmentType, equipmentItems]) => {
                (equipmentItems as any[]).forEach((item: any) => {
                    items.push({
                        id: item.tag_id,
                        name: item.item_title,
                        equipment_type: equipmentType,
                        location: item.current_area,
                        status: 'tracking' as const,
                        last_seen: item.last_seen_time,
                        missing_since: undefined
                    });
                });
            });

            console.log(`✅ Fallback transformed ${items.length} items:`, items);
            return items;
        } catch (fetchError: any) {
            console.error('❌ Both axios and fetch failed:', {
                axiosError: error.message,
                fetchError: fetchError.message,
                url: `${API_BASE_URL}/items/${mapId}/${day}`
            });
            throw new Error(`Failed to fetch items: ${fetchError.message}`);
        }
    }
};

// Pure fetch version (no axios)
export const getItemsRaw = async (mapId: number, day: number): Promise<Item[]> => {
    try {
        const url = `${API_BASE_URL}/items/${mapId}/${day}`;
        console.log(`🔍 Raw fetch from: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Raw fetch response:', data);

        // Transform the backend response to frontend format
        const equipmentTypes = data.equipment_types || {};
        const items: Item[] = [];

        Object.entries(equipmentTypes).forEach(([equipmentType, equipmentItems]) => {
            (equipmentItems as any[]).forEach((item: any) => {
                items.push({
                    id: item.tag_id,
                    name: item.item_title,
                    equipment_type: equipmentType,
                    location: item.current_area,
                    status: 'tracking' as const,
                    last_seen: item.last_seen_time,
                    missing_since: undefined
                });
            });
        });

        console.log(`✅ Raw fetch transformed ${items.length} items`);
        return items;
    } catch (error: any) {
        console.error('❌ Raw fetch failed:', error);
        throw new Error(`Raw fetch failed: ${error.message}`);
    }
};

// Legacy function names for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).getItemsRaw = getItemsRaw;
}

// 3. Start tracking session
export const startTracking = async (
    mapId: number,
    day: number,
    itemIds: number[],
    daysThreshold: number
): Promise<TrackingSession> => {
    try {
        console.log('🚀 Starting tracking session...', { mapId, day, itemIds, daysThreshold });

        // Use correct field names that backend expects
        const payload = {
            map_id: mapId,
            day: day,
            selected_items: itemIds,  // ✅ Backend expects 'selected_items' not 'item_ids'
            days_threshold: daysThreshold,
            current_day: day,         // ✅ Backend requires 'current_day'
        };

        console.log('📦 Payload with correct field names:', payload);

        const response = await api.post('/tracking/start', payload);
        console.log('✅ Tracking session started:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Axios tracking failed, trying raw fetch:', error);

        // Fallback to raw fetch with correct field names
        try {
            const url = `${API_BASE_URL}/tracking/start`;
            console.log('🔄 Fallback tracking request to:', url);

            const payload = {
                map_id: mapId,
                day: day,
                selected_items: itemIds,  // ✅ Backend expects 'selected_items'
                days_threshold: daysThreshold,
                current_day: day,         // ✅ Backend requires 'current_day'
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Raw fetch tracking successful:', data);
            return data;
        } catch (fetchError: any) {
            console.error('❌ Both axios and fetch tracking failed:', {
                axiosError: error.message,
                fetchError: fetchError.message,
            });
            throw new Error(`Failed to start tracking: ${fetchError.message}`);
        }
    }
};

// Mock tracking function as temporary workaround
export const startTrackingMock = async (
    mapId: number,
    day: number,
    itemIds: number[],
    daysThreshold: number
): Promise<TrackingSession> => {
    console.log('🎭 Using mock tracking (backend has Python error)');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockSession: TrackingSession = {
        session_id: `mock_${Date.now()}`,
        map_id: mapId,
        day: day,
        items: itemIds,
        days_threshold: daysThreshold,
        created_at: new Date().toISOString(),
        status: 'active'
    };

    console.log('✅ Mock tracking session created:', mockSession);
    return mockSession;
};

// Add mock function to window for testing
if (typeof window !== 'undefined') {
    (window as any).startTrackingMock = startTrackingMock;
}

// Raw fetch version for testing
export const startTrackingRaw = async (
    mapId: number,
    day: number,
    itemIds: number[],
    daysThreshold: number
): Promise<TrackingSession> => {
    try {
        const url = `${API_BASE_URL}/tracking/start`;
        console.log('🚀 Raw tracking request to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                map_id: mapId,
                day: day,
                item_ids: itemIds,
                days_threshold: daysThreshold,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Raw tracking successful:', data);
        return data;
    } catch (error: any) {
        console.error('❌ Raw tracking failed:', error);
        throw new Error(`Raw tracking failed: ${error.message}`);
    }
};

// Add startTrackingRaw to window for debugging
if (typeof window !== 'undefined') {
    (window as any).startTrackingRaw = startTrackingRaw;
}

// 4. Stop tracking session
export const stopTracking = async (sessionId: string): Promise<{ message: string }> => {
    try {
        console.log('🛑 Stopping tracking session:', sessionId);
        const response = await api.delete('/tracking/stop', {
            data: { session_id: sessionId }
        });
        console.log('✅ Tracking session stopped:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Axios stop tracking failed, trying raw fetch:', error);

        // Fallback to raw fetch
        try {
            const url = `${API_BASE_URL}/tracking/stop`;
            console.log('🔄 Fallback stop tracking request to:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Raw fetch stop tracking successful:', data);
            return data;
        } catch (fetchError: any) {
            console.error('❌ Both axios and fetch stop tracking failed:', {
                axiosError: error.message,
                fetchError: fetchError.message,
            });
            throw new Error(`Failed to stop tracking: ${fetchError.message}`);
        }
    }
};

// 5. Get session status
export const getSessionStatus = async (sessionId: string): Promise<SessionStatus> => {
    try {
        const response = await api.get(`/session-status/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching session status:', error);
        throw new Error('Failed to fetch session status');
    }
};

// 6. Get missing items for a session
export const getMissingItems = async (sessionId: string): Promise<MissingItemsResponse> => {
    try {
        const response = await api.get(`/missing-items/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching missing items:', error);
        throw new Error('Failed to fetch missing items');
    }
};

// 7. Move item (for simulation)
export const moveItem = async (itemId: number, newMapId: number): Promise<{ message: string }> => {
    try {
        const response = await api.post('/move-item', {
            item_id: itemId,
            new_map_id: newMapId,
        });
        return response.data;
    } catch (error) {
        console.error('Error moving item:', error);
        throw new Error('Failed to move item');
    }
};

// 8. Get all sessions
export const getAllSessions = async (): Promise<TrackingSession[]> => {
    try {
        const response = await api.get('/sessions');
        return response.data;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw new Error('Failed to fetch sessions');
    }
};

// Utility functions for polling and real-time updates
export const pollSessionStatus = (
    sessionId: string,
    callback: (status: SessionStatus) => void,
    interval: number = 2000
): (() => void) => {
    const intervalId = setInterval(async () => {
        try {
            const status = await getSessionStatus(sessionId);
            callback(status);
        } catch (error) {
            console.error('Error polling session status:', error);
        }
    }, interval);

    return () => clearInterval(intervalId);
};

export const pollMissingItems = (
    sessionId: string,
    callback: (missingItems: MissingItemsResponse) => void,
    interval: number = 3000
): (() => void) => {
    const intervalId = setInterval(async () => {
        try {
            const missingItems = await getMissingItems(sessionId);
            callback(missingItems);
        } catch (error) {
            console.error('Error polling missing items:', error);
        }
    }, interval);

    return () => clearInterval(intervalId);
};

// Error handling helper
export const handleApiError = (error: any): string => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
        // The request was made but no response was received
        return 'No response from server. Please check if the backend is running.';
    } else {
        // Something happened in setting up the request that triggered an Error
        return error.message || 'An unexpected error occurred';
    }
};

// Equipment types constant (based on your data)
export const EQUIPMENT_TYPES = [
    'Telemetry Systems',
    'Module Infusion',
    'Bed East',
    'Pump Infusion',
    'Monitors',
    'Wheelchairs',
    'IV Poles',
    'Crash Carts',
    'Ventilators',
    'Defibrillators',
    'Oxygen Tanks',
    'Wheelchairs',
    'Beds',
    'Stretchers',
    'Other'
] as const;

// Map IDs constant
export const MAP_IDS = {
    'North Wing': 18,
    'South Wing': 20,
    'East Wing': 26,
    'West Wing': 29,
    'Central Wing': 33,
    'Emergency Wing': 34,
} as const;

