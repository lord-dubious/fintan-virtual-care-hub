
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface TimeFilterProps {
  timeFilter: 'all' | 'morning' | 'afternoon' | 'evening';
  onTimeFilterChange: (filter: 'all' | 'morning' | 'afternoon' | 'evening') => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  timeFilter,
  onTimeFilterChange
}) => {
  return (
    <div className="flex items-center gap-4 justify-center">
      <Filter className="h-4 w-4 text-gray-500" />
      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Times</SelectItem>
          <SelectItem value="morning">Morning</SelectItem>
          <SelectItem value="afternoon">Afternoon</SelectItem>
          <SelectItem value="evening">Evening</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeFilter;
