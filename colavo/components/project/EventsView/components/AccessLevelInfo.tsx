import { Badge } from '@/components/ui/badge';
import { Eye, Settings } from 'lucide-react';

interface AccessLevelInfoProps {
  canCreateEvents: boolean;
  canHandleEvents: boolean;
}

export function AccessLevelInfo({ canCreateEvents, canHandleEvents }: AccessLevelInfoProps) {
  if (canCreateEvents && canHandleEvents) return null;

  if (!canCreateEvents && !canHandleEvents) {
    return (
      <div className="flex justify-start">
        <Badge 
          variant="outline" 
          className="text-sm font-medium px-4 py-2 border-[#008080] dark:border-[#00FFFF] text-[#008080] dark:text-[#00FFFF] bg-transparent hover:bg-[#008080]/5 dark:hover:bg-[#00FFFF]/5 transition-colors duration-200"
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
          className="text-sm font-medium px-4 py-2 border-[#008080] dark:border-[#00FFFF] text-[#008080] dark:text-[#00FFFF] bg-transparent hover:bg-[#008080]/5 dark:hover:bg-[#00FFFF]/5 transition-colors duration-200"
        >
          <Settings className="h-4 w-4 mr-2" />
          Event Management Access
        </Badge>
      </div>
    );
  }

  return null;
} 