'use client';

import { HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserManualButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/manual')}
      title="Manual de usuario"
      aria-label="Abrir manual de usuario"
      className="
        fixed bottom-6 right-6 z-50
        w-10 h-10
        bg-primary hover:bg-primary-light
        text-white
        rounded-full
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-200
        hover:scale-105
      "
    >
      <HelpCircle size={20} />
    </button>
  );
}
