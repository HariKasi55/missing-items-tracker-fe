"use client"

import { useRef, useEffect, useState } from "react"
import FloorMap from "@/components/floor-map"
import Onboarding from "@/components/onboarding"
import MissingItemsPanel from "@/components/missing-items-panel"

export interface UserPreferences {
  assignedAreas: string[]
  trackedItems: string[]
  trackMissingItems: boolean
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true)
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

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences)
    setShowOnboarding(false)
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
            <FloorMap assignedAreas={userPreferences.assignedAreas} trackedItems={userPreferences.trackedItems} />
          </div>
        </div>
        {userPreferences.trackMissingItems && <MissingItemsPanel />}
      </div>
    </div>
  )
}
