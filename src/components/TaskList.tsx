import { useState, useEffect } from 'react';
import {
  Button, Typography, Box, TextField, List, ListItem, ListItemText, IconButton, Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';

// ▼▼▼ 追加 ▼▼▼
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
// ▲▲▲ 追加 ▲▲▲

// Taskの型を更新
interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline: string | null; // 締切日を追加
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [deadline, setDeadline] = useState<Dayjs | null>(null); // ▼▼▼ 追加 ▼▼▼

  // ログアウト処理 (変更なし)
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  // タスクを追加する処理 (更新)
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') {
      alert('タスク名を入力してください');
      return;
    }
    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, 'tasks', user.uid, 'userTasks'), {
        title: newTaskTitle,
        completed: false,
        createdAt: serverTimestamp(),
        // ▼▼▼ 追加 ▼▼▼
        deadline: deadline ? deadline.toISOString() : null,
      });
      setNewTaskTitle('');
      setDeadline(null); // フォームをクリア
      // ▲▲▲ 追加 ▲▲▲
    }
  };

  // タスクを削除する処理 (変更なし)
  const handleDeleteTask = async (id: string) => {
    const user = auth.currentUser;
    if (user) {
      await deleteDoc(doc(db, 'tasks', user.uid, 'userTasks', id));
    }
  };

  // タスクの完了状態を切り替える処理 (変更なし)
  const handleToggleComplete = async (task: Task) => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'tasks', user.uid, 'userTasks', task.id), {
        completed: !task.completed,
      });
    }
  };

  // Firestoreからタスクをリアルタイムで取得する (更新)
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, 'tasks', user.uid, 'userTasks'),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(q, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          completed: doc.data().completed,
          deadline: doc.data().deadline, // deadlineを取得
        }));
        setTasks(tasksData);
      });
      return () => unsub();
    }
  }, []);

  return (
    // ▼▼▼ 追加 ▼▼▼
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 4, mx: 'auto', maxWidth: '600px', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">タスク管理</Typography>
          <Button variant="outlined" onClick={handleLogout}>
            ログアウト
          </Button>
        </Box>
        <Typography sx={{ mb: 2 }}>
          こんにちは、{auth.currentUser?.email}さん
        </Typography>

        {/* タスク追加フォーム */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="新しいタスク"
            variant="outlined"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          {/* ▼▼▼ 追加 ▼▼▼ */}
          <DatePicker
            label="締切日"
            value={deadline}
            onChange={(newValue) => setDeadline(newValue)}
          />
          {/* ▲▲▲ 追加 ▲▲▲ */}
          <Button
            variant="contained"
            onClick={handleAddTask}
            sx={{ whiteSpace: 'nowrap' }}
          >
            追加
          </Button>
        </Box>

        {/* タスク一覧 */}
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ bgcolor: 'background.paper', mb: 1 }}
            >
              <Checkbox
                edge="start"
                checked={task.completed}
                onChange={() => handleToggleComplete(task)}
              />
              <ListItemText
                primary={task.title}
                // ▼▼▼ 更新 ▼▼▼
                secondary={
                  task.deadline
                    ? `締切: ${dayjs(task.deadline).format('YYYY/MM/DD')}`
                    : '締切なし'
                }
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              />
              {/* ▲▲▲ 更新 ▲▲▲ */}
            </ListItem>
          ))}
        </List>
      </Box>
    </LocalizationProvider>
    // ▲▲▲ 追加 ▲▲▲
  );
};

export default TaskList;