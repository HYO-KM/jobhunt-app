import { useState, useEffect } from 'react';
import {
  Button, Typography, Box, TextField, List, ListItem, ListItemText, IconButton, Checkbox,
  Select, MenuItem, FormControl, InputLabel,
  // モーダル用に以下を追加
  Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// 編集アイコンを追加
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

// Taskの型定義
interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline: string | null;
  companyName: string;
  status: string;
}

const TaskList = () => {
  // --- State定義 ---
  const [tasks, setTasks] = useState<Task[]>([]);
  // 新規追加フォーム用のState
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState<Dayjs | null>(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newStatus, setNewStatus] = useState('未着手');

  // 編集モーダル用のStateを追加
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState<Dayjs | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editStatus, setEditStatus] = useState('未着手');

  // 並び替え用のStateを追加
  const [sortOrder, setSortOrder] = useState('createdAt_desc');

  // 関数定義 
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

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
    // window.confirmで確認ダイアログを表示
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

  // 編集モーダルを開く処理を追加
  const handleOpenModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCompanyName(task.companyName);
    setEditStatus(task.status);
    setEditDeadline(task.deadline ? dayjs(task.deadline) : null);
    setIsModalOpen(true);
  };

  // 編集モーダルを閉じる処理を追加
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // タスクを更新する処理を追加
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
    const user = auth.currentUser;
    if (user) {
      let q;
      const tasksCollectionRef = collection(db, 'tasks', user.uid, 'userTasks');

      // sortOrderの値に応じてクエリを変更
      if (sortOrder === 'deadline_asc') {
        q = query(tasksCollectionRef, orderBy('deadline', 'asc'));
      } else if (sortOrder === 'deadline_desc') {
        q = query(tasksCollectionRef, orderBy('deadline', 'desc'));
      } else {
        // デフォルトは作成日の降順
        q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));
      }

      const unsub = onSnapshot(q, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);
      });

      // クリーンアップ関数
      return () => unsub();
    }
  }, [sortOrder]); // sortOrderが変更された時に再実行


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 4, mx: 'auto', maxWidth: '800px', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">タスク管理</Typography>
          <Button variant="outlined" onClick={handleLogout}>ログアウト</Button>
        </Box>

        /* タスク追加 */
        <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, alignItems: 'center' }}>
          <TextField
            label="タスク名" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} sx={{ flex: 2 }}
          />
          <TextField
            label="企業名" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} sx={{ flex: 1 }}
          />
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>ステータス</InputLabel>
            <Select value={newStatus} label="ステータス" onChange={(e) => setNewStatus(e.target.value)}>
              <MenuItem value="未着手">未着手</MenuItem>
              <MenuItem value="進行中">進行中</MenuItem>
              <MenuItem value="完了">完了</MenuItem>
            </Select>
          </FormControl>
          <DatePicker
            label="締切日" 
            value={newDeadline} 
            onChange={(newValue) => setNewDeadline(newValue)}
            format="YYYY/MM/DD"
          />
          <Button variant="contained" onClick={handleAddTask}>追加</Button>
        </Box>


        {/* 並び替え */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>並び替え</InputLabel>
            <Select
              value={sortOrder}
              label="並び替え"
              onChange={(e) => setSortOrder(e.target.value)}
              size="small"
            >
              <MenuItem value="createdAt_desc">作成日（新しい順）</MenuItem>
              <MenuItem value="deadline_asc">締切日（早い順）</MenuItem>
              <MenuItem value="deadline_desc">締切日（遅い順）</MenuItem>
            </Select>
          </FormControl>
        </Box>


        {/* タスク一覧 */}
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{ bgcolor: 'background.paper', mb: 1, border: '1px solid #ddd', borderRadius: '4px' }}
              secondaryAction={
                <>
                  {/* 編集ボタン */}
                  <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <Checkbox
                edge="start" checked={task.completed} onChange={() => handleToggleComplete(task)}
              />
              <ListItemText
                primary={`${task.title} (${task.companyName || '指定なし'})`}
                secondary={`ステータス: ${task.status || '未定義'} | 締切: ${task.deadline ? dayjs(task.deadline).format('YYYY/MM/DD') : 'なし'}`}
                sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
              />
            </ListItem>
          ))}
        </List>

        {/* 編集モーダルの定義を追加 */}
        <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle>タスクを編集</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  autoFocus margin="dense" label="タスク名" type="text" fullWidth
                  value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                />
                <TextField
                  margin="dense" label="企業名" type="text" fullWidth
                  value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>ステータス</InputLabel>
                  <Select
                    value={editStatus} label="ステータス" onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <MenuItem value="未着手">未着手</MenuItem>
                    <MenuItem value="進行中">進行中</MenuItem>
                    <MenuItem value="完了">完了</MenuItem>
                  </Select>
                </FormControl>
                <DatePicker
                  label="締切日" 
                  value={editDeadline} 
                  onChange={(newValue) => setEditDeadline(newValue)}
                  format="YYYY/MM/DD"
                />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>キャンセル</Button>
            <Button onClick={handleUpdateTask} variant="contained">保存</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default TaskList;