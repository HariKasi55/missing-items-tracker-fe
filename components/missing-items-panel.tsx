"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MapPin } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import React from "react"
import { getMissingItems, type Item, type MissingItemsResponse } from "@/lib/api"

interface MissingItemsPanelProps {
  sessionId?: string;
  isVisible?: boolean;
  onMissingItemsCountChange?: (count: number) => void;
}

export default function MissingItemsPanel({ sessionId, isVisible = true, onMissingItemsCountChange }: MissingItemsPanelProps) {
  const [missingItems, setMissingItems] = useState<Item[]>([])
  const [totalMissing, setTotalMissing] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Draggable logic
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 24, y: 24 }) // 24px from left and bottom
  const [dragging, setDragging] = useState(false)
  const [rel, setRel] = useState({ x: 0, y: 0 })

  const onMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current && e.button === 0) {
      const rect = panelRef.current.getBoundingClientRect()
      setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setDragging(true)
      e.preventDefault()
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPosition({ x: e.clientX - rel.x, y: e.clientY - rel.y })
    }
  }

  const onMouseUp = () => setDragging(false)

  // Fetch missing items data
  const fetchMissingItems = async () => {
    if (!sessionId) return
    
    setLoading(true)
    setError(null)
    try {
      const response: MissingItemsResponse = await getMissingItems(sessionId)
      setMissingItems(response.missing_items)
      setTotalMissing(response.total_missing)
      
      // Notify parent component of count change
      if (onMissingItemsCountChange) {
        onMissingItemsCountChange(response.total_missing)
      }
    } catch (err) {
      console.error('Error fetching missing items:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load missing items'
      setError(`Failed to load missing items: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Attach/detach listeners for dragging
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    } else {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [dragging])

  // Fetch missing items on mount and when sessionId changes
  useEffect(() => {
    fetchMissingItems()
  }, [sessionId])

  // Poll for missing items updates every 5 seconds
  useEffect(() => {
    if (!sessionId) return
    
    const interval = setInterval(fetchMissingItems, 5000)
    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <Card
      ref={panelRef}
      style={{ left: position.x, bottom: position.y, top: "auto", right: "auto", position: "fixed", cursor: dragging ? "grabbing" : "grab" }}
      className="w-80 max-h-96 overflow-y-auto shadow-lg z-20 select-none"
    >
      <CardHeader className="pb-3" onMouseDown={onMouseDown} style={{ cursor: "grab" }}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Missing Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">Loading missing items...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <div className="text-sm">{error}</div>
            <button 
              onClick={fetchMissingItems}
              className="text-xs mt-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : missingItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">
              {sessionId ? 'No missing items detected' : 'No tracking session active'}
            </div>
            <div className="text-xs mt-1">
              {sessionId ? 'All tracked equipment is accounted for' : 'Start tracking to monitor missing items'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">
              {totalMissing} item{totalMissing !== 1 ? 's' : ''} missing
            </div>
            {missingItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-red-50 rounded border border-red-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">{item.name}</span>
                  <Badge variant="destructive" className="text-xs">
                    Missing
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Type: {item.equipment_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Location: {item.location}</span>
                  </div>
                  {item.last_seen && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Last seen: {new Date(item.last_seen).toLocaleString()}</span>
                    </div>
                  )}
                  {item.missing_since && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Missing since: {new Date(item.missing_since).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
