import { Badge } from '@/components/ui/badge';
import { Eye, Settings } from 'lucide-react';

interface AccessLevelInfoProps {
  canCreateEvents: boolean;
  canHandleEvents: boolean;
}

const BADGE_STYLES = "text-sm font-medium px-4 py-2 border-primary dark:border-secondary text-primary dark:text-secondary bg-transparent hover:bg-primary/5 dark:hover:bg-secondary/5 transition-colors duration-200";

export function AccessLevelInfo({ canCreateEvents, canHandleEvents }: AccessLevelInfoProps) {
  if (canCreateEvents && canHandleEvents) return null;

  if (!canCreateEvents && !canHandleEvents) {
    return (
      <div className="flex justify-start">
        <Badge 
          variant="outline" 
          className={BADGE_STYLES}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Only Access
        </Badge>
      </div>
    );
  }

  if (canHandleEvents && !canCreateEvents) {
    return (
      <div className="flex justify-start">
        <Badge 
          variant="outline" 
          className={BADGE_STYLES}
        >
          <Settings className="h-4 w-4 mr-2" />
          Event Management Access
        </Badge>
      </div>
    );
  }

  return null;
} 