import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const AvailabilityCalendar = ({ availability, onUpdateAvailability }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek?.getDay();
    const diff = startOfWeek?.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek?.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date?.setDate(startOfWeek?.getDate() + i);
      return date;
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  const isTimeSlotAvailable = (date, time) => {
    const dateKey = date?.toISOString()?.split('T')?.[0];
    return availability?.[dateKey]?.includes(time) || false;
  };

  const toggleTimeSlot = (date, time) => {
    const dateKey = date?.toISOString()?.split('T')?.[0];
    const currentSlots = availability?.[dateKey] || [];
    const updatedSlots = currentSlots?.includes(time)
      ? currentSlots?.filter(slot => slot !== time)
      : [...currentSlots, time];
    
    onUpdateAvailability(dateKey, updatedSlots);
  };

  const weekDates = getCurrentWeekDates();

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Availability Calendar</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          iconName="ChevronLeft"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate?.setDate(selectedDate?.getDate() - 7);
            setSelectedDate(newDate);
          }}
        />
        <h4 className="font-medium text-foreground">
          {selectedDate?.toLocaleDateString('en-GB', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          iconName="ChevronRight"
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate?.setDate(selectedDate?.getDate() + 7);
            setSelectedDate(newDate);
          }}
        />
      </div>
      {viewMode === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-muted-foreground p-2">Time</div>
              {weekDates?.map((date, index) => (
                <div key={index} className="text-center p-2">
                  <div className="text-sm font-medium text-foreground">
                    {daysOfWeek?.[index]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(date)}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="space-y-1">
              {timeSlots?.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-2">
                  <div className="text-sm text-muted-foreground p-2 font-mono">
                    {time}
                  </div>
                  {weekDates?.map((date, dateIndex) => (
                    <button
                      key={`${time}-${dateIndex}`}
                      onClick={() => toggleTimeSlot(date, time)}
                      className={`p-2 rounded text-xs font-medium micro-animation ${
                        isTimeSlotAvailable(date, time)
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {isTimeSlotAvailable(date, time) ? 'Available' : 'Blocked'}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-muted rounded"></div>
            <span className="text-muted-foreground">Blocked</span>
          </div>
        </div>
        <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
          Bulk Update
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;