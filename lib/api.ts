import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://wmc-wam.onrender.com/api';

// Configure axios with default settings
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request and response interceptors for debugging
api.interceptors.request.use(
    (config) => {
        console.log('🚀 Making API request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('✅ API response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Test connection function
export const testConnection = async (): Promise<boolean> => {
    try {
        const response = await api.get('/maps');
        console.log('🔗 Connection test successful:', response.data);
        return true;
    } catch (error: any) {
        console.error('🔗 Connection test failed:', error);
        return false;
    }
};

// Test with raw fetch (bypassing axios)
export const testRawFetch = async (): Promise<boolean> => {
    try {
        console.log('🧪 Testing raw fetch...');
        const response = await fetch(`${API_BASE_URL}/maps`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🔗 Raw fetch test successful:', data);
        return true;
    } catch (error: any) {
        console.error('🔗 Raw fetch test failed:', error);
        return false;
    }
};

// Test items endpoint with raw fetch
export const testItemsFetch = async (mapId: number = 18, day: number = 1): Promise<boolean> => {
    try {
        console.log(`🧪 Testing items fetch for map ${mapId}, day ${day}...`);
        const url = `${API_BASE_URL}/items/${mapId}/${day}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🔗 Items fetch test successful:', data);
        return true;
    } catch (error: any) {
        console.error('🔗 Items fetch test failed:', error);
        return false;
    }
};

// Make testConnection available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).testConnection = testConnection;
    (window as any).testRawFetch = testRawFetch;
    (window as any).testItemsFetch = testItemsFetch;
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

        // Transform the response to match frontend interface
        const transformedMaps = response.data.map((map: any) => ({
            id: map.map_id,
            name: map.name
        }));

        return transformedMaps;
    } catch (error: any) {
        console.error('Error fetching maps:', error);
        throw new Error('Failed to fetch maps');
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

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).testConnection = testConnection;
    (window as any).testRawFetch = testRawFetch;
    (window as any).testItemsFetch = testItemsFetch;
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

// Test start tracking with debugging
export const testStartTracking = async (mapId: number = 18, day: number = 1, itemIds: number[] = [17340557], daysThreshold: number = 5) => {
    try {
        console.log('🧪 Testing start tracking with:', { mapId, day, itemIds, daysThreshold });

        // Use correct field names that backend expects
        const payload = {
            map_id: mapId,
            day: day,
            selected_items: itemIds,  // ✅ Backend expects 'selected_items' not 'item_ids'
            days_threshold: daysThreshold,
            current_day: day,         // ✅ Backend requires 'current_day'
        };

        console.log('📦 Correct payload (should work!):', payload);

        const response = await fetch(`${API_BASE_URL}/tracking/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📡 Raw response:', responseText);

        if (!response.ok) {
            console.error('❌ Error response:', {
                status: response.status,
                statusText: response.statusText,
                body: responseText
            });
            return false;
        }

        const data = JSON.parse(responseText);
        console.log('✅ SUCCESS! Tracking session created:', data);
        console.log('🎉 Backend is fully working with frontend!');
        return true;

    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
};

// Add to window for debugging
if (typeof window !== 'undefined') {
    (window as any).testStartTracking = testStartTracking;
} 