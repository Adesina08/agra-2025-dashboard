import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Approved' | 'Pending' | 'Rejected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Approved: 'text-green-500',
    Pending: 'text-yellow-500',
    Rejected: 'text-red-500',
  };

  return (
    <span className={cn('text-xs font-medium', styles[status])}>
      {status}
    </span>
  );
}
