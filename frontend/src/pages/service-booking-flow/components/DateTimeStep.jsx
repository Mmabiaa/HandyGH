import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateTimeStep = ({ selectedDateTime, onDateTimeSelect, onNext, onPrevious }) => {
  const [selectedDate, setSelectedDate] = useState(selectedDateTime?.date || '');
  const [selectedTime, setSelectedTime] = useState(selectedDateTime?.time || '');

  // Generate available dates (next 14 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date?.setDate(today?.getDate() + i);
      
      const isWeekend = date?.getDay() === 0 || date?.getDay() === 6;
      const dayName = date?.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date?.getDate();
      const monthName = date?.toLocaleDateString('en-US', { month: 'short' });
      
      dates?.push({
        value: date?.toISOString()?.split('T')?.[0],
        display: `${dayName} ${dayNumber}`,
        month: monthName,
        isWeekend,
        fullDate: date
      });
    }
    
    return dates;
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour?.toString()?.padStart(2, '0')}:${minute?.toString()?.padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`)?.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        // Mock availability - some slots are booked
        const isBooked = Math.random() < 0.3; // 30% chance of being booked
        
        slots?.push({
          value: time,
          display: displayTime,
          isBooked
        });
      }
    }
    
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    onDateTimeSelect({ date, time: '' });
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    onDateTimeSelect({ date: selectedDate, time });
  };

  const canProceed = selectedDate && selectedTime;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Select Date & Time</h3>
        <p className="text-muted-foreground">Choose your preferred date and time for the service.</p>
      </div>
      {/* Date Selection */}
      <div>
        <h4 className="text-lg font-medium text-foreground mb-4">Available Dates</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {availableDates?.map((date) => (
            <div
              key={date?.value}
              onClick={() => handleDateSelect(date?.value)}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center micro-animation hover-shadow ${
                selectedDate === date?.value
                  ? 'border-primary bg-primary/5'
                  : date?.isWeekend
                  ? 'border-warning/50 bg-warning/5' :'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">{date?.month}</div>
              <div className="font-medium text-foreground">{date?.display}</div>
              {date?.isWeekend && (
                <div className="text-xs text-warning mt-1">Weekend</div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Time Selection */}
      {selectedDate && (
        <div>
          <h4 className="text-lg font-medium text-foreground mb-4">Available Times</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {timeSlots?.map((slot) => (
              <button
                key={slot?.value}
                onClick={() => !slot?.isBooked && handleTimeSelect(slot?.value)}
                disabled={slot?.isBooked}
                className={`p-3 rounded-lg border-2 text-sm font-medium micro-animation ${
                  slot?.isBooked
                    ? 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                    : selectedTime === slot?.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                }`}
              >
                {slot?.display}
                {slot?.isBooked && (
                  <div className="text-xs mt-1">Booked</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Provider Availability Notice */}
      {selectedDate && selectedTime && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="CheckCircle" size={20} className="text-success mt-0.5" />
            <div>
              <h5 className="font-medium text-success mb-1">Time Slot Available</h5>
              <p className="text-sm text-success/80">
                Your selected time slot is available. The provider will be notified once you confirm your booking.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Alternative Suggestions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h5 className="font-medium text-foreground mb-2">Popular Time Slots</h5>
        <div className="flex flex-wrap gap-2">
          {['09:00', '14:00', '16:00']?.map((time) => (
            <span
              key={time}
              className="px-3 py-1 bg-card border border-border rounded-full text-sm text-muted-foreground"
            >
              {new Date(`2000-01-01T${time}`)?.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          ))}
        </div>
      </div>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Service
        </Button>
        
        <Button
          variant="default"
          disabled={!canProceed}
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Location
        </Button>
      </div>
    </div>
  );
};

export default DateTimeStep;