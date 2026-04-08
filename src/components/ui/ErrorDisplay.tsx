'use client';

import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Por favor intente de nuevo.',
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 text-center max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Intentar de nuevo
        </Button>
      )}
    </div>
  );
}
