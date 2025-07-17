"use client"

import { useState } from "react"

interface FloorMapProps {
  assignedAreas: string[]
  trackedItems: string[]
  onRoomClick?: (room: string) => void
  isOnboarding?: boolean
}

export default function FloorMap({ assignedAreas, trackedItems, onRoomClick, isOnboarding = false }: FloorMapProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)

  const handleRoomClick = (room: string) => {
    if (onRoomClick) {
      onRoomClick(room)
    }
  }

  const isRoomAssigned = (room: string) => assignedAreas.includes(room)

  const getRoomClassName = (room: string, baseClass: string) => {
    let className = baseClass

    if (isRoomAssigned(room)) {
      className += " bg-green-200 border-green-400 text-green-800"
    }

    if (onRoomClick) {
      className += " cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200"
    }

    return className
  }

  return (
    <div className="w-[4800px] h-[1440px] flex items-center justify-center mx-auto my-12 bg-white rounded-2xl shadow-2xl">
      <div>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 text-shadow">East North 05</h1>

        <div className="overflow-x-auto">
          <div className="grid grid-rows-3 gap-1 border-4 border-gray-800 bg-gray-800 rounded-xl overflow-hidden min-w-[1600px]">
            {/* Top Row */}
            <div className="grid grid-cols-17 gap-1">
              {["N516", "N517", "N518", "N519", "N520", "N521", "N522"].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-48 transition-all duration-300",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {room}
                    {trackedItems.includes(room) && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse z-10">
                        <span className="w-6 h-6 bg-white rounded-full"></span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Stacked Meds/Nurse Station */}
              <div className="flex flex-col gap-0 h-48">
                <div
                  className={getRoomClassName(
                    "N524",
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-24 transition-all duration-300",
                  )}
                  onClick={() => handleRoomClick("N524")}
                  onMouseEnter={() => setHoveredRoom("N524")}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  N524
                  <br />
                  Meds
                </div>
                <div
                  className={getRoomClassName(
                    "Nurse Station",
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-24 transition-all duration-300",
                  )}
                  onClick={() => handleRoomClick("Nurse Station")}
                  onMouseEnter={() => setHoveredRoom("Nurse Station")}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  Nurse
                  <br />
                  Station
                </div>
              </div>

              {["N525", "N526"].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-48 transition-all duration-300",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  {room}
                </div>
              ))}

              {/* Stairs */}
              <div className="bg-gray-100 border border-gray-300 text-gray-800 font-bold flex items-center justify-center p-0 h-48">
                <svg width="38" height="38" viewBox="0 0 360 360" className="fill-current">
                  <g transform="translate(0,360) scale(0.1,-0.1)">
                    <path d="M1417 3020 c-45 -14 -95 -58 -118 -102 -45 -88 -6 -214 81 -258 43 -22 121 -27 167 -9 62 23 122 109 123 175 0 39 -17 91 -42 127 -38 53 -146 88 -211 67z" />
                    <path d="M1326 2591 c-20 -16 -104 -78 -187 -137 -84 -60 -158 -118 -165 -129 -7 -11 -17 -78 -23 -155 -6 -74 -13 -156 -16 -181 -5 -40 -2 -51 21 -78 32 -38 74 -41 108 -8 24 25 29 52 42 240 l7 97 68 50 c38 28 71 50 74 50 3 0 5 -91 5 -203 0 -111 4 -217 10 -235 8 -28 -5 -90 -75 -382 -47 -191 -85 -359 -85 -374 0 -15 5 -36 10 -47 16 -28 67 -51 99 -44 58 13 65 31 152 390 45 187 83 342 86 344 3 4 158 -66 176 -79 4 -3 3 -64 -2 -135 -10 -141 -4 -174 34 -199 37 -24 80 -20 115 12 l31 27 11 187 c11 173 10 188 -6 213 -13 19 -61 48 -157 94 l-139 66 0 135 0 135 58 -63 57 -63 160 -19 c177 -21 199 -17 223 32 10 23 10 33 -2 62 -8 19 -22 37 -33 40 -10 3 -76 13 -148 21 -71 9 -130 17 -131 18 0 1 -46 56 -101 123 -55 67 -110 139 -123 162 -38 68 -94 80 -154 33z" />
                    <path d="M2318 1713 l-3 -148 -192 -3 -193 -2 0 -140 0 -140 -192 -2 -193 -3 -3 -147 -3 -148 -189 0 -190 0 0 -145 0 -145 -170 0 -170 0 0 -60 0 -60 230 0 230 0 0 150 0 150 190 0 189 0 3 143 3 142 192 3 192 2 3 143 3 142 193 3 192 2 0 145 0 145 170 0 170 0 0 60 0 60 -230 0 -229 0 -3 -147z" />
                  </g>
                </svg>
              </div>

              <div
                className={getRoomClassName(
                  "Hall Restroom",
                  "bg-white border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-48 transition-all duration-300",
                )}
                onClick={() => handleRoomClick("Hall Restroom")}
                onMouseEnter={() => setHoveredRoom("Hall Restroom")}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                Hall
                <br />
                Restroom
              </div>

              {["N530", "N531", "N532", "N533"].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-48 transition-all duration-300",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  {room}
                </div>
              ))}
            </div>

            {/* Hallway Row */}
            <div className="grid grid-cols-17 gap-0.5">
              <div className="bg-gray-100 border border-gray-300 text-gray-800 font-bold flex items-center justify-center p-0">
                <svg width="38" height="38" viewBox="0 0 360 360" className="fill-current">
                  <g transform="translate(0,360) scale(0.1,-0.1)">
                    <path d="M1417 3020 c-45 -14 -95 -58 -118 -102 -45 -88 -6 -214 81 -258 43 -22 121 -27 167 -9 62 23 122 109 123 175 0 39 -17 91 -42 127 -38 53 -146 88 -211 67z" />
                    <path d="M1326 2591 c-20 -16 -104 -78 -187 -137 -84 -60 -158 -118 -165 -129 -7 -11 -17 -78 -23 -155 -6 -74 -13 -156 -16 -181 -5 -40 -2 -51 21 -78 32 -38 74 -41 108 -8 24 25 29 52 42 240 l7 97 68 50 c38 28 71 50 74 50 3 0 5 -91 5 -203 0 -111 4 -217 10 -235 8 -28 -5 -90 -75 -382 -47 -191 -85 -359 -85 -374 0 -15 5 -36 10 -47 16 -28 67 -51 99 -44 58 13 65 31 152 390 45 187 83 342 86 344 3 4 158 -66 176 -79 4 -3 3 -64 -2 -135 -10 -141 -4 -174 34 -199 37 -24 80 -20 115 12 l31 27 11 187 c11 173 10 188 -6 213 -13 19 -61 48 -157 94 l-139 66 0 135 0 135 58 -63 57 -63 160 -19 c177 -21 199 -17 223 32 10 23 10 33 -2 62 -8 19 -22 37 -33 40 -10 3 -76 13 -148 21 -71 9 -130 17 -131 18 0 1 -46 56 -101 123 -55 67 -110 139 -123 162 -38 68 -94 80 -154 33z" />
                    <path d="M2318 1713 l-3 -148 -192 -3 -193 -2 0 -140 0 -140 -192 -2 -193 -3 -3 -147 -3 -148 -189 0 -190 0 0 -145 0 -145 -170 0 -170 0 0 -60 0 -60 230 0 230 0 0 150 0 150 190 0 189 0 3 143 3 142 192 3 192 2 3 143 3 142 193 3 192 2 0 145 0 145 170 0 170 0 0 60 0 60 -230 0 -229 0 -3 -147z" />
                  </g>
                </svg>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex items-center justify-center col-span-3">
                <span className="font-bold text-2xl text-blue-800">Hall-N513</span>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex items-center justify-center col-span-6">
                <span className="font-bold text-2xl text-blue-800">Hall-N510</span>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex items-center justify-center col-span-6">
                <span className="font-bold text-2xl text-blue-800">Hall-N506</span>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex items-center justify-center">
                <span className="font-bold text-2xl text-blue-800">Hall-N533</span>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-16 gap-0.5">
              {[
                "N515",
                "N514",
                "N513",
                "N512",
                "N511",
                "N510",
                "N509",
                "N508",
                "N507",
                "N506",
                "N505",
                "N504",
                "N503",
                "N502",
                "N501",
                "N500",
              ].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex items-center justify-center h-48 transition-all duration-300",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  {room}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {hoveredRoom && (
          <div className="fixed top-5 right-5 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-xs z-10">
            <div className="font-bold">{hoveredRoom}</div>
            <div className="text-sm text-gray-600">
              {hoveredRoom.includes("N5")
                ? "Patient Room"
                : hoveredRoom.includes("Nurse")
                  ? "Central nursing area"
                  : hoveredRoom.includes("Meds")
                    ? "Medication storage"
                    : hoveredRoom.includes("Restroom")
                      ? "Public facilities"
                      : "Hospital area"}
            </div>
            {isOnboarding && (
              <div className="text-xs text-blue-600 mt-1">
                Click to {isRoomAssigned(hoveredRoom) ? "deselect" : "select"}
              </div>
            )}
          </div>
        )}

        {isOnboarding && assignedAreas.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Green rooms are selected as your assigned areas</p>
          </div>
        )}
      </div>
    </div>
  )
}
