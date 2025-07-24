"use client"

import { useRef, useEffect, useState } from "react"
import MapTracker from "@/components/map_tracker"
import Onboarding from "@/components/onboarding"
import OnboardingWelcome from "@/components/onboarding-welcome"
import MissingItemsPanel from "@/components/missing-items-panel"
import MapSelection from "@/components/MapSelection"
import ItemSelection from "@/components/ItemSelection"
import TrackingDashboard from "@/components/TrackingDashboard"
import { useStore } from "../lib/store"
import { getItemsRaw, startTracking } from "../lib/api"
import React from "react"

export interface UserPreferences {
  assignedAreas: string[]
  trackedItems: string[]
  trackMissingItems: boolean
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true)           // Step 1: Welcome page
  const [showOnboarding, setShowOnboarding] = useState(false)    // Step 2: Onboarding
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    assignedAreas: [],
    trackedItems: [],
    trackMissingItems: false,
  })
  const [itemsByRoom, setItemsByRoom] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(false)
  const [simulationDay, setSimulationDay] = useState(1)
  const [isPolling, setIsPolling] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showMissingItemsPanel, setShowMissingItemsPanel] = useState(false)
  const [missingItemsCount, setMissingItemsCount] = useState(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showOnboarding && scrollRef.current) {
      const container = scrollRef.current
      const map = container.querySelector('div.inline-block') as HTMLDivElement | null
      if (map) {
        container.scrollLeft = (map.offsetWidth - container.clientWidth) / 2 + 200
        container.scrollTop = (map.offsetHeight - container.clientHeight) / 2 + 50
      }
    }
  }, [showOnboarding])

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // After welcome page → show onboarding
  const handleWelcomeStart = () => {
    setShowWelcome(false)
    setShowOnboarding(true)
  }

  // After onboarding → show main UI
  const handleOnboardingComplete = async (preferences: UserPreferences) => {
    console.log('✅ Onboarding completed with preferences:', preferences)
    setUserPreferences(preferences)
    setShowOnboarding(false)
    
    // Reset simulation time and fetch initial data
    setSimulationDay(1)
    
    try {
      // Start real tracking session with backend if missing items tracking is enabled
      if (preferences.trackMissingItems) {
        console.log('🚀 Starting backend tracking session...')
        
        // For now, we'll use placeholder values since we don't have item selection yet
        // In a full implementation, you'd get these from the user's selections
        const mapId = 18 // North Wing map ID
        const day = 1
        const itemIds = [1, 2, 3, 4, 5] // Placeholder - would come from user selection
        const daysThreshold = 3 // Default threshold
        
        const trackingSession = await startTracking(mapId, day, itemIds, daysThreshold)
        setSessionId(trackingSession.session_id)
        console.log('✅ Real tracking session started:', trackingSession.session_id)
      }
    } catch (error) {
      console.error('❌ Failed to start tracking session:', error)
      // Continue without tracking session - user can still view equipment
    }
    
    // Fetch initial equipment data and start polling
    fetchEquipmentData(1).then(() => {
      startPolling()
    })
  }

  // Transform backend items into itemsByRoom format
  const transformItemsToRoomData = (items: any[]) => {
    const roomData: Record<string, any[]> = {}
    items.forEach(item => {
      // Extract room from location (e.g., "EastHosp_North_05_N506" -> "N506")
      const locationParts = item.location?.split('_') || []
      let room = locationParts[locationParts.length - 1] || 'Unknown'
      
      // Debug logging to see actual location strings
      console.log(`🔍 Item: ${item.name}, Location: ${item.location}, Parsed room: ${room}`)
      
      // Handle special cases - be more specific with mapping
      if (room === 'Hall' || room === 'Restroom' || room.includes('Restroom')) {
        room = 'Hall Restroom'
      } else if (room.includes('Nurse') || room === 'NurseStation') {
        room = 'Nurse Station'
      } else if (room === 'Meds' || room === 'N524Meds' || room.includes('Meds')) {
        // Map to N524 key (not "N524 Meds") to match MapTracker expectations
        room = 'N524'
      } else if (room.startsWith('N') && room.length >= 4) {
        // Handle room numbers like N506, N513, etc.
        room = room
      }
      
      if (!roomData[room]) {
        roomData[room] = []
      }
      
      roomData[room].push({
        tag_id: item.id,
        item_title: item.name,
        to_area_title: item.location,
        current_area: item.location
      })
    })
    
    // Debug logging to see final room distribution
    console.log('🏥 Final room distribution:', Object.keys(roomData).map(room => `${room}: ${roomData[room].length} items`))
    return roomData
  }

  // Fetch equipment data from backend (one-time)
  const fetchEquipmentData = async (day: number = 1) => {
    setLoading(true)
    try {
      // Use default map ID 18 and specified day
      const items = await getItemsRaw(18, day)
      const roomData = transformItemsToRoomData(items)
      
      console.log(`📍 Equipment data for day ${day} by room:`, roomData)
      setItemsByRoom(roomData)
    } catch (error) {
      console.error('❌ Failed to fetch equipment data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Start simulation polling - time advances 1 day every 3 seconds
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    const interval = 3000 // Poll every 3 seconds
    const timeMultiplier = 1 // Advance 1 day per interval
    
    setIsPolling(true)
    console.log(`📅 Simulation day: ${simulationDay} - time advances 1 day every 3 seconds...`)
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Advance simulation time
        setSimulationDay((prevDay) => {
          const newDay = prevDay + timeMultiplier
          
          // Fetch data for the new simulation time
          getItemsRaw(18, newDay)
            .then(items => {
              const roomData = transformItemsToRoomData(items)
              console.log(`🔄 Updated equipment data for simulation day ${newDay}:`, roomData)
              setItemsByRoom(roomData)
            })
            .catch(error => {
              console.error('❌ Failed to fetch updated equipment data:', error)
            })
          
          return newDay
        })
      } catch (error) {
        console.error('❌ Failed to advance simulation time:', error)
      }
    }, interval)
  }

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
    console.log('⏹️ Stopped simulation')
  }

  if (showWelcome) {
    return <OnboardingWelcome onStart={handleWelcomeStart} />
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center overflow-auto">
      <div className="flex flex-col items-center w-full">
        {/* Simulation Status and Controls */}
        <div className="mb-4 flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {isPolling ? 'Simulation Running' : 'Simulation Paused'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border">
            <span className="text-xs text-gray-600">Day:</span>
            <span className="text-sm font-bold text-blue-600">{simulationDay}</span>
          </div>
          <button
            onClick={() => isPolling ? stopPolling() : startPolling()}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              isPolling 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isPolling ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          {isPolling && (
            <span className="text-xs text-gray-600">
              Time advances 1 day every 3 seconds
            </span>
          )}
        </div>

        <div
          ref={scrollRef}
          className="w-full overflow-x-auto overflow-y-auto max-h-[600px] flex justify-center"
        >
          <div className="scale-50 origin-top inline-block min-w-[1600px] min-h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-lg text-gray-600">Loading equipment data...</div>
              </div>
            ) : (
              <MapTracker
                assignedAreas={userPreferences.assignedAreas}
                trackedItems={userPreferences.trackedItems}
                itemsByRoom={itemsByRoom}
              />
            )}
          </div>
        </div>
        
        {/* Static Notification Button - Fixed position, doesn't scroll with map */}
        {userPreferences.trackMissingItems && sessionId && (
          <button
            onClick={() => setShowMissingItemsPanel(!showMissingItemsPanel)}
            className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-30 flex items-center gap-2"
            title={`${missingItemsCount} missing items`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {missingItemsCount > 0 && (
              <span className="bg-white text-red-500 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                {missingItemsCount}
              </span>
            )}
          </button>
        )}
        
        {/* Missing Items Panel - shows when tracking missing items is enabled and button is clicked */}
        {userPreferences.trackMissingItems && sessionId && showMissingItemsPanel && (
          <MissingItemsPanel 
            sessionId={sessionId}
            isVisible={showMissingItemsPanel}
            onMissingItemsCountChange={setMissingItemsCount}
          />
        )}
      </div>
    </div>
  )
}
