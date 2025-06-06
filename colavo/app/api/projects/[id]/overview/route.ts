import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    // TODO: Replace with your actual database calls
    // Batch all overview data in parallel
    const [projectData, tasksData, membersData] = await Promise.all([
      // fetch(`${process.env.API_BASE_URL}/projects/${projectId}`),
      // fetch(`${process.env.API_BASE_URL}/projects/${projectId}/tasks`),
      // fetch(`${process.env.API_BASE_URL}/projects/${projectId}/members`),
      
      // Placeholder - replace with actual database queries
      getProjectData(projectId),
      getProjectTasks(projectId),
      getProjectMembers(projectId),
    ]);

    return NextResponse.json({
      project: projectData,
      tasks: tasksData,
      members: membersData,
      stats: {
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter(t => t.status === 'completed').length,
        totalMembers: membersData.length,
        recentActivity: getRecentActivity(tasksData, membersData),
      }
    });

  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}

// Placeholder functions - replace with your actual database queries
async function getProjectData(projectId: string) {
  // Your existing project fetch logic
  return {};
}

async function getProjectTasks(projectId: string) {
  // Your existing tasks fetch logic
  return [];
}

async function getProjectMembers(projectId: string) {
  // Your existing members fetch logic
  return [];
}

function getRecentActivity(tasks: any[], members: any[]) {
  // Calculate recent activity metrics
  return {
    recentTasks: tasks.slice(0, 5),
    activeMembers: members.filter(m => m.lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000),
  };
} 