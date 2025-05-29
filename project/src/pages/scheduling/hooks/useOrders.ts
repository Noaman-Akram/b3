import { useState, useEffect } from 'react';
import { Order } from '../types';
import { getAllOrders } from '../schedulingService'; // imported service that fetches nested orders

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await getAllOrders();
        console.log('📦 useOrders fetchedOrders:', fetchedOrders);
        setOrders(fetchedOrders);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch orders');
        console.error('❌ useOrders error fetching orders:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
  };
}

export default useOrders;
