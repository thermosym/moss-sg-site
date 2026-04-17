import type { Status } from '@/data/projects';

export interface StatusMeta {
  color: string;
  pulse: boolean;
  label: Status;
}

export function statusMeta(status: Status): StatusMeta {
  switch (status) {
    case 'ACTIVE':
      return { color: '#22c55e', pulse: true, label: 'ACTIVE' };
    case 'WIP':
      return { color: '#f59e0b', pulse: true, label: 'WIP' };
    case 'ARCHIVED':
      return { color: '#6b7280', pulse: false, label: 'ARCHIVED' };
  }
}
