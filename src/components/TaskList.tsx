import { useState, useEffect } from 'react';
import {
  Button, Box, TextField, List, ListItem, ListItemText, IconButton, Checkbox,
  Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from '../firebase';
import {
  collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import type { User } from 'firebase/auth';

// Taskの型定義
interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline: string | null;
  companyName: string;
  status: string;
}

const TaskList = ({ user }: { user: User }) => {
  // --- State定義 ---
  const [tasks, setTasks] = useState<Task[]>([]);
  // 新規追加フォーム用のState
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState<Dayjs | null>(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newStatus, setNewStatus] = useState('未着手');
  // 編集モーダル用のState
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState<Dayjs | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editStatus, setEditStatus] = useState('未着手');
  // 並び替え用のState
  const [sortOrder, setSortOrder] = useState('createdAt_desc');

  // --- 関数定義 ---
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') return;
    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, 'tasks', user.uid, 'userTasks'), {
        title: newTaskTitle,
        completed: false,
        createdAt: serverTimestamp(),
        deadline: newDeadline ? newDeadline.toISOString() : null,
        companyName: newCompanyName,
        status: newStatus,
      });
      setNewTaskTitle('');
      setNewDeadline(null);
      setNewCompanyName('');
      setNewStatus('未着手');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('本当にこのタスクを削除しますか？')) {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, 'tasks', user.uid, 'userTasks', id));
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'tasks', user.uid, 'userTasks', task.id), {
        completed: !task.completed,
      });
    }
  };

  const handleOpenModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCompanyName(task.companyName);
    setEditStatus(task.status);
    setEditDeadline(task.deadline ? dayjs(task.deadline) : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const user = auth.currentUser;
    if (user) {
      const taskDocRef = doc(db, 'tasks', user.uid, 'userTasks', editingTask.id);
      await updateDoc(taskDocRef, {
        title: editTitle,
        companyName: editCompanyName,
        status: editStatus,
        deadline: editDeadline ? editDeadline.toISOString() : null,
      });
      handleCloseModal();
    }
  };

  useEffect(() => {
    let q;
    const tasksCollectionRef = collection(db, 'tasks', user.uid, 'userTasks');

    if (sortOrder === 'deadline_asc') {
      q = query(tasksCollectionRef, orderBy('deadline', 'asc'));
    } else if (sortOrder === 'deadline_desc') {
      q = query(tasksCollectionRef, orderBy('deadline', 'desc'));
    } else {
      q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    });

    return () => unsub();
  }, [sortOrder, user]); // 依存配列にuserを追加

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="タスク名" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField fullWidth label="企業名" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>ステータス</InputLabel>
              <Select value={newStatus} label="ステータス" onChange={(e) => setNewStatus(e.target.value)}>
                <MenuItem value="未着手">未着手</MenuItem>
                <MenuItem value="進行中">進行中</MenuItem>
                <MenuItem value="完了">完了</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              sx={{ width: '100%' }}
              label="締切日" value={newDeadline} onChange={(newValue) => setNewDeadline(newValue)} format="YYYY/MM/DD"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={handleAddTask} sx={{ height: '56px' }}>追加</Button>
          </Grid>
        </Grid>
      </Box>

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
          <ListItem
            key={task.id}
            sx={{ bgcolor: 'background.paper', mb: 1, border: '1px solid #ddd', borderRadius: '4px' }}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(task)}><EditIcon /></IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}><DeleteIcon /></IconButton>
              </>
            }
          >
            <Checkbox edge="start" checked={task.completed} onChange={() => handleToggleComplete(task)} />
            <ListItemText
              primary={`${task.title} (${task.companyName || '指定なし'})`}
              secondary={`ステータス: ${task.status || '未定義'} | 締切: ${task.deadline ? dayjs(task.deadline).format('YYYY/MM/DD') : 'なし'}`}
              sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>タスクを編集</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField autoFocus margin="dense" label="タスク名" type="text" fullWidth value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <TextField margin="dense" label="企業名" type="text" fullWidth value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} />
            <FormControl fullWidth margin="dense">
              <InputLabel>ステータス</InputLabel>
              <Select value={editStatus} label="ステータス" onChange={(e) => setEditStatus(e.target.value)}>
                <MenuItem value="未着手">未着手</MenuItem>
                <MenuItem value="進行中">進行中</MenuItem>
                <MenuItem value="完了">完了</MenuItem>
              </Select>
            </FormControl>
            <DatePicker label="締切日" value={editDeadline} onChange={(newValue) => setEditDeadline(newValue)} format="YYYY/MM/DD" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>キャンセル</Button>
          <Button onClick={handleUpdateTask} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TaskList;