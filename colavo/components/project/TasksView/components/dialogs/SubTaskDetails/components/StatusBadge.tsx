import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '../utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${getStatusColor(status)} border ${className}`}
    >
      {getStatusLabel(status)}
    </Badge>
  );
} 