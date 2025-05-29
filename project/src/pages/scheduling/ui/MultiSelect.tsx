import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/components/ui/popover';
import { Button } from '../../../components/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/components/ui/command';
import { Badge } from '../../../components/components/ui/badge';
import { ScrollArea } from '../../../components/components/ui/scroll-area';
import { cn } from '../../../lib/utils';
import { Employee } from '../types';

const MultiSelect = ({
  options,
  selected,
  onChange,
}: {
  options: Employee[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-left">
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
              <Badge variant="secondary" className="rounded-sm font-normal">
                {selected.length} employee{selected.length > 1 ? 's' : ''} selected
              </Badge>
            </div>
          ) : (
            'Select employees...'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>No employee found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-60">
                {options.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={employee.name}
                    onSelect={() => {
                      const newSelected = selected.includes(employee.name)
                        ? selected.filter((name) => name !== employee.name)
                        : [...selected, employee.name];
                      onChange(newSelected);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        selected.includes(employee.name)
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span>{employee.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({employee.role})</span>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect; 