import { Order, OrderStage } from "../types";
import { supabase } from '../../../lib/supabase';

/**
 * Fetches all working orders with their details and stages
 * This is optimized for the assignment form to show available orders and their stages
 */
export async function getOrdersWithStages(): Promise<Order[]> {
  try {
    // First, fetch all working orders with their details
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_details:order_details (
          detail_id,
          order_id,
          assigned_to,
          updated_date,
          due_date,
          price,
          total_cost,
          notes,
          img_url,
          process_stage,
          updated_at
        )
      `)
      .eq('order_status', 'working');

    if (ordersError) throw ordersError;
    if (!ordersData) return [];

    // For each order, fetch stages for each of its details
    const ordersWithStages = await Promise.all(
      ordersData.map(async (order) => {
        if (!order.order_details || order.order_details.length === 0) {
          return {
            ...order,
            order_details: [],
            work_types: [],
            address: order.address || '',
            order_price: order.order_price || 0
          };
        }

        // Get all detail IDs for this order
        const detailIds = order.order_details.map(detail => detail.detail_id);

        // Fetch all stages for these details in a single query
        const { data: stagesData, error: stagesError } = await supabase
          .from('order_stages')
          .select('*')
          .in('order_detail_id', detailIds);

        if (stagesError) {
          console.error(`Error fetching stages for order ${order.id}:`, stagesError);
          return {
            ...order,
            order_details: order.order_details.map(detail => ({
              ...detail,
              stages: []
            })),
            work_types: [],
            address: order.address || '',
            order_price: order.order_price || 0
          };
        }

        // Group stages by order_detail_id
        const stagesByDetailId = new Map<number, OrderStage[]>();
        stagesData?.forEach(stage => {
          if (stage.order_detail_id) {
            const detailId = stage.order_detail_id;
            if (!stagesByDetailId.has(detailId)) {
              stagesByDetailId.set(detailId, []);
            }
            stagesByDetailId.get(detailId)?.push(stage);
          }
        });

        // Attach stages to their respective order details
        const orderDetailsWithStages = order.order_details.map(detail => ({
          ...detail,
          stages: stagesByDetailId.get(detail.detail_id) || []
        }));

        return {
          ...order,
          order_details: orderDetailsWithStages,
          work_types: [], // Initialize empty work types
          address: order.address || '',
          order_price: order.order_price || 0
        };
      })
    );

    return ordersWithStages;
  } catch (error) {
    console.error('Error in getOrdersWithStages:', error);
    throw error;
  }
}

/**
 * Fetches a single order with its details and stages by ID
 */
export async function getOrderWithStages(orderId: number): Promise<Order | null> {
  try {
    // Fetch the order with its details
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_details:order_details (
          detail_id,
          order_id,
          assigned_to,
          updated_date,
          due_date,
          price,
          total_cost,
          notes,
          img_url,
          process_stage,
          updated_at
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!orderData) return null;

    // If no details, return early
    if (!orderData.order_details || orderData.order_details.length === 0) {
      return {
        ...orderData,
        order_details: [],
        work_types: [],
        address: orderData.address || '',
        order_price: orderData.order_price || 0
      };
    }


    // Get all detail IDs for this order
    const detailIds = orderData.order_details.map(detail => detail.detail_id);

    // Fetch all stages for these details in a single query
    const { data: stagesData, error: stagesError } = await supabase
      .from('order_stages')
      .select('*')
      .in('order_detail_id', detailIds);

    if (stagesError) throw stagesError;

    // Group stages by order_detail_id
    const stagesByDetailId = new Map<number, OrderStage[]>();
    stagesData?.forEach(stage => {
      if (stage.order_detail_id) {
        const detailId = stage.order_detail_id;
        if (!stagesByDetailId.has(detailId)) {
          stagesByDetailId.set(detailId, []);
        }
        stagesByDetailId.get(detailId)?.push(stage);
      }
    });

    // Attach stages to their respective order details
    const orderDetailsWithStages = orderData.order_details.map(detail => ({
      ...detail,
      stages: stagesByDetailId.get(detail.detail_id) || []
    }));

    return {
      ...orderData,
      order_details: orderDetailsWithStages,
      work_types: [], // Initialize empty work types
      address: orderData.address || '',
      order_price: orderData.order_price || 0
    };
  } catch (error) {
    console.error(`Error in getOrderWithStages for order ${orderId}:`, error);
    throw error;
  }
}

export default {
  getOrdersWithStages,
  getOrderWithStages
};
