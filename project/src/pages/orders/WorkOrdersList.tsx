"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  PlusCircle,
  Search,
  ListFilter,
  ArrowUpDown,
  Hammer,
  Calendar,
  User,
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
  Building2,
  Phone,
  MapPin,
  Box,
  Clock,
  ClipboardList,
  Pencil,
  Eye,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
} from "lucide-react"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import { supabase } from "../../lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import EditWorkOrderDialog from "../../components/orders/EditWorkOrderDialog"
import { STAGE_STATUSES, ORDER_TYPES } from "../../lib/constants"

interface WorkOrder {
  detail_id: string
  order_id: string
  assigned_to: string
  due_date: string
  process_stage: string
  price: number
  total_cost: number
  notes?: string
  order?: {
    id: string
    code: string
    customer_id: number
    customer_name: string
    company: string
    address: string
    work_types: string[]
    created_at: string
    customer?: {
      id: number
      name: string
      company: string
      phone_number: string
      address: string
      city: string
      address_details: string
    }
    measurements?: {
      id: string
      material_name: string
      material_type: string
      unit: string
      quantity: number
      cost: number
      total_cost: number
    }[]
  }
  stages?: {
    id: string
    stage_name: string
    status: string
    planned_start_date: string
    planned_finish_date: string
    actual_start_date: string | null
    actual_finish_date: string | null
    notes: string
    assignments?: {
      id: string
      employee_name: string
      work_date: string
      note: string | null
      is_done: boolean
      employee_rate: number
    }[]
  }[]
}

type SortableField = keyof WorkOrder | "customer_name" | "code"

const WorkOrdersList = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortableField>("detail_id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null)

  const fetchOrders = async () => {
    try {
      console.log("[WorkOrdersList] Fetching work orders with customer data")
      const { data, error } = await supabase
        .from("order_details")
        .select(`
          *,
          order:orders(
            *,
            measurements(*),
            customer:customers(
              id,
              name,
              company,
              phone_number,
              address
            )
          ),
          stages:order_stages(
            *,
            assignments:order_stage_assignments(*)
          )
        `)
        .order(sortField, { ascending: sortDirection === "asc" })

      if (error) throw error
      console.log("[WorkOrdersList] Fetched work orders:", data)
      setOrders(data || [])
    } catch (err) {
      console.error("[WorkOrdersList] Error fetching work orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [sortField, sortDirection])

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortValue = (order: WorkOrder, field: SortableField): string | number => {
    if (field === "customer_name" || field === "code") {
      return order.order?.[field] || ""
    }
    const value = order[field as keyof WorkOrder]
    if (typeof value === "string" || typeof value === "number") {
      return value
    }
    return ""
  }

  const handleEdit = (order: WorkOrder) => {
    setEditingOrder(order)
  }

  const handleEditClose = () => {
    setEditingOrder(null)
  }

  const handleEditSave = () => {
    setEditingOrder(null)
    // Refresh the orders list
    fetchOrders()
  }

  const handleViewDetails = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id)
  }

  // Calculate scheduled stages count
  const getScheduledStagesInfo = (order: WorkOrder) => {
    if (!order.stages || order.stages.length === 0) {
      return { total: 0, scheduled: 0 }
    }

    const total = order.stages.length
    const scheduled = order.stages.filter((stage) => stage.status === "scheduled").length

    return { total, scheduled }
  }

  // Calculate profit margin
  const calculateProfitMargin = (price: number, cost: number) => {
    if (!price || !cost || cost === 0) return 0
    return ((price - cost) / price) * 100
  }

  // Format date with time
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Format date only
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get stage status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "delayed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders
    .filter(
      (order) =>
        order.order?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)
      if (aValue === bValue) return 0
      const comparison = aValue > bValue ? 1 : -1
      return sortDirection === "asc" ? comparison : -comparison
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <Hammer className="text-green-600" /> Work Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track work orders</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-8 pr-3 py-2 rounded border border-gray-300 focus:ring-green-500 focus:border-green-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ListFilter size={16} /> Filter
          </Button>
          <Button
            onClick={() => navigate("/orders/work/new")}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusCircle size={16} />
            <span>New Work Order</span>
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase cursor-pointer"
                  onClick={() => handleSort("order_id")}
                >
                  <div className="flex items-center gap-1">
                    Order Code <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase cursor-pointer"
                  onClick={() => handleSort("customer_name")}
                >
                  <div className="flex items-center gap-1">
                    Customer <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase cursor-pointer"
                  onClick={() => handleSort("assigned_to")}
                >
                  <div className="flex items-center gap-1">
                    Assigned To <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase cursor-pointer"
                  onClick={() => handleSort("due_date")}
                >
                  <div className="flex items-center gap-1">
                    Due Date <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase cursor-pointer"
                  onClick={() => handleSort("process_stage")}
                >
                  <div className="flex items-center gap-1">
                    Stage <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">
                  <div className="flex items-center gap-1">Stages</div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center gap-1">
                    Price <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No work orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const stagesInfo = getScheduledStagesInfo(order)

                  return (
                    <React.Fragment key={order.detail_id}>
                      <tr
                        className="hover:bg-green-50 cursor-pointer"
                        onClick={() => handleViewDetails(order.detail_id)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900">{order.order?.code || `#${order.order_id}`}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            <span>{order.order?.customer_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            <span>{order.assigned_to}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span>{new Date(order.due_date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.process_stage === ORDER_TYPES.WORK
                                ? "bg-green-100 text-green-800"
                                : order.process_stage === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {STAGE_STATUSES.find((s) => s.value === order.process_stage)?.label || order.process_stage}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <CalendarClock size={16} className="text-blue-500 mr-2" />
                            <span className="text-blue-600 font-medium">{stagesInfo.scheduled}</span>
                            <span className="text-gray-500 mx-1">of</span>
                            <span>{stagesInfo.total}</span>
                            <span className="text-gray-500 ml-1">scheduled</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <BadgeDollarSign size={16} className="text-gray-400 mr-2" />
                            <span>{order.price.toLocaleString()} EGP</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/orders/work/${order.detail_id}`)
                              }}
                            >
                              View Details
                            </Button>
                            {expandedOrderId === order.detail_id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedOrderId === order.detail_id && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan={8} className="bg-gray-50 p-6">
                              <div className="space-y-6">
                                {/* Customer Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <User size={16} />
                                      <span className="font-medium">Customer Name:</span>
                                    </div>
                                    <p className="text-gray-900">{order.order?.customer_name}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <Building2 size={16} />
                                      <span className="font-medium">Company:</span>
                                    </div>
                                    <p className="text-gray-900">{order.order?.company || "N/A"}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <Phone size={16} />
                                      <span className="font-medium">Phone:</span>
                                    </div>
                                    <p className="text-gray-900">{order.order?.customer?.phone_number || "N/A"}</p>
                                  </div>
                                  <div className="md:col-span-3 space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <MapPin size={16} />
                                      <span className="font-medium">Address:</span>
                                    </div>
                                    <p className="text-gray-900">{order.order?.address || "N/A"}</p>
                                  </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-500">Total Price</p>
                                      <p className="text-xl font-bold text-green-700">
                                        {order.price.toLocaleString()} EGP
                                      </p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-500">Total Cost</p>
                                      <p className="text-xl font-bold text-red-700">
                                        {order.total_cost.toLocaleString()} EGP
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-500">Profit</p>
                                      <p className="text-xl font-bold text-blue-700">
                                        {(order.price - order.total_cost).toLocaleString()} EGP
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-500">Profit Margin</p>
                                      <p className="text-xl font-bold text-purple-700">
                                        {calculateProfitMargin(order.price, order.total_cost).toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Work Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <Box size={16} />
                                      <span className="font-medium">Work Types:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {order.order?.work_types.map((type, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                                        >
                                          {type}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <Clock size={16} />
                                      <span className="font-medium">Due Date:</span>
                                    </div>
                                    <p className="text-gray-900">{new Date(order.due_date).toLocaleDateString()}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <User size={16} />
                                      <span className="font-medium">Assigned To:</span>
                                    </div>
                                    <p className="text-gray-900">{order.assigned_to}</p>
                                  </div>
                                </div>

                                {/* Work Stages */}
                                {order.stages && order.stages.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="text-lg font-medium text-gray-900">Work Stages</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {order.stages.map((stage, index) => {
                                        const statusInfo = STAGE_STATUSES.find((s) => s.value === stage.status)
                                        const statusColor = getStatusColor(stage.status)
                                        const assignmentsCount = stage.assignments?.length || 0
                                        const completedAssignments =
                                          stage.assignments?.filter((a) => a.is_done)?.length || 0

                                        return (
                                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between">
                                              <h5 className="text-lg font-medium text-gray-900">{stage.stage_name}</h5>
                                              <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                                              >
                                                {statusInfo?.label || stage.status}
                                              </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                              <div>
                                                <p className="text-sm text-gray-500">Planned Start</p>
                                                <p className="text-gray-900">{formatDate(stage.planned_start_date)}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-gray-500">Planned Finish</p>
                                                <p className="text-gray-900">{formatDate(stage.planned_finish_date)}</p>
                                              </div>

                                              {stage.actual_start_date && (
                                                <div>
                                                  <p className="text-sm text-gray-500">Actual Start</p>
                                                  <p className="text-gray-900">{formatDate(stage.actual_start_date)}</p>
                                                </div>
                                              )}

                                              {stage.actual_finish_date && (
                                                <div>
                                                  <p className="text-sm text-gray-500">Actual Finish</p>
                                                  <p className="text-gray-900">
                                                    {formatDate(stage.actual_finish_date)}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                              <div className="flex items-center">
                                                <ClipboardList size={16} className="text-gray-400 mr-2" />
                                                <span>
                                                  <span className="font-medium">{completedAssignments}</span>
                                                  <span className="text-gray-500"> of </span>
                                                  <span className="font-medium">{assignmentsCount}</span>
                                                  <span className="text-gray-500"> assignments completed</span>
                                                </span>
                                              </div>

                                              {stage.status === "scheduled" && (
                                                <span className="flex items-center text-blue-600">
                                                  <CalendarClock size={16} className="mr-1" />
                                                  Scheduled
                                                </span>
                                              )}

                                              {stage.status === "in_progress" && (
                                                <span className="flex items-center text-yellow-600">
                                                  <AlertCircle size={16} className="mr-1" />
                                                  In Progress
                                                </span>
                                              )}

                                              {stage.status === "completed" && (
                                                <span className="flex items-center text-green-600">
                                                  <CheckCircle2 size={16} className="mr-1" />
                                                  Completed
                                                </span>
                                              )}
                                            </div>

                                            {stage.notes && (
                                              <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-sm text-gray-500">Notes</p>
                                                <p className="text-gray-900">{stage.notes}</p>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Measurements */}
                                {order.order?.measurements && order.order.measurements.length > 0 && (
                                  <div className="space-y-4">
                                    <h4 className="text-lg font-medium text-gray-900">Measurements</h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Material
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Unit
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Cost
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Total
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {order.order.measurements.map((measurement, index) => (
                                            <tr key={index}>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {measurement.material_name}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {measurement.material_type}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {measurement.unit}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {measurement.quantity}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {measurement.cost.toLocaleString()} EGP
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {measurement.total_cost.toLocaleString()} EGP
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {order.notes && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
                                    <p className="text-gray-700 whitespace-pre-line">{order.notes}</p>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4">
                                  <Button
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEdit(order)
                                    }}
                                    className="flex items-center space-x-2"
                                  >
                                    <Pencil size={16} />
                                    <span>Edit Order</span>
                                  </Button>
                                  <Button
                                    variant="primary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/orders/work/${order.detail_id}`)
                                    }}
                                    className="flex items-center space-x-2"
                                  >
                                    <Eye size={16} />
                                    <span>View Full Details</span>
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add the dialog */}
      {editingOrder && (
        <EditWorkOrderDialog workOrder={editingOrder} onClose={handleEditClose} onSave={handleEditSave} />
      )}
    </div>
  )
}

export default WorkOrdersList
