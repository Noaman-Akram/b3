import { useState, useEffect, useCallback } from "react";
import type { OrderStageAssignment, OrderStage } from "../types";
import { getCalendarData, createAssignment, updateAssignment as updateAssignmentService, CalendarData } from "../schedulingService";

const useAssignments = (startDate: Date, endDate: Date) => {
  const [assignments, setAssignments] = useState<OrderStageAssignment[]>([]);
  const [stages, setStages] = useState<OrderStage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCalendarData(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
      
      // Extract assignments and unique stages from the fetched data
      const fetchedAssignments: OrderStageAssignment[] = data.map(item => ({
        id: item.id,
        order_stage_id: item.order_stage_id,
        order_detail_id: item.order_stages.order_details.detail_id, // Extract order_detail_id
        employee_name: item.employee_name,
        work_date: item.work_date,
        note: item.note,
        is_done: item.is_done,
        created_at: item.created_at,
        employee_rate: item.employee_rate,
      }));

      const fetchedStages: OrderStage[] = Array.from(
        new Map(data.map(item => [item.order_stages.id, item.order_stages])).values()
      );

      setAssignments(fetchedAssignments);
      setStages(fetchedStages);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching calendar data:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAssignment = useCallback(async (assignment: Omit<OrderStageAssignment, 'id'>) => {
    try {
      const newAssignment = await createAssignment(assignment);
      setAssignments((prev) => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      setError(err as Error);
      console.error("Error adding assignment:", err);
      throw err; // Re-throw to allow UI to handle
    }
  }, []);

  const updateAssignment = useCallback(async (id: number, updates: Omit<Partial<OrderStageAssignment>, 'id'>): Promise<OrderStageAssignment> => {
    try {
      const updatedAssignment: OrderStageAssignment = await updateAssignmentService(id, updates);
      setAssignments((prev) =>
        prev.map((assign) => (assign.id === id ? updatedAssignment : assign))
      );
      return updatedAssignment;
    } catch (err) {
      setError(err as Error);
      console.error("Error updating assignment:", err);
      throw err; // Re-throw to allow UI to handle
    }
  }, []);

  return {
    assignments,
    stages,
    loading,
    error,
    addAssignment,
    updateAssignment,
  };
};

export default useAssignments; 