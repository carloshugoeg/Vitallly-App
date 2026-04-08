/**
 * Registro de auditoría para trazabilidad de cambios en datos sensibles.
 * Cada entrada vincula usuario + tenant + entidad afectada, cumpliendo
 * requisitos de auditoría para clínicas de nutrición.
 */
import 'server-only';
import { prisma } from '@/server/lib/prisma';

/** Parámetros necesarios para crear una entrada de auditoría. */
interface AuditLogParams {
  tenantId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  /** Diff de campos modificados; se omite en CREATE/DELETE. */
  changes?: Record<string, { old: string | number | boolean | null; new: string | number | boolean | null }>;
  ipAddress?: string;
}

/**
 * Registra una entrada en el log de auditoría.
 * Se ejecuta en modo fire-and-forget para no bloquear la respuesta al cliente.
 */
export function logAudit(params: AuditLogParams): void {
  prisma.auditLog
    .create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes ?? undefined,
        ipAddress: params.ipAddress ?? '',
      },
    })
    .catch((error) => {
      console.error('Failed to write audit log:', error);
    });
}

/**
 * Extrae la IP del cliente desde los headers de la petición.
 * Toma el primer valor de x-forwarded-for (el más cercano al cliente real).
 */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
}
