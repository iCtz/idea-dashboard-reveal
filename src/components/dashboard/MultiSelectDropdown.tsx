import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectDropdownProps {
  // Use a more generic type that matches the hook's output
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className = "",
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionKey: string) => {
    const newValue = value.includes(optionKey)
      ? value.filter(v => v !== optionKey)
      : [...value, optionKey];
    onChange(newValue);
  };

  const removeOption = (optionKey: string) => {
    onChange(value.filter(v => v !== optionKey));
  };

  const getOptionLabel = (optionKey: string) => {
    const option = options.find(opt => opt.value === optionKey);
    if (!option) return optionKey;
    return option.label;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        className={`w-full justify-between ${disabled ? 'opacity-50' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.slice(0, 2).map((optionKey) => (
              <Badge key={optionKey} variant="secondary" className="text-xs"
                onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
              >
                {getOptionLabel(optionKey)}
                <button
                  type="button"
                  onClick={(e) => {
                    removeOption(optionKey);
                  }}
                  className="ml-1 p-0.5 hover:bg-destructive/20 rounded-full"
                  aria-label={`Remove ${getOptionLabel(optionKey)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
          {value.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 2} more
            </Badge>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div role="listbox" className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
            key={option.value}
              type="button"
              role="option"
              aria-selected={value.includes(option.value)}
              className={`
                w-full px-3 py-2 text-left hover:bg-accent transition-colors
                ${value.includes(option.value) ? 'bg-accent' : ''}
              `}
              onClick={() => toggleOption(option.value)}
            >
              <div className="flex items-center space-x-2">
                <div className={`
                  w-4 h-4 border rounded flex items-center justify-center
                  ${value.includes(option.value) ? 'bg-primary border-primary' : 'border-border'}
                `}>
                  {value.includes(option.value) && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
                  )}
                </div>
                <span className="text-sm">
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
