import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const existingUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, email.toLowerCase()),
    });

    // We don't want to reveal if a user exists or not for security reasons
    // So we always return success even if the user doesn't exist
    if (!existingUser) {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    // Generate a unique token
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete any existing verification tokens for this user
    await db.delete(verification).where(
      eq(verification.identifier, existingUser.email)
    );

    // Store the token in the database
    await db.insert(verification).values({
      id: nanoid(),
      identifier: existingUser.email,
      value: token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // In a real application, send an email with a link to reset password
    // For this example, we'll just log it
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    console.log(`Password reset link: ${resetUrl}`);

    // Send email with reset link (in a real application)
    // await sendMail({
    //   to: email,
    //   subject: 'Reset your password',
    //   text: `Use this link to reset your password: ${resetUrl}`,
    //   html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    // });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 