import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projects, members, mainTasks, subTasks, user, events } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireProjectAccess } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    
    // Ensure user has access to this project
    await requireProjectAccess(session.user.id, projectId);
    
    // Batch all overview data in parallel
    const [projectData, tasksData, membersData, eventsData] = await Promise.all([
      getProjectData(projectId, session.user.id),
      getProjectTasks(projectId),
      getProjectMembers(projectId),
      getProjectEvents(projectId),
    ]);

    return NextResponse.json({
      project: projectData,
      tasks: tasksData,
      members: membersData,
      events: eventsData,
      stats: {
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter((t: any) => t.status === 'completed').length,
        totalMembers: membersData.length,
        totalEvents: eventsData.length,
        recentActivity: getRecentActivity(tasksData, membersData),
      }
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

// Optimized database queries
async function getProjectData(projectId: string, userId: string) {
  // Get project with leader info and all members
  const projectWithMembers = await db
    .select({
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        deadline: projects.deadline,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        leaderId: projects.leaderId,
      },
      leader: {
        name: user.name,
        email: user.email,
      },
    })
    .from(projects)
    .innerJoin(user, eq(user.id, projects.leaderId))
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!projectWithMembers.length) return null;

  const result = projectWithMembers[0];
  if (!result) return null;
  
  const { project, leader } = result;
  
  // Check if user is leader
  const isLeader = project.leaderId === userId;
  
  // Get user permissions if not leader
  let userPermissions: string[] = [];
  let userRole: 'leader' | 'member' | null = null;
  
  if (isLeader) {
    userPermissions = ['createTask', 'handleTask', 'updateTask', 'handleEvent', 'handleFile', 'addMember', 'createEvent', 'viewFiles'];
    userRole = 'leader';
  } else {
    // Get member permissions
    const memberRecord = await db
      .select({
        id: members.id,
        role: members.role,
      })
      .from(members)
      .where(and(eq(members.userId, userId), eq(members.projectId, projectId)))
      .limit(1);
    
    if (memberRecord.length > 0 && memberRecord[0]) {
      userRole = 'member';
      
      // Get member permissions
      const { permissions } = await import('@/db/schema');
      const memberPermissions = await db
        .select({
          permission: permissions.permission,
          granted: permissions.granted
        })
        .from(permissions)
        .where(eq(permissions.memberId, memberRecord[0].id));
      
      userPermissions = memberPermissions
        .filter(p => p.granted)
        .map(p => p.permission);
    }
  }
  
  // Get all members with their data
  const allMembers = await getProjectMembers(projectId);
  
  // Transform to match expected format
  return {
    ...project,
    leaderName: leader.name,
    leaderEmail: leader.email,
    members: allMembers,
    userPermissions,
    isLeader,
    userRole,
    currentUserId: userId,
  };
}

async function getProjectTasks(projectId: string) {
  // Get main tasks with creator details
  const mainTasksData = await db
    .select({
      id: mainTasks.id,
      title: mainTasks.title,
      description: mainTasks.description,
      importanceLevel: mainTasks.importanceLevel,
      deadline: mainTasks.deadline,
      createdBy: mainTasks.createdBy,
      createdAt: mainTasks.createdAt,
      updatedAt: mainTasks.updatedAt,
      creatorName: user.name,
      creatorEmail: user.email,
    })
    .from(mainTasks)
    .innerJoin(user, eq(user.id, mainTasks.createdBy))
    .where(eq(mainTasks.projectId, projectId))
    .orderBy(desc(mainTasks.createdAt));

  // Get subtasks for each main task
  const tasksWithSubTasks = await Promise.all(
    mainTasksData.map(async (task) => {
      const taskSubTasks = await db
        .select({
          id: subTasks.id,
          title: subTasks.title,
          description: subTasks.description,
          status: subTasks.status,
          note: subTasks.note,
          deadline: subTasks.deadline,
          assignedId: subTasks.assignedId,
          createdBy: subTasks.createdBy,
          createdAt: subTasks.createdAt,
          updatedAt: subTasks.updatedAt,
          assignedUserName: user.name,
          assignedUserEmail: user.email,
        })
        .from(subTasks)
        .leftJoin(user, eq(user.id, subTasks.assignedId))
        .where(eq(subTasks.mainTaskId, task.id))
        .orderBy(subTasks.createdAt);

      return {
        ...task,
        subTasks: taskSubTasks
      };
    })
  );

  return tasksWithSubTasks;
}

async function getProjectEvents(projectId: string) {
  const projectEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      datetime: events.datetime,
      location: events.location,
      createdBy: events.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .where(eq(events.projectId, projectId))
    .orderBy(desc(events.datetime));

  return projectEvents;
}

async function getProjectMembers(projectId: string) {
  const projectMembers = await db
    .select({
      id: members.id,
      userId: members.userId,
      role: members.role,
      joinedAt: members.joinedAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
    .from(members)
    .innerJoin(user, eq(user.id, members.userId))
    .where(eq(members.projectId, projectId))
    .orderBy(desc(members.joinedAt));

  return projectMembers;
}

function getRecentActivity(tasks: any[], members: any[]) {
  // Get recent tasks (last 5 main tasks created)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get recently joined members (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentMembers = members.filter((m: any) => 
    new Date(m.joinedAt) > sevenDaysAgo
  );

  return {
    recentTasks,
    recentMembers,
    totalActiveMembers: members.length,
  };
} 