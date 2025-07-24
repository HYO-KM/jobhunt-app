import { useState } from 'react';
import { Box, List, ListItem, ListItemText, IconButton, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useOutletContext } from 'react-router-dom';
import { type User } from 'firebase/auth';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { useTasks } from '../hooks/useTasks';
import { type Task } from '../types';
import TaskForm from './TaskForm';
import EditTaskModal from './EditTaskModal';
import ConfirmationDialog from './ConfirmationDialog';


const TaskList = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [sortOrder, setSortOrder] = useState('createdAt_desc');
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks(user, sortOrder);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleOpenModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId); // どのタスクを削除するかIDを保持
    setConfirmOpen(true);    // ダイアログを開く
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete); // useTasksフックのdeleteTaskを実行
    }
    setConfirmOpen(false); // ダイアログを閉じる
    setTaskToDelete(null); // 保持していたIDをクリア
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TaskForm onAddTask={addTask} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>並び替え</InputLabel>
          <Select value={sortOrder} label="並び替え" onChange={(e) => setSortOrder(e.target.value)} size="small">
            <MenuItem value="createdAt_desc">作成日（新しい順）</MenuItem>
            <MenuItem value="deadline_asc">締切日（早い順）</MenuItem>
            <MenuItem value="deadline_desc">締切日（遅い順）</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} sx={{ bgcolor: 'background.paper', mb: 1, border: '1px solid #ddd', borderRadius: '4px' }}
            secondaryAction={
              <>
                <IconButton onClick={() => handleOpenModal(task)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDeleteClick(task.id)}><DeleteIcon /></IconButton>
              </>
            }
          >
            <Checkbox checked={task.completed} onChange={() => toggleComplete(task)} />
            <ListItemText
              primary={`${task.title} (${task.companyName || '指定なし'})`}
              secondary={`ステータス: ${task.status} | 締切: ${task.deadline ? dayjs(task.deadline).format('YYYY/MM/DD') : 'なし'}`}
              sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>

      <EditTaskModal
        open={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
        onUpdate={updateTask}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="タスクの削除"
        message="このタスクを本当に削除しますか？この操作は取り消せません。"
      />
    </LocalizationProvider>
  );
};

export default TaskList;