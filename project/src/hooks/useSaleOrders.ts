import { useState, useCallback } from 'react';
import { SaleOrderService } from '../services/SaleOrderService';
import { SaleOrder, CreateSaleOrderDTO, UpdateSaleOrderDTO } from '../types/saleOrder';

export const useSaleOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const saleOrderService = new SaleOrderService();

  const getAllSaleOrders = useCallback(async (options?: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const orders = await saleOrderService.getAllSaleOrders(options);
      return orders;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSaleOrderById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const order = await saleOrderService.getSaleOrderById(id);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSaleOrder = useCallback(async (dto: CreateSaleOrderDTO) => {
    setLoading(true);
    setError(null);
    try {
      const order = await saleOrderService.createSaleOrder(dto);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSaleOrder = useCallback(async (id: string, dto: UpdateSaleOrderDTO) => {
    setLoading(true);
    setError(null);
    try {
      const order = await saleOrderService.updateSaleOrder(id, dto);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSaleOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await saleOrderService.deleteSaleOrder(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSaleOrdersByCustomer = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const orders = await saleOrderService.getSaleOrdersByCustomer(customerId);
      return orders;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSaleOrdersByStatus = useCallback(async (status: SaleOrder['status']) => {
    setLoading(true);
    setError(null);
    try {
      const orders = await saleOrderService.getSaleOrdersByStatus(status);
      return orders;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAllSaleOrders,
    getSaleOrderById,
    createSaleOrder,
    updateSaleOrder,
    deleteSaleOrder,
    getSaleOrdersByCustomer,
    getSaleOrdersByStatus
  };
}; 