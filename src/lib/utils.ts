/**
 * Utilidades generales: formateo de fechas, cálculo de edad y helpers de UI.
 * Todas las fechas se formatean con locale español (es) para consistencia en la app.
 */

import { format, differenceInYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/** Formatea una fecha ISO a formato corto. Ej: "15 ene 2024" */
export function formatDate(dateStr: string, fmt: string = 'dd MMM yyyy'): string {
  return format(parseISO(dateStr), fmt, { locale: es });
}

/** Formatea una fecha ISO a formato largo. Ej: "15 de enero de 2024" */
export function formatDateLong(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es });
}

/** Calcula la edad en años completos a partir de la fecha de nacimiento ISO */
export function calculateAge(fechaNacimiento: string): number {
  return differenceInYears(new Date(), parseISO(fechaNacimiento));
}

/** Obtiene las iniciales de nombre y apellido para avatares */
export function getInitials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

/** Combina clases CSS condicionalmente, filtrando valores falsy */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
