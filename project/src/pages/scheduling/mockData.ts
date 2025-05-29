import { Order, OrderStage, OrderStageAssignment, Employee } from "./types";
import { addDays, subDays, format } from "date-fns";

// Generate dates relative to current date for realistic data
const today = new Date();
const yesterday = subDays(today, 1);
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 7);
const twoWeeksFromNow = addDays(today, 14);
const lastWeek = subDays(today, 7);

// Mock Employees
export const mockEmployees: Employee[] = [
  { id: 1, name: "Ahmed Mohamed", role: "Carpenter" },
  { id: 2, name: "Sara Ibrahim", role: "Designer" },
  { id: 3, name: "Omar Khaled", role: "Installer" },
  { id: 4, name: "Layla Mahmoud", role: "Painter" },
  { id: 5, name: "Tarek Hassan", role: "Supervisor" },
  { id: 6, name: "Nour Ali", role: "Electrician" },
  { id: 7, name: "Mostafa Saeed", role: "Plumber" },
  { id: 8, name: "Hoda Nasser", role: "Project Manager" },
];

// Mock Orders with Stages
export const mockOrders: Order[] = [
  {
    id: 1001,
    code: "ALM-1001",
    customer_name: "Cairo Hospital",
    customer_id: 5001,
    address: "123 Tahrir Square, Cairo",
    order_status: "In Progress",
    order_price: 45000,
    work_types: ["Furniture", "Installation"],
    created_by: "Admin",
    company: "El Masria Furniture",
    created_at: format(subDays(today, 30), "yyyy-MM-dd"),
    updated_at: format(subDays(today, 25), "yyyy-MM-dd"),
    stages: [
      {
        id: 10001,
        order_detail_id: 1001,
        stage_name: "Cutting",
        status: "Completed",
        planned_start_date: format(subDays(today, 25), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 20), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 25), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 19), "yyyy-MM-dd"),
        notes: "All materials cut according to specifications",
      },
      {
        id: 10002,
        order_detail_id: 1001,
        stage_name: "Assembly",
        status: "Completed",
        planned_start_date: format(subDays(today, 19), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 15), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 18), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 14), "yyyy-MM-dd"),
        notes: "Assembly completed ahead of schedule",
      },
      {
        id: 10003,
        order_detail_id: 1001,
        stage_name: "Finishing",
        status: "In Progress",
        planned_start_date: format(subDays(today, 14), "yyyy-MM-dd"),
        planned_finish_date: format(tomorrow, "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 14), "yyyy-MM-dd"),
        actual_finish_date: null,
        notes: "Applying final coat of paint",
      },
      {
        id: 10004,
        order_detail_id: 1001,
        stage_name: "Installation",
        status: "Pending",
        planned_start_date: format(addDays(today, 2), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 5), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Waiting for finishing stage to complete",
      },
    ],
  },
  {
    id: 1002,
    code: "ALM-1002",
    customer_name: "Alexandria Library",
    customer_id: 5002,
    address: "45 Corniche Road, Alexandria",
    order_status: "Pending",
    order_price: 75000,
    work_types: ["Shelves", "Desks", "Chairs"],
    created_by: "Admin",
    company: "El Masria Furniture",
    created_at: format(subDays(today, 20), "yyyy-MM-dd"),
    updated_at: format(subDays(today, 18), "yyyy-MM-dd"),
    stages: [
      {
        id: 10005,
        order_detail_id: 1002,
        stage_name: "Design",
        status: "Completed",
        planned_start_date: format(subDays(today, 18), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 15), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 18), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 14), "yyyy-MM-dd"),
        notes: "Design approved by customer",
      },
      {
        id: 10006,
        order_detail_id: 1002,
        stage_name: "Cutting",
        status: "Completed",
        planned_start_date: format(subDays(today, 14), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 10), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 14), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 9), "yyyy-MM-dd"),
        notes: "All materials cut according to design specifications",
      },
      {
        id: 10007,
        order_detail_id: 1002,
        stage_name: "Assembly",
        status: "In Progress",
        planned_start_date: format(subDays(today, 9), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 1), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 8), "yyyy-MM-dd"),
        actual_finish_date: null,
        notes: "Assembly in progress, 70% complete",
      },
      {
        id: 10008,
        order_detail_id: 1002,
        stage_name: "Finishing",
        status: "Pending",
        planned_start_date: format(addDays(today, 2), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 6), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Waiting for assembly to complete",
      },
      {
        id: 10009,
        order_detail_id: 1002,
        stage_name: "Delivery",
        status: "Pending",
        planned_start_date: format(addDays(today, 7), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 7), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Delivery scheduled",
      },
    ],
  },
  {
    id: 1003,
    code: "ALM-1003",
    customer_name: "Giza Office Complex",
    customer_id: 5003,
    address: "789 Pyramids Road, Giza",
    order_status: "Delayed",
    order_price: 120000,
    work_types: ["Office Furniture", "Partitions"],
    created_by: "Admin",
    company: "El Masria Furniture",
    created_at: format(subDays(today, 45), "yyyy-MM-dd"),
    updated_at: format(subDays(today, 10), "yyyy-MM-dd"),
    stages: [
      {
        id: 10010,
        order_detail_id: 1003,
        stage_name: "Design",
        status: "Completed",
        planned_start_date: format(subDays(today, 40), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 35), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 40), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 35), "yyyy-MM-dd"),
        notes: "Design approved with minor modifications",
      },
      {
        id: 10011,
        order_detail_id: 1003,
        stage_name: "Material Procurement",
        status: "Completed",
        planned_start_date: format(subDays(today, 34), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 25), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 34), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 22), "yyyy-MM-dd"),
        notes: "All materials received from suppliers",
      },
      {
        id: 10012,
        order_detail_id: 1003,
        stage_name: "Cutting",
        status: "Completed",
        planned_start_date: format(subDays(today, 22), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 15), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 21), "yyyy-MM-dd"),
        actual_finish_date: format(subDays(today, 12), "yyyy-MM-dd"),
        notes: "Cutting completed for all components",
      },
      {
        id: 10013,
        order_detail_id: 1003,
        stage_name: "Assembly",
        status: "Delayed",
        planned_start_date: format(subDays(today, 12), "yyyy-MM-dd"),
        planned_finish_date: format(subDays(today, 5), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 10), "yyyy-MM-dd"),
        actual_finish_date: null,
        notes: "Delayed due to missing hardware components",
      },
      {
        id: 10014,
        order_detail_id: 1003,
        stage_name: "Finishing",
        status: "Pending",
        planned_start_date: format(subDays(today, 5), "yyyy-MM-dd"),
        planned_finish_date: format(today, "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Waiting for assembly completion",
      },
      {
        id: 10015,
        order_detail_id: 1003,
        stage_name: "Installation",
        status: "Pending",
        planned_start_date: format(addDays(today, 1), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 5), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Rescheduled due to delays in production",
      },
    ],
  },
  {
    id: 1004,
    code: "ALM-1004",
    customer_name: "Luxor Resort",
    customer_id: 5004,
    address: "321 Karnak Temple Road, Luxor",
    order_status: "New",
    order_price: 95000,
    work_types: ["Hotel Furniture", "Custom Pieces"],
    created_by: "Admin",
    company: "El Masria Furniture",
    created_at: format(subDays(today, 5), "yyyy-MM-dd"),
    updated_at: format(subDays(today, 3), "yyyy-MM-dd"),
    stages: [
      {
        id: 10016,
        order_detail_id: 1004,
        stage_name: "Design",
        status: "In Progress",
        planned_start_date: format(subDays(today, 3), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 4), "yyyy-MM-dd"),
        actual_start_date: format(subDays(today, 3), "yyyy-MM-dd"),
        actual_finish_date: null,
        notes: "Finalizing design details with customer",
      },
      {
        id: 10017,
        order_detail_id: 1004,
        stage_name: "Material Procurement",
        status: "Pending",
        planned_start_date: format(addDays(today, 5), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 12), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Sourcing exotic wood for custom pieces",
      },
      {
        id: 10018,
        order_detail_id: 1004,
        stage_name: "Production",
        status: "Pending",
        planned_start_date: format(addDays(today, 13), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 23), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Production schedule to be finalized",
      },
      {
        id: 10019,
        order_detail_id: 1004,
        stage_name: "Finishing",
        status: "Pending",
        planned_start_date: format(addDays(today, 24), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 28), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Special finish required as per customer specifications",
      },
      {
        id: 10020,
        order_detail_id: 1004,
        stage_name: "Delivery and Installation",
        status: "Pending",
        planned_start_date: format(addDays(today, 30), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 32), "yyyy-MM-dd"),
        actual_start_date: null,
        actual_finish_date: null,
        notes: "Will require coordination with resort renovation schedule",
      },
    ],
  },
];

