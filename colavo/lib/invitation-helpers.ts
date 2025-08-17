import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, projects, user } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';
import { ResendEmailService } from '@/lib/email/resend-service';
import { generateProjectInvitationEmail } from '@/lib/email/templates/project-invitation';
import { autoCleanupExpiredInvitations } from './invitation-cleanup';

// Dynamic expiration based on context
function getExpirationTime(context: 'new_user' | 'existing_user' | 'resend' = 'new_user'): Date {
  const hours = {
    new_user: 48,      // 2 days for new users
    existing_user: 24, // 1 day for existing users  
    resend: 24         // 1 day for resent invitations
  };
  
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours[context]);
  return expiry;
}

// Helper function to handle email invitations for non-existing users
export async function handleEmailInvitation(
  email: string, 
  projectId: string, 
  inviterId: string,
  context: 'new_user' | 'existing_user' | 'resend' = 'new_user'
): Promise<NextResponse> {
  try {
    // Auto-cleanup expired invitations first
    await autoCleanupExpiredInvitations();

    return await db.transaction(async (tx) => {
      // Check if active invitation already exists
      const existingInvitation = await tx.select().from(invitations)
        .where(and(
          eq(invitations.email, email),
          eq(invitations.projectId, projectId),
          eq(invitations.acceptedAt, null as any)
        )).limit(1);

      if (existingInvitation.length) {
        return NextResponse.json(
          { error: 'Invitation already sent to this email' },
          { status: 409 }
        );
      }

      // Get project details for email
      const projectDetails = await tx.select({
        name: projects.name,
        inviterName: user.name
      }).from(projects)
        .innerJoin(user, eq(user.id, inviterId))
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!projectDetails.length) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const { name: projectName, inviterName } = projectDetails[0];

      // Create invitation token and record with dynamic expiration
      const invitationToken = createId();
      const expiresAt = getExpirationTime(context);

      const newInvitation = await tx.insert(invitations).values({
        id: createId(),
        email,
        projectId,
        invitedBy: inviterId,
        token: invitationToken,
        expiresAt,
        createdAt: new Date()
      }).returning();

      if (!newInvitation.length) {
        return NextResponse.json(
          { error: 'Failed to create invitation' },
          { status: 500 }
        );
      }

      // Generate invitation URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        process.env.BETTER_AUTH_URL || 
        process.env.PRODUCTION_URL ? `https://${process.env.PRODUCTION_URL}` : 
        'http://localhost:3000';
      const acceptUrl = `${baseUrl}/accept-invitation?token=${invitationToken}`;

      // Send invitation email
      const emailHtml = generateProjectInvitationEmail({
        inviterName: inviterName || 'A team member',
        projectName,
        acceptUrl,
        expiresAt
      });

      await ResendEmailService.sendEmail({
        to: [email],
        subject: `You're invited to join "${projectName}" on Collavo`,
        html: emailHtml
      });

      return NextResponse.json({
        message: `Invitation sent to ${email}`,
        invitationId: newInvitation[0].id,
        expiresAt,
        expiresInHours: context === 'new_user' ? 48 : 24
      }, { status: 201 });
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

