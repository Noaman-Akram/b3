import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Box, 
  Clock, 
  Ruler, 
  Trash2, 
  Plus, 
  Calculator,
  Calendar,
  FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkOrderDetail } from '../../types/order';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RadioGroup from '../../components/ui/RadioGroup';
import { EGYPTIAN_CITIES, MATERIAL_TYPES, UNITS } from '../../lib/constants';
import { formatDate } from '../../utils/date';

interface Customer {
  name: string;
  company: string;
  phone_number: string;
  city: string;
  address_details: string;
}

interface WorkOrderData {
  assigned_to: string;
  due_date: string;
  price: number;
  notes: string;
}

const EditWorkOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    company: '',
    phone_number: '',
    city: 'Cairo',
    address_details: ''
  });
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [workOrderData, setWorkOrderData] = useState<WorkOrderData>({
    assigned_to: '',
    due_date: '',
    price: 0,
    notes: ''
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [changes, setChanges] = useState<string[]>([]);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!id) return;
      
      try {
        // Fetch work order with all related data
        const { data: orderData, error: orderError } = await supabase
          .from('order_details')
          .select(`
            *,
            order:orders(
              *,
              measurements(*)
            ),
            stages:order_stages(*)
          `)
          .eq('detail_id', id)
          .single();

        if (orderError) throw orderError;
        
        // Parse address into city and details
        let city = 'Cairo', address_details = '';
        if (orderData.order.address && orderData.order.address.includes(' - ')) {
          [city, address_details] = orderData.order.address.split(' - ');
        }

        setWorkOrder(orderData);
        setWorkTypes(orderData.order.work_types || []);
        setMeasurements(orderData.order.measurements || []);
        setCustomer({
          name: orderData.order.customer_name,
          company: orderData.order.company || '',
          phone_number: orderData.order.phone_number || '',
          city,
          address_details
        });
        setWorkOrderData({
          assigned_to: orderData.assigned_to,
          due_date: orderData.due_date,
          price: orderData.price,
          notes: orderData.notes || ''
        });
      } catch (err) {
        console.error('Error fetching work order:', err);
        setToast({ type: 'error', message: 'Failed to load work order details' });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id]);

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
      unit: 'square_meter',
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

  const trackChanges = () => {
    const changes: string[] = [];
    
    // Track customer changes
    if (workOrder?.order) {
      if (workOrder.order.customer_name !== customer.name) {
        changes.push(`Customer Name: ${workOrder.order.customer_name} → ${customer.name}`);
      }
      if (workOrder.order.company !== customer.company) {
        changes.push(`Company: ${workOrder.order.company} → ${customer.company}`);
      }
      if (workOrder.order.phone_number !== customer.phone_number) {
        changes.push(`Phone: ${workOrder.order.phone_number} → ${customer.phone_number}`);
      }
      if (workOrder.order.address !== `${customer.city} - ${customer.address_details}`) {
        changes.push(`Address: ${workOrder.order.address} → ${customer.city} - ${customer.address_details}`);
      }
    }

    // Track work types changes
    if (JSON.stringify(workOrder?.order?.work_types) !== JSON.stringify(workTypes)) {
      changes.push(`Work Types: ${workOrder?.order?.work_types?.join(', ')} → ${workTypes.join(', ')}`);
    }

    // Track measurements changes
    const oldMeasurements = workOrder?.order?.measurements || [];
    if (measurements.length !== oldMeasurements.length) {
      changes.push(`Measurements count: ${oldMeasurements.length} → ${measurements.length}`);
    }
    measurements.forEach((m, idx) => {
      const old = oldMeasurements[idx];
      if (!old) {
        changes.push(`Added measurement: ${m.material_name}`);
      } else {
        const diffs = [];
        if (m.material_name !== old.material_name) diffs.push(`Name: ${old.material_name} → ${m.material_name}`);
        if (m.material_type !== old.material_type) diffs.push(`Type: ${old.material_type} → ${m.material_type}`);
        if (m.unit !== old.unit) diffs.push(`Unit: ${old.unit} → ${m.unit}`);
        if (m.quantity !== old.quantity) diffs.push(`Quantity: ${old.quantity} → ${m.quantity}`);
        if (m.cost !== old.cost) diffs.push(`Cost: ${old.cost} → ${m.cost}`);
        if (diffs.length) changes.push(`Measurement ${idx + 1}: ${diffs.join(', ')}`);
      }
    });

    // Track work order data changes
    if (workOrder) {
      if (workOrder.assigned_to !== workOrderData.assigned_to) {
        changes.push(`Assigned To: ${workOrder.assigned_to} → ${workOrderData.assigned_to}`);
      }
      if (workOrder.due_date !== workOrderData.due_date) {
        changes.push(`Due Date: ${formatDate(workOrder.due_date)} → ${formatDate(workOrderData.due_date)}`);
      }
      if (workOrder.price !== workOrderData.price) {
        changes.push(`Price: ${workOrder.price} → ${workOrderData.price}`);
      }
      if (workOrder.notes !== workOrderData.notes) {
        changes.push(`Notes: ${workOrder.notes || 'None'} → ${workOrderData.notes || 'None'}`);
      }
    }

    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder) return;

    // Validation
    if (!workOrderData.assigned_to || !workOrderData.due_date) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    if (workTypes.length === 0) {
      setToast({ type: 'error', message: 'Please select at least one work type' });
      return;
    }

    if (measurements.length === 0) {
      setToast({ type: 'error', message: 'At least one measurement is required' });
      return;
    }

    // Track changes
    const changes = trackChanges();
    if (changes.length === 0) {
      setToast({ type: 'info', message: 'No changes detected' });
      return;
    }

    // Confirm changes
    const confirmMsg = `You are about to update this work order with the following changes:\n\n${changes.join('\n')}\n\nProceed?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: customer.name,
          company: customer.company,
          phone_number: customer.phone_number,
          address: `${customer.city} - ${customer.address_details}`,
          work_types: workTypes,
          order_price: workOrderData.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrder.order_id);

      if (orderError) throw orderError;

      // 2. Update measurements
      await supabase.from('measurements').delete().eq('order_id', workOrder.order_id);
      const newMeasurements = measurements.map(m => ({
        ...m,
        order_id: workOrder.order_id,
        total_cost: m.quantity * m.cost
      }));
      const { error: measurementsError } = await supabase
        .from('measurements')
        .insert(newMeasurements);

      if (measurementsError) throw measurementsError;

      // 3. Update work order details
      const { error: workOrderError } = await supabase
        .from('order_details')
        .update({
          assigned_to: workOrderData.assigned_to,
          due_date: workOrderData.due_date,
          price: workOrderData.price,
          notes: workOrderData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('detail_id', workOrder.detail_id);

      if (workOrderError) throw workOrderError;

      setToast({ type: 'success', message: 'Work order updated successfully!' });
      setTimeout(() => navigate('/orders/work'), 1500);
    } catch (err) {
      console.error('Error updating work order:', err);
      setToast({ type: 'error', message: 'Failed to update work order' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
            <span>{formatDate(new Date())}</span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-md">
            <span className="text-sm text-gray-500">Order Code:</span>
            <span className="ml-2 font-mono font-bold text-green-600">{workOrder?.order?.code}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={customer.company}
                  onChange={(e) => setCustomer(prev => ({ ...prev, company: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  value={customer.phone_number}
                  onChange={(e) => setCustomer(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <select
                  value={customer.city}
                  onChange={(e) => setCustomer(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  {EGYPTIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address Details *</label>
                <input
                  type="text"
                  value={customer.address_details}
                  onChange={(e) => setCustomer(prev => ({ ...prev, address_details: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Work Types */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Work Types *</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['kitchen', 'walls', 'floor', 'other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleWorkTypeChange(type)}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    workTypes.includes(type)
                      ? 'bg-green-100 text-green-800 border-2 border-green-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Work Details */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Work Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To *</label>
                <input
                  type="text"
                  value={workOrderData.assigned_to}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, assigned_to: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  value={workOrderData.due_date}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (EGP) *</label>
                <input
                  type="number"
                  value={workOrderData.price}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  required
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={workOrderData.notes}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Measurements */}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                      <RadioGroup
                        options={[...UNITS]}
                        value={measurement.unit}
                        onChange={(value) => updateMeasurement(index, 'unit', value)}
                      />
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

        {/* Order Summary */}
        <Card>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Order Price:</span>
                <span className="font-bold text-green-600">{workOrderData.price.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Total Cost:</span>
                <span className="font-bold text-gray-900">{calculateTotals().totalCost.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Expected Profit:</span>
                <span className={`font-bold ${calculateTotals().profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateTotals().profit.toLocaleString()} EGP
                </span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-gray-700">Profit Margin:</span>
                <span className={`font-bold ${calculateTotals().profitMargin >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {calculateTotals().profitMargin}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders/work')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {toast && (
          <div className={`mt-4 p-4 rounded-lg ${
            toast.type === 'success' ? 'bg-green-50 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {toast.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditWorkOrder; 