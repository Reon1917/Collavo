import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '../utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  isOverdue?: boolean;
}

export function StatusBadge({ status, className = "", isOverdue = false }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${getStatusColor(status, isOverdue)} border ${className}`}
    >
      {getStatusLabel(status, isOverdue)}
    </Badge>
  );
}
