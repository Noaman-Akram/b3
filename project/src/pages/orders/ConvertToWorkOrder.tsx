import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Calculator
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RadioGroup from '../../components/ui/RadioGroup';
import { supabase } from '../../lib/supabase';
import { WorkOrderService } from '../../services/WorkOrderService';
import Toast from '../../components/ui/Toast';
import { EGYPTIAN_CITIES, WORK_TYPES, MATERIAL_TYPES, UNITS, ENGINEERS } from '../../lib/constants';

const ConvertToWorkOrder: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [customer, setCustomer] = useState<any>({
    name: '',
    company: '',
    phone_number: '',
    city: 'Cairo',
    address_details: ''
  });
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        // Fetch order with measurements
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, measurements(*)')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;
        
        // Parse address into city and details
        let city = 'Cairo', address_details = '';
        if (orderData.address && orderData.address.includes(' - ')) {
          [city, address_details] = orderData.address.split(' - ');
        }

        setOrder(orderData);
        setWorkTypes(orderData.work_types || []);
        setMeasurements(orderData.measurements || []);
        setCustomer({
          name: orderData.customer_name,
          company: orderData.company,
          phone_number: '',
          city,
          address_details
        });
        setWorkOrderData(prev => ({
          ...prev,
          price: orderData.order_price,
        }));
      } catch (err) {
        console.error('Error fetching order:', err);
        setToast({ type: 'error', message: 'Failed to load order details' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

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

    setSubmitting(true);
    try {
      // 1. Upload image if selected
      let img_url = '';
      if (selectedFile) {
        img_url = await workOrderService.uploadImage(selectedFile);
      }

      // 2. Update original order with new data
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: customer.name,
          company: customer.company,
          address: `${customer.city} - ${customer.address_details}`,
          work_types: workTypes,
          order_price: workOrderData.price,
          order_status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // 3. Update measurements
      await supabase.from('measurements').delete().eq('order_id', order.id);
      const newMeasurements = measurements.map(m => ({
        ...m,
        order_id: order.id,
        total_cost: m.quantity * m.cost
      }));
      const { error: measurementsError } = await supabase
        .from('measurements')
        .insert(newMeasurements);

      if (measurementsError) throw measurementsError;

      // 4. Create work order
      const workOrder = await workOrderService.create({
        order_id: order.id,
        assigned_to: workOrderData.assigned_to,
        due_date: workOrderData.due_date,
        price: workOrderData.price,
        total_cost: calculateTotals().totalCost,
        notes: workOrderData.notes,
        img_url,
      });

      setToast({ type: 'success', message: 'Work order created successfully!' });
      setTimeout(() => navigate('/orders/work'), 1500);
    } catch (err) {
      console.error('Error creating work order:', err);
      setToast({ type: 'error', message: 'Failed to create work order' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/orders/sale')}>
          Back to Orders
        </Button>
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
          onClick={() => navigate('/orders/sale')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Orders</span>
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="bg-green-50 px-4 py-2 rounded-md">
            <span className="text-sm text-gray-500">Order Code:</span>
            <span className="ml-2 font-mono font-bold text-green-600">{order.code}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Hammer className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Convert to Work Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    {EGYPTIAN_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address Details *</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={customer.address_details}
                    onChange={(e) => setCustomer({ ...customer, address_details: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 text-lg rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
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

        {/* Work Order Details */}
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
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  required
                  value={workOrderData.due_date}
                  onChange={(e) => setWorkOrderData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1 block w-full py-2 px-3 text-base rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                  min={new Date().toISOString().split('T')[0]}
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

        {/* Order Summary */}
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
            onClick={() => navigate('/orders/sale')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={submitting}
          >
            {submitting ? 'Converting...' : 'Convert to Work Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConvertToWorkOrder;