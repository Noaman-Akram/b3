import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Hammer, 
  Calendar, 
  User, 
  FileText, 
  Upload, 
  ArrowLeft,
  Building2,
  Phone,
  Home,
  MapPin,
  Box,
  Ruler,
  Plus,
  Trash2,
  Calculator,
  UserPlus,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RadioGroup from '../../components/ui/RadioGroup';
import { supabase } from '../../lib/supabase';
import { WorkOrderService } from '../../services/WorkOrderService';
import Toast from '../../components/ui/Toast';
import { 
  EGYPTIAN_CITIES, 
  WORK_TYPES, 
  MATERIAL_TYPES, 
  UNITS, 
  ENGINEERS, 
  WORK_ORDER_STAGES,
  EMPLOYEE_RATES,
  STAGE_STATUSES,
  ORDER_TYPES 
} from '../../lib/constants';
import SaleOrderSelector from '../../components/orders/SaleOrderSelector';


const COST_TYPES = [
  { type: 'cutting', label: 'Cutting' },
  { type: 'finishing', label: 'Finishing' },
  { type: 'installation', label: 'Installation' },
  { type: 'delivery', label: 'Delivery' },
  { type: 'other', label: 'Other' }
];

 

const NewWorkOrder = () => {
  
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [customer, setCustomer] = useState<any>({
    name: '',
    company: '',
    phone_number: '',
    address: '',
    city: ''
  });
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [realCustomers, setRealCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([{
    material_name: '',
    material_type: 'marble',
    unit: '',
    quantity: 0,
    cost: 0
  }]);
  const [workOrderData, setWorkOrderData] = useState({
    assigned_to: '',
    due_date: '',
    notes: '',
    price: 0,
    total_cost: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const workOrderService = new WorkOrderService();
  const [nextOrderId, setNextOrderId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderSummary, setLastOrderSummary] = useState<any>(null);
  const [costBreakdown, setCostBreakdown] = useState([
    { type: '', quantity: '', unit: '', cost_per_unit: '', total_cost: '', notes: '' }
  ]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (orderId) {
          console.log('[NewWorkOrder] Fetching order data for ID:', orderId);
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*, measurements(*)')
            .eq('id', orderId)
            .single();
          console.log('[NewWorkOrder] Fetched order data:', orderData);

          if (orderError) throw orderError;
          populateFormWithOrder(orderData);
        }
      } catch (err) {
        console.error('[NewWorkOrder] Error fetching initial data:', err);
        setToast({ type: 'error', message: 'Failed to load required data' });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [orderId]);

  useEffect(() => {
    const fetchNextOrderId = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          setNextOrderId(data[0].id + 1);
        } else {
          setNextOrderId(1);
        }
      } catch (err) {
        console.error('[NewWorkOrder] Error fetching next order ID:', err);
      }
    };
    fetchNextOrderId();
  }, []);

  useEffect(() => {
    // Load draft from localStorage
    const draft = localStorage.getItem('workOrderDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.customer) setCustomer(parsed.customer);
        if (parsed.order) setOrder(parsed.order);
        if (parsed.workTypes) setWorkTypes(parsed.workTypes);
        if (parsed.measurements) setMeasurements(parsed.measurements);
        if (parsed.workOrderData) setWorkOrderData(parsed.workOrderData);
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Save draft to localStorage on change
    localStorage.setItem('workOrderDraft', JSON.stringify({ customer, order, workTypes, measurements, workOrderData }));
  }, [customer, order, workTypes, measurements, workOrderData]);

  const fetchCustomers = async () => {
    if (realCustomers.length > 0) return; // Don't fetch if we already have customers
    
    setCustomersLoading(true);
    try {
      console.log('[NewWorkOrder] Fetching customers list');
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, company, phone_number, address')
        .order('name');
      console.log('[NewWorkOrder] Fetched customers:', customers);
      
      if (customersError) throw customersError;
      setRealCustomers(customers || []);
    } catch (err) {
      console.error('[NewWorkOrder] Error fetching customers:', err);
      setToast({ type: 'error', message: 'Failed to load customers' });
    } finally {
      setCustomersLoading(false);
    }
  };

  const populateFormWithOrder = async (orderData: any) => {
    if (!orderData) {
      clearForm();
      return;
    }

    try {
      // Fetch complete customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', orderData.customer_id)
        .single();

      if (customerError) throw customerError;

      // Parse address into city and address fields
      let city = '', address_details = '';
      if (orderData.address && orderData.address.includes(' - ')) {
        [city, address_details] = orderData.address.split(' - ');
      } else {
        address_details = orderData.address || '';
      }

      setOrder(orderData);
      setWorkTypes(orderData.work_types || []);
      setMeasurements(orderData.measurements || []);
      setCustomer({
        name: orderData.customer_name,
        company: orderData.company,
        phone_number: customerData.phone_number || '',
        address: address_details,
        city: city
      });
      setWorkOrderData(prev => ({
        ...prev,
        price: orderData.order_price,
        total_cost: 0, // order_cost removed
      }));
    } catch (err) {
      console.error('[NewWorkOrder] Error populating form:', err);
      setToast({ type: 'error', message: 'Failed to load customer data' });
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const selected = realCustomers.find((c) => c.id === Number(customerId));
    setSelectedCustomer(selected || null);
    if (selected) {
      setCustomer({
        name: selected.name,
        company: selected.company || '',
        phone_number: selected.phone_number || '',
        address: selected.address || '',
        city: selected.city || ''
      });
    }
  };

  const handleSaleOrderSelect = async (selectedOrder: any) => {
    try {
      // Fetch complete customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', selectedOrder.customer_id)
        .single();

      if (customerError) throw customerError;

      // Parse address into city and address fields
      let city = '', address_details = '';
      if (selectedOrder.address && selectedOrder.address.includes(' - ')) {
        [city, address_details] = selectedOrder.address.split(' - ');
      } else {
        address_details = selectedOrder.address || '';
      }

      setCustomer({
        name: selectedOrder.customer_name,
        company: selectedOrder.company || '',
        phone_number: customerData.phone_number || '',
        address: address_details,
        city: city
      });

      populateFormWithOrder(selectedOrder);
    } catch (err) {
      console.error('[NewWorkOrder] Error fetching customer details:', err);
      setToast({ type: 'error', message: 'Failed to load customer details' });
    }
  };

  const handleWorkTypeChange = (type: string) => {
    setWorkTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const addMeasurement = () => {
    setMeasurements(prev => [...prev, {
      material_name: '',
      material_type: 'marble',
      unit: '',
      quantity: 0,
      cost: 0
    }]);
  };

  const removeMeasurement = (index: number) => {
    if (measurements.length > 1) {
      setMeasurements(prev => prev.filter((_, i) => i !== index));
    } else {
      setToast({ type: 'error', message: 'At least one measurement is required' });
    }
  };

  const updateMeasurement = (index: number, field: string, value: any) => {
    setMeasurements(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateTotals = () => {
    const totalCost = measurements.reduce((sum, m) => sum + (m.quantity * m.cost), 0);
    const profit = workOrderData.price - totalCost;
    const profitMargin = totalCost > 0 ? (profit / totalCost * 100) : 0;
    
    return {
      totalCost,
      profit,
      profitMargin: Math.round(profitMargin)
    };
  };

  const generateOrderCode = (types: string[]) => {
    if (types.length === 0) return '---';
    const codes = types.map(type => {
      const workType = WORK_TYPES.find(wt => wt.value === type);
      return workType ? workType.code : '';
    }).sort().join('');
    return `${codes}-${nextOrderId || 'NEW'}`;
  };

  const validatePhoneNumber = (phone: string) => {
    return /^01[0125][0-9]{8}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let createdCustomerId: number | null = null;
    let createdOrderId: number | null = null;
    let createdWorkOrderId: number | null = null;

    try {
      // 1. Validate required fields
      if (!workOrderData.assigned_to) {
        throw new Error('Please fill in all required fields');
      }

      if (workTypes.length === 0) {
        throw new Error('Please select at least one work type');
      }

      if (measurements.length === 0) {
        throw new Error('At least one measurement is required');
      }

      // Validate measurements
      for (const m of measurements) {
        if (m.quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }
        if (m.cost < 0) {
          throw new Error('Cost cannot be negative');
        }
      }

      // Validate that at least one unit is selected
      const hasUnitSelected = measurements.some(m => m.unit);
      if (!hasUnitSelected) {
        throw new Error('Please select at least one unit for the measurements');
      }

      // 2. Handle Customer
      let customerId: number;
      if (!order) {
        if (isNewCustomer) {
          if (!customer.phone_number) {
            throw new Error('Phone number is required for new customers');
          }

          if (!validatePhoneNumber(customer.phone_number)) {
            throw new Error('Please enter a valid Egyptian phone number (e.g., 01012345678)');
          }

          console.log('[NewWorkOrder] Creating new customer:', customer);
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert([{
              name: customer.name,
              company: customer.company,
              phone_number: customer.phone_number,
              address: `${customer.address}, ${customer.city}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          if (customerError) throw customerError;
          console.log('[NewWorkOrder] New customer created:', newCustomer);
          createdCustomerId = newCustomer.id;
          customerId = newCustomer.id;
        } else {
          customerId = selectedCustomer.id;
        }
      } else {
        customerId = order.customer_id;
      }

      // 3. Handle Order (All Scenarios)
      let orderId: number;
      if (!order) {
        // Generate order code based on work types
        const orderCode = generateOrderCode(workTypes);

        // Create new order
        console.log('[NewWorkOrder] Creating new order for customer:', customerId);
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert([{
            code: orderCode,
            customer_id: customerId,
            customer_name: customer.name,
            company: customer.company,
            address: `${customer.address}, ${customer.city}`,
            work_types: workTypes,
            order_price: workOrderData.price,
            order_status: 'working', // Always 'working' for work orders
            created_by: 'system', // TODO: Replace with actual user
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (orderError) throw orderError;
        console.log('[NewWorkOrder] New order created:', newOrder);
        orderId = newOrder.id;
        createdOrderId = newOrder.id;
      } else {
        // Update existing order
        orderId = order.id;
        console.log('[NewWorkOrder] Updating existing order:', orderId);
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            customer_name: customer.name,
            company: customer.company,
            address: `${customer.address}, ${customer.city}`,
            work_types: workTypes,
            order_price: workOrderData.price,
            order_status: 'working', // Always 'working' for work orders
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (updateError) throw updateError;
        console.log('[NewWorkOrder] Order updated successfully');
      }

      // 4. Handle Measurements
      if (order) {
        // Delete old measurements for existing order
        console.log('[NewWorkOrder] Deleting old measurements for order:', orderId);
        const { error: deleteError } = await supabase
          .from('measurements')
          .delete()
          .eq('order_id', orderId);
        
        if (deleteError) throw deleteError;
      }

      // Insert new measurements
      const newMeasurements = measurements.map(m => ({
        order_id: orderId,
        material_name: m.material_name,
        material_type: m.material_type,
        unit: m.unit,
        quantity: m.quantity,
        cost: m.cost,
        total_cost: m.quantity * m.cost
      }));

      console.log('[NewWorkOrder] Inserting new measurements:', newMeasurements);
      const { error: measurementsError } = await supabase
        .from('measurements')
        .insert(newMeasurements);

      if (measurementsError) throw measurementsError;

      // 5. Create Work Order Details
      let img_url = '';
      if (selectedFile) {
        console.log('[NewWorkOrder] Uploading image');
        img_url = await workOrderService.uploadImage(selectedFile);
      }

      const newWorkOrderDetails = {
        order_id: orderId,
        assigned_to: workOrderData.assigned_to,
        updated_date: new Date().toISOString(),
        due_date: workOrderData.due_date || null,
        price: workOrderData.price,
        total_cost: calculateTotals().totalCost,
        notes: workOrderData.notes,
        img_url,
        process_stage: 'pending',
        updated_at: new Date().toISOString()
      };

      console.log('[NewWorkOrder] Creating work order:', newWorkOrderDetails);
      const { data: workOrder, error: workOrderError } = await supabase
        .from('order_details')
        .insert([newWorkOrderDetails])
        .select()
        .single();

      if (workOrderError) throw workOrderError;
      console.log('[NewWorkOrder] Work order created:', workOrder);
      createdWorkOrderId = workOrder.detail_id;

      // 6. Create Work Order Stages
      const stages = WORK_ORDER_STAGES.map(stage => ({
        order_detail_id: workOrder.detail_id,
        stage_name: stage.value,
        status: STAGE_STATUSES[0].value, // Set initial status to 'not_started'
        created_at: new Date().toISOString()
      }));

      console.log('[NewWorkOrder] Creating stages:', stages);
      const { error: stagesError } = await supabase
        .from('order_stages')
        .insert(stages);

      if (stagesError) throw stagesError;
      console.log('[NewWorkOrder] Stages created successfully');

      // After successful creation, set the summary and show modal
      setLastOrderSummary({
        code: order?.code || generateOrderCode(workTypes),
        customer: {
          name: customer.name,
          company: customer.company,
          phone: customer.phone_number
        },
        workTypes: workTypes,
        price: workOrderData.price,
        dueDate: workOrderData.due_date ? new Date(workOrderData.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null,
        assignedTo: ENGINEERS.find(e => e.value === workOrderData.assigned_to)?.label,
        measurements: measurements,
        totalCost: calculateTotals().totalCost,
        profit: calculateTotals().profit,
        profitMargin: calculateTotals().profitMargin,
        stages: stages
      });
      setShowSuccessModal(true);

      localStorage.removeItem('workOrderDraft');

    } catch (err) {
      console.error('[NewWorkOrder] Error:', err);
      
      // Cleanup any created resources in case of error
      try {
        if (createdWorkOrderId) {
          console.log('[NewWorkOrder] Cleaning up work order:', createdWorkOrderId);
          await supabase.from('order_details').delete().eq('detail_id', createdWorkOrderId);
        }
        if (createdOrderId) {
          console.log('[NewWorkOrder] Cleaning up order:', createdOrderId);
          await supabase.from('orders').delete().eq('id', createdOrderId);
        }
        if (createdCustomerId) {
          console.log('[NewWorkOrder] Cleaning up customer:', createdCustomerId);
          await supabase.from('customers').delete().eq('id', createdCustomerId);
        }
      } catch (cleanupError) {
        console.error('[NewWorkOrder] Error during cleanup:', cleanupError);
      }

      setToast({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to create work order'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerTypeChange = (newIsNewCustomer: boolean) => {
    setIsNewCustomer(newIsNewCustomer);
    if (newIsNewCustomer) {
      setSelectedCustomer(null);
      setCustomer({
        name: '',
        company: '',
        phone_number: '',
        address: '',
        city: ''
      });
    }
  };

  const clearForm = () => {
    setOrder(null);
    setCustomer({
      name: '',
      company: '',
      phone_number: '',
      address: '',
      city: ''
    });
    setWorkTypes([]);
    setMeasurements([{
      material_name: '',
      material_type: 'marble',
      unit: '',
      quantity: 0,
      cost: 0
    }]);
    setWorkOrderData({
      assigned_to: '',
      due_date: '',
      notes: '',
      price: 0,
      total_cost: 0,
    });
    setSelectedFile(null);
  };



  const renderSuccessModal = () => {
    if (!lastOrderSummary) return null;

    const getStatusColor = (status: string) => {
      const statusInfo = STAGE_STATUSES.find(s => s.value === status);
      return statusInfo?.color || 'gray';
    };

   

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-green-600">Order Created Successfully!</h2>
            <button
              onClick={() => {
                setShowSuccessModal(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Order Code:</span> {lastOrderSummary.code}</p>
                <p><span className="font-medium">Assigned To:</span> {lastOrderSummary.assignedTo}</p>
                <p><span className="font-medium">Due Date:</span> {lastOrderSummary.dueDate || 'Not set'}</p>
                <p><span className="font-medium">Price:</span> {lastOrderSummary.price.toLocaleString()} EGP</p>
                <p><span className="font-medium">Work Types:</span> {lastOrderSummary.workTypes.join(', ')}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Name:</span> {lastOrderSummary.customer.name}</p>
                <p><span className="font-medium">Company:</span> {lastOrderSummary.customer.company || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {lastOrderSummary.customer.phone}</p>
              </div>
            </div>

            {/* Work Stages */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Work Stages</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                {lastOrderSummary.stages.map((stage: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium text-gray-900">{stage.stage_name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(stage.status)}-100 text-${getStatusColor(stage.status)}-800`}>
                      {STAGE_STATUSES.find(s => s.value === stage.status)?.label || 'Not Started'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Measurements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Measurements</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lastOrderSummary.measurements.map((m: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{m.material_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{m.material_type}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{m.unit}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{m.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{m.cost.toLocaleString()} EGP</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{(m.quantity * m.cost).toLocaleString()} EGP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Total Cost:</span> {lastOrderSummary.totalCost.toLocaleString()} EGP</p>
                <p><span className="font-medium">Profit:</span> {lastOrderSummary.profit.toLocaleString()} EGP</p>
                <p><span className="font-medium">Profit Margin:</span> {lastOrderSummary.profitMargin}%</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/orders/work')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Work Orders</span>
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-md">
            <span className="text-sm text-gray-500">Order Code:</span>
            <span className="ml-2 font-mono font-bold text-green-600">{generateOrderCode(workTypes)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Hammer className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-semibold text-gray-900">
          {orderId ? 'Convert to Work Order' : 'New Work Order'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!orderId && (
          <Card>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Select Sale Order</h3>
              </div>
              <SaleOrderSelector onSelect={handleSaleOrderSelect} onClear={clearForm} />
            </div>
          </Card>
        )}

        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>
              {!order && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomerTypeChange(!isNewCustomer)}
                  className="flex items-center space-x-2"
                >
                  <UserPlus size={16} />
                  <span>{isNewCustomer ? 'Select Existing' : 'Add New Customer'}</span>
                </Button>
              )}
            </div>

            {!order && !isNewCustomer ? (
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Select Customer *</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={selectedCustomer?.id || ''}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      onFocus={fetchCustomers}
                      className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select a customer</option>
                      {customersLoading ? (
                        <option value="" disabled>Loading customers...</option>
                      ) : (
                        realCustomers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
                    <p><span className="font-medium">Company:</span> {selectedCustomer.company || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedCustomer.phone_number}</p>
                    <p><span className="font-medium">Address:</span> {selectedCustomer.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={customer.company}
                      onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={customer.phone_number}
                      onChange={(e) => setCustomer({ ...customer, phone_number: e.target.value })}
                      className={`block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500 ${
                        customer.phone_number && !validatePhoneNumber(customer.phone_number)
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : ''
                      }`}
                      placeholder="01012345678"
                      required
                    />
                  </div>
                  {customer.phone_number && !validatePhoneNumber(customer.phone_number) && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter a valid Egyptian phone number (e.g., 01012345678)
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select a city</option>
                        {EGYPTIAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                        placeholder="Street address, building number, etc."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Work Types *</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {WORK_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleWorkTypeChange(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    workTypes.includes(type.value)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ruler className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Measurements *</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMeasurement}
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Measurement</span>
              </Button>
            </div>

            <div className="space-y-6">
              {measurements.map((measurement, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-900">Measurement {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeMeasurement(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Material Name *</label>
                      <input
                        type="text"
                        value={measurement.material_name}
                        onChange={(e) => updateMeasurement(index, 'material_name', e.target.value)}
                        className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material Type *</label>
                      <RadioGroup
                        options={[...MATERIAL_TYPES]}
                        value={measurement.material_type}
                        onChange={(value) => updateMeasurement(index, 'material_type', value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit *</label>
                      <div className="flex gap-2">
                        {UNITS.map(u => (
                          <button
                            key={u.value}
                            type="button"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              measurement.unit === u.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => updateMeasurement(index, 'unit', u.value)}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <input
                        type="number"
                        value={measurement.quantity}
                        onChange={(e) => updateMeasurement(index, 'quantity', parseInt(e.target.value))}
                        className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cost per Unit (EGP) *</label>
                      <input
                        type="number"
                        value={measurement.cost}
                        onChange={(e) => updateMeasurement(index, 'cost', parseInt(e.target.value))}
                        className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Hammer className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Work Order Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To *</label>
                <select
                  required
                  value={workOrderData.assigned_to}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, assigned_to: e.target.value }))}
                  className="mt-1 block w-full py-2 px-3 text-base rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Engineer</option>
                  {ENGINEERS.map(eng => (
                    <option key={eng.value} value={eng.value}>{eng.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={workOrderData.due_date}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1 block w-full py-2 px-3 text-base rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Work Notes</label>
                <textarea
                  value={workOrderData.notes}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full py-2 px-3 text-base rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add any additional notes or instructions..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Work Reference Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {selectedFile && (
                      <p className="text-sm text-green-600">{selectedFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>


        <Card>
  <div className="space-y-6">
    <div className="flex items-center space-x-2">
      <Calculator className="h-5 w-5 text-green-600" />
      <h3 className="text-lg font-medium text-gray-900">Cost Breakdown</h3>
    </div>

    {/* Table Header */}
    <div className="grid grid-cols-6 gap-2 items-center bg-gray-100 p-2 rounded font-medium text-sm text-gray-700">
      <div>Type</div>
      <div>Qty</div>
      <div>Unit</div>
      <div>Cost/Unit</div>
      <div>Total</div>
      <div>Notes</div>
    </div>

    {/* Rows */}
    {costBreakdown.map((item, index) => (
      <div
        key={index}
        className="grid grid-cols-6 gap-2 items-center bg-gray-50 p-2 rounded"
      >
        <select
          className="px-2 py-1 rounded border border-gray-300"
          value={item.type}
          onChange={e => {
            const updated = [...costBreakdown];
            updated[index].type = e.target.value;
            setCostBreakdown(updated);
          }}
          required
        >
          <option value="">Select Type</option>
          <option value="cutting">Cutting</option>
          <option value="finishing">Finishing</option>
          <option value="installation">Installation</option>
          <option value="delivery">Delivery</option>
          <option value="other">Other</option>
        </select>

        <input
          className="px-2 py-1 rounded border border-gray-300"
          type="number"
          placeholder="Qty"
          value={item.quantity}
          onChange={e => {
            const updated = [...costBreakdown];
            updated[index].quantity = e.target.value;
            setCostBreakdown(updated);
          }}
        />

        <input
          className="px-2 py-1 rounded border border-gray-300"
          placeholder="Unit"
          value={item.unit}
          onChange={e => {
            const updated = [...costBreakdown];
            updated[index].unit = e.target.value;
            setCostBreakdown(updated);
          }}
        />

        <input
          className="px-2 py-1 rounded border border-gray-300"
          type="number"
          placeholder="Cost/Unit"
          value={item.cost_per_unit}
          onChange={e => {
            const updated = [...costBreakdown];
            updated[index].cost_per_unit = e.target.value;
            setCostBreakdown(updated);
          }}
        />

        <input
          className="px-2 py-1 rounded border border-gray-300"
          type="number"
          placeholder="Total"
          value={item.total_cost}
          onChange={e => {
            const updated = [...costBreakdown];
            updated[index].total_cost = e.target.value;
            setCostBreakdown(updated);
          }}
        />

        <input
          className="px-2 py-1 rounded border border-gray-300"
          placeholder="Notes"
          value={item.notes}
          onChange={e => {
            const updated = [...costBreakdown];
            updated[index].notes = e.target.value;
            setCostBreakdown(updated);
          }}
        />
      </div>
    ))}

    {/* Add New Row Button */}
    <button
      type="button"
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      onClick={() =>
        setCostBreakdown([
          ...costBreakdown,
          { type: '', quantity: '', unit: '', cost_per_unit: '', total_cost: '', notes: '' },
        ])
      }
    >
      + Add Cost
    </button>
  </div>
</Card>





        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Price (EGP) *</label>
                <input
                  type="number"
                  value={workOrderData.price}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Order Price (input):</span>
                <span className="font-bold text-green-600">{workOrderData.price.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Total Cost:</span>
                <span className="font-bold text-gray-900">{totals.totalCost.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Expected Profit:</span>
                <span className={`font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totals.profit.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Profit Margin:</span>
                <span className={`font-bold ${totals.profitMargin >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>{totals.profitMargin}%</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders/work')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : orderId ? 'Convert to Work Order' : 'Create Work Order'}
          </Button>
        </div>
      </form>

      {/* Debug Panel */}
      <Card className="mt-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Debug Panel</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-1">Order State</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
                {JSON.stringify(order, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-1">Customer State</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
                {JSON.stringify(customer, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-1">Work Types</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
                {JSON.stringify(workTypes, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-1">Measurements</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
                {JSON.stringify(measurements, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-1">Work Order Data</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
                {JSON.stringify(workOrderData, null, 2)}
              </pre>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-1">Selected File</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border border-gray-200">
                {selectedFile ? selectedFile.name : 'No file selected'}
              </pre>
            </div>
          </div>
        </div>
      </Card>

      {showSuccessModal && renderSuccessModal()}
    </div>
  );
};

export default NewWorkOrder;