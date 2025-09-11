import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ selectedBookings, onBulkAction, onClearSelection }) => {
  const [selectedAction, setSelectedAction] = useState('');

  const actionOptions = [
    { value: '', label: 'Select action...' },
    { value: 'export', label: 'Export to CSV' },
    { value: 'cancel', label: 'Cancel Selected' },
    { value: 'reschedule', label: 'Bulk Reschedule' },
    { value: 'send-reminder', label: 'Send Reminders' }
  ];

  const handleExecuteAction = () => {
    if (selectedAction && selectedBookings?.length > 0) {
      onBulkAction(selectedAction, selectedBookings);
      setSelectedAction('');
    }
  };

  if (selectedBookings?.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {selectedBookings?.length} booking{selectedBookings?.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              placeholder="Choose action"
              options={actionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              className="min-w-48"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleExecuteAction}
              disabled={!selectedAction}
              iconName="Play"
              iconPosition="left"
            >
              Execute
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
};

export default BulkActions;