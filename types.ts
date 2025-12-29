
export enum PlanType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  type: PlanType;
  createdAt: number;
}

export interface Benefit {
  id: string;
  content: string;
  pageNumber?: string;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  pagesRead: number;
  totalPages: number;
  coverUrl?: string;
  benefits: Benefit[];
  status: 'reading' | 'completed' | 'on_hold';
  completedAt?: number;
  reminderEnabled?: boolean;
  reminderTime?: string; // Format: "HH:mm"
}

export interface Stats {
  dailyProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
}
