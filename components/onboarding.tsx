"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import FloorMap from "@/components/floor-map"
import type { UserPreferences } from "@/app/page"

interface OnboardingProps {
  onComplete: (preferences: UserPreferences) => void
}

const TRACKABLE_ITEMS = [
  "Telebox",
  "Vein finder",
  "Vitals cart",
  "Pulse ox cords",
  "Glucometers",
  "Bladder scanners",
  "EKG machine",
  "Potty/shower chairs",
  "Recliner chairs",
  "Dash monitor",
  "Doppler ultrasound",
  "Dyson Fans",
]

const ROOM_AREAS = [
  "N500",
  "N501",
  "N502",
  "N503",
  "N504",
  "N505",
  "N506",
  "N507",
  "N508",
  "N509",
  "N510",
  "N511",
  "N512",
  "N513",
  "N514",
  "N515",
  "N516",
  "N517",
  "N518",
  "N519",
  "N520",
  "N521",
  "N522",
  "N524",
  "N525",
  "N526",
  "N530",
  "N531",
  "N532",
  "N533",
  "Nurse Station",
  "Hall Restroom",
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [assignedAreas, setAssignedAreas] = useState<string[]>([])
  const [trackedItems, setTrackedItems] = useState<string[]>([])
  const [trackMissingItems, setTrackMissingItems] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep === 1 && scrollRef.current) {
      const container = scrollRef.current
      const map = container.querySelector('div.inline-block') as HTMLDivElement | null
      if (map) {
        // Center horizontally and vertically, with a right and down offset
        container.scrollLeft = (map.offsetWidth - container.clientWidth) / 2 + 200
        container.scrollTop = (map.offsetHeight - container.clientHeight) / 2 + 50
      }
    }
  }, [currentStep])

  const handleAreaToggle = (area: string) => {
    setAssignedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const handleItemToggle = (item: string) => {
    setTrackedItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete({
        assignedAreas,
        trackedItems,
        trackMissingItems,
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return assignedAreas.length > 0
      case 2:
        return trackedItems.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        {/* Fixed header for onboarding text and stepper */}
        <div className="sticky top-0 z-10 bg-white bg-opacity-90 p-2 border-b border-gray-200">
          <CardHeader className="text-center p-0">
            <CardTitle className="text-lg font-bold">Welcome to Hospital Equipment Tracker</CardTitle>
            <div className="flex justify-center space-x-2 mt-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === currentStep
                      ? "bg-blue-600 text-white"
                      : step < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            {/* Step-specific instructions */}
            <div className="mt-2 text-center">
              {currentStep === 1 && (
                <>
                  <h3 className="text-sm font-semibold mb-1">Select Your Assigned Areas</h3>
                  <p className="text-xs text-gray-600 mb-2">Choose the rooms and areas you're responsible for monitoring.</p>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <h3 className="text-sm font-semibold mb-1">Select Items to Track</h3>
                  <p className="text-xs text-gray-600 mb-2">Choose which equipment and items you want to monitor.</p>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <h3 className="text-sm font-semibold mb-1">Missing Items Tracking</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Would you like to enable missing items tracking? This will show a panel with items that are currently missing from your assigned areas.
                  </p>
                </>
              )}
            </div>
          </CardHeader>
        </div>
        {/* Scrollable content below header */}
        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh] pt-2 pb-24">
          {currentStep === 1 && (
            <div className="mb-4 flex flex-col items-center w-full">
              <div
                ref={scrollRef}
                className="w-full overflow-x-auto overflow-y-auto max-h-[400px] flex justify-center"
              >
                <div className="scale-50 origin-top inline-block min-w-[1600px] min-h-[600px]">
                  <FloorMap
                    assignedAreas={assignedAreas}
                    trackedItems={[]}
                    onRoomClick={handleAreaToggle}
                    isOnboarding={true}
                  />
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRACKABLE_ITEMS.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={item}
                      checked={trackedItems.includes(item)}
                      onCheckedChange={() => handleItemToggle(item)}
                    />
                    <label
                      htmlFor={item}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant={trackMissingItems ? "default" : "outline"}
                  onClick={() => setTrackMissingItems(true)}
                  className="px-8"
                >
                  Yes, track missing items
                </Button>
                <Button
                  variant={!trackMissingItems ? "default" : "outline"}
                  onClick={() => setTrackMissingItems(false)}
                  className="px-8"
                >
                  No, not now
                </Button>
              </div>
              <div className="text-center mt-4">
                <h4 className="font-medium text-xs mb-1">Setup Summary:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Assigned Areas: {assignedAreas.length} selected</p>
                  <p>Tracked Items: {trackedItems.length} selected</p>
                  <p>Missing Items Tracking: {trackMissingItems ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {/* Sticky footer for selected area summary and navigation buttons */}
        <div className="sticky bottom-0 left-0 right-0 z-20 bg-white bg-opacity-95 border-t border-gray-200 px-6 py-3 flex flex-col gap-2">
          {currentStep === 1 && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs">Selected Areas ({assignedAreas.length}):</h4>
              <div className="flex flex-wrap gap-2">
                {assignedAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleAreaToggle(area)}
                  >
                    {area} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <p className="text-xs text-gray-600">Selected: {trackedItems.length} items</p>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
