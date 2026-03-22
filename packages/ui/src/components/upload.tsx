import * as React from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
} from "react-dropzone";
import Button from "./button";
import { Icon } from './icon';

interface UploadProps extends Omit<DropzoneOptions, "onDrop"> {
  label?: string;
  value?: File[];
  onValueChange?: (files: File[]) => void;
  className?: string;
  maxSizeInMB?: number;
  showList?: boolean;
  error?: string;
  hint?: string;
  required?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      label,
      value = [],
      onValueChange,
      className = "",
      maxSizeInMB = 5,
      showList = true,
      maxSize = maxSizeInMB * 1024 * 1024,
      accept,
      multiple = false,
      error,
      hint,
      required,
      ...props
    },
    ref
  ) => {
    const onDrop = React.useCallback(
      (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
          console.warn("Files rejected:", fileRejections);
        }

        const newFiles = multiple
          ? [...value, ...acceptedFiles]
          : acceptedFiles;
        onValueChange?.(newFiles);
      },
      [multiple, onValueChange, value]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      maxSize,
      accept,
      multiple,
      ...props,
    });

    const removeFile = (indexToRemove: number) => {
      const newFiles = value.filter((_: File, index: number) => index !== indexToRemove);
      onValueChange?.(newFiles);
    };

    const acceptString = accept
      ? Object.values(accept)
          .flat()
          .map((ext: string) => ext.replace(".", "").toUpperCase())
          .join(", ")
      : "";

    return (
      <div ref={ref} className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <span className="text-gray-100 font-medium text-sm">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            flex flex-col items-center justify-center gap-2
            ${isDragActive 
              ? "border-orange-500 bg-orange-500/5" 
              : error 
                ? "border-red-400 bg-red-400/5 hover:border-red-500" 
                : "border-gray-400 hover:border-orange-500 hover:bg-gray-50/5"}
          `.trim()}
        >
          <input {...getInputProps()} />
          <Icon type="cloud_upload" className={`text-[48px] transition-colors ${isDragActive || !error ? "text-orange-500" : "text-red-400"}`} />
          <div className="text-gray-100">
            <span className="font-semibold text-orange-500 text-lg">Select File</span>
            <span className="mx-1 text-gray-200">or Drag and Drop</span>
          </div>
          <div className="text-gray-100 text-sm">
            Max. {maxSizeInMB} MB
          </div>
        </div>
        
        {acceptString && (
          <div className="text-gray-100 text-xs mt-1 font-medium">
            Supported: {acceptString}
          </div>
        )}

        {(hint || error) && (
            <div className="flex flex-col gap-0.5 mt-0.5">
                {error && <span className="text-red-400 text-xs">{error}</span>}
                {hint && <span className="text-gray-100 text-xs">{hint}</span>}
            </div>
        )}

        {showList && value.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {value.map((file: File, index: number) => (
              <div
                key={`${file.name}-${index}`}
                className="bg-white/5 border border-gray-400/30 flex items-center justify-between rounded-xl p-3 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-orange-500/10 text-orange-500 flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon type="description" className="text-[20px]" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-gray-100">
                      {file.name}
                    </span>
                    <span className="text-gray-100 text-xs">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  icon={{ left: <Icon type="delete" className="text-gray-100 hover:text-red-200" /> }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Upload.displayName = "Upload";

export { Upload };
