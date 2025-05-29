import { Customer, Measurement, Order } from '../types';

// Mock data for development

export const customers: Customer[] = [
  {
    id: 1,
    name: 'John Smith',
    address: '123 Main St, New York, NY',
    phone_number: '(555) 123-4567',
    company: 'Smith Renovations',
    paid_total: 15000,
    to_be_paid: 5000,
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2023-06-20T14:30:00Z'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    address: '456 Park Ave, Boston, MA',
    phone_number: '(555) 987-6543',
    company: 'Johnson Interiors',
    paid_total: 28000,
    to_be_paid: 0,
    created_at: '2023-02-10T10:15:00Z',
    updated_at: '2023-07-05T11:45:00Z'
  },
  {
    id: 3,
    name: 'Michael Davis',
    address: '789 Oak St, Chicago, IL',
    phone_number: '(555) 456-7890',
    company: 'Davis Construction',
    paid_total: 7500,
    to_be_paid: 12500,
    created_at: '2023-03-22T09:30:00Z',
    updated_at: '2023-06-18T15:20:00Z'
  }
];

export const orders: Order[] = [
  {
    id: 1,
    code: 'ORD-2023-001',
    customer_id: 1,
    customer_name: 'John Smith',
    address: '123 Main St, New York, NY',
    order_status: 'in_progress',
    order_price: 12000,
    work_types: ['Countertop', 'Backsplash'],
    created_by: 'Admin',
    company: 'Smith Renovations',
    created_at: '2023-05-15T08:00:00Z',
    updated_at: '2023-06-20T14:30:00Z'
  },
  {
    id: 2,
    code: 'ORD-2023-002',
    customer_id: 2,
    customer_name: 'Sarah Johnson',
    address: '456 Park Ave, Boston, MA',
    order_status: 'completed',
    order_price: 28000,
    work_types: ['Countertop', 'Island', 'Vanity'],
    created_by: 'Admin',
    company: 'Johnson Interiors',
    created_at: '2023-05-22T10:15:00Z',
    updated_at: '2023-07-05T11:45:00Z'
  },
  {
    id: 3,
    code: 'ORD-2023-003',
    customer_id: 3,
    customer_name: 'Michael Davis',
    address: '789 Oak St, Chicago, IL',
    order_status: 'pending',
    order_price: 20000,
    work_types: ['Countertop', 'Fireplace'],
    created_by: 'Admin',
    company: 'Davis Construction',
    created_at: '2023-06-10T09:30:00Z',
    updated_at: '2023-06-18T15:20:00Z'
  }
];

export const measurements: Measurement[] = [
  {
    id: 1,
    order_id: 1,
    material_name: 'Carrara Marble',
    material_type: 'Marble',
    unit: 'sqft',
    quantity: 45,
    cost: 120,
    total_cost: 5400
  },
  {
    id: 2,
    order_id: 1,
    material_name: 'Subway Tile',
    material_type: 'Ceramic',
    unit: 'sqft',
    quantity: 30,
    cost: 15,
    total_cost: 450
  },
  {
    id: 3,
    order_id: 2,
    material_name: 'Black Galaxy Granite',
    material_type: 'Granite',
    unit: 'sqft',
    quantity: 60,
    cost: 150,
    total_cost: 9000
  },
  {
    id: 4,
    order_id: 2,
    material_name: 'Calacatta Gold',
    material_type: 'Marble',
    unit: 'sqft',
    quantity: 35,
    cost: 200,
    total_cost: 7000
  },
  {
    id: 5,
    order_id: 3,
    material_name: 'Blue Pearl Granite',
    material_type: 'Granite',
    unit: 'sqft',
    quantity: 50,
    cost: 130,
    total_cost: 6500
  },
  {
    id: 6,
    order_id: 3,
    material_name: 'Fireplace Surround',
    material_type: 'Custom',
    unit: 'piece',
    quantity: 1,
    cost: 3500,
    total_cost: 3500
  }
];