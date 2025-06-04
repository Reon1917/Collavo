import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AccessLevelInfoProps {
  canViewAllTasks: boolean;
}

export function AccessLevelInfo({ canViewAllTasks }: AccessLevelInfoProps) {
  if (canViewAllTasks) return null;

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Limited Task View</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              You can only see tasks where you are assigned to subtasks. Contact the project leader for broader access.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 