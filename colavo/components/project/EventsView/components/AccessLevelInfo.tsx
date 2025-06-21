import { Card, CardContent } from '@/components/ui/card';
import { Eye, CheckCircle } from 'lucide-react';

interface AccessLevelInfoProps {
  canCreateEvents: boolean;
  canHandleEvents: boolean;
}

export function AccessLevelInfo({ canCreateEvents, canHandleEvents }: AccessLevelInfoProps) {
  if (canCreateEvents && canHandleEvents) return null;

  if (!canCreateEvents && !canHandleEvents) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border border-slate-200/60 dark:border-slate-700/60 rounded-full shadow-sm">
        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">View Only Access</span>
      </div>
    );
  }

  if (canHandleEvents && !canCreateEvents) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200/60 dark:border-blue-800/60 shadow-sm">
        <CardContent className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Event Management Access</h3>
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