import { Button, Typography } from '@mui/material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const TaskList = () => {
  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました');
    } catch (error) {
      alert('ログアウトに失敗しました');
      console.error(error);
    }
  };

  return (
    <div>
      <Typography variant="h4">タスク管理へようこそ！</Typography>
      <p>こんにちは、{auth.currentUser?.email}さん</p>
      <Button variant="contained" onClick={handleLogout}>
        ログアウト
      </Button>
    </div>
  );
};

export default TaskList;