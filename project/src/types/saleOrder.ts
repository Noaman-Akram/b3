export * from './entities';

export interface SaleOrderItem {
  id: string;
  sale_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface SaleOrder {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  status: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  items: SaleOrderItem[];
}

export interface CreateSaleOrderDTO {
  customer_id: string;
  order_date: string;
  status?: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface UpdateSaleOrderDTO {
  customer_id?: string;
  order_date?: string;
  status?: 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  items?: {
    id?: string;
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
} 