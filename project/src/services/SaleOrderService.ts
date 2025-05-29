import { BaseService } from './BaseService';
import { SaleOrder, CreateSaleOrderDTO, UpdateSaleOrderDTO } from '../types/saleOrder';

export class SaleOrderService extends BaseService {
  constructor() {
    super('sale_orders');
  }

  async getAllSaleOrders(options?: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }): Promise<SaleOrder[]> {
    const select = options?.select || `
      *,
      items:sale_order_items(*),
      customer:customers(id, name, email)
    `;

    return this.getAll<SaleOrder>({ ...options, select });
  }

  async getSaleOrderById(id: string): Promise<SaleOrder | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        items:sale_order_items(*),
        customer:customers(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SaleOrder;
  }

  async createSaleOrder(dto: CreateSaleOrderDTO): Promise<SaleOrder> {
    const { items, ...orderData } = dto;

    // Start a transaction
    const { data: order, error: orderError } = await this.supabase
      .from(this.tableName)
      .insert({
        ...orderData,
        status: orderData.status || 'draft',
        total_amount: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map(item => ({
      ...item,
      sale_order_id: order.id,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await this.supabase
      .from('sale_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return this.getSaleOrderById(order.id) as Promise<SaleOrder>;
  }

  async updateSaleOrder(id: string, dto: UpdateSaleOrderDTO): Promise<SaleOrder> {
    const { items, ...orderData } = dto;

    // Update order
    if (Object.keys(orderData).length > 0) {
      const { error: orderError } = await this.supabase
        .from(this.tableName)
        .update(orderData)
        .eq('id', id);

      if (orderError) throw orderError;
    }

    // Update items if provided
    if (items) {
      // Delete existing items
      const { error: deleteError } = await this.supabase
        .from('sale_order_items')
        .delete()
        .eq('sale_order_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
      const orderItems = items.map(item => ({
        ...item,
        sale_order_id: id,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await this.supabase
        .from('sale_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    return this.getSaleOrderById(id) as Promise<SaleOrder>;
  }

  async deleteSaleOrder(id: string): Promise<void> {
    // Delete order items first
    const { error: itemsError } = await this.supabase
      .from('sale_order_items')
      .delete()
      .eq('sale_order_id', id);

    if (itemsError) throw itemsError;

    // Delete the order
    const { error: orderError } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (orderError) throw orderError;
  }

  async getSaleOrdersByCustomer(customerId: string): Promise<SaleOrder[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        items:sale_order_items(*),
        customer:customers(id, name, email)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SaleOrder[];
  }

  async getSaleOrdersByStatus(status: SaleOrder['status']): Promise<SaleOrder[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        items:sale_order_items(*),
        customer:customers(id, name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SaleOrder[];
  }
} 