import { db } from '@/db';
import { invitations, projects, user } from '@/db/schema';
import { lt, gt, and, eq } from 'drizzle-orm';

export interface CleanupStats {
  expiredDeleted: number;
  acceptedDeleted: number;
  totalDeleted: number;
}

/**
 * Auto-cleanup expired invitations - runs during normal operations
 * This is called automatically whenever we query invitations
 */
export async function autoCleanupExpiredInvitations(): Promise<number> {
  try {
    const now = new Date();
    
    const result = await db.delete(invitations)
      .where(and(
        lt(invitations.expiresAt, now),
        eq(invitations.acceptedAt, null as any)
      ))
      .returning({ id: invitations.id });
    
    return result.length;
  } catch (error) {
    // Silent fail - don't break the main operation if cleanup fails
    return 0;
  }
}

/**
 * Get pending invitations for a user by email
 * Automatically cleans up expired invitations first
 */
export async function getPendingInvitations(email: string) {
  // Auto-cleanup first
  await autoCleanupExpiredInvitations();
  
  return await db.select({
    id: invitations.id,
    token: invitations.token,
    projectId: invitations.projectId,
    projectName: projects.name,
    inviterName: user.name,
    expiresAt: invitations.expiresAt,
    createdAt: invitations.createdAt
  })
  .from(invitations)
  .innerJoin(projects, eq(invitations.projectId, projects.id))
  .innerJoin(user, eq(invitations.invitedBy, user.id))
  .where(and(
    eq(invitations.email, email),
    eq(invitations.acceptedAt, null as any)
  ))
  .orderBy(invitations.createdAt);
}

/**
 * Clean up expired and old accepted invitations
 * @param gracePeriodDays - Days to keep accepted invitations for audit trail (default: 30)
 * @returns Cleanup statistics
 */
export async function cleanupInvitations(gracePeriodDays: number = 30): Promise<CleanupStats> {
  return await db.transaction(async (tx) => {
    const now = new Date();
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    // Delete expired invitations
    const expiredResult = await tx.delete(invitations)
      .where(and(
        lt(invitations.expiresAt, now),
        eq(invitations.acceptedAt, null as any)
      ))
      .returning({ id: invitations.id });

    // Delete old accepted invitations (audit trail cleanup)  
    const acceptedResult = await tx.delete(invitations)
      .where(and(
        lt(invitations.acceptedAt, gracePeriodDate)
        // Only delete accepted invitations older than grace period
      ))
      .returning({ id: invitations.id });

    const expiredDeleted = expiredResult.length;
    const acceptedDeleted = acceptedResult.length;

    return {
      expiredDeleted,
      acceptedDeleted,
      totalDeleted: expiredDeleted + acceptedDeleted
    };
  });
}

/**
 * Get invitation statistics for monitoring
 */
export async function getInvitationStats() {
  return await db.transaction(async (tx) => {
    const now = new Date();
    
    // Count active invitations  
    const activeInvitations = await tx.select({ count: invitations.id })
      .from(invitations)
      .where(and(
        eq(invitations.acceptedAt, null as any),
        gt(invitations.expiresAt, now)
      ));

    // Count expired invitations
    const expiredInvitations = await tx.select({ count: invitations.id })
      .from(invitations)
      .where(and(
        eq(invitations.acceptedAt, null as any),
        lt(invitations.expiresAt, now)
      ));

    // Count accepted invitations
    const acceptedInvitations = await tx.select({ count: invitations.id })
      .from(invitations)
      .where(
        // acceptedAt is not null - using workaround
        gt(invitations.acceptedAt, new Date(0))
      );

    return {
      active: activeInvitations.length,
      expired: expiredInvitations.length,
      accepted: acceptedInvitations.length,
      total: activeInvitations.length + expiredInvitations.length + acceptedInvitations.length
    };
  });
}

/**
 * Clean up invitations for a specific project
 * @param projectId - Project ID to clean up invitations for
 */
export async function cleanupProjectInvitations(projectId: string): Promise<CleanupStats> {
  return await db.transaction(async (tx) => {
    const now = new Date();
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - 30);

    // Delete expired invitations for this project
    const expiredResult = await tx.delete(invitations)
      .where(and(
        eq(invitations.projectId, projectId),
        lt(invitations.expiresAt, now),
        eq(invitations.acceptedAt, null as any)
      ))
      .returning({ id: invitations.id });

    // Delete old accepted invitations for this project
    const acceptedResult = await tx.delete(invitations)
      .where(and(
        eq(invitations.projectId, projectId),
        lt(invitations.acceptedAt, gracePeriodDate)
      ))
      .returning({ id: invitations.id });

    const expiredDeleted = expiredResult.length;
    const acceptedDeleted = acceptedResult.length;

    return {
      expiredDeleted,
      acceptedDeleted,
      totalDeleted: expiredDeleted + acceptedDeleted
    };
  });
}
