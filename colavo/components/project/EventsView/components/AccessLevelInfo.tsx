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
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#008080]/10 to-[#006666]/10 dark:from-[#00FFFF]/10 dark:to-[#00CCCC]/10 border border-[#008080]/30 dark:border-[#00FFFF]/30 rounded-full shadow-sm">
        <Eye className="h-3 w-3 text-[#008080] dark:text-[#00FFFF]" />
        <span className="text-xs font-medium text-[#008080] dark:text-[#00FFFF]">View Only Access</span>
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