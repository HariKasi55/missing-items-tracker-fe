"use client"

import { useState } from "react"
import React from "react"
import Image from "next/image"
import { getEquipmentTypeIconPath } from "../lib/equipmentIcons"

interface FloorMapProps {
  assignedAreas: string[]
  trackedItems: string[]
  onRoomClick?: (room: string) => void
  isOnboarding?: boolean
  itemsByRoom?: Record<string, any[]>
}

export default function MapTracker({ assignedAreas, trackedItems, onRoomClick, isOnboarding = false, itemsByRoom = {} }: FloorMapProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number, y: number } | null>(null)

  const handleRoomClick = (room: string) => {
    if (onRoomClick) {
      onRoomClick(room)
    }
  }

  const handleItemHover = (item: any, event: React.MouseEvent) => {
    // This function is no longer needed for the item info panel
  }

  const handleItemLeave = () => {
    // This function is no longer needed for the item info panel
  }

  // Handle item click with position tracking
  const handleItemClick = (item: any, event: React.MouseEvent) => {
    event.stopPropagation()
    
    // Get the clicked element's position
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    // Position popup above the clicked element
    setPopupPosition({
      x: rect.left + scrollLeft + (rect.width / 2), // Center horizontally
      y: rect.top + scrollTop - 10 // Position above with small gap
    })
    
    setSelectedItem(item)
  }

  // Close popup and clear position
  const closePopup = () => {
    setSelectedItem(null)
    setPopupPosition(null)
  }

  // Reusable Equipment Icon component with integrated popup
  const EquipmentIcon = ({ group, size = "w-8 h-8", badgeSize = "w-5 h-5" }: { 
    group: { items: any[], iconPath: string, count: number }, 
    size?: string,
    badgeSize?: string 
  }) => {
    const isSelected = selectedItem?.tag_id === group.items[0].tag_id
    
    return (
      <div
        className="relative cursor-pointer hover:scale-105 transition-transform"
        onMouseEnter={(e) => handleItemHover(group.items[0], e)}
        onMouseLeave={handleItemLeave}
        onClick={(e) => handleItemClick(group.items[0], e)}
      >
        <div className={`${size} relative`}>
          <Image
            src={group.iconPath}
            alt={group.items[0].item_title}
            fill
            className="object-contain"
          />
          {group.count > 1 && (
            <div className={`absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full ${badgeSize} flex items-center justify-center font-bold text-[10px]`}>
              {group.count}
            </div>
          )}
        </div>
        {isSelected && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white bg-opacity-95 p-2 rounded-lg shadow-lg border border-gray-200 z-50 min-w-max">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
            <div className="text-xs font-bold mb-1 flex items-center gap-1">
              <div className="w-4 h-4 relative flex-shrink-0">
                <Image
                  src={group.iconPath}
                  alt={group.items[0].item_title}
                  fill
                  className="object-contain"
                />
              </div>
              {group.items[0].item_title}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              ID: {group.items[0].tag_id}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              Room: {group.items[0].to_area_title?.replace(/^.*EastHosp_North_05_?/, '')}
            </div>
            <button
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                closePopup()
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    )
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

  const getItemIconPath = (itemTitle: string) => {
    const title = itemTitle?.toLowerCase() || ''
    // Map item titles to equipment types for icon lookup
    if (title.includes('telemetry')) return getEquipmentTypeIconPath('Telemetry Systems')
    if (title.includes('module') && title.includes('infusion')) return getEquipmentTypeIconPath('Module Infusion')
    if (title.includes('bed')) return getEquipmentTypeIconPath('Beds')
    if (title.includes('pump') && title.includes('infusion')) return getEquipmentTypeIconPath('Pump Infusion')
    if (title.includes('monitor')) return getEquipmentTypeIconPath('Monitors')
    if (title.includes('wheelchair')) return getEquipmentTypeIconPath('Wheelchairs')
    if (title.includes('iv pole')) return getEquipmentTypeIconPath('IV Poles')
    if (title.includes('crash cart')) return getEquipmentTypeIconPath('Crash Carts')
    if (title.includes('ventilator')) return getEquipmentTypeIconPath('Ventilators')
    if (title.includes('defibrillator')) return getEquipmentTypeIconPath('Defibrillators')
    if (title.includes('oxygen tank')) return getEquipmentTypeIconPath('Oxygen Tanks')
    if (title.includes('stretcher')) return getEquipmentTypeIconPath('Stretchers')
    // Legacy items for backward compatibility
    if (title.includes('hemodialysis')) return '/Med-Icons/Hemodialysis System.png'
    if (title.includes('nebulizer')) return getEquipmentTypeIconPath('Other')
    if (title.includes('positive airway pressure')) return getEquipmentTypeIconPath('Other')
    if (title.includes('pump')) return getEquipmentTypeIconPath('Pump Infusion')
    if (title.includes('scanning system')) return getEquipmentTypeIconPath('Other')
    if (title.includes('bladder scanner')) return getEquipmentTypeIconPath('Other')
    if (title.includes('ed stretcher')) return getEquipmentTypeIconPath('Stretchers')
    if (title.includes('vein finder')) return getEquipmentTypeIconPath('Other')
    return getEquipmentTypeIconPath('Other')
  }

  // Map backend item names to onboarding equipment types
  const getEquipmentType = (itemTitle: string) => {
    const title = itemTitle?.toLowerCase() || ''
    if (title.includes('telemetry')) return 'Telemetry Systems'
    if (title.includes('module') && title.includes('infusion')) return 'Module Infusion'
    if (title.includes('bed')) return 'Beds'
    if (title.includes('pump') && title.includes('infusion')) return 'Pump Infusion'
    if (title.includes('monitor')) return 'Monitors'
    if (title.includes('wheelchair')) return 'Wheelchairs'
    if (title.includes('iv pole')) return 'IV Poles'
    if (title.includes('crash cart')) return 'Crash Carts'
    if (title.includes('ventilator')) return 'Ventilators'
    if (title.includes('defibrillator')) return 'Defibrillators'
    if (title.includes('oxygen tank')) return 'Oxygen Tanks'
    if (title.includes('stretcher')) return 'Stretchers'
    if (title.includes('ed stretcher')) return 'Stretchers'
    return 'Other'
  }

  // Group items by their type and return grouped data with counts, filtered by tracked items
  const groupItemsByType = (items: any[]) => {
    const grouped: Record<string, { items: any[], iconPath: string, count: number }> = {}
    
    // Filter items based on tracked items from onboarding
    const filteredItems = items?.filter(item => {
      const equipmentType = getEquipmentType(item.item_title)
      return trackedItems.includes(equipmentType)
    }) || []
    
    filteredItems.forEach(item => {
      const iconPath = getItemIconPath(item.item_title)
      const key = iconPath // Use icon path as the grouping key
      
      if (!grouped[key]) {
        grouped[key] = {
          items: [],
          iconPath,
          count: 0
        }
      }
      
      grouped[key].items.push(item)
      grouped[key].count++
    })
    
    return Object.values(grouped)
  }

  // Close info panel on click outside
  React.useEffect(() => {
    if (!selectedItem) return;
    const handleClick = (e: MouseEvent) => {
      const panel = document.getElementById('item-info-panel');
      if (panel && !panel.contains(e.target as Node)) {
        closePopup();
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [selectedItem]);

  return (
    <div className="w-[4800px] h-[1440px] flex items-center justify-center mx-auto my-12 bg-white rounded-2xl shadow-2xl">
      <div>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 text-shadow">East North 05</h1>

        <div className="overflow-x-auto">
          <div className="grid grid-rows-[auto_auto_auto] gap-1 border-4 border-gray-800 bg-gray-800 rounded-xl overflow-hidden min-w-[1600px]">
            {/* Top Row - All elements same height (h-96) */}
            <div className="grid grid-cols-17 gap-1">
              {["N516", "N517", "N518", "N519", "N520", "N521", "N522"].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex flex-col items-center justify-center h-96 transition-all duration-300 relative",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="text-2xl font-bold mb-2">{room}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItemsByType(itemsByRoom[room]).map((group, idx) => (
                      <EquipmentIcon 
                        key={`${group.iconPath}-${idx}`}
                        group={group}
                        size="w-8 h-8"
                        badgeSize="w-5 h-5"
                      />
                    ))}
                  </div>
                  {trackedItems.includes(room) && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse z-10">
                      <span className="w-6 h-6 bg-white rounded-full"></span>
                    </span>
                  )}
                </div>
              ))}

              {/* Stacked Meds/Nurse Station - Combined height matches other rooms (h-96) */}
              <div className="flex flex-col gap-1 h-96">
                <div
                  className={getRoomClassName(
                    "N524",
                    "bg-blue-50 border border-blue-200 p-3 text-center font-bold text-blue-800 flex flex-col items-center justify-center h-[calc(50%-0.125rem)] transition-all duration-300 relative",
                  )}
                  onClick={() => handleRoomClick("N524")}
                  onMouseEnter={() => setHoveredRoom("N524")}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="text-lg font-bold mb-1">N524 Meds</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItemsByType(itemsByRoom["N524"]).map((group, idx) => (
                      <EquipmentIcon 
                        key={`${group.iconPath}-${idx}`}
                        group={group}
                        size="w-6 h-6"
                        badgeSize="w-4 h-4"
                      />
                    ))}
                  </div>
                </div>
                <div
                  className={getRoomClassName(
                    "Nurse Station",
                    "bg-blue-50 border border-blue-200 p-3 text-center font-bold text-blue-800 flex flex-col items-center justify-center h-[calc(50%-0.125rem)] transition-all duration-300 relative",
                  )}
                  onClick={() => handleRoomClick("Nurse Station")}
                  onMouseEnter={() => setHoveredRoom("Nurse Station")}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="text-lg font-bold mb-1">Nurse Station</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItemsByType(itemsByRoom["Nurse Station"]).map((group, idx) => (
                      <EquipmentIcon 
                        key={`${group.iconPath}-${idx}`}
                        group={group}
                        size="w-6 h-6"
                        badgeSize="w-4 h-4"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {["N525", "N526"].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex flex-col items-center justify-center h-96 transition-all duration-300 relative",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="text-2xl font-bold mb-2">{room}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItemsByType(itemsByRoom[room]).map((group, idx) => (
                      <EquipmentIcon 
                        key={`${group.iconPath}-${idx}`}
                        group={group}
                        size="w-8 h-8"
                        badgeSize="w-5 h-5"
                      />
                    ))}
                  </div>
                  {trackedItems.includes(room) && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse z-10">
                      <span className="w-6 h-6 bg-white rounded-full"></span>
                    </span>
                  )}
                </div>
              ))}

              {/* Stairs - Same height as other rooms (h-96) */}
              <div className="bg-gray-100 border border-gray-300 text-gray-800 font-bold flex items-center justify-center p-0 h-96">
                <svg width="38" height="38" viewBox="0 0 360 360" className="fill-current">
                  <g transform="translate(0,360) scale(0.1,-0.1)">
                    <path d="M1417 3020 c-45 -14 -95 -58 -118 -102 -45 -88 -6 -214 81 -258 43 -22 121 -27 167 -9 62 23 122 109 123 175 0 39 -17 91 -42 127 -38 53 -146 88 -211 67z" />
                    <path d="M1326 2591 c-20 -16 -104 -78 -187 -137 -84 -60 -158 -118 -165 -129 -7 -11 -17 -78 -23 -155 -6 -74 -13 -156 -16 -181 -5 -40 -2 -51 21 -78 32 -38 74 -41 108 -8 24 25 29 52 42 240 l7 97 68 50 c38 28 71 50 74 50 3 0 5 -91 5 -203 0 -111 4 -217 10 -235 8 -28 -5 -90 -75 -382 -47 -191 -85 -359 -85 -374 0 -15 5 -36 10 -47 16 -28 67 -51 99 -44 58 13 65 31 152 390 45 187 83 342 86 344 3 4 158 -66 176 -79 4 -3 3 -64 -2 -135 -10 -141 -4 -174 34 -199 37 -24 80 -20 115 12 l31 27 11 187 c11 173 10 188 -6 213 -13 19 -61 48 -157 94 l-139 66 0 135 0 135 58 -63 57 -63 160 -19 c177 -21 199 -17 223 32 10 23 10 33 -2 62 -8 19 -22 37 -33 40 -10 3 -76 13 -148 21 -71 9 -130 17 -131 18 0 1 -46 56 -101 123 -55 67 -110 139 -123 162 -38 68 -94 80 -154 33z" />
                    <path d="M2318 1713 l-3 -148 -192 -3 -193 -2 0 -140 0 -140 -192 -2 -193 -3 -3 -147 -3 -148 -189 0 -190 0 0 -145 0 -145 -170 0 -170 0 0 -60 0 -60 230 0 230 0 0 150 0 150 190 0 189 0 3 143 3 142 192 3 192 2 3 143 3 142 193 3 192 2 0 145 0 145 170 0 170 0 0 60 0 60 -230 0 -229 0 -3 -147z" />
                  </g>
                </svg>
              </div>

              {/* Hall Restroom - Same height as other rooms (h-96) */}
              <div
                className={getRoomClassName(
                  "Hall Restroom",
                  "bg-white border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex flex-col items-center justify-center h-96 transition-all duration-300 relative",
                )}
                onClick={() => handleRoomClick("Hall Restroom")}
                onMouseEnter={() => setHoveredRoom("Hall Restroom")}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                <div className="text-lg font-bold mb-2">Hall Restroom</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {groupItemsByType(itemsByRoom["Hall Restroom"]).map((group, idx) => (
                    <EquipmentIcon 
                      key={`${group.iconPath}-${idx}`}
                      group={group}
                      size="w-8 h-8"
                      badgeSize="w-5 h-5"
                    />
                  ))}
                </div>
              </div>

              {["N530", "N531", "N532", "N533"].map((room) => (
                <div
                  key={room}
                  className={getRoomClassName(
                    room,
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex flex-col items-center justify-center h-96 transition-all duration-300 relative",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="text-2xl font-bold mb-2">{room}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItemsByType(itemsByRoom[room]).map((group, idx) => (
                      <EquipmentIcon 
                        key={`${group.iconPath}-${idx}`}
                        group={group}
                        size="w-8 h-8"
                        badgeSize="w-5 h-5"
                      />
                    ))}
                  </div>
                  {trackedItems.includes(room) && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse z-10">
                      <span className="w-6 h-6 bg-white rounded-full"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Hallway Row - Half height of top row (h-48) */}
            <div className="grid grid-cols-17 gap-0.5">
              <div className="bg-gray-100 border border-gray-300 text-gray-800 font-bold flex items-center justify-center p-0 h-48">
                <svg width="28" height="28" viewBox="0 0 360 360" className="fill-current">
                  <g transform="translate(0,360) scale(0.1,-0.1)">
                    <path d="M1417 3020 c-45 -14 -95 -58 -118 -102 -45 -88 -6 -214 81 -258 43 -22 121 -27 167 -9 62 23 122 109 123 175 0 39 -17 91 -42 127 -38 53 -146 88 -211 67z" />
                    <path d="M1326 2591 c-20 -16 -104 -78 -187 -137 -84 -60 -158 -118 -165 -129 -7 -11 -17 -78 -23 -155 -6 -74 -13 -156 -16 -181 -5 -40 -2 -51 21 -78 32 -38 74 -41 108 -8 24 25 29 52 42 240 l7 97 68 50 c38 28 71 50 74 50 3 0 5 -91 5 -203 0 -111 4 -217 10 -235 8 -28 -5 -90 -75 -382 -47 -191 -85 -359 -85 -374 0 -15 5 -36 10 -47 16 -28 67 -51 99 -44 58 13 65 31 152 390 45 187 83 342 86 344 3 4 158 -66 176 -79 4 -3 3 -64 -2 -135 -10 -141 -4 -174 34 -199 37 -24 80 -20 115 12 l31 27 11 187 c11 173 10 188 -6 213 -13 19 -61 48 -157 94 l-139 66 0 135 0 135 58 -63 57 -63 160 -19 c177 -21 199 -17 223 32 10 23 10 33 -2 62 -8 19 -22 37 -33 40 -10 3 -76 13 -148 21 -71 9 -130 17 -131 18 0 1 -46 56 -101 123 -55 67 -110 139 -123 162 -38 68 -94 80 -154 33z" />
                    <path d="M2318 1713 l-3 -148 -192 -3 -193 -2 0 -140 0 -140 -192 -2 -193 -3 -3 -147 -3 -148 -189 0 -190 0 0 -145 0 -145 -170 0 -170 0 0 -60 0 -60 230 0 230 0 0 150 0 150 190 0 189 0 3 143 3 142 192 3 192 2 3 143 3 142 193 3 192 2 0 145 0 145 170 0 170 0 0 60 0 60 -230 0 -229 0 -3 -147z" />
                  </g>
                </svg>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex flex-col items-center justify-center col-span-3 p-2 h-48">
                <div className="font-bold text-lg text-blue-800 mb-1">Hall-N513</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {groupItemsByType(itemsByRoom["Hall-N513"]).map((group, idx) => (
                    <EquipmentIcon 
                      key={`${group.iconPath}-${idx}`}
                      group={group}
                      size="w-6 h-6"
                      badgeSize="w-4 h-4"
                    />
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex flex-col items-center justify-center col-span-6 p-2 h-48">
                <div className="font-bold text-lg text-blue-800 mb-1">Hall-N510</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {groupItemsByType(itemsByRoom["Hall-N510"]).map((group, idx) => (
                    <EquipmentIcon 
                      key={`${group.iconPath}-${idx}`}
                      group={group}
                      size="w-6 h-6"
                      badgeSize="w-4 h-4"
                    />
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex flex-col items-center justify-center col-span-6 p-2 h-48">
                <div className="font-bold text-lg text-blue-800 mb-1">Hall-N506</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {groupItemsByType(itemsByRoom["Hall-N506"]).map((group, idx) => (
                    <EquipmentIcon 
                      key={`${group.iconPath}-${idx}`}
                      group={group}
                      size="w-6 h-6"
                      badgeSize="w-4 h-4"
                    />
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-300 text-gray-800 text-xs flex flex-col items-center justify-center p-2 h-48">
                <div className="font-bold text-lg text-blue-800 mb-1">Hall-N533</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {groupItemsByType(itemsByRoom["Hall-N533"]).map((group, idx) => (
                    <EquipmentIcon 
                      key={`${group.iconPath}-${idx}`}
                      group={group}
                      size="w-6 h-6"
                      badgeSize="w-4 h-4"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row - Same height as top row (h-96) */}
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
                    "bg-blue-50 border border-blue-200 p-6 text-center font-bold text-2xl text-blue-800 flex flex-col items-center justify-center h-96 transition-all duration-300 relative",
                  )}
                  onClick={() => handleRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <div className="text-2xl font-bold mb-2">{room}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {groupItemsByType(itemsByRoom[room]).map((group, idx) => (
                      <EquipmentIcon 
                        key={`${group.iconPath}-${idx}`}
                        group={group}
                        size="w-8 h-8"
                        badgeSize="w-5 h-5"
                      />
                    ))}
                  </div>
                  {trackedItems.includes(room) && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse z-10">
                      <span className="w-6 h-6 bg-white rounded-full"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel for item (on click) */}
        {selectedItem && popupPosition && (
          <div
            id="item-info-panel"
            className="absolute bg-white bg-opacity-95 p-3 rounded-lg shadow-lg max-w-xs z-50 border border-gray-200"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: 'translate(-50%, -100%)', // Center horizontally and position above
              pointerEvents: 'auto'
            }}
          >
            <div className="font-bold text-lg mb-1 flex items-center gap-2">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src={getItemIconPath(selectedItem.item_title)}
                  alt={selectedItem.item_title}
                  fill
                  className="object-contain"
                />
              </div>
              {selectedItem.item_title}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Tag ID: {selectedItem.tag_id}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Room: {selectedItem.to_area_title?.replace(/^.*EastHosp_North_05_?/, '')}
            </div>
            <button
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
              onClick={closePopup}
            >
              Close
            </button>
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