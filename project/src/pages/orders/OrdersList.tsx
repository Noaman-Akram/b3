/* import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { orders, measurements } from '../../lib/data';
import { Order, Measurement } from '../../types';

const OrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const toggleOrder = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getOrderMeasurements = (orderId: number) => {
    return measurements.filter(m => m.order_id === orderId);
  };

  const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const isExpanded = expandedOrder === order.id;
    const orderMeasurements = getOrderMeasurements(order.id);

    return (
      <div className="border rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
        <div 
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
            isExpanded ? 'bg-gray-50' : ''
          }`}
          onClick={() => toggleOrder(order.id)}
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-lg font-medium text-gray-900">{order.code}</span>
                <StatusBadge status={order.order_status} />
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{order.order_price.toLocaleString()} EGP</div>
              <div className="flex flex-wrap gap-1 justify-end mt-1">
                {order.work_types.map((type) => (
                  <span key={type} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/orders/${order.id}/edit`);
                }}
              >
                <Edit2 size={16} />
              </Button>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t px-4 py-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Name:</span> {order.customer_name}</p>
                  <p><span className="text-gray-600">Company:</span> {order.company}</p>
                  <p><span className="text-gray-600">Address:</span> {order.address}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Status:</span> {order.order_status}</p>
                  <p><span className="text-gray-600">Price:</span> {order.order_price.toLocaleString()} EGP</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Measurements</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderMeasurements.map((measurement) => (
                      <tr key={measurement.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{measurement.material_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{measurement.material_type}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{measurement.quantity} {measurement.unit}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{measurement.cost.toLocaleString()} EGP</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{measurement.total_cost.toLocaleString()} EGP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your orders</p>
        </div>
        <Button 
          onClick={() => navigate('/orders/new')}
          className="flex items-center space-x-2"
        >
          <PlusCircle size={16} />
          <span>New Order</span>
        </Button>
      </div>
      
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrdersList */