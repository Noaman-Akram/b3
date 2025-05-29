//SchedulingPage.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Plus } from "lucide-react";

// Hooks
import useCalendarNavigation from "./hooks/useCalendarNavigation";
import useAssignments from "./hooks/useAssignments";
import useFilters from "./hooks/useFilters";
import useOrders from './hooks/useOrders';

// Components
import CalendarHeader from "./components/CalendarHeader";
import { CalendarGrid } from "./components/CalendarGrid";
import AssignmentForm from "./components/AssignmentForm";
import FilterPanel from "./components/FilterPanel";

// Types and Utils
import type { OrderStageAssignment, Employee } from "./types";

// Re-export types for components to use
export type { Order, OrderStage, OrderStageAssignment } from "./types";

// Static employee data
const STATIC_EMPLOYEES: Employee[] = [
  { id: 1, name: "John Doe", role: "Technician" },
  { id: 2, name: "Jane Smith", role: "Technician" },
  { id: 3, name: "Mike Johnson", role: "Supervisor" },
];

export default function SchedulingPage() {
  // Calendar navigation
  const {
    currentDate,
    weekDays,
    weekRangeText,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    isCurrentDay,
  } = useCalendarNavigation();

  // Data management (assignments and stages)
  const {
    assignments,
    stages,
    loading,
    error,
    addAssignment: addAssignmentToApi,
    updateAssignment: updateAssignmentInApi,
  } = useAssignments(weekDays[0], weekDays[weekDays.length - 1]);

  // Fetch orders separately using the new hook
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();

  // Filtering
  const {
    filters,
    setFilters,
    isAnyFilterActive,
    resetFilters,
    filterAssignments,
    getUniqueStatuses,
  } = useFilters();

  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<OrderStageAssignment | null>(null);

  // Filter assignments based on current filters
  const filteredAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments) || !orders || !Array.isArray(orders) || !stages || !Array.isArray(stages)) return [];
    
    return filterAssignments(
      assignments,
      (assignment) => {
        if (!assignment) return undefined;
        
        // Find the stage for this assignment
        const stage = stages.find(s => s?.id === assignment.order_stage_id);
        if (!stage) return undefined;
        
        // Find the order that matches the stage's order_detail_id
        return orders.find(order => {
          // If the order has stages, check if any stage's id matches our stage's id
          if (order.order_details?.some(detail => detail.stages?.some(s => s.id === stage.id))) {
             return true;
          }
          
          // Fallback: check if the order's id matches the stage's order_detail_id
          // This is a fallback and might not be needed if all stages are properly populated
          return stage.order_detail_id !== undefined && order.order_details?.some(detail => detail.detail_id === stage.order_detail_id);
        });
      },
      (assignment) => {
        if (!assignment) return undefined;
        return stages.find(s => s?.id === assignment.order_stage_id);
      }
    );
  }, [assignments, filters, orders, stages, filterAssignments]);

  // Get assignments for a specific day
  const getAssignmentsForDay = useCallback((date: Date) => {
    if (!filteredAssignments || !Array.isArray(filteredAssignments)) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredAssignments.filter(a => a?.work_date === dateStr);
  }, [filteredAssignments]);

  // Handle form submission
  const handleSubmitAssignment = async (assignmentsData: Omit<OrderStageAssignment, 'id'> | Omit<OrderStageAssignment, 'id'>[]) => {
    try {
      const assignmentsArray = Array.isArray(assignmentsData) ? assignmentsData : [assignmentsData];
      
      // Validate required fields for each assignment
      for (const assignment of assignmentsArray) {
        if (!assignment.order_stage_id || !assignment.employee_name || !assignment.work_date) {
          console.error('Missing required fields in assignment:', assignment);
          throw new Error('Missing required fields in assignment');
        }
      }
      
      if (editingAssignment) {
        // Update existing assignment - only use the first one if multiple are provided
        if (assignmentsArray.length > 0) {
          const updateData: Omit<OrderStageAssignment, 'id'> = {
            order_stage_id: assignmentsArray[0].order_stage_id,
            employee_name: assignmentsArray[0].employee_name,
            work_date: assignmentsArray[0].work_date,
            // Include optional fields if they exist
            note: assignmentsArray[0].note,
            is_done: assignmentsArray[0].is_done || false,
            created_at: assignmentsArray[0].created_at || new Date().toISOString(),
            employee_rate: assignmentsArray[0].employee_rate || null,
            order_detail_id: assignmentsArray[0].order_detail_id
          };
          
          await updateAssignmentInApi(editingAssignment.id, updateData);
        }
      } else {
        // Create new assignments
        for (const assignment of assignmentsArray) {
          if (assignment) {
            const newAssignment: Omit<OrderStageAssignment, 'id'> = {
              order_stage_id: assignment.order_stage_id,
              employee_name: assignment.employee_name,
              work_date: assignment.work_date,
              // Optional fields with defaults
              note: assignment.note,
              is_done: false,
              created_at: new Date().toISOString(),
              employee_rate: null,
              order_detail_id: assignment.order_detail_id
            };
            
            await addAssignmentToApi(newAssignment);
          }
        }
      }
      
      setIsFormOpen(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error("Error saving assignment:", error);
      // You might want to show an error toast/message to the user here
      throw error; // Re-throw to allow the form to handle the error
    }
  };

  // Handle opening the form to edit an assignment
  const handleEditAssignment = (assignment: OrderStageAssignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  // Handle opening the form to create a new assignment
  const handleAddAssignment = (date?: Date) => {
    setEditingAssignment(null);
    if (date) {
      // Pre-fill the date if provided
      setEditingAssignment({
        id: 0,
        order_stage_id: 0,
        employee_name: "",
        work_date: format(date, 'yyyy-MM-dd'),
        note: "",
        is_done: false,
        created_at: new Date().toISOString(),
      } as OrderStageAssignment);
    }
    setIsFormOpen(true);
  };

  // Get unique statuses for filtering
  const statusOptions = useMemo(() => getUniqueStatuses(stages), [stages, getUniqueStatuses]);

  // Overall loading state
  const overallLoading = loading || ordersLoading;

  // Overall error state
  const overallError = error || ordersError;

  // Loading and error states
  if (overallLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (overallError) {
    return (
      <div className="p-4 text-red-500">
        Error: {overallError.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
      <div className="p-4 border-b">
        <CalendarHeader
          currentDate={currentDate}
          weekRangeText={weekRangeText}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
          onAddAssignment={() => handleAddAssignment()}
        />
      </div>

      {/* Filters */}
      <div className="p-4 border-b">
        <FilterPanel
          orders={orders}
          employees={STATIC_EMPLOYEES}
          stages={stages}
          selectedOrderId={filters.orderId}
          setSelectedOrderId={setFilters.setOrderId}
          selectedEmployees={filters.employeeNames}
          setSelectedEmployees={setFilters.setEmployeeNames}
          selectedStatuses={filters.statuses}
          setSelectedStatuses={setFilters.setStatuses}
          resetFilters={resetFilters}
          isAnyFilterActive={isAnyFilterActive}
        />
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <CalendarGrid
          weekDays={weekDays}
          assignments={filteredAssignments}
          onAddAssignment={handleAddAssignment}
          onEditAssignment={handleEditAssignment}
          orders={orders}
          stages={stages}
          isCurrentDay={isCurrentDay}
        />
      </div>

      {/* Assignment Form Modal */}
      <AssignmentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAssignment(null);
        }}
        onSubmit={handleSubmitAssignment}
        stages={stages}
        assignment={editingAssignment}
      />
    </div>
  );
}
