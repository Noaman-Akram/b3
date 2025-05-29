//useAssignments.ts
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Order, OrderStage, OrderStageAssignment } from '../types';
import { 
  getCalendarData,
  createAssignment as createAssignmentInApi, 
  updateAssignment as updateAssignmentInApi,
  deleteAssignment as deleteAssignmentInApi,
  CalendarData
} from '../schedulingService';

// Helper function to normalize the calendar data into our state structure
function normalizeCalendarData(calendarData: CalendarData[]): {
  assignments: OrderStageAssignment[];
  stages: OrderStage[];
  orders: Order[];
} {
  const assignments: OrderStageAssignment[] = [];
  const stagesMap = new Map<number, OrderStage>();
  const ordersMap = new Map<number, Order>();
  const orderDetailsMap = new Map<number, any>();

  calendarData.forEach(assignment => {
    // Process assignment
    const { order_stages, ...assignmentData } = assignment;
    assignments.push(assignmentData as OrderStageAssignment);

    // Process stage if it exists
    if (order_stages) {
      const { order_details, ...stageData } = order_stages;
      if (!stagesMap.has(stageData.id)) {
        stagesMap.set(stageData.id, stageData as OrderStage);
      }

      // Process order details if they exist
      if (order_details) {
        const { orders, ...detailData } = order_details;
        if (!orderDetailsMap.has(detailData.detail_id)) {
          orderDetailsMap.set(detailData.detail_id, detailData);
        }

        // Process order if it exists
        if (orders && !ordersMap.has(orders.id)) {
          ordersMap.set(orders.id, {
            ...orders,
            order_details: [detailData],
            work_types: [] as string[],
            address: '',
            order_price: 0
          } as Order);
        }
      }
    }
  });

  return {
    assignments,
    stages: Array.from(stagesMap.values()),
    orders: Array.from(ordersMap.values())
  };
}

export function useAssignments(weekStart: Date, weekEnd: Date) {
  const [assignments, setAssignments] = useState<OrderStageAssignment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stages, setStages] = useState<OrderStage[]>([]);
  const [loading, setLoading] = useState({
    assignments: false,
    orders: false,
    stages: false
  });
  const [error, setError] = useState<Error | null>(null);

  // Fetch all calendar data in a single query
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading({
        assignments: true,
        orders: true,
        stages: true
      });
      
      const from = format(weekStart, 'yyyy-MM-dd');
      const to = format(weekEnd, 'yyyy-MM-dd');
      
      // Fetch all data in a single query
      const calendarData = await getCalendarData(from, to);
      
      // Normalize the data into our state structure
      const { assignments, stages, orders } = normalizeCalendarData(calendarData);
      
      // Update state with the normalized data
      setAssignments(assignments);
      setStages(stages);
      setOrders(orders);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch calendar data');
      console.error('Error in fetchCalendarData:', error);
      setError(error);
    } finally {
      setLoading({
        assignments: false,
        orders: false,
        stages: false
      });
    }
  }, [weekStart, weekEnd]);
  
  // Initial data loading
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);
  
  // Add a new assignment
  const addAssignment = useCallback(async (assignment: Omit<OrderStageAssignment, 'id'>): Promise<OrderStageAssignment> => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }));
      const newAssignment = await createAssignmentInApi(assignment);
      setAssignments(prev => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add assignment');
      console.error('Error in addAssignment:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, []);
  
  // Update an existing assignment
  const updateAssignment = useCallback(async (id: number, updates: Partial<OrderStageAssignment>): Promise<OrderStageAssignment> => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }));
      const updatedAssignment = await updateAssignmentInApi(id, updates);
      setAssignments(prev => 
        prev.map(a => a.id === id ? { ...a, ...updatedAssignment } : a)
      );
      return updatedAssignment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update assignment');
      console.error('Error in updateAssignment:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, []);
  
  // Delete an assignment
  const deleteAssignment = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(prev => ({ ...prev, assignments: true }));
      await deleteAssignmentInApi(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete assignment');
      console.error('Error in deleteAssignment:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, []);
  
  // Return the state and actions
  return {
    assignments,
    orders,
    stages,
    loading: loading.assignments || loading.orders || loading.stages,
    error,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    refetch: fetchCalendarData,
  };
}

export default useAssignments;
