import React from "react";

import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: LucideIcon | (() => JSX.Element);
  description: string;
  brands?: string[];
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, isSelected }) => {
  return (
    <div className={cn(
      "flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all",
      isSelected 
        ? "border-medical-primary dark:border-medical-accent bg-medical-primary/5 dark:bg-medical-accent/5 shadow-sm"
        : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
    )}>
      <RadioGroupItem value={method.id} id={method.id} />
      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-3">
          {typeof method.icon === 'function' 
            ? <method.icon />
            : React.createElement(method.icon, { className: "h-5 w-5" })}
          <div>
            <div className="font-medium dark:text-medical-dark-text-primary">{method.name}</div>
            <div className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary">
              {method.description}
            </div>
          </div>
        </div>
      </Label>
      {method.brands && (
        <div className="flex gap-2">
          {method.brands.map(brand => (
            <div key={brand} className="w-8 h-5 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] text-gray-500">
              {brand.toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;
