import { Building2, User, ClipboardList } from "lucide-react"
import { Button } from "../../../components/components/ui/button"
import { cn } from "../../../lib/utils"
import { OrderStageAssignment, Order, OrderStage } from "../types"
import { getStageColorScheme } from "../utils/assignmentUtils"

interface AssignmentCardProps {
  assignment: OrderStageAssignment
  order?: Order
  stage?: OrderStage
  onClick?: () => void
}

export const AssignmentCard = ({ assignment, order, stage, onClick }: AssignmentCardProps) => {
  const colorScheme = getStageColorScheme(stage?.status)

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded border-l-4 cursor-pointer transition-colors hover:bg-gray-50",
        colorScheme.border,
        colorScheme.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div className="w-full">
          <div className="flex items-center space-x-1">
            <ClipboardList className={cn("h-3 w-3 flex-shrink-0", colorScheme.icon)} />
            <span className="text-xs font-medium line-clamp-1">
              {order?.code ? `${order.code} - ` : ''}{stage?.stage_name || 'Unassigned Stage'}
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-1 text-xs text-muted-foreground">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{assignment.employee_name}</span>
          </div>
          {order?.customer_name && (
            <div className="mt-1 flex items-center space-x-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{order.customer_name}</span>
            </div>
          )}
        </div>
        {assignment.note && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Show note in a tooltip or modal
              alert(assignment.note)
            }}
          >
            <span className="sr-only">View note</span>
            <span className="text-xs">📝</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default AssignmentCard
