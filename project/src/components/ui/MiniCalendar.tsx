import React from 'react';
import { format, addWeeks, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);
  
  const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
  const weeks = Array.from({ length: 6 }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const day = addDays(weekStart, weekIndex * 7 + dayIndex);
      return day;
    });
  });

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(prev => addWeeks(prev, -1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(prev => addWeeks(prev, 1))}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} className="text-xs text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => {
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isDisabled = isDateDisabled(date);
          
          return (
            <button
              key={i}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                p-1 text-center text-sm rounded-md transition-colors
                ${isDisabled ? 'text-gray-300 cursor-not-allowed' :
                  isSelected ? 'bg-green-600 text-white' :
                  'hover:bg-gray-100 text-gray-700'}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;