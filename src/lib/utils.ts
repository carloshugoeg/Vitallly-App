import { format, differenceInYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(dateStr: string, fmt: string = 'dd MMM yyyy'): string {
  return format(parseISO(dateStr), fmt, { locale: es });
}

export function formatDateLong(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function calculateAge(fechaNacimiento: string): number {
  return differenceInYears(new Date(), parseISO(fechaNacimiento));
}

export function getInitials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
