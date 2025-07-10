import React from "react";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

interface SmartSuggestion {
  date: Date;
  time: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  discount?: number;
}

interface SmartSuggestionsViewProps {
  suggestions: SmartSuggestion[];
  onSuggestionSelect: (suggestion: SmartSuggestion) => void;
}

const SmartSuggestionsView: React.FC<SmartSuggestionsViewProps> = ({
  suggestions,
  onSuggestionSelect
}) => {
  return (
    <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Sparkles className="h-5 w-5" />
          AI-Recommended Times
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Optimized suggestions based on availability and your preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 4).map((suggestion, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md",
              "bg-white dark:bg-gray-800/50",
              suggestion.priority === 'high' ? "border-green-200 dark:border-green-800 hover:border-green-300" :
              suggestion.priority === 'medium' ? "border-blue-200 dark:border-blue-800 hover:border-blue-300" :
              "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            )}
            onClick={() => onSuggestionSelect(suggestion)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {format(suggestion.date, 'EEEE, MMM d')} at {suggestion.time}
                </h4>
                {suggestion.priority === 'high' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                {suggestion.discount && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    {suggestion.discount}% off
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suggestion.reason}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartSuggestionsView;
