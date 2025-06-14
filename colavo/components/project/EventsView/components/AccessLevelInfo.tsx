import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AccessLevelInfoProps {
  canCreateEvents: boolean;
  canHandleEvents: boolean;
}

export function AccessLevelInfo({ canCreateEvents, canHandleEvents }: AccessLevelInfoProps) {
  if (canCreateEvents && canHandleEvents) return null;

  if (!canCreateEvents && !canHandleEvents) {
    return (
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-medium text-amber-900 dark:text-amber-100 text-sm">View-Only Access</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                You can view events but cannot create or manage them. Contact the project leader for event management access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (canHandleEvents && !canCreateEvents) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Event Management Access</h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                You can manage existing events but cannot create new ones. Contact the project leader to create events.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
} 