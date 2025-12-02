import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Approved' | 'Pending' | 'Rejected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={cn(
      'px-2 py-1 rounded-full text-xs font-medium border',
      styles[status]
    )}>
      {status}
    </span>
  );
}
