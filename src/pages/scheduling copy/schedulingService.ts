//schedulingService.ts
import { Order, OrderStage, OrderStageAssignment, Employee } from "./types";
import { supabase } from '../../lib/supabase';

// Types for the joined data
export interface CalendarData extends OrderStageAssignment {
  order_stages: OrderStage & {
    order_details: {
      detail_id: number;
      order_id: number;
      assigned_to?: string | null;
      due_date?: string | null;
      price: number;
      total_cost: number;
      notes?: string | null;
      process_stage?: string | null;
      orders: {
        id: number;
        code: string;
        customer_name: string;
        order_status: string;
      };
    };
  };
}

/**
 * Fetches all calendar data including assignments, stages, order details, and order information
 * in a single query to avoid N+1 problem
 */
export async function getCalendarData(from: string, to: string): Promise<CalendarData[]> {
  console.log('Fetching calendar data from', from, 'to', to);
  
  const { data, error } = await supabase
    .from('order_stage_assignments')
    .select(`
      *,
      order_stages:order_stage_id (
        *,
        order_details:order_detail_id (
          detail_id,
          order_id,
          assigned_to,
          due_date,
          price,
          total_cost,
          notes,
          process_stage,
          orders:order_id (
            id,
            code,
            customer_name,
            order_status
          )
        )
      )
    `)
    .gte('work_date', from)
    .lte('work_date', to);
    
  if (error) {
    console.error('Error fetching calendar data:', error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} assignments for the date range`);
  
  // Type assertion to ensure we have the correct type
  return data as unknown as CalendarData[];
}

// Function to fetch all assignments
export async function getAssignments(from: string, to: string): Promise<OrderStageAssignment[]> {
  console.log('Fetching raw assignments from', from, 'to', to);
  
  const { data, error } = await supabase
    .from('order_stage_assignments')
    .select('*')
    .gte('work_date', from)
    .lte('work_date', to);
  
  if (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} raw assignments`);
  return (data || []) as OrderStageAssignment[];
}

// Function to create assignments is intentionally left as a placeholder
export async function createAssignments(): Promise<OrderStageAssignment[]> {
  throw new Error('Not implemented: createAssignments');
}

// Function to update assignments is intentionally left as a placeholder
export async function updateAssignments(): Promise<OrderStageAssignment[]> {
  throw new Error('Not implemented: updateAssignments');
}

// Function to delete assignments is intentionally left as a placeholder
export async function deleteAssignments(): Promise<boolean> {
  throw new Error('Not implemented: deleteAssignments');
}

// Function to check for duplicate assignments is intentionally left as a placeholder
export async function checkDuplicateAssignments(): Promise<boolean> {
  throw new Error('Not implemented: checkDuplicateAssignments');
}

// Get all available orders for the form
export async function getAvailableOrders(): Promise<Order[]> {
  console.log('Fetching available orders');
  
  // Fetch only orders with status 'Working', no joins, no stages
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_status', 'Working');
  
  if (error) {
    console.error('Error fetching available orders:', error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} available orders`);
  return (data || []) as Order[];
}

// Get all available employees for the form
export async function getAvailableEmployees(): Promise<Employee[]> {
  console.log('Fetching available employees');
  
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role');
  
  if (error) {
    console.error('Error fetching available employees:', error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} available employees`);
  return (data || []) as Employee[];
}

/**
 * Fetch all orders with status 'working'.
 */
export async function getWorkingOrders(): Promise<Order[]> {
  try {
    console.log('Fetching working orders');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_details (
          detail_id,
          order_id,
          assigned_to,
          due_date,
          notes,
          process_stage
        )
      `)
      .ilike('order_status', 'working')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching working orders:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} working orders`);
    return (data || []).map(order => ({
      id: order.id,
      code: order.code || '',
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Unknown Customer',
      address: order.address || 'No address provided',
      order_status: order.order_status || 'working',
      order_price: order.order_price || 0,
      work_types: order.work_types || [],
      created_by: order.created_by,
      company: order.company,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_details: Array.isArray(order.order_details) 
        ? order.order_details.map((detail: any) => ({
            detail_id: detail.detail_id,
            order_id: detail.order_id,
            assigned_to: detail.assigned_to,
            due_date: detail.due_date,
            notes: detail.notes,
            process_stage: detail.process_stage
          }))
        : []
    }));
  } catch (error) {
    console.error('Error in getWorkingOrders:', error);
    return [];
  }
}

/**
 * Fetch all order_details for a given order.
 */
export async function getOrderDetails(orderId: number): Promise<Array<{
  detail_id: number;
  order_id: number;
  assigned_to?: string | null;
  updated_date?: string | null;
  due_date?: string | null;
  price: number;
  total_cost: number;
  notes?: string | null;
  img_url?: string | null;
  process_stage?: string | null;
  updated_at?: string | null;
}>> {
  try {
    console.log(`Fetching order details for order ${orderId}`);
    
    const { data, error } = await supabase
      .from('order_details')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) {
      console.error(`Error fetching order details for order ${orderId}:`, error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} order details`);
    return (data || []).map(detail => ({
      detail_id: detail.detail_id,
      order_id: detail.order_id,
      assigned_to: detail.assigned_to || null,
      updated_date: detail.updated_date || null,
      due_date: detail.due_date || null,
      price: Number(detail.price) || 0,
      total_cost: Number(detail.total_cost) || 0,
      notes: detail.notes || null,
      img_url: detail.img_url || null,
      process_stage: detail.process_stage || null,
      updated_at: detail.updated_at || null
    }));
  } catch (error) {
    console.error(`Error in getOrderDetails for order ${orderId}:`, error);
    throw error;
  }
}

export async function getOrderStages(orderDetailId: number): Promise<OrderStage[]> {
  try {
    console.log(`Fetching stages for order detail ${orderDetailId}`);
    
    const { data, error } = await supabase
      .from('order_stages')
      .select('*')
      .eq('order_detail_id', orderDetailId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching stages for order detail ${orderDetailId}:`, error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} stages`);
    return (data || []).map(stage => ({
      id: stage.id,
      order_detail_id: stage.order_detail_id,
      stage_name: stage.stage_name || 'Unnamed Stage',
      status: stage.status || 'pending',
      planned_start_date: stage.planned_start_date,
      planned_finish_date: stage.planned_finish_date,
      actual_start_date: stage.actual_start_date,
      actual_finish_date: stage.actual_finish_date,
      notes: stage.notes,
      created_at: stage.created_at,
      updated_at: stage.updated_at
    }));
  } catch (error) {
    console.error('Error in getOrderStages:', error);
    return [];
  }
}

/**
 * Create a new assignment.
 * Matches the database schema fields exactly.
 */
export async function createAssignment(assignment: Omit<OrderStageAssignment, 'id'>): Promise<OrderStageAssignment> {
  console.log("Creating assignment:", assignment);
  
  // Validate required fields according to schema
  if (!assignment.employee_name || !assignment.work_date) {
    throw new Error("Missing required fields: employee_name and work_date are required");
  }

  // Ensure we only send fields that exist in the database schema
  const sanitizedAssignment = {
    order_stage_id: assignment.order_stage_id,
    employee_name: assignment.employee_name,
    work_date: assignment.work_date,
    note: assignment.note || null,
    is_done: assignment.is_done !== undefined ? assignment.is_done : false,
    created_at: assignment.created_at || new Date().toISOString(),
    employee_rate: assignment.employee_rate || null
  };

  const { data, error } = await supabase
    .from('order_stage_assignments')
    .insert(sanitizedAssignment)
    .select()
    .single();

  if (error) {
    console.error("Error creating assignment:", error);
    throw new Error(error.message);
  }

  console.log('Created assignment:', data);  
  return data as OrderStageAssignment;
}

/**
 * Update an assignment by id.
 * Only updates fields that exist in the database schema.
 */
export async function updateAssignment(
  id: number, 
  updates: Omit<Partial<OrderStageAssignment>, 'id'>
): Promise<OrderStageAssignment> {
  try {
    console.log(`Updating assignment ${id}:`, updates);
    
    // Ensure we only update fields that exist in the database schema
    const sanitizedUpdates: Record<string, any> = {};
    
    // Only include defined fields that are part of the schema
    if (updates.order_stage_id !== undefined) sanitizedUpdates.order_stage_id = updates.order_stage_id;
    if (updates.employee_name !== undefined) sanitizedUpdates.employee_name = updates.employee_name;
    if (updates.work_date !== undefined) sanitizedUpdates.work_date = updates.work_date;
    if (updates.note !== undefined) sanitizedUpdates.note = updates.note;
    if (updates.is_done !== undefined) sanitizedUpdates.is_done = updates.is_done;
    if (updates.created_at !== undefined) sanitizedUpdates.created_at = updates.created_at;
    if (updates.employee_rate !== undefined) sanitizedUpdates.employee_rate = updates.employee_rate;
    
    // If there are no fields to update, return the current assignment
    if (Object.keys(sanitizedUpdates).length === 0) {
      console.log(`No valid fields to update for assignment ${id}`);
      const { data: currentData } = await supabase
        .from('order_stage_assignments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!currentData) {
        throw new Error('Assignment not found');
      }
      
      return currentData as OrderStageAssignment;
    }
    
    // Perform the update with the sanitized fields
    const { data, error } = await supabase
      .from('order_stage_assignments')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating assignment ${id}:`, error);
      throw error;
    }
    
    console.log(`Updated assignment ${id}:`, data);
    return data as OrderStageAssignment;
    
  } catch (error) {
    console.error('Error in updateAssignment:', error);
    throw error;
  }
}

/**
 * Delete an assignment by id.
 */
export async function deleteAssignment(id: number): Promise<void> {
  console.log(`Deleting assignment ${id}`);
  
  const { error } = await supabase
    .from('order_stage_assignments')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting assignment ${id}:`, error);
    throw error;
  }
  
  console.log(`Deleted assignment ${id}`);
}

/**
 * Log an activity (optional).
 */
export async function logActivity(activity: any): Promise<void> {
  console.log(`Logging activity:`, activity);
  
  const { error } = await supabase
    .from('activity_log')
    .insert([activity]);
  
  if (error) {
    console.error(`Error logging activity:`, error);
    throw error;
  }
  
  console.log(`Activity logged successfully`);
}

/**
 * Fetches all orders with status 'working' including their nested order details and stages.
 */
export async function getWorkingOrdersWithStages(): Promise<Order[]> {
  try {
    console.log('Fetching working orders with stages');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_details (
          detail_id,
          order_id,
          assigned_to,
          due_date,
          notes,
          process_stage,
          img_url,
          updated_date,
          updated_at,
          price,
          total_cost,
          order_stages (
            *
          )
        )
      `)
      .ilike('order_status', 'working')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching working orders with stages:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} working orders with stages`);
    
    // Basic mapping, assuming Supabase returns the nested structure
    return (data || []).map(order => ({
      id: order.id,
      code: order.code || '',
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Unknown Customer',
      address: order.address || 'No address provided',
      order_status: order.order_status || 'working',
      order_price: order.order_price || 0,
      work_types: order.work_types || [],
      created_by: order.created_by,
      company: order.company,
      created_at: order.created_at,
      updated_at: order.updated_at,
      // Map order_details, which should already have nested order_stages due to the select query
      order_details: Array.isArray(order.order_details)
        ? order.order_details.map((detail: any) => ({ // Use 'any' temporarily if the exact nested type isn't inferred
            detail_id: detail.detail_id,
            order_id: detail.order_id,
            assigned_to: detail.assigned_to,
            due_date: detail.due_date,
            notes: detail.notes,
            process_stage: detail.process_stage,
            img_url: detail.img_url,
            updated_date: detail.updated_date,
            updated_at: detail.updated_at,
            price: detail.price,
            total_cost: detail.total_cost,
            stages: Array.isArray(detail.order_stages) ? detail.order_stages : [], // Map nested stages
          }))
        : []
    }));
  } catch (error) {
    console.error('Error in getWorkingOrdersWithStages:', error);
    throw error;
  }
}

/**
 * Fetches all orders with status 'working'.
 */
// Renamed to getAllOrders to replace the mock function
export async function getAllOrders(): Promise<Order[]> {
  try {
    console.log('Fetching all working orders');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_details (
          detail_id,
          order_id,
          assigned_to,
          due_date,
          notes,
          process_stage,
          img_url,
          updated_date,
          updated_at,
          price,
          total_cost,
          order_stages (
            *
          )
        )
      `)
      .ilike('order_status', 'working')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} orders`);
    
    // Basic mapping, assuming Supabase returns the nested structure
    return (data || []).map(order => ({
      id: order.id,
      code: order.code || '',
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Unknown Customer',
      address: order.address || 'No address provided',
      order_status: order.order_status || 'working',
      order_price: order.order_price || 0,
      work_types: order.work_types || [],
      created_by: order.created_by,
      company: order.company,
      created_at: order.created_at,
      updated_at: order.updated_at,
      // Map order_details, which should already have nested order_stages due to the select query
      order_details: Array.isArray(order.order_details) ? order.order_details.map((detail: any) => ({ // Use 'any' temporarily if the exact nested type isn't inferred
            detail_id: detail.detail_id,
            order_id: detail.order_id,
            assigned_to: detail.assigned_to,
            due_date: detail.due_date,
            notes: detail.notes,
            process_stage: detail.process_stage,
            img_url: detail.img_url, // Included based on OrderDetailWithStages type
            updated_date: detail.updated_date, // Included based on OrderDetailWithStages type
            updated_at: detail.updated_at, // Included based on OrderDetailWithStages type
            price: detail.price, // Included based on OrderDetailWithStages type
            total_cost: detail.total_cost, // Included based on OrderDetailWithStages type
            stages: Array.isArray(detail.order_stages) ? detail.order_stages : [], // Map nested stages
          }))
        : []
    }));
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    throw error;
  }
}