// Mock Assignments
// Creating realistic assignments for the upcoming week
export const mockAssignments: OrderStageAssignment[] = [
  // Assignments for Cairo Hospital order (Finishing stage)
  {
    id: 100001,
    order_stage_id: 10003, // Finishing stage for Cairo Hospital
    employee_name: "Layla Mahmoud", // Painter
    work_date: format(yesterday, "yyyy-MM-dd"),
    note: "Applied first coat of paint",
    is_done: true,
    created_at: format(subDays(yesterday, 1), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100002,
    order_stage_id: 10003, // Finishing stage for Cairo Hospital
    employee_name: "Layla Mahmoud", // Painter
    work_date: format(today, "yyyy-MM-dd"),
    note: "Applying second coat of paint",
    is_done: false,
    created_at: format(subDays(yesterday, 1), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100003,
    order_stage_id: 10003, // Finishing stage for Cairo Hospital
    employee_name: "Layla Mahmoud", // Painter
    work_date: format(tomorrow, "yyyy-MM-dd"),
    note: "Final touches and quality check",
    is_done: false,
    created_at: format(subDays(yesterday, 1), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  
  // Assignments for Alexandria Library order (Assembly stage)
  {
    id: 100004,
    order_stage_id: 10007, // Assembly stage for Alexandria Library
    employee_name: "Ahmed Mohamed", // Carpenter
    work_date: format(subDays(today, 3), "yyyy-MM-dd"),
    note: "Started shelf assembly",
    is_done: true,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100005,
    order_stage_id: 10007, // Assembly stage for Alexandria Library
    employee_name: "Ahmed Mohamed", // Carpenter
    work_date: format(subDays(today, 2), "yyyy-MM-dd"),
    note: "Continued with desk assembly",
    is_done: true,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100006,
    order_stage_id: 10007, // Assembly stage for Alexandria Library
    employee_name: "Ahmed Mohamed", // Carpenter
    work_date: format(subDays(today, 1), "yyyy-MM-dd"),
    note: "Started chair assembly",
    is_done: true,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100007,
    order_stage_id: 10007, // Assembly stage for Alexandria Library
    employee_name: "Ahmed Mohamed", // Carpenter
    work_date: format(today, "yyyy-MM-dd"),
    note: "Finishing chair assembly",
    is_done: false,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100008,
    order_stage_id: 10007, // Assembly stage for Alexandria Library
    employee_name: "Tarek Hassan", // Supervisor
    work_date: format(tomorrow, "yyyy-MM-dd"),
    note: "Final assembly check and quality control",
    is_done: false,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  
  // Multi-day assignment for Giza Office Complex (Delayed assembly stage)
  {
    id: 100009,
    order_stage_id: 10013, // Assembly stage for Giza Office Complex
    employee_name: "Omar Khaled", // Installer
    work_date: format(subDays(today, 2), "yyyy-MM-dd"),
    note: "Working on partitions",
    is_done: true,
    created_at: format(subDays(today, 7), "yyyy-MM-dd'T'HH:mm:ss"),
    multi_day_group_id: "multi-day-1680012345",
  },
  {
    id: 100010,
    order_stage_id: 10013, // Assembly stage for Giza Office Complex
    employee_name: "Omar Khaled", // Installer
    work_date: format(subDays(today, 1), "yyyy-MM-dd"),
    note: "Continuing partition assembly, awaiting missing hardware",
    is_done: true,
    created_at: format(subDays(today, 7), "yyyy-MM-dd'T'HH:mm:ss"),
    multi_day_group_id: "multi-day-1680012345",
  },
  {
    id: 100011,
    order_stage_id: 10013, // Assembly stage for Giza Office Complex
    employee_name: "Omar Khaled", // Installer
    work_date: format(today, "yyyy-MM-dd"),
    note: "Hardware arrived, resuming assembly",
    is_done: false,
    created_at: format(subDays(today, 7), "yyyy-MM-dd'T'HH:mm:ss"),
    multi_day_group_id: "multi-day-1680012345",
  },
  {
    id: 100012,
    order_stage_id: 10013, // Assembly stage for Giza Office Complex
    employee_name: "Omar Khaled", // Installer
    work_date: format(tomorrow, "yyyy-MM-dd"),
    note: "Expected completion of assembly",
    is_done: false,
    created_at: format(subDays(today, 7), "yyyy-MM-dd'T'HH:mm:ss"),
    multi_day_group_id: "multi-day-1680012345",
  },
  {
    id: 100013,
    order_stage_id: 10013, // Assembly stage for Giza Office Complex
    employee_name: "Mostafa Saeed", // Plumber
    work_date: format(tomorrow, "yyyy-MM-dd"),
    note: "Installing plumbing fixtures in office furniture",
    is_done: false,
    created_at: format(subDays(today, 3), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  
  // Assignments for Luxor Resort (Design stage)
  {
    id: 100014,
    order_stage_id: 10016, // Design stage for Luxor Resort
    employee_name: "Sara Ibrahim", // Designer
    work_date: format(subDays(today, 3), "yyyy-MM-dd"),
    note: "Initial design consultation",
    is_done: true,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100015,
    order_stage_id: 10016, // Design stage for Luxor Resort
    employee_name: "Sara Ibrahim", // Designer
    work_date: format(subDays(today, 2), "yyyy-MM-dd"),
    note: "Drafting preliminary designs",
    is_done: true,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100016,
    order_stage_id: 10016, // Design stage for Luxor Resort
    employee_name: "Sara Ibrahim", // Designer
    work_date: format(today, "yyyy-MM-dd"),
    note: "Finalizing details with client",
    is_done: false,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100017,
    order_stage_id: 10016, // Design stage for Luxor Resort
    employee_name: "Sara Ibrahim", // Designer
    work_date: format(addDays(today, 2), "yyyy-MM-dd"),
    note: "Present final designs to client",
    is_done: false,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
  {
    id: 100018,
    order_stage_id: 10016, // Design stage for Luxor Resort
    employee_name: "Hoda Nasser", // Project Manager
    work_date: format(addDays(today, 4), "yyyy-MM-dd"),
    note: "Final design approval meeting",
    is_done: false,
    created_at: format(subDays(today, 5), "yyyy-MM-dd'T'HH:mm:ss"),
  },
];

// Additional mock data creation helpers
export function createNewOrder(data: Partial<Order>): Order {
  return {
    id: Math.floor(Math.random() * 10000) + 2000,
    code: `ALM-${Math.floor(Math.random() * 10000)}`,
    customer_name: data.customer_name || "New Customer",
    customer_id: data.customer_id || Math.floor(Math.random() * 10000) + 6000,
    address: data.address || "New Address",
    order_status: data.order_status || "New",
    order_price: data.order_price || 0,
    work_types: data.work_types || [],
    created_by: data.created_by || "Admin",
    company: data.company || "El Masria Furniture",
    created_at: data.created_at || format(new Date(), "yyyy-MM-dd"),
    updated_at: data.updated_at || format(new Date(), "yyyy-MM-dd"),
    stages: data.stages || [
      {
        id: Math.floor(Math.random() * 10000) + 20000,
        order_detail_id: Math.floor(Math.random() * 10000) + 2000,
        stage_name: "Design",
        status: "New",
        planned_start_date: format(addDays(today, 1), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 5), "yyyy-MM-dd"),
      },
      {
        id: Math.floor(Math.random() * 10000) + 20000,
        order_detail_id: Math.floor(Math.random() * 10000) + 2000,
        stage_name: "Production",
        status: "New",
        planned_start_date: format(addDays(today, 6), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 15), "yyyy-MM-dd"),
      },
      {
        id: Math.floor(Math.random() * 10000) + 20000,
        order_detail_id: Math.floor(Math.random() * 10000) + 2000,
        stage_name: "Finishing",
        status: "New",
        planned_start_date: format(addDays(today, 16), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 20), "yyyy-MM-dd"),
      },
      {
        id: Math.floor(Math.random() * 10000) + 20000,
        order_detail_id: Math.floor(Math.random() * 10000) + 2000,
        stage_name: "Delivery",
        status: "New",
        planned_start_date: format(addDays(today, 21), "yyyy-MM-dd"),
        planned_finish_date: format(addDays(today, 22), "yyyy-MM-dd"),
      },
    ],
  };
}

export function createNewAssignment(data: Partial<OrderStageAssignment>): OrderStageAssignment {
  return {
    id: Math.floor(Math.random() * 10000) + 200000,
    order_stage_id: data.order_stage_id || 0,
    employee_name: data.employee_name || "",
    work_date: data.work_date || format(new Date(), "yyyy-MM-dd"),
    note: data.note || null,
    is_done: data.is_done || false,
    created_at: data.created_at || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    multi_day_group_id: data.multi_day_group_id || null,
  };
} 