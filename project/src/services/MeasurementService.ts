import { supabase } from '../lib/supabase';
import { Measurement } from '../types/order';

export class MeasurementService {
  async getAll(order_id?: number): Promise<Measurement[]> {
    console.log('[MeasurementService] Fetching measurements for order:', order_id);
    let query = supabase.from('measurements').select('*');
    if (order_id !== undefined) {
      query = query.eq('order_id', order_id);
    }
    const { data, error } = await query.order('id', { ascending: true });
    console.log('[MeasurementService] Fetched measurements:', { data, error });
    if (error) throw error;
    return data as Measurement[];
  }

  async getById(id: number): Promise<Measurement | null> {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Measurement;
  }

  async create(measurement: Omit<Measurement, 'id'>): Promise<Measurement> {
    const { data, error } = await supabase
      .from('measurements')
      .insert(measurement)
      .select()
      .single();
    if (error) throw error;
    return data as Measurement;
  }

  async update(id: number, measurement: Partial<Measurement>): Promise<Measurement> {
    const { data, error } = await supabase
      .from('measurements')
      .update(measurement)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Measurement;
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('measurements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async getMeasurements(orderId: number) {
    console.log('[MeasurementService] Fetching measurements for order:', orderId);
    let query = supabase.from('measurements').select('*');
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    const { data, error } = await query;
    console.log('[MeasurementService] Fetched measurements:', { data, error });
    if (error) throw error;
    return data;
  }
} 