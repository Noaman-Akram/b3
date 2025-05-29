import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { Measurement } from '../../types';
import { MeasurementService } from '../../services/MeasurementService';

const MeasurementsList: React.FC = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const service = new MeasurementService();
    service.getAll()
      .then(setMeasurements)
      .finally(() => setLoading(false));
  }, []);
  
  const columns = [
    {
      header: 'Material',
      accessor: (measurement: Measurement) => (
        <div>
          <div className="font-medium text-gray-900">{measurement.material_name}</div>
          <div className="text-gray-500 text-xs">{measurement.material_type}</div>
        </div>
      ),
    },
    {
      header: 'Quantity',
      accessor: (measurement: Measurement) => (
        <div className="font-medium text-gray-900">
          {measurement.quantity} {measurement.unit}
        </div>
      ),
    },
    {
      header: 'Cost per Unit',
      accessor: (measurement: Measurement) => (
        <div className="font-medium text-gray-900">
          ${measurement.cost.toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Total Cost',
      accessor: (measurement: Measurement) => (
        <div className="font-medium text-gray-900">
          ${measurement.total_cost.toLocaleString()}
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Measurements</h1>
          <p className="mt-1 text-sm text-gray-500">Track material measurements</p>
        </div>
        <Button 
          onClick={() => navigate('/measurements/new')}
          className="flex items-center space-x-2"
        >
          <PlusCircle size={16} />
          <span>Add Measurement</span>
        </Button>
      </div>
      
      <Card>
        <DataTable
          data={measurements}
          columns={columns}
          keyExtractor={(measurement) => measurement.id}
          onRowClick={(measurement) => navigate(`/measurements/${measurement.id}`)}
        />
      </Card>
    </div>
  );
};

export default MeasurementsList;