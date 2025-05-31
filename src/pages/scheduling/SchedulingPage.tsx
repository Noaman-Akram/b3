//SchedulingPage.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import DebugPanel from "./components/DebugPanel";

// Types and Utils
import type { OrderStageAssignment, Employee } from "./types";

// Re-export types for components to use
export type { Order, OrderStage, OrderStageAssignment } from "./types";

// Static employee data
const STATIC_EMPLOYEES: Employee[] = [
  { id: 1, name: "John Doe", role: "Technician" },
  { id: 2, name: "Jane Smith", role: "Technician" },
  { id: 3, name: "Mike Johnson", role: "Supervisor" },
  { id: 4, name: "Sara Wilson", role: "Designer" },
  { id: 5, name: "Ahmed Mohamed", role: "Installer" },
  { id: 6, name: "Fatima Ali", role: "Project Manager" },
];

export default function SchedulingPage() {
  // Debug state
  const [showDebug, setShowDebug] = useState(true);

  // Calendar navigation
  const {
    currentDate,
    weekStart,
    weekEnd,
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
    refetch: refetchAssignments,
  } = useAssignments(weekStart, weekEnd);

  // Fetch orders separately using the hook
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
  const [formSelectedDate, setFormSelectedDate] = useState<Date | null>(null);

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
            };
            
            await addAssignmentToApi(newAssignment);
          }
        }
      }
      
      setIsFormOpen(false);
      setEditingAssignment(null);
      
      // Refresh assignments after successful submission
      refetchAssignments();
      
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
    setFormSelectedDate(date || null);
    setIsFormOpen(true);
  };

  // Get unique statuses for filtering
  const statusOptions = useMemo(() => getUniqueStatuses(stages), [stages, getUniqueStatuses]);

  // Overall loading state
  const overallLoading = loading || ordersLoading;

  // Overall error state
  const overallError = error || ordersError;

  // Effect to log data for debugging
  useEffect(() => {
    console.log('Week range:', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));
    console.log('Assignments count:', assignments?.length || 0);
    console.log('Filtered assignments count:', filteredAssignments?.length || 0);
  }, [weekStart, weekEnd, assignments, filteredAssignments]);

  // Loading and error states
  if (overallLoading && !assignments.length) {
    return <div className="p-4">Loading...</div>;
  }

  if (overallError && !assignments.length) {
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
          setFormSelectedDate(null);
        }}
        onSubmit={handleSubmitAssignment}
        stages={stages}
        assignment={editingAssignment}
        date={formSelectedDate || undefined}
      />

      {/* Debug Panel */}
      <DebugPanel 
        weekStart={weekStart}
        weekEnd={weekEnd}
        assignments={assignments}
        loading={loading}
        onRefresh={refetchAssignments}
      />
    </div>
  );
}