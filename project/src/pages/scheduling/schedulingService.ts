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
  
  // Type assertion to ensure we have the correct type
  return data as unknown as CalendarData[];
}

// Function to fetch all assignments
export async function getAssignments(from: string, to: string): Promise<OrderStageAssignment[]> {
  const { data, error } = await supabase
    .from('order_stage_assignments')
    .select('*')
    .gte('work_date', from)
    .lte('work_date', to);
  if (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
  return (data || []) as OrderStageAssignment[];
}

// Function to create new assignments
export async function createAssignments(): Promise<OrderStageAssignment[]> {
  throw new Error('Not implemented: createAssignments');
}

// Function to update existing assignments
export async function updateAssignments(): Promise<OrderStageAssignment[]> {
  throw new Error('Not implemented: updateAssignments');
}

// Function to delete assignments
export async function deleteAssignments(): Promise<boolean> {
  throw new Error('Not implemented: deleteAssignments');
}

// Function to check for duplicate assignments
export async function checkDuplicateAssignments(): Promise<boolean> {
  throw new Error('Not implemented: checkDuplicateAssignments');
}

// Get all available orders for the form
export async function getAvailableOrders(): Promise<Order[]> {
  // Fetch only orders with status 'Working', no joins, no stages
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_status', 'Working');
  if (error) {
    console.error('Error fetching available orders:', error);
    throw error;
  }
  return (data || []) as Order[];
}

// Get all available employees for the form
export async function getAvailableEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role');
  if (error) {
    console.error('Error fetching available employees:', error);
    throw error;
  }
  return (data || []) as Employee[];
}

/**
 * Fetch all orders with status 'working'.
 */
export async function getWorkingOrders(): Promise<Order[]> {
  try {
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
    const { data, error } = await supabase
      .from('order_details')
      .select('*')
      .eq('order_id', orderId); // Ensure we're selecting the correct order details by order_id
    
    if (error) {
      console.error(`Error fetching order details for order ${orderId}:`, error);
      throw error;
    }

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
    const { data, error } = await supabase
      .from('order_stages')
      .select('*')
      .eq('order_detail_id', orderDetailId)  // Ensuring we are linking with the correct order_detail_id
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching stages for order detail ${orderDetailId}:`, error);
      throw error;
    }

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
 */
// Function to create a single assignment
export async function createAssignment(assignment: Omit<OrderStageAssignment, 'id'>) {
  console.log("➡️ createAssignment called with:", assignment);

  const { data, error } = await supabase
    .from('order_stage_assignments')
    .insert(assignment)
    .select()
    .single();

    if (error) {
      console.error("❌ createAssignment supabase error:", error);
      throw new Error(error.message);
    }
  // Update the process_stage to 'scheduled' if order_detail_id exists
  if (assignment.order_detail_id) {
    await supabase
      .from('order_details')
      .update({ process_stage: 'scheduled' })
      .eq('detail_id', assignment.order_detail_id);
  }

  console.log('From data service, added to DB: ', data);  

  return data;
}


/**
 * Update an assignment by id.
 */
export async function updateAssignment(
  id: number, 
  updates: Omit<Partial<OrderStageAssignment>, 'id'>
): Promise<OrderStageAssignment> {
  try {
    // Ensure we have a valid update object
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No update data provided');
    }

    // Extract the order_detail_id if it exists and create a clean update object
    const { order_detail_id, ...updateFields } = updates;
    
    // Only include defined fields in the update
    const cleanUpdateFields = Object.fromEntries(
      Object.entries(updateFields)
        .filter(([_, v]) => v !== undefined)
    );
    
    // If there are no fields to update after cleaning, return the current assignment
    if (Object.keys(cleanUpdateFields).length === 0 && order_detail_id === undefined) {
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
    
    // Perform the update with the cleaned fields
    const { data, error } = await supabase
      .from('order_stage_assignments')
      .update(cleanUpdateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the process_stage to 'scheduled' in order_details if order_detail_id is provided
    const detailIdToUpdate = order_detail_id || data.order_detail_id;
    if (detailIdToUpdate) {
      await supabase
        .from('order_details')
        .update({ 
          process_stage: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('detail_id', detailIdToUpdate);
    }
    
    // Include the order_detail_id in the returned data if it was provided
    return {
      ...data,
      order_detail_id: order_detail_id !== undefined ? order_detail_id : data.order_detail_id
    } as OrderStageAssignment;
  } catch (error) {
    console.error('Error in updateAssignment:', error);
    throw error;
  }
}

/**
 * Delete an assignment by id.
 */
export async function deleteAssignment(id: number): Promise<void> {
  const { error } = await supabase
    .from('order_stage_assignments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Log an activity (optional).
 */
export async function logActivity(activity: any): Promise<void> {
  const { error } = await supabase
    .from('activity_log')
    .insert([activity]);
  if (error) throw error;
}

/**
 * Fetches all orders with status 'working' including their nested order details and stages.
 */
export async function getWorkingOrdersWithStages(): Promise<Order[]> {
  try {
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

    // The query structure should automatically nest order_stages within order_details
    // based on the Supabase select syntax with parentheses.
    // We might need to adjust the mapping if the returned structure isn't exactly
    // Order[] with OrderDetailWithStages[] based on the Supabase client's return type for this complex select.
    // For now, we assume it aligns with the type definition.

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
    console.error('Error in getWorkingOrdersWithStages:', error);
    // Depending on error handling strategy, might re-throw or return empty array
    throw error;
  }
}

/**
 * Fetches all orders with status 'working'.
 */
// Renamed to getAllOrders to replace the mock function
export async function getAllOrders(): Promise<Order[]> {
  try {
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
      console.error("❌ getAllOrders supabase error:", error);
      throw error;
    }

    // The query structure should automatically nest order_stages within order_details
    // based on the Supabase select syntax with parentheses.
    // We might need to adjust the mapping if the returned structure isn't exactly
    // Order[] with OrderDetailWithStages[] based on the Supabase client's return type for this complex select.
    // For now, we assume it aligns with the type definition.

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
    console.error('Error in getAllOrders:', error); // Updated console log
    // Depending on error handling strategy, might re-throw or return empty array
    throw error;
  }
} 