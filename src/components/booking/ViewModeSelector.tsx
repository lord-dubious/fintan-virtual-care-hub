import React from "react";

import { Button } from "@/components/ui/button";
import { CalendarIcon, Calendar, Sparkles } from "lucide-react";

interface ViewModeSelectorProps {
  viewMode: 'calendar' | 'week' | 'suggestions';
  onViewModeChange: (mode: 'calendar' | 'week' | 'suggestions') => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={viewMode === 'suggestions' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('suggestions')}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Smart Suggestions
      </Button>
      <Button
        variant={viewMode === 'week' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('week')}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Week View
      </Button>
      <Button
        variant={viewMode === 'calendar' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('calendar')}
        className="flex items-center gap-2"
      >
        <CalendarIcon className="h-4 w-4" />
        Calendar View
      </Button>
    </div>
  );
};

export default ViewModeSelector;
