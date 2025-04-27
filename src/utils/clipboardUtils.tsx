import * as React from "react";
import { FileText, Image, Link, File } from "lucide-react";

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <FileText className="h-3.5 w-3.5 text-blue-500" />;
    case 'image':
      return <Image className="h-3.5 w-3.5 text-purple-500" />;
    case 'link':
      return <Link className="h-3.5 w-3.5 text-green-500" />;
    default:
      return <File className="h-3.5 w-3.5 text-gray-500" />;
  }
};