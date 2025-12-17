export interface Task {
  id: string;
  user_identifier: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  user_identifier: string;
  title: string;
  description?: string | null;
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

