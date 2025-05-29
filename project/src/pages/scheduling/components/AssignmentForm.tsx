import { useState, useEffect, useMemo, useCallback } from "react"
import { format, isBefore, isEqual, addDays, eachDayOfInterval } from "date-fns"
import { Calendar, ClipboardList, User, Info } from "lucide-react"
import { Button } from "../../../components/components/ui/button"
import { Label } from "../../../components/components/ui/label"
import { Textarea } from "../../../components/components/ui/textarea"
import { Switch } from "../../../components/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/components/ui/select"
import { Order, OrderStage, OrderStageAssignment, OrderDetailWithStages } from "../types"
import DateRangePicker from "../ui/DateRangePicker"
import MultiSelect from "../ui/MultiSelect"
import { STATIC_EMPLOYEES } from "../constants"
import useOrders from '../hooks/useOrders'
import MyForm from "../ui/DatePickerHero";
import { supabase } from "../../../lib/supabase"
import DatePickerHero from "../ui/DatePickerHero"
import { createAssignment } from '../schedulingService'; // or wherever your service is

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignments: Omit<OrderStageAssignment, 'id'>[]) => Promise<void>;
  stages: OrderStage[];
  assignment?: OrderStageAssignment | null;
  orderId?: number; // Keep for initial value if needed, though handling in effect now
  stageId?: number; // Keep for initial value if needed, though handling in effect now
  date?: Date;
}

