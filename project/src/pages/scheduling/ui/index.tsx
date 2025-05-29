import { ReactNode, forwardRef, ElementRef, ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/utils";
import OriginalButton from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

// Custom Button with extended variants
interface ExtendedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ExtendedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  // Use the original Button component but handle 'ghost' variant and 'icon' size
  const safeVariant = variant === 'ghost' ? 'outline' : variant;
  const safeSize = size === 'icon' ? 'sm' : size;
  
  // Add appropriate classes for ghost variant and icon size
  let extraClasses = '';
  if (variant === 'ghost') {
    extraClasses += ' bg-transparent hover:bg-gray-100 text-gray-700 border-none shadow-none ';
  }
  
  if (size === 'icon') {
    extraClasses += ' p-2 aspect-square ';
  }
  
  return (
    <OriginalButton
      variant={safeVariant as any}
      size={safeSize as any}
      className={`${extraClasses} ${className}`}
      {...props}
    >
      {children}
    </OriginalButton>
  );
};

// Re-export existing components
export { Button, Card };

// Label component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    >
      {children}
    </label>
  );
}

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

// Dialog components
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ children, ...props }: DialogProps) {
  return <div className="relative">{children}</div>;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="z-50 grid w-full max-w-lg gap-4 bg-white p-6 shadow-lg sm:rounded-lg">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>{children}</div>;
}

// CardContent component
export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

// Select components
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  defaultValue?: string;
}

export function Select({ children, ...props }: SelectProps) {
  return <div className="relative">{children}</div>;
}

export function SelectTrigger({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: ReactNode }) {
  return <span className="truncate">{children || placeholder}</span>;
}

export function SelectContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("absolute mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg z-50", className)}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <div className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100">
      {children}
    </div>
  );
}

// Switch component
interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600" : "bg-gray-200",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// Popover components
interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  return <div className="relative">{children}</div>;
}

interface PopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function PopoverTrigger({ children, asChild }: PopoverTriggerProps) {
  return <>{children}</>;
}

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  align?: string;
  side?: string;
}

export function PopoverContent({ children, className, align, side }: PopoverContentProps) {
  return (
    <div className={cn("absolute z-50 w-72 rounded-md border border-gray-200 bg-white p-4 shadow-md outline-none", className)}>
      {children}
    </div>
  );
}

// Calendar component
export function Calendar({ 
  mode = "single", 
  selected, 
  onSelect, 
  disabled, 
  initialFocus 
}: { 
  mode?: "single"; 
  selected?: Date; 
  onSelect?: (date: Date | null) => void; 
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}) {
  // Just a placeholder component - actual calendar implementation would be more complex
  return (
    <div className="p-3">
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              className={cn(
                "h-9 w-9 rounded-md text-center text-sm p-0 font-normal",
                "hover:bg-gray-100 focus:bg-gray-100"
              )}
              onClick={() => onSelect?.(new Date(2023, 0, day))}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Command components
export function Command({ children }: { children: ReactNode }) {
  return <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white">{children}</div>;
}

export function CommandInput({ placeholder }: { placeholder?: string }) {
  return (
    <div className="flex items-center border-b px-3">
      <input
        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
      />
    </div>
  );
}

export function CommandList({ children }: { children: ReactNode }) {
  return <div className="max-h-[300px] overflow-y-auto">{children}</div>;
}

export function CommandEmpty({ children }: { children: ReactNode }) {
  return <div className="py-6 text-center text-sm">{children}</div>;
}

export function CommandGroup({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden p-1 text-gray-950">{children}</div>;
}

export function CommandItem({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) {
  return (
    <div
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100"
      onClick={onSelect}
    >
      {children}
    </div>
  );
}

// Badge component
export function Badge({ 
  children, 
  variant = "default", 
  className 
}: { 
  children: ReactNode; 
  variant?: "default" | "secondary" | "outline" | "destructive"; 
  className?: string;
}) {
  const variantStyles = {
    default: "bg-blue-100 text-blue-800 hover:bg-blue-200/80",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200/80",
    outline: "border border-gray-200 bg-transparent hover:bg-gray-100",
    destructive: "bg-red-100 text-red-800 hover:bg-red-200/80"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

// ScrollArea component
export function ScrollArea({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative overflow-auto", className)}>{children}</div>;
}

// Tooltip components
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}

export function TooltipTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TooltipContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "z-50 overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-950 shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

// Checkbox component
export function Checkbox({
  checked,
  onCheckedChange,
  className,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600 text-white" : "bg-white",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-white"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// Collapsible components
export function Collapsible({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

export function CollapsibleTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function CollapsibleContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden", className)}>{children}</div>;
} 