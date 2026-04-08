'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ocurrió un error inesperado. Por favor intente de nuevo.
        </p>
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>
    </div>
  );
}
