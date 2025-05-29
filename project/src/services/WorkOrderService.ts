import { supabase } from '../lib/supabase';
import { WorkOrderDetail, WorkOrderStage, CreateWorkOrderDTO } from '../types/order';
import { WORK_ORDER_STAGES, STAGE_STATUSES } from '../lib/constants';

export class WorkOrderService {
  // Fetch all work orders
  async getAll(): Promise<WorkOrderDetail[]> {
    const { data, error } = await supabase
      .from('order_details')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as WorkOrderDetail[];
  }

  // Create a new work order (with default stages)
  async create(dto: CreateWorkOrderDTO): Promise<WorkOrderDetail> {
    console.log('[WorkOrderService] Creating work order:', dto);
    // 1. Insert order_details
    const { data: detail, error } = await supabase
      .from('order_details')
      .insert({
        ...dto,
        process_stage: STAGE_STATUSES[0].value, // Set initial status to 'not_started'
      })
      .select()
      .single();
    console.log('[WorkOrderService] Work order creation result:', { data: detail, error });
    if (error) throw error;

    // 2. Create default stages
    const stages = WORK_ORDER_STAGES.map(stage => ({
      order_detail_id: detail.detail_id,
      stage_name: stage.value,
      status: STAGE_STATUSES[0].value, // Set initial status to 'not_started'
      created_at: new Date().toISOString(),
    }));
    await supabase.from('order_stages').insert(stages);

    return detail as WorkOrderDetail;
  }

  // Update a work order
  async update(detail_id: number, updates: Partial<WorkOrderDetail>): Promise<WorkOrderDetail> {
    const { data, error } = await supabase
      .from('order_details')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('detail_id', detail_id)
      .select()
      .single();
    if (error) throw error;
    return data as WorkOrderDetail;
  }

  // Upload image to external provider (stub, replace with real logic)
  async uploadImage(file: File): Promise<string> {
    // TODO: Replace with real upload logic (e.g., Cloudinary, S3, etc.)
    // For now, just return a placeholder URL
    return Promise.resolve('https://via.placeholder.com/300x200.png?text=Work+Order+Image');
  }

  // Get stages for a work order
  async getStages(order_detail_id: number): Promise<WorkOrderStage[]> {
    const { data, error } = await supabase
      .from('order_stages')
      .select('*')
      .eq('order_detail_id', order_detail_id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as WorkOrderStage[];
  }

  async createStages(orderId: number) {
    console.log('[WorkOrderService] Creating stages for work order:', orderId);
    const stages = WORK_ORDER_STAGES.map(stage => ({
      order_id: orderId,
      stage_name: stage.value,
      status: STAGE_STATUSES[0].value, // Set initial status to 'not_started'
      created_at: new Date().toISOString(),
    }));
    const { data, error } = await supabase.from('order_stages').insert(stages);
    console.log('[WorkOrderService] Stages creation result:', { data, error });
    if (error) throw error;
    return data;
  }
} 