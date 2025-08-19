import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, projects, user, members } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq, and, count, isNull } from 'drizzle-orm';
import { ResendEmailService } from '@/lib/email/resend-service';
import { generateExistingUserInvitationEmail } from '@/lib/email/templates/project-invitation-existing-user';
import { generateNewUserInvitationEmail } from '@/lib/email/templates/project-invitation-new-user';
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
    
    // Check if active invitation already exists
    const existingInvitation = await db.select().from(invitations)
        .where(and(
          eq(invitations.email, email),
          eq(invitations.projectId, projectId),
          isNull(invitations.acceptedAt)
        )).limit(1);

      if (existingInvitation.length) {
        return NextResponse.json(
          { error: 'Invitation already sent to this email' },
          { status: 409 }
        );
      }

    // Get project details for email
    const projectQuery = await db.select({
      project: projects,
      leaderName: user.name
    }).from(projects)
      .innerJoin(user, eq(projects.leaderId, user.id))
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!projectQuery.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const { project, leaderName } = projectQuery[0]!;

    // Get inviter details
    const inviterQuery = await db.select({ name: user.name })
      .from(user)
      .where(eq(user.id, inviterId))
      .limit(1);

    const inviterName = inviterQuery[0]?.name || 'A team member';

    // Get member count
    const memberCountResult = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.projectId, projectId));

    const memberCount = memberCountResult[0]?.count || 0;

    // Create invitation token and record with dynamic expiration
    const invitationToken = createId();
    const expiresAt = getExpirationTime(context);
    const newInvitation = await db.insert(invitations).values({
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

    // We no longer check if user exists - we rely on the context parameter
    const userExists = (context === 'existing_user');

    // Generate URLs based on user existence
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      process.env.BETTER_AUTH_URL || 
      process.env.PRODUCTION_URL ? `https://${process.env.PRODUCTION_URL}` : 
      'http://localhost:3000';

    let emailHtml: string;
    let emailSubject: string;

    if (userExists) {
      // Existing user - send them to dashboard to check inbox
      const dashboardUrl = `${baseUrl}/dashboard`;
      
      emailHtml = generateExistingUserInvitationEmail({
        inviterName,
        projectName: project.name,
        ...(project.description && { projectDescription: project.description }),
        leaderName,
        memberCount: memberCount + 1, // +1 for the leader
        ...(project.deadline && { projectDeadline: project.deadline }),
        dashboardUrl,
        expiresAt
      });
      
      emailSubject = `📧 New project invitation: "${project.name}" - Check your dashboard`;
    } else {
      // New user - send them to signup page
      const signupUrl = `${baseUrl}/signup`;
      
      emailHtml = generateNewUserInvitationEmail({
        inviterName,
        projectName: project.name,
        ...(project.description && { projectDescription: project.description }),
        leaderName,
        memberCount: memberCount + 1, // +1 for the leader
        ...(project.deadline && { projectDeadline: project.deadline }),
        signupUrl,
        expiresAt
      });
      
      emailSubject = `🎉 You're invited to join "${project.name}" on Collavo!`;
    }

    await ResendEmailService.sendEmail({
      to: [email],
      subject: emailSubject,
      html: emailHtml
    });
    return NextResponse.json({
      message: `Invitation sent to ${email}`,
      invitationId: newInvitation[0]!.id,
      expiresAt,
      expiresInHours: context === 'new_user' ? 48 : 24
    }, { status: 201 });

  } catch {
    // Silently handle invitation errors
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

