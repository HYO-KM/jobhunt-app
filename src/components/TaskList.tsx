import { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
// Firestoreの機能をインポート
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';

// Taskの型を定義
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const TaskList = () => {
  // タスクのリストを保持する状態
  const [tasks, setTasks] = useState<Task[]>([]);
  // 新しく追加するタスクのタイトルを保持する状態
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  // タスクを追加する処理
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') {
      alert('タスク名を入力してください');
      return;
    }
    try {
      const user = auth.currentUser;
      if (user) {
        // `tasks/{userId}/userTasks` というコレクションにドキュメントを追加
        await addDoc(collection(db, 'tasks', user.uid, 'userTasks'), {
          title: newTaskTitle,
          completed: false,
          createdAt: serverTimestamp(), // 作成日時を記録
        });
        setNewTaskTitle(''); // 入力フォームをクリア
      }
    } catch (error) {
      console.error('タスクの追加に失敗しました', error);
    }
  };

  // タスクを削除する処理
  const handleDeleteTask = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, 'tasks', user.uid, 'userTasks', id));
      }
    } catch (error) {
      console.error('タスクの削除に失敗しました', error);
    }
  };

  // タスクの完了状態を切り替える処理
  const handleToggleComplete = async (task: Task) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'tasks', user.uid, 'userTasks', task.id), {
          completed: !task.completed,
        });
      }
    } catch (error) {
      console.error('タスクの更新に失敗しました', error);
    }
  };

  // Firestoreからタスクをリアルタイムで取得する
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, 'tasks', user.uid, 'userTasks'),
        orderBy('createdAt', 'desc') // 作成日の降順で並び替え
      );
      // onSnapshotでデータの変更をリアルタイムに監視
      const unsub = onSnapshot(q, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          completed: doc.data().completed,
        }));
        setTasks(tasksData);
      });
      // コンポーネントがアンマウントされる時に監視を解除
      return () => unsub();
    }
  }, []);

  return (
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
      <Box sx={{ display: 'flex', mt: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="新しいタスク"
          variant="outlined"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <Button
          variant="contained"
          onClick={handleAddTask}
          sx={{ ml: 2, whiteSpace: 'nowrap' }}
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
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteTask(task.id)}
              >
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
              sx={{
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'text.secondary' : 'text.primary',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TaskList;