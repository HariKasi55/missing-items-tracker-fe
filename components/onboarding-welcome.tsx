"use client"

import { Button } from "@/components/ui/button"

interface OnboardingWelcomeProps {
  onStart: () => void
}

export default function OnboardingWelcome({ onStart }: OnboardingWelcomeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to <span className="text-blue-600">[App Name]</span></h1>
        <h2 className="text-xl font-semibold mb-2">Simple Device Tracking</h2>
        <p className="text-gray-700 mb-8">
          Easily find and track medical equipment — no more searching, no more delays.
        </p>
        <Button className="w-full text-lg py-2" onClick={onStart}>
          Get Started
        </Button>
      </div>
    </div>
  )
}