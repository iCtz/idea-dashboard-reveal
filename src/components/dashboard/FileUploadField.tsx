import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface FileUploadFieldProps {
  label: string;
  fileType: 'feasibility' | 'pricing_offer' | 'prototype';
  accept?: string;
  multiple?: boolean;
  value: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
  placeholder?: string;
}

export const FileUploadField = ({
  label,
  fileType,
  accept = "*/*",
  multiple = false,
  value,
  onChange,
  disabled = false,
  maxSizeMB = 10,
  className = "",
  placeholder
}: FileUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const { t, isRTL } = useLanguage();

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { isValid: false, error: `${file.name} exceeds ${maxSizeMB}MB limit` };
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const fileMimeType = file.type.toLowerCase();

    const isTypeAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) { // It's a file extension
        return fileExtension === type;
      }
      if (type.endsWith('/*')) { // It's a wildcard MIME type
        return fileMimeType.startsWith(type.slice(0, -1));
      }
      return fileMimeType === type; // It's a specific MIME type
    });

    if (!isTypeAccepted) {
      return { isValid: false, error: `${file.name}: Invalid file type. Accepted: ${accept}` };
    }

    return { isValid: true };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const { isValid, error } = validateFile(file);
      if (isValid) {
        validFiles.push(file);
      } else {
        toast({ title: "File Error", description: error, variant: "destructive" });
      }
    }

    if (multiple) {
      onChange([...value, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className={`text-sm font-medium ${isRTL ? 'text-right block' : 'text-left'}`}>{label}</Label>

      <div
        className={`
          border-2 border-dashed rounded-lg p-4 transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {placeholder || t('idea_form', 'upload_files')}
          </p>
          <Badge variant="secondary" className="mt-2 text-xs font-normal">
            {multiple
              ? t('idea_form', 'multiple_files_allowed')
              : t('idea_form', 'single_file_only')
            } • Max {maxSizeMB}MB
          </Badge>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                role="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
