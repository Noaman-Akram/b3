import { Order, OrderStage, OrderStageAssignment } from '../types/scheduling';

export const mockOrders: Order[] = [
  {
    id: 1,
    code: "KW-101",
    customer_id: 1,
    customer_name: "John Smith",
    address: "123 Main St",
    order_status: "active",
    order_price: 1000,
    work_types: ["installation"],
    created_by: "admin",
    company: "ABC Corp",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    stages: [
      { id: 1, order_detail_id: 1, stage_name: "Measurement", status: "completed", planned_start_date: "2023-01-01", planned_finish_date: "2023-01-02", actual_start_date: "2023-01-01", actual_finish_date: "2023-01-02", notes: "", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 2, order_detail_id: 1, stage_name: "Cutting", status: "in_progress", planned_start_date: "2023-01-03", planned_finish_date: "2023-01-04", actual_start_date: "2023-01-03", actual_finish_date: null, notes: "", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 3, order_detail_id: 1, stage_name: "Polishing", status: "pending", planned_start_date: "2023-01-05", planned_finish_date: "2023-01-06", actual_start_date: null, actual_finish_date: null, notes: "", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
      { id: 4, order_detail_id: 1, stage_name: "Installation", status: "pending", planned_start_date: "2023-01-07", planned_finish_date: "2023-01-08", actual_start_date: null, actual_finish_date: null, notes: "", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" }
    ]
  },
  {
    id: 2,
    code: "FW-202",
    customer_id: 2,
    customer_name: "Sarah Johnson",
    address: "456 Oak St",
    order_status: "active",
    order_price: 2000,
    work_types: ["tiling"],
    created_by: "admin",
    company: "XYZ Corp",
    created_at: "2023-01-02T00:00:00Z",
    updated_at: "2023-01-02T00:00:00Z",
    stages: [
      { id: 5, order_detail_id: 2, stage_name: "Site Preparation", status: "completed", planned_start_date: "2023-01-02", planned_finish_date: "2023-01-03", actual_start_date: "2023-01-02", actual_finish_date: "2023-01-03", notes: "", created_at: "2023-01-02T00:00:00Z", updated_at: "2023-01-02T00:00:00Z" },
      { id: 6, order_detail_id: 2, stage_name: "Tiling", status: "in_progress", planned_start_date: "2023-01-04", planned_finish_date: "2023-01-05", actual_start_date: "2023-01-04", actual_finish_date: null, notes: "", created_at: "2023-01-02T00:00:00Z", updated_at: "2023-01-02T00:00:00Z" },
      { id: 7, order_detail_id: 2, stage_name: "Grouting", status: "pending", planned_start_date: "2023-01-06", planned_finish_date: "2023-01-07", actual_start_date: null, actual_finish_date: null, notes: "", created_at: "2023-01-02T00:00:00Z", updated_at: "2023-01-02T00:00:00Z" },
      { id: 8, order_detail_id: 2, stage_name: "Final Inspection", status: "pending", planned_start_date: "2023-01-08", planned_finish_date: "2023-01-09", actual_start_date: null, actual_finish_date: null, notes: "", created_at: "2023-01-02T00:00:00Z", updated_at: "2023-01-02T00:00:00Z" }
    ]
  },
  {
    id: 3,
    code: "K-303",
    customer_id: 3,
    customer_name: "Michael Brown",
    address: "789 Pine St",
    order_status: "active",
    order_price: 3000,
    work_types: ["fabrication"],
    created_by: "admin",
    company: "DEF Corp",
    created_at: "2023-01-03T00:00:00Z",
    updated_at: "2023-01-03T00:00:00Z",
    stages: [
      { id: 9, order_detail_id: 3, stage_name: "Design Approval", status: "completed", planned_start_date: "2023-01-03", planned_finish_date: "2023-01-04", actual_start_date: "2023-01-03", actual_finish_date: "2023-01-04", notes: "", created_at: "2023-01-03T00:00:00Z", updated_at: "2023-01-03T00:00:00Z" },
      { id: 10, order_detail_id: 3, stage_name: "Material Selection", status: "completed", planned_start_date: "2023-01-05", planned_finish_date: "2023-01-06", actual_start_date: "2023-01-05", actual_finish_date: "2023-01-06", notes: "", created_at: "2023-01-03T00:00:00Z", updated_at: "2023-01-03T00:00:00Z" },
      { id: 11, order_detail_id: 3, stage_name: "Fabrication", status: "in_progress", planned_start_date: "2023-01-07", planned_finish_date: "2023-01-08", actual_start_date: "2023-01-07", actual_finish_date: null, notes: "", created_at: "2023-01-03T00:00:00Z", updated_at: "2023-01-03T00:00:00Z" },
      { id: 12, order_detail_id: 3, stage_name: "Installation", status: "pending", planned_start_date: "2023-01-09", planned_finish_date: "2023-01-10", actual_start_date: null, actual_finish_date: null, notes: "", created_at: "2023-01-03T00:00:00Z", updated_at: "2023-01-03T00:00:00Z" }
    ]
  },
  {
    id: 4,
    code: "W-404",
    customer_id: 4,
    customer_name: "Emily Davis",
    address: "101 Maple St",
    order_status: "active",
    order_price: 4000,
    work_types: ["cladding"],
    created_by: "admin",
    company: "GHI Corp",
    created_at: "2023-01-04T00:00:00Z",
    updated_at: "2023-01-04T00:00:00Z",
    stages: [
      { id: 13, order_detail_id: 4, stage_name: "Wall Assessment", status: "completed", planned_start_date: "2023-01-04", planned_finish_date: "2023-01-05", actual_start_date: "2023-01-04", actual_finish_date: "2023-01-05", notes: "", created_at: "2023-01-04T00:00:00Z", updated_at: "2023-01-04T00:00:00Z" },
      { id: 14, order_detail_id: 4, stage_name: "Material Cutting", status: "completed", planned_start_date: "2023-01-06", planned_finish_date: "2023-01-07", actual_start_date: "2023-01-06", actual_finish_date: "2023-01-07", notes: "", created_at: "2023-01-04T00:00:00Z", updated_at: "2023-01-04T00:00:00Z" },
      { id: 15, order_detail_id: 4, stage_name: "Installation", status: "in_progress", planned_start_date: "2023-01-08", planned_finish_date: "2023-01-09", actual_start_date: "2023-01-08", actual_finish_date: null, notes: "", created_at: "2023-01-04T00:00:00Z", updated_at: "2023-01-04T00:00:00Z" },
      { id: 16, order_detail_id: 4, stage_name: "Sealing", status: "pending", planned_start_date: "2023-01-10", planned_finish_date: "2023-01-11", actual_start_date: null, actual_finish_date: null, notes: "", created_at: "2023-01-04T00:00:00Z", updated_at: "2023-01-04T00:00:00Z" }
    ]
  }
];

export const mockEmployees = [
  { id: 1, name: "Alex Thompson", role: "Senior Installer" },
  { id: 2, name: "Maria Garcia", role: "Fabricator" },
  { id: 3, name: "David Chen", role: "Installer" },
  { id: 4, name: "Sophie Wilson", role: "Measurement Specialist" },
  { id: 5, name: "James Anderson", role: "Senior Fabricator" }
];