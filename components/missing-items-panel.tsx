"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { useRef, useState } from "react"
import React from "react"

export default function MissingItemsPanel() {
  // This would be populated with actual missing items data
  const missingItems: string[] = []

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

  // Attach/detach listeners
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
        {missingItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">No missing items detected</div>
            <div className="text-xs mt-1">All tracked equipment is accounted for</div>
          </div>
        ) : (
          <div className="space-y-2">
            {missingItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
              >
                <span className="text-sm font-medium text-red-800">{item}</span>
                <Badge variant="destructive" className="text-xs">
                  Missing
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
