'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { APPOINTMENT_STATUS } from '@/lib/constants';

type AppointmentNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
};

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [audioReady, setAudioReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notifiedAppointmentsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const { patients } = usePatients({
    search: debouncedQuery,
    pageSize: 6,
  });
  const { appointments } = useAppointments({ pageSize: 500, estado: 'programada' });

  useEffect(() => {
    setIsOpen(debouncedQuery.trim().length > 0);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('vitallly-notified-appointments');
    if (saved) {
      notifiedAppointmentsRef.current = new Set(JSON.parse(saved) as string[]);
    }
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      const AudioContextConstructor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!AudioContextConstructor) return;
      audioContextRef.current ??= new AudioContextConstructor();
      audioContextRef.current.resume();
      setAudioReady(true);
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const playAppointmentSound = () => {
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.36);
  };

  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      appointments.forEach((appointment) => {
        if (appointment.fecha !== today || appointment.hora !== currentTime || appointment.estado !== 'programada') return;
        if (notifiedAppointmentsRef.current.has(appointment.id)) return;

        notifiedAppointmentsRef.current.add(appointment.id);
        localStorage.setItem('vitallly-notified-appointments', JSON.stringify([...notifiedAppointmentsRef.current]));

        const patientName = appointment.patient ? `${appointment.patient.nombre} ${appointment.patient.apellido}` : 'Paciente';
        const title = `Cita ahora: ${patientName}`;
        const body = `${appointment.hora} - ${appointment.motivo || APPOINTMENT_STATUS[appointment.estado].label}`;
        const href = `/consultas/nueva?${new URLSearchParams({
          pacienteId: appointment.pacienteId,
          motivo: appointment.motivo ?? '',
          appointmentId: appointment.id,
        }).toString()}`;

        setNotifications((current) => [{ id: appointment.id, title, body, href }, ...current].slice(0, 8));
        setNotificationsOpen(true);
        playAppointmentSound();

        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, { body });
          notification.onclick = () => {
            window.focus();
            router.push(href);
          };
        }
      });
    };

    checkAppointments();
    const interval = window.setInterval(checkAppointments, 30000);
    return () => window.clearInterval(interval);
  }, [appointments, router]);

  const handleNotificationsClick = async () => {
    setNotificationsOpen((current) => !current);

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (!audioReady) {
      const AudioContextConstructor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextConstructor) {
        audioContextRef.current ??= new AudioContextConstructor();
        await audioContextRef.current.resume();
        setAudioReady(true);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pacientes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleSelectPatient = (id: string) => {
    router.push(`/pacientes/${id}`);
    setSearchQuery('');
    setIsOpen(false);
  };

  const userName = session?.user
    ? `${session.user.nombre} ${session.user.apellido}`
    : '';

  const userRole =
    session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'
      ? 'Administradora'
      : 'Nutricionista';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors mr-2 shrink-0"
        aria-label="Abrir menú"
      >
        <Menu size={22} className="text-gray-600" />
      </button>
      <div ref={containerRef} className="relative flex-1 max-w-xs sm:max-w-xl">
        <form onSubmit={handleSearch}>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Buscar pacientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (debouncedQuery.trim().length > 0) setIsOpen(true);
            }}
            className="w-full rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </form>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            {patients.length > 0 ? (
              <>
                <ul>
                  {patients.map((patient) => (
                    <li key={patient.id}>
                      <button
                        onMouseDown={() => handleSelectPatient(patient.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient.nombre} {patient.apellido}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{patient.telefono}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onMouseDown={handleSearch as unknown as React.MouseEventHandler}
                  className="w-full px-4 py-2.5 text-xs text-primary font-medium hover:bg-primary-50 border-t border-gray-50 transition-colors text-center"
                >
                  Ver todos los resultados para &quot;{searchQuery}&quot;
                </button>
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                Sin resultados para &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={handleNotificationsClick}
            className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
            title="Notificaciones"
          >
            <Bell size={20} className={notifications.length > 0 ? 'text-primary' : 'text-gray-500'} />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
                <button type="button" onClick={() => setNotifications([])} className="text-xs font-medium text-gray-400 hover:text-primary">
                  Limpiar
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-5 text-sm text-gray-400">
                  Sin notificaciones por ahora.
                  {!audioReady && <p className="mt-1 text-xs">Haz clic en la campana para activar el sonido.</p>}
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(notification.href);
                          setNotificationsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{notification.body}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
