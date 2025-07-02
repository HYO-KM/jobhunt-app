import { useState } from 'react';
// Firebase関連の機能をインポート
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';

// 認証フォームのコンポーネント
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ログイン処理
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('ログインに成功しました！');
    } catch (error) {
      alert('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
      console.error(error);
    }
  };

  // ユーザー登録処理
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('ユーザー登録に成功しました！');
    } catch (error) {
      alert('ユーザー登録に失敗しました。このメールアドレスは既に使用されている可能性があります。');
      console.error(error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          {isLogin ? 'ログイン' : 'ユーザー登録'}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="メールアドレス"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={isLogin ? handleLogin : handleSignUp}
          >
            {isLogin ? 'ログイン' : '登録'}
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? 'アカウントをお持ちでないですか？ 新規登録'
              : 'すでにアカウントをお持ちですか？ ログイン'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Auth;