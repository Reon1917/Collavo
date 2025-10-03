import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { mainTasks, subTasks, projects, members, user } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

interface SubTaskSummary {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  assignedId: string | null;
}

interface MainTaskSummary {
  id: string;
  title: string;
  description: string | null;
  importanceLevel: string;
  deadline: string | null;
  subTasks: SubTaskSummary[];
}

interface ProjectTasksSummary {
  projectId: string;
  projectName: string;
  projectDeadline: string | null;
  mainTasks: MainTaskSummary[];
}

// GET /api/dashboard/tasks-summary - Get all tasks for current user across all projects
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const userId = session.user.id;

    // Get all projects where user is a member
    const userProjects = await db
      .select({
        projectId: members.projectId,
        projectName: projects.name,
        projectDeadline: projects.deadline,
      })
      .from(members)
      .innerJoin(projects, eq(projects.id, members.projectId))
      .where(eq(members.userId, userId));

    if (userProjects.length === 0) {
      return NextResponse.json({
        projects: [],
        totalTasks: 0,
        totalSubTasks: 0,
        completedSubTasks: 0,
        overdueSubTasks: 0,
      });
    }

    const projectIds = userProjects.map((p) => p.projectId);

    // Get all main tasks for these projects
    const allMainTasks = await db
      .select({
        id: mainTasks.id,
        projectId: mainTasks.projectId,
        title: mainTasks.title,
        description: mainTasks.description,
        importanceLevel: mainTasks.importanceLevel,
        deadline: mainTasks.deadline,
      })
      .from(mainTasks)
      .where(
        or(...projectIds.map((id) => eq(mainTasks.projectId, id)))
      );

    if (allMainTasks.length === 0) {
      return NextResponse.json({
        projects: userProjects.map((p) => ({
          projectId: p.projectId,
          projectName: p.projectName,
          projectDeadline: p.projectDeadline,
          mainTasks: [],
        })),
        totalTasks: 0,
        totalSubTasks: 0,
        completedSubTasks: 0,
        overdueSubTasks: 0,
      });
    }

    const mainTaskIds = allMainTasks.map((t) => t.id);

    // Get all subtasks for these main tasks that are assigned to the user
    const allSubTasks = await db
      .select({
        id: subTasks.id,
        mainTaskId: subTasks.mainTaskId,
        title: subTasks.title,
        status: subTasks.status,
        deadline: subTasks.deadline,
        assignedId: subTasks.assignedId,
      })
      .from(subTasks)
      .where(
        and(
          or(...mainTaskIds.map((id) => eq(subTasks.mainTaskId, id))),
          eq(subTasks.assignedId, userId)
        )
      );

    // Calculate statistics
    const now = new Date();
    const completedSubTasks = allSubTasks.filter((st) => st.status === 'completed').length;
    const overdueSubTasks = allSubTasks.filter(
      (st) => st.deadline && new Date(st.deadline) < now && st.status !== 'completed'
    ).length;

    // Group data by project
    const projectTasksMap = new Map<string, ProjectTasksSummary>();

    userProjects.forEach((p) => {
      projectTasksMap.set(p.projectId, {
        projectId: p.projectId,
        projectName: p.projectName,
        projectDeadline: p.projectDeadline,
        mainTasks: [],
      });
    });

    // Group main tasks by project
    const mainTasksByProject = new Map<string, MainTaskSummary[]>();
    allMainTasks.forEach((mt) => {
      if (!mainTasksByProject.has(mt.projectId)) {
        mainTasksByProject.set(mt.projectId, []);
      }
      mainTasksByProject.get(mt.projectId)?.push({
        id: mt.id,
        title: mt.title,
        description: mt.description,
        importanceLevel: mt.importanceLevel,
        deadline: mt.deadline,
        subTasks: [],
      });
    });

    // Group subtasks by main task
    const subTasksByMainTask = new Map<string, SubTaskSummary[]>();
    allSubTasks.forEach((st) => {
      if (!subTasksByMainTask.has(st.mainTaskId)) {
        subTasksByMainTask.set(st.mainTaskId, []);
      }
      subTasksByMainTask.get(st.mainTaskId)?.push({
        id: st.id,
        title: st.title,
        status: st.status,
        deadline: st.deadline,
        assignedId: st.assignedId,
      });
    });

    // Assemble the final structure
    mainTasksByProject.forEach((tasks, projectId) => {
      const projectSummary = projectTasksMap.get(projectId);
      if (projectSummary) {
        projectSummary.mainTasks = tasks.map((mt) => ({
          ...mt,
          subTasks: subTasksByMainTask.get(mt.id) || [],
        }));
      }
    });

    const projectsArray = Array.from(projectTasksMap.values()).filter(
      (p) => p.mainTasks.some((mt) => mt.subTasks.length > 0)
    );

    return NextResponse.json({
      projects: projectsArray,
      totalTasks: allMainTasks.length,
      totalSubTasks: allSubTasks.length,
      completedSubTasks,
      overdueSubTasks,
    });

  } catch (error) {
    console.error('Error fetching tasks summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