export function AssignmentForm({
  isOpen,
  onClose,
  onSubmit,
  stages, // Stages passed from parent
  assignment,
  date, // Initial date for new assignments
}: AssignmentFormProps) {
  // --- State Variables ---
  const [selectedOrderId, setSelectedOrderId] = useState(0) // Use 0 for no selection
  const [selectedStageId, setSelectedStageId] = useState(0) // Use 0 for no selection
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | null>(date || new Date())
  const [endDate, setEndDate] = useState<Date | null>(date ? addDays(date, 1) : addDays(new Date(), 1))
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})


  const [stagesForOrder, setStagesForOrder] = useState<OrderStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);




  // --- Fetch Orders ---
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();

  // --- Derived State / Memos ---
  // Find the selected order object
  const selectedOrder = useMemo(() =>
    orders.find(order => order.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  // Get all detail_ids for the selected order
  const orderDetailId = useMemo(() => {
    if (!selectedOrder?.order_details?.length) return null;
    return Number(selectedOrder.order_details[0].detail_id);
  }, [selectedOrder]);
  
  const filteredStages = useMemo(() => {
    return stagesForOrder; // already filtered by backend
  }, [stagesForOrder]);
  
  

  // --- Effects ---
 

  // Initialize form when assignment changes or orders/stages load
  useEffect(() => {
    if (assignment && orders.length > 0 && stages.length > 0) {
      // Find the stage to get the order_detail_id
      const stage = stages.find(s => s.id === assignment.order_stage_id);
      if (stage?.order_detail_id) {
        // Find the order that contains this order_detail_id
        const order = orders.find(o =>
          o.order_details?.some(detail => detail.detail_id === stage.order_detail_id)
        );

        if (order) {
          setSelectedOrderId(order.id);
          setSelectedStageId(assignment.order_stage_id);
          setSelectedEmployees(assignment.employee_name ? [assignment.employee_name] : []); // Assuming single employee for existing assignment
          setStartDate(assignment.work_date ? new Date(assignment.work_date) : new Date());
          setEndDate(assignment.work_date ? addDays(new Date(assignment.work_date), 1) : addDays(new Date(), 1)); // Default end date for single day edit
          setIsMultiDay(false); // Assume existing assignment is single day initially
          setNote(assignment.note || "");
          setErrors({}); // Clear errors on load
          return;
        }
      }

      // If we couldn't find the order or stage for the assignment
      console.error('Could not find order or relevant stage for assignment:', assignment);
      // Optionally, show an error message to the user

    }

    // Handle date initialization for new assignments when 'date' prop is provided
    if (!assignment && date) {
       setStartDate(date);
       setEndDate(addDays(date, 1)); // Default end date one day after start
       setIsMultiDay(false); // Default to single day for new assignments
    }

    // Reset other fields for new assignments or if assignment details are invalid
    if (!assignment || ! (assignment && orders.length > 0 && stages.length > 0 && selectedOrder && selectedOrder.order_details?.some(detail => detail.detail_id === stages.find(s => s.id === assignment.order_stage_id)?.order_detail_id))) {
        setSelectedOrderId(0);
        setSelectedStageId(0);
        setSelectedEmployees([]);
        setNote("");
        // Dates are handled above based on the 'date' prop
        setIsMultiDay(false);
        setErrors({}); // Clear errors on reset
    }

  }, [assignment, date, stages, orders]) // Added orders to dependency array, simplified logic

  useEffect(() => {
    async function fetchStages() {
      if (!orderDetailId) {
        setStagesForOrder([]);
        return;
      }
  
      setLoadingStages(true);
      try {
        const { data, error } = await supabase
          .from('order_stages')
          .select('*')
          .eq('order_detail_id', orderDetailId);
  
        if (error) {
          console.error('Supabase error:', error);
          setStagesForOrder([]);
        } else {
          setStagesForOrder(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStagesForOrder([]);
      } finally {
        setLoadingStages(false);
      }
    }
  
    fetchStages();
  
  }, [orderDetailId]);
  


  // --- Validation ---
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!selectedOrderId) {
      newErrors.order = "Please select an order"
    }
    if (!selectedStageId) {
      newErrors.stage = "Please select a stage"
    }
    if (selectedEmployees.length === 0) {
      newErrors.employees = "Please select at least one employee"
    }
    if (!startDate) {
      newErrors.startDate = "Please select a start date"
    }
    if (isMultiDay) {
      if (!endDate) {
         newErrors.endDate = "Please select an end date for multi-day assignment"
      } else if (startDate && isBefore(endDate, startDate)) {
         newErrors.endDate = "End date must be on or after the start date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [selectedOrderId, selectedStageId, selectedEmployees, startDate, endDate, isMultiDay]); // Added dependencies

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed.');
      return;
    }
  
    setLoading(true);
    setErrors({}); // Clear previous errors on new submission attempt
  
    try {
      const selectedStage = filteredStages.find(s => s.id === selectedStageId);
  
      // Stage validation
      if (!selectedStage || !selectedStage.order_detail_id) {
        setErrors(prev => ({
          ...prev,
          form: 'Selected stage is invalid or missing order detail link. Please select again.'
        }));
        console.error('Validation failed: ', { selectedStage, selectedStageId });
        return;
      }
  
      const orderDetail = selectedOrder?.order_details?.find(d => d.detail_id === selectedStage.order_detail_id);
  
      // Order detail validation
      if (!orderDetail) {
        setErrors(prev => ({
          ...prev,
          form: 'Selected stage does not belong to the selected order. Please check selection.'
        }));
        console.error('Validation failed: Selected stage does not belong to selected order', { selectedOrderId, selectedStageId, selectedStage, selectedOrder });
        return;
      }
  
      if (!startDate) {
        setErrors(prev => ({ ...prev, form: 'Start date is required.' }));
        console.error('Validation failed: Start date is null');
        return;
      }

      
  
      if (selectedEmployees.length === 0) {
        setErrors(prev => ({ ...prev, form: 'At least one employee must be selected.' }));
        console.error('Validation failed: No employees selected');
        return;
      }
  
      const assignmentsToSubmit: Omit<OrderStageAssignment, 'id'>[] = [];
  
      // Generate assignments based on multi-day or single-day selection
      if (isMultiDay && startDate && endDate) {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
  
        for (const day of days) {
          for (const employee of selectedEmployees) {
            assignmentsToSubmit.push({
              order_stage_id: selectedStageId,
              employee_name: employee,
              work_date: format(day, 'yyyy-MM-dd'),
              note: note || null,
        //      order_detail_id: orderDetail.detail_id,
              is_done: false,
              created_at: new Date().toISOString(),
              employee_rate: null,
            });
          }
        }
      } else if (startDate) {
        // For a single day
        for (const employee of selectedEmployees) {
          assignmentsToSubmit.push({
            order_stage_id: selectedStageId,
            employee_name: employee,
            work_date: format(startDate, 'yyyy-MM-dd'),
            note: note || null,
//            order_detail_id: orderDetail.detail_id,
            is_done: false,
            created_at: new Date().toISOString(),
            employee_rate: null,
          });
        }
      }
      console.log('--- Assignment Submission Debug ---');
      console.log('Selected Order:', selectedOrder);
      console.log('Selected Stage:', selectedStage);
      console.log('Order Detail:', orderDetail);
      console.log('Assignments to be submitted to DB:', assignmentsToSubmit);

  
      // Check if assignments were generated
      if (assignmentsToSubmit.length === 0) {
        const msg = 'No assignments were generated based on your selections. Please check dates and employees.';
        setErrors(prev => ({ ...prev, form: msg }));
        console.error(msg, { startDate, endDate, isMultiDay, selectedEmployees });
        return;
      }
  
      // Insert assignments one by one using createAssignment
      for (const assignment of assignmentsToSubmit) {
        await createAssignment(assignment); // This calls the createAssignment function in the other file
      }
  
      onClose(); // Close the form after successful submission
  
    } catch (error) {
      console.error('Error during assignment submission:', error);
      setErrors(prev => ({
        ...prev,
        form: error instanceof Error ? error.message : 'An unexpected error occurred during submission.'
      }));
    } finally {
      setLoading(false);
    }
  };
  

  const handleMultiDayToggle = useCallback((checked: boolean) => {
    setIsMultiDay(checked);
    // Adjust end date based on toggle
    if (checked && startDate) {
      // If toggling on and start date exists, set end date to one day after start date
      setEndDate(addDays(startDate, 1));
    } else if (!checked && startDate) {
      // If toggling off and start date exists, set end date to same as start date
      setEndDate(startDate);
    } else if (!checked && !startDate) {
       // If toggling off and no start date, ensure end date is null or new Date()
       setEndDate(null); // Or set to new Date() if a default is desired when no start date
    }
     // If toggling on and no start date, end date will remain null, caught by validation
  }, [startDate]); // Added startDate to dependency array

  // --- Render ---
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> {/* Use onOpenChange to handle closing via overlay click or escape */}
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]"> {/* Added max height and overflow */}
        <DialogHeader>
          <DialogTitle>{assignment ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}> {/* Wrap form fields in a form element */}
          <div className="grid gap-6 py-4"> {/* Increased gap for better spacing */}

            {/* Order and Stage Selection */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <ClipboardList className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> {/* Use grid for layout */}
                <div>
                  <Label htmlFor="order">Order *</Label>
                  <Select
                    value={selectedOrderId.toString()}
                    onValueChange={(value) => {
                      const id = Number(value);
                      setSelectedOrderId(id);
                      // Reset stage when order changes
                      setSelectedStageId(0);
                    }}
                    disabled={ordersLoading}
                  >
                    <SelectTrigger>
                      {ordersLoading ? (
                        <SelectValue placeholder="Loading Orders..." />
                      ) : ordersError ? (
                        <SelectValue placeholder={`Error: ${ordersError.message}`} />
                      ) : (orders.length === 0 ? (
                         <SelectValue placeholder="No Orders Available" />
                      ) : (
                         <SelectValue placeholder="Select an order" />
                      ))}
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          {order.code} - {order.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.order && <p className="text-sm text-red-500 mt-1">{errors.order}</p>}
                </div>

                {/* Stage Selection - Dynamic Label */}
                <div>
                  <Label htmlFor="stage">
                     Stage {selectedOrderId > 0 && selectedOrder ? `for Order ${selectedOrder.code}` : ''} *
                  </Label>
                  <Select
                    value={selectedStageId.toString()}
                    onValueChange={(value) => setSelectedStageId(Number(value))}
                    disabled={!selectedOrderId || filteredStages.length === 0} /* Disabled if no order selected or no stages available */
                  >
                    <SelectTrigger>
                      {!selectedOrderId ? (
                         <SelectValue placeholder="Select an order first" />
                      ) : filteredStages.length === 0 ? (
                         <SelectValue placeholder="No stages for this order" />
                      ) : (
                         <SelectValue placeholder="Select a stage" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {stage.stage_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stage && <p className="text-sm text-red-500 mt-1">{errors.stage}</p>}
                </div>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Employee Assignment</h3>
              </div>

              <div>
                <Label className="mb-2 block">Employees *</Label>
                <MultiSelect
                  options={STATIC_EMPLOYEES}
                  selected={selectedEmployees}
                  onChange={setSelectedEmployees}
                />
                {errors.employees && <p className="text-sm text-red-500 mt-1">{errors.employees}</p>}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
             <Calendar className="h-5 w-5 text-green-600" /> 
                   <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="multi-day" className="text-sm cursor-pointer"> {/* Added cursor-pointer */}
                    Multi-Day Assignment
                  </Label>
                  <Switch
                    id="multi-day"
                    checked={isMultiDay}
                    onCheckedChange={handleMultiDayToggle}
                    disabled={!!assignment} /* Disable for existing assignments */
                  />
                </div>
              </div>

              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                isMultiDay={isMultiDay}
              />

              {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
              {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
            </div>

            {/* Notes */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Additional Notes</h3>
              </div>

              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add any additional notes or instructions..."
              />
            </div>

            {/* Live Preview Section */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
               <h3 className="text-lg font-medium text-blue-900">Live Preview</h3>
               <div>
                 <h4 className="text-md font-medium">Form Data (JSON):</h4>
                 <pre className="bg-blue-100 p-3 rounded text-sm overflow-auto max-h-40">
                   {JSON.stringify({
                      selectedOrderId,
                      orderDetailId,
                      selectedStageId,
                      selectedEmployees,
                      startDate: startDate?.toISOString().split('T')[0],
                      endDate: isMultiDay ? endDate?.toISOString().split('T')[0] : undefined,
                      isMultiDay,
                      note,
                      // Add filtered stages to the JSON preview
                      filteredStages: filteredStages.map(stage => ({
                        id: stage.id,
                        stage_name: stage.stage_name,
                        order_detail_id: stage.order_detail_id,
                      })),
                   }, null, 2)}
                 </pre>
               </div>
               <div>
                 <h4 className="text-md font-medium">Assignment Preview (HTML approx):</h4>
                 <div className="bg-blue-100 p-3 rounded text-sm overflow-auto max-h-40">
                   {selectedOrderId > 0 && selectedStageId > 0 && selectedEmployees.length > 0 && startDate ? (
                      <>
                         <p><strong>Order:</strong> {selectedOrder?.code} - {selectedOrder?.customer_name}</p>
                         <p><strong>Stage:</strong> {filteredStages.find(s => s.id === selectedStageId)?.stage_name}</p>
                         <p><strong>Employees:</strong> {selectedEmployees.join(', ')}</p>
                         <p><strong>Date{isMultiDay ? ' Range' : ''}:</strong> {format(startDate, 'yyyy-MM-dd')}{isMultiDay && endDate ? ` to ${format(endDate, 'yyyy-MM-dd')}` : ''}</p>
                         {note && <p><strong>Notes:</strong> {note}</p>}
                      </>
                   ) : (
                      <p className="text-gray-600">Select Order, Stage, Employees, and Date to see preview.</p>
                   )}
                 </div>
               </div>
            </div>

            {errors.form && <p className="text-sm text-red-500 mt-4 text-center">{errors.form}</p>}

          </div> {/* End grid gap */}

          {/* Dialog Footer - outside form if buttons trigger form submission manually */}
          {/* If using form onSubmit, buttons inside form with type=submit or type=button */}
           <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={loading || ordersLoading}>
                Cancel
              </Button>
              {/* Button type is submit to trigger form onSubmit */}
              <Button type="submit" disabled={loading || ordersLoading || ordersError !== null} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Saving..." : assignment ? "Update Assignment" : "Create Assignment"}
              </Button>
            </DialogFooter>
        </form> {/* End form element */}
      </DialogContent>
    </Dialog>
  )
}

export default AssignmentForm
