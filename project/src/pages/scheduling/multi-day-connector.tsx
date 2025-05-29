"use client"

import { useEffect, useState } from "react"
import { isSameDay, parseISO } from "date-fns"

interface MultiDayConnectorProps {
  assignments: any[]
  weekDays: Date[]
}

export function MultiDayConnector({ assignments, weekDays }: MultiDayConnectorProps) {
  const [connectors, setConnectors] = useState<JSX.Element[]>([])

  useEffect(() => {
    // Group assignments by multi_day_group_id
    const multiDayGroups = new Map<string, any[]>()

    assignments.forEach((assignment) => {
      if (assignment.multi_day_group_id) {
        if (!multiDayGroups.has(assignment.multi_day_group_id)) {
          multiDayGroups.set(assignment.multi_day_group_id, [])
        }
        multiDayGroups.get(assignment.multi_day_group_id)?.push(assignment)
      }
    })

    const newConnectors: JSX.Element[] = []

    // For each multi-day group, create connectors between days
    multiDayGroups.forEach((groupAssignments, groupId) => {
      // Sort assignments by date
      groupAssignments.sort((a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime())

      // Get unique dates in this group
      const uniqueDates = Array.from(new Set(groupAssignments.map((a) => a.work_date))).map((dateStr) =>
        parseISO(dateStr as string),
      )

      // Only process if we have multiple dates in the current week
      if (uniqueDates.length > 1) {
        // Find which days of the week contain these assignments
        const dayIndices = weekDays
          .map((day, index) => {
            return uniqueDates.some((date) => isSameDay(date, day)) ? index : -1
          })
          .filter((index) => index !== -1)

        // If we have at least two days in the current week, create connectors
        if (dayIndices.length > 1) {
          // Get the first assignment to determine the stage and order
          const firstAssignment = groupAssignments[0]
          const stageId = firstAssignment.order_stage_id

          // Create a unique key for this connector
          const key = `connector-${groupId}-${stageId}`

          // Add the connector
          newConnectors.push(
            <div key={key} className="connector-group" data-group-id={groupId}>
              {dayIndices.map((dayIndex, i) => {
                if (i < dayIndices.length - 1) {
                  return (
                    <div
                      key={`${key}-${i}`}
                      className="absolute h-1 bg-purple-400 z-10 rounded-full"
                      style={{
                        top: `calc(${stageId % 5} * 20px + 100px)`, // Adjust based on your layout
                        left: `calc(${dayIndex} * (100% / 7) + (100% / 14))`,
                        width: `calc(${dayIndices[i + 1] - dayIndex} * (100% / 7))`,
                      }}
                    />
                  )
                }
                return null
              })}
            </div>,
          )
        }
      }
    })

    setConnectors(newConnectors)
  }, [assignments, weekDays])

  return <div className="absolute inset-0 pointer-events-none">{connectors}</div>
}
