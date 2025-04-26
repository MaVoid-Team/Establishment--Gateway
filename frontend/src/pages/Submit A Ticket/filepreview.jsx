import { useState, useEffect } from 'react';
import { FileText, ImageIcon, Paperclip } from 'lucide-react';

export const FilePreview = ({ file }) => {
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    setFileType(file.type);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="mt-2 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        {fileType.startsWith('image/') ? (
          <ImageIcon className="h-5 w-5" />
        ) : fileType === 'application/pdf' ? (
          <FileText className="h-5 w-5" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
        <span className="text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">
          ({(file.size / 1024).toFixed(2)} KB)
        </span>
      </div>
      
      {fileType.startsWith('image/') && preview && (
        <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border bg-background">
          <img
            src={preview}
            alt="File preview"
            className="object-contain w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

