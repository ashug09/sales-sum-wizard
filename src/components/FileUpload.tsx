import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  title: string;
  description: string;
  onFileSelect: (file: File) => void;
  isUploaded: boolean;
  uploadedFileName?: string;
  variant: 'master' | 'transaction';
}

const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  onFileSelect,
  isUploaded,
  uploadedFileName,
  variant
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.endsWith('.csv')) {
        onFileSelect(file);
      } else {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV file.');
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-card",
      variant === 'master' ? 'border-primary/50' : 'border-success/50',
      isUploaded && "bg-gradient-to-br from-success-light to-background border-success"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            variant === 'master' ? 'bg-primary/10' : 'bg-success/10'
          )}>
            {isUploaded ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <FileSpreadsheet className={cn(
                "w-6 h-6",
                variant === 'master' ? 'text-primary' : 'text-success'
              )} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>

        {isUploaded && uploadedFileName ? (
          <div className="flex items-center justify-between p-3 bg-success-light rounded-lg border border-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="font-medium text-success-foreground">{uploadedFileName}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClick}
              className="hover:bg-success/10"
            >
              Replace File
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleClick} 
            className={cn(
              "w-full gap-2 transition-smooth",
              variant === 'master' ? 'bg-gradient-primary hover:opacity-90' : 'bg-gradient-success hover:opacity-90'
            )}
          >
            <Upload className="w-4 h-4" />
            Upload {variant === 'master' ? 'Master' : 'Transaction'} Sheet
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Supported formats: .xlsx, .xls, .csv
        </p>
      </CardContent>
    </Card>
  );
};

export default FileUpload;