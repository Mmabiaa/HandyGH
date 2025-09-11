import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BookingFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  userType 
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'amount-desc', label: 'Highest Amount' },
    { value: 'amount-asc', label: 'Lowest Amount' },
    { value: 'status', label: 'By Status' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filter Bookings</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          iconName="X"
          iconPosition="left"
        >
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-1">
          <Input
            type="search"
            placeholder={userType === 'customer' ? 'Search providers...' : 'Search customers...'}
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            placeholder="Filter by status"
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => onFilterChange('status', value)}
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            placeholder="Filter by category"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => onFilterChange('category', value)}
          />
        </div>

        {/* Sort */}
        <div>
          <Select
            placeholder="Sort by"
            options={sortOptions}
            value={filters?.sort}
            onChange={(value) => onFilterChange('sort', value)}
          />
        </div>
      </div>
      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Input
            type="date"
            label="From Date"
            value={filters?.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e?.target?.value)}
          />
        </div>
        <div>
          <Input
            type="date"
            label="To Date"
            value={filters?.dateTo}
            onChange={(e) => onFilterChange('dateTo', e?.target?.value)}
          />
        </div>
      </div>
      {/* Active Filters Display */}
      {(filters?.search || filters?.status || filters?.category || filters?.dateFrom || filters?.dateTo) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters?.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              Search: {filters?.search}
              <button 
                onClick={() => onFilterChange('search', '')}
                className="ml-1 hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {filters?.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
              <button 
                onClick={() => onFilterChange('status', '')}
                className="ml-1 hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          {filters?.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              Category: {categoryOptions?.find(opt => opt?.value === filters?.category)?.label}
              <button 
                onClick={() => onFilterChange('category', '')}
                className="ml-1 hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingFilters;