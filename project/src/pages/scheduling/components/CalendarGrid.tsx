import { format } from "date-fns"
import { useMemo } from "react"
import { Button } from "../../../components/components/ui/button"
import type { OrderStageAssignment, Order, OrderStage } from "../types"
import { AssignmentCard } from "./AssignmentCard"
import { cn } from "../../../lib/utils"

export interface DayColumnProps {
  date: Date
  assignments: OrderStageAssignment[]
  onAddAssignment: (date: Date) => void
  onEditAssignment: (assignment: OrderStageAssignment) => void
  orders: Order[]
  stages: OrderStage[]
  isCurrentDay: boolean
}

export function DayColumn({
  date,
  assignments,
  onAddAssignment,
  onEditAssignment,
  orders,
  stages,
  isCurrentDay,
}: DayColumnProps) {
  const day = format(date, "EEE");
  const dayNumber = format(date, "d");
  const isToday = isCurrentDay;

  // Group assignments by stage and date
  const groupedAssignments = useMemo(() => {
    return assignments.reduce<Record<string, OrderStageAssignment[]>>((acc, assignment) => {
      const key = `${assignment.order_stage_id}-${assignment.work_date}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(assignment);
      return acc;
    }, {});
  }, [assignments]);

  return (
    <div className="flex flex-col border-r last:border-r-0">
      <div className={cn("p-2 text-center border-b", isToday ? "bg-blue-50 font-medium" : "bg-gray-50")}>
        <div className="text-sm text-gray-500">{day}</div>
        <div className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm", isToday && "bg-blue-600 text-white")}>
          {dayNumber}
        </div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]">
        {Object.entries(groupedAssignments).map(([key, group]) => {
          const assignment = group[0]; // Get the first assignment in the group

          // Find the stage first to get the order_id
          const stage = stages.find(s => s.id === assignment.order_stage_id);
          // Find the order using the stage's order_detail_id
          const order = stage && stage.order_detail_id
            ? orders.find(o => o.id === stage.order_detail_id)
            : undefined;

          return (
            <div key={key} onClick={() => onEditAssignment(assignment)} className="cursor-pointer">
              <AssignmentCard assignment={assignment} order={order} stage={stage} />
            </div>
          );
        })}
        {assignments.length === 0 && <div className="text-center text-sm text-muted-foreground py-2">No assignments</div>}
        <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => onAddAssignment(date)}>
          + Add Assignment
        </Button>
      </div>
    </div>
  );
}


interface CalendarGridProps {
  weekDays: Date[]
  assignments: OrderStageAssignment[]
  onAddAssignment: (date: Date) => void
  onEditAssignment: (assignment: OrderStageAssignment) => void
  orders: Order[]
  stages: OrderStage[]
  isCurrentDay: (date: Date) => boolean
}

export function CalendarGrid({
  weekDays,
  assignments,
  onAddAssignment,
  onEditAssignment,
  orders,
  stages,
  isCurrentDay,
}: CalendarGridProps) {
  // Group assignments by date for better performance
  const assignmentsByDate = useMemo(() => {
    return assignments.reduce<Record<string, OrderStageAssignment[]>>((acc, assignment) => {
      const date = assignment.work_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(assignment)
      return acc
    }, {})
  }, [assignments])

  return (
    <div className="flex flex-1 overflow-hidden">
      {weekDays.map((date) => {
        const dateKey = format(date, "yyyy-MM-dd")
        const dayAssignments = assignmentsByDate[dateKey] || []

        return (
          <DayColumn
            key={dateKey}
            date={date}
            assignments={dayAssignments}
            onAddAssignment={onAddAssignment}
            onEditAssignment={onEditAssignment}
            orders={orders}
            stages={stages}
            isCurrentDay={isCurrentDay(date)}
          />
        )
      })}
    </div>
  )
}

export default CalendarGrid
