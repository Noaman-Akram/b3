import { useState, useMemo } from "react";
import { Filter, ChevronsUpDown } from "lucide-react";
import { Button } from "../../../components/components/ui/button";
import { Label } from "../../../components/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select";
import { Badge } from "../../../components/components/ui/badge";
import { ScrollArea } from "../../../components/components/ui/scroll-area";
import { Checkbox } from "../../../components/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/components/ui/collapsible";
import MultiSelect from '../ui/MultiSelect';
import { Order, OrderStage, Employee } from '../../../types/entities';

interface FilterPanelProps {
  orders: Order[];
  employees: Employee[];
  stages: OrderStage[];
  selectedOrderId: number | null;
  setSelectedOrderId: (id: number | null) => void;
  selectedEmployees: string[];
  setSelectedEmployees: (employees: string[]) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  resetFilters: () => void;
  isAnyFilterActive: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  orders,
  employees,
  stages,
  selectedOrderId,
  setSelectedOrderId,
  selectedEmployees,
  setSelectedEmployees,
  selectedStatuses,
  setSelectedStatuses,
  resetFilters,
  isAnyFilterActive,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const allStatuses = useMemo(() => {
    const statuses = new Set<string>();
    stages.forEach((stage) => {
      if (stage.status) {
        statuses.add(stage.status);
      }
    });
    return Array.from(statuses);
  }, [stages]);

  const toggleStatus = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-2 border rounded-lg bg-white min-h-[350px] flex flex-col justify-start shadow-md text-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium">Filters</h2>
          {isAnyFilterActive && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAnyFilterActive && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm text-gray-500">
              Reset
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className="p-2 pt-0 flex flex-col gap-3">
          {/* Order Filter */}
          <div>
            <Label className="mb-1 block">Order</Label>
            <Select
              value={selectedOrderId?.toString() || "0"}
              onValueChange={(value) => {
                setSelectedOrderId(Number(value) ?? 0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order: Order) => (
                  <SelectItem key={order.id} value={order.id.toString()}>
                    {order.code} - {order.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Filter */}
          <div>
            <Label className="mb-1 block">Employee</Label>
            <MultiSelect options={employees} selected={selectedEmployees} onChange={setSelectedEmployees} />
          </div>

          {/* Status Filter */}
          <div>
            <Label className="mb-1 block">Status</Label>
            <div className="space-y-1 border rounded-md p-2 max-h-32 overflow-y-auto">
              {allStatuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <Label htmlFor={`status-${status}`} className="text-xs cursor-pointer">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FilterPanel; 