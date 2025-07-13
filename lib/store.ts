import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Map, Item, TrackingSession, SessionStatus, MissingItemsResponse } from './api';

interface AppState {
    // Navigation state
    currentPage: 'maps' | 'items' | 'tracking';
    selectedMap: Map | null;
    selectedDay: number;
    selectedItems: number[];
    daysThreshold: number;

    // Data state
    maps: Map[];
    items: Item[];
    sessions: TrackingSession[];
    currentSession: TrackingSession | null;
    sessionStatus: SessionStatus | null;
    missingItems: MissingItemsResponse | null;

    // UI state
    loading: boolean;
    error: string | null;
    isTracking: boolean;
    showSimulation: boolean;
    selectedEquipmentType: string;
    searchTerm: string;

    // Actions
    setCurrentPage: (page: 'maps' | 'items' | 'tracking') => void;
    setSelectedMap: (map: Map | null) => void;
    setSelectedDay: (day: number) => void;
    setSelectedItems: (items: number[]) => void;
    setDaysThreshold: (threshold: number) => void;

    // Data actions
    setMaps: (maps: Map[]) => void;
    setItems: (items: Item[]) => void;
    setSessions: (sessions: TrackingSession[]) => void;
    setCurrentSession: (session: TrackingSession | null) => void;
    setSessionStatus: (status: SessionStatus | null) => void;
    setMissingItems: (missingItems: MissingItemsResponse | null) => void;

    // UI actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setIsTracking: (isTracking: boolean) => void;
    setShowSimulation: (show: boolean) => void;
    setSelectedEquipmentType: (type: string) => void;
    setSearchTerm: (term: string) => void;

    // Utility actions
    toggleItemSelection: (itemId: number) => void;
    clearSelection: () => void;
    resetState: () => void;

    // Computed getters
    getSelectedItemsCount: () => number;
    getItemsByEquipmentType: (type: string) => Item[];
    getFilteredItems: () => Item[];
    getEquipmentTypes: () => string[];
    getMissingItemsCount: () => number;
    getTrackingItemsCount: () => number;
}

const initialState = {
    // Navigation state
    currentPage: 'maps' as const,
    selectedMap: null,
    selectedDay: 1,
    selectedItems: [] as number[],
    daysThreshold: 3,

    // Data state
    maps: [] as Map[],
    items: [] as Item[],
    sessions: [] as TrackingSession[],
    currentSession: null,
    sessionStatus: null,
    missingItems: null,

    // UI state
    loading: false,
    error: null,
    isTracking: false,
    showSimulation: false,
    selectedEquipmentType: 'All',
    searchTerm: '',
};

export const useStore = create<AppState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Navigation actions
            setCurrentPage: (page) => set({ currentPage: page }),
            setSelectedMap: (map) => set({ selectedMap: map }),
            setSelectedDay: (day) => set({ selectedDay: day }),
            setSelectedItems: (items) => set({ selectedItems: items }),
            setDaysThreshold: (threshold) => set({ daysThreshold: threshold }),

            // Data actions
            setMaps: (maps) => set({ maps }),
            setItems: (items) => set({ items }),
            setSessions: (sessions) => set({ sessions }),
            setCurrentSession: (session) => set({ currentSession: session }),
            setSessionStatus: (status) => set({ sessionStatus: status }),
            setMissingItems: (missingItems) => set({ missingItems }),

            // UI actions
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            setIsTracking: (isTracking) => set({ isTracking }),
            setShowSimulation: (show) => set({ showSimulation: show }),
            setSelectedEquipmentType: (type) => set({ selectedEquipmentType: type }),
            setSearchTerm: (term) => set({ searchTerm: term }),

            // Utility actions
            toggleItemSelection: (itemId) => {
                const currentItems = get().selectedItems;
                const newItems = currentItems.includes(itemId)
                    ? currentItems.filter(id => id !== itemId)
                    : [...currentItems, itemId];
                set({ selectedItems: newItems });
            },

            clearSelection: () => set({ selectedItems: [] }),

            resetState: () => set({
                ...initialState,
                maps: get().maps, // Keep loaded maps
            }),

            // Computed getters
            getSelectedItemsCount: () => get().selectedItems.length,

            getItemsByEquipmentType: (type) => {
                const items = get().items;
                if (type === 'All') return items;
                return items.filter(item => item.equipment_type === type);
            },

            getFilteredItems: () => {
                const { items, selectedEquipmentType, searchTerm } = get();
                let filteredItems = items;

                // Filter by equipment type
                if (selectedEquipmentType !== 'All') {
                    filteredItems = filteredItems.filter(item =>
                        item.equipment_type === selectedEquipmentType
                    );
                }

                // Filter by search term
                if (searchTerm) {
                    filteredItems = filteredItems.filter(item =>
                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.equipment_type.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                return filteredItems;
            },

            getEquipmentTypes: () => {
                const items = get().items;
                const types = new Set(items.map(item => item.equipment_type));
                return ['All', ...Array.from(types).sort()];
            },

            getMissingItemsCount: () => {
                const missingItems = get().missingItems;
                return missingItems?.total_missing || 0;
            },

            getTrackingItemsCount: () => {
                const sessionStatus = get().sessionStatus;
                return sessionStatus?.tracked_items || 0;
            },
        }),
        {
            name: 'missing-items-tracker-store',
        }
    )
);

// Selector hooks for better performance
export const useCurrentPage = () => useStore(state => state.currentPage);
export const useSelectedMap = () => useStore(state => state.selectedMap);
export const useSelectedDay = () => useStore(state => state.selectedDay);
export const useSelectedItems = () => useStore(state => state.selectedItems);
export const useDaysThreshold = () => useStore(state => state.daysThreshold);
export const useMaps = () => useStore(state => state.maps);
export const useItems = () => useStore(state => state.items);
export const useCurrentSession = () => useStore(state => state.currentSession);
export const useSessionStatus = () => useStore(state => state.sessionStatus);
export const useMissingItems = () => useStore(state => state.missingItems);
export const useLoading = () => useStore(state => state.loading);
export const useError = () => useStore(state => state.error);
export const useIsTracking = () => useStore(state => state.isTracking);
export const useShowSimulation = () => useStore(state => state.showSimulation);
export const useSelectedEquipmentType = () => useStore(state => state.selectedEquipmentType);
export const useSearchTerm = () => useStore(state => state.searchTerm);

// Computed selectors
export const useSelectedItemsCount = () => useStore(state => state.getSelectedItemsCount());
export const useFilteredItems = () => useStore(state => state.getFilteredItems());
export const useEquipmentTypes = () => useStore(state => state.getEquipmentTypes());
export const useMissingItemsCount = () => useStore(state => state.getMissingItemsCount());
export const useTrackingItemsCount = () => useStore(state => state.getTrackingItemsCount()); 