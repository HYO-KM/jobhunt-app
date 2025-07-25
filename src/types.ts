import { type Dayjs } from 'dayjs';

// Taskの型定義
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline: string | null;
  companyName: string;
  status: string;
  color: string;
}

// 新規タスク用の型（IDとcreatedAtは除く）
export interface NewTask {
  title: string;
  companyName: string;
  status: string;
  deadline: Dayjs | null;
  color: string;
}

// 更新タスク用の型
export interface UpdateTaskData {
  title: string;
  companyName: string;
  status: string;
  deadline: Dayjs | null;
  color: string;
}