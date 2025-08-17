#!/usr/bin/env tsx

/**
 * Manual script to cleanup expired invitations
 * Usage: npx tsx scripts/cleanup-invitations.ts [--dry-run] [--grace-period=30]
 */

import { cleanupInvitations, getInvitationStats } from '../lib/invitation-cleanup';

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const gracePeriodArg = args.find(arg => arg.startsWith('--grace-period='));
  const gracePeriod = gracePeriodArg ? parseInt(gracePeriodArg.split('=')[1] || '30') : 30;

  console.log('🧹 Invitation Cleanup Script');
  console.log('============================');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE CLEANUP'}`);
  console.log(`Grace Period: ${gracePeriod} days`);
  console.log('');

  try {
    // Get current stats
    console.log('📊 Current Invitation Statistics:');
    const stats = await getInvitationStats();
    console.log(`  Active: ${stats.active}`);
    console.log(`  Expired: ${stats.expired}`);
    console.log(`  Accepted: ${stats.accepted}`);
    console.log(`  Total: ${stats.total}`);
    console.log('');

    if (isDryRun) {
      console.log('🔍 Dry run - no changes will be made');
      console.log(`Would delete ${stats.expired} expired invitations`);
      return;
    }

    if (stats.expired === 0 && stats.accepted === 0) {
      console.log('✅ No cleanup needed - database is clean!');
      return;
    }

    // Perform cleanup
    console.log('🚀 Starting cleanup...');
    const cleanupResult = await cleanupInvitations(gracePeriod);
    
    console.log('✅ Cleanup completed!');
    console.log(`  Expired deleted: ${cleanupResult.expiredDeleted}`);
    console.log(`  Old accepted deleted: ${cleanupResult.acceptedDeleted}`);
    console.log(`  Total deleted: ${cleanupResult.totalDeleted}`);
    console.log('');

    // Get updated stats
    console.log('📊 Updated Statistics:');
    const newStats = await getInvitationStats();
    console.log(`  Active: ${newStats.active}`);
    console.log(`  Expired: ${newStats.expired}`);
    console.log(`  Accepted: ${newStats.accepted}`);
    console.log(`  Total: ${newStats.total}`);

  } catch (error) {
    console.error('❌ Cleanup failed:');
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
