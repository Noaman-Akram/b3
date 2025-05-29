import React, { useState } from 'react';
import { X, User, Building2, Phone, MapPin, Box, Clock, Ruler, Trash2, Plus, Calculator } from 'lucide-react';
import { WorkOrderDetail } from '../../types/order';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { EGYPTIAN_CITIES, MATERIAL_TYPES, UNITS, WORK_TYPES } from '../../lib/constants';
import { formatDate } from '../../utils/date';
import RadioGroup from '../ui/RadioGroup';

interface EditWorkOrderDialogProps {
  workOrder: WorkOrderDetail;
  onClose: () => void;
  onSave: () => void;
}

interface Measurement {
  id?: number;
  material_name: string;
  material_type: string;
  unit: string;
  quantity: number;
  cost: number;
  total_cost: number;
}

type MeasurementField = keyof Measurement;

const EditWorkOrderDialog = ({ workOrder, onClose, onSave }: EditWorkOrderDialogProps) => {
  const [customer, setCustomer] = useState({
    name: workOrder.order?.customer?.name || workOrder.order?.customer_name || '',
    company: workOrder.order?.customer?.company || workOrder.order?.company || '',
    phone_number: workOrder.order?.customer?.phone_number || '',
    address: workOrder.order?.customer?.address || workOrder.order?.address || ''
  });

  const [workTypes, setWorkTypes] = useState<string[]>(workOrder.order?.work_types || []);
  const [measurements, setMeasurements] = useState<Measurement[]>(
    (workOrder.order?.measurements || []).map(m => ({
      ...m,
      id: m.id ? Number(m.id) : undefined,
      total_cost: m.quantity * m.cost
    }))
  );
  const [workOrderData, setWorkOrderData] = useState({
    assigned_to: workOrder.assigned_to,
    due_date: workOrder.due_date.split('T')[0], // Format date for input
    price: workOrder.price,
    notes: workOrder.notes || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

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
      material_type: MATERIAL_TYPES[0].value,
      unit: UNITS[0].value,
      quantity: 0,
      cost: 0,
      total_cost: 0
    }]);
  };

  const removeMeasurement = (index: number) => {
    if (measurements.length > 1) {
      setMeasurements(prev => prev.filter((_, i) => i !== index));
    } else {
      setToast({ type: 'error', message: 'At least one measurement is required' });
    }
  };

  const updateMeasurement = (index: number, field: MeasurementField, value: any) => {
    setMeasurements(prev => {
      const updated = [...prev];
      const measurement = { ...updated[index] };
      
      switch (field) {
        case 'quantity':
        case 'cost':
          measurement[field] = Number(value);
          measurement.total_cost = measurement.quantity * measurement.cost;
          break;
        case 'id':
          measurement.id = value ? Number(value) : undefined;
          break;
        case 'material_name':
        case 'material_type':
        case 'unit':
          measurement[field] = String(value);
          break;
        case 'total_cost':
          // Don't allow direct updates to total_cost
          break;
      }
      
      updated[index] = measurement;
      return updated;
    });
  };

  const calculateTotals = () => {
    const totalCost = measurements.reduce((sum, m) => sum + m.total_cost, 0);
    const profit = workOrderData.price - totalCost;
    const profitMargin = totalCost > 0 ? (profit / totalCost * 100) : 0;
    
    return {
      totalCost,
      profit,
      profitMargin: Math.round(profitMargin)
    };
  };

  const validateForm = () => {
    if (!customer.name || !customer.phone_number || !customer.address) {
      setToast({ type: 'error', message: 'Please fill in all required customer fields' });
      return false;
    }

    if (workTypes.length === 0) {
      setToast({ type: 'error', message: 'Please select at least one work type' });
      return false;
    }

    if (!workOrderData.assigned_to || !workOrderData.due_date) {
      setToast({ type: 'error', message: 'Please fill in all required work order fields' });
      return false;
    }

    if (measurements.length === 0) {
      setToast({ type: 'error', message: 'At least one measurement is required' });
      return false;
    }

    for (const m of measurements) {
      if (!m.material_name || !m.material_type || !m.unit || m.quantity <= 0 || m.cost < 0) {
        setToast({ type: 'error', message: 'Please fill all measurement fields with valid values' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      console.log('[EditWorkOrderDialog] Starting work order update');
      
      // 1. Update customer data
      console.log('[EditWorkOrderDialog] Updating customer data');
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          company: customer.company,
          phone_number: customer.phone_number,
          address: customer.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', workOrder.order?.customer_id);

      if (customerError) throw customerError;
      console.log('[EditWorkOrderDialog] Customer data updated successfully');

      // 2. Update order
      console.log('[EditWorkOrderDialog] Updating order data');
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: customer.name,
          company: customer.company,
          address: customer.address,
          work_types: workTypes,
          order_price: workOrderData.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', Number(workOrder.order_id));

      if (orderError) throw orderError;
      console.log('[EditWorkOrderDialog] Order data updated successfully');

      // 3. Update measurements
      console.log('[EditWorkOrderDialog] Updating measurements');
      await supabase.from('measurements').delete().eq('order_id', Number(workOrder.order_id));
      
      const { error: measurementsError } = await supabase
        .from('measurements')
        .insert(measurements.map(m => ({
          ...m,
          order_id: Number(workOrder.order_id),
          total_cost: m.quantity * m.cost
        })));

      if (measurementsError) throw measurementsError;
      console.log('[EditWorkOrderDialog] Measurements updated successfully');

      // 4. Update work order details
      console.log('[EditWorkOrderDialog] Updating work order details');
      const { error: workOrderError } = await supabase
        .from('order_details')
        .update({
          assigned_to: workOrderData.assigned_to,
          due_date: new Date(workOrderData.due_date).toISOString(),
          price: workOrderData.price,
          notes: workOrderData.notes,
          process_stage: workOrder.process_stage,
          updated_at: new Date().toISOString()
        })
        .eq('detail_id', Number(workOrder.detail_id));

      if (workOrderError) throw workOrderError;
      console.log('[EditWorkOrderDialog] Work order details updated successfully');

      setToast({ type: 'success', message: 'Work order updated successfully!' });
      setTimeout(onSave, 1500);
    } catch (err) {
      console.error('[EditWorkOrderDialog] Error updating work order:', err);
      setToast({ type: 'error', message: 'Failed to update work order' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Work Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            </div>
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
                    onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setCustomer(prev => ({ ...prev, company: e.target.value }))}
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
                    onChange={(e) => setCustomer(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                    required
                    pattern="^01[0125][0-9]{8}$"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Types */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Work Types *</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WORK_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleWorkTypeChange(type.value)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    workTypes.includes(type.value)
                      ? 'bg-green-100 text-green-800 border-2 border-green-500'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Work Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To *</label>
                <input
                  type="text"
                  value={workOrderData.assigned_to}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, assigned_to: e.target.value }))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  value={workOrderData.due_date}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (EGP) *</label>
                <input
                  type="number"
                  value={workOrderData.price}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={workOrderData.notes}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Measurements */}
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

            <div className="space-y-4">
              {measurements.map((measurement, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Material Name *</label>
                      <input
                        type="text"
                        value={measurement.material_name}
                        onChange={(e) => updateMeasurement(index, 'material_name', e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Material Type *</label>
                      <RadioGroup
                        options={[...MATERIAL_TYPES]}
                        value={measurement.material_type}
                        onChange={(value) => updateMeasurement(index, 'material_type', value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit *</label>
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
                        onChange={(e) => updateMeasurement(index, 'quantity', Number(e.target.value))}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cost per Unit (EGP) *</label>
                      <input
                        type="number"
                        value={measurement.cost}
                        onChange={(e) => updateMeasurement(index, 'cost', Number(e.target.value))}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        required
                        min="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                      <input
                        type="number"
                        value={measurement.total_cost}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
    </div>
  );
};

export default EditWorkOrderDialog; 