"use client"

import { useRef, useEffect, useState } from "react"
import FloorMap from "@/components/floor-map"
import Onboarding from "@/components/onboarding"
import OnboardingWelcome from "@/components/onboarding-welcome"
import MissingItemsPanel from "@/components/missing-items-panel"
import MapSelection from "@/components/MapSelection"
import ItemSelection from "@/components/ItemSelection"
import TrackingDashboard from "@/components/TrackingDashboard"
import { useStore } from "../lib/store"
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

  // After welcome page → show onboarding
  const handleWelcomeStart = () => {
    setShowWelcome(false)
    setShowOnboarding(true)
  }

  // After onboarding → show main UI
  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences)
    setShowOnboarding(false)
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
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto overflow-y-auto max-h-[600px] flex justify-center"
        >
          <div className="scale-50 origin-top inline-block min-w-[1600px] min-h-[600px]">
            <FloorMap
              assignedAreas={userPreferences.assignedAreas}
              trackedItems={userPreferences.trackedItems}
            />
          </div>
        </div>
        {/* Uncomment if needed */}
        {/* {userPreferences.trackMissingItems && <MissingItemsPanel />} */}
      </div>
    </div>
  )
}
