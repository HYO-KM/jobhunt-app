import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';

// 認証フォームのコンポーネント
const Auth = () => {
  // ログインモードか登録モードかを切り替えるための状態
  const [isLogin, setIsLogin] = useState(true);

  // 入力されたメールアドレスとパスワードを保持するための状態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ログイン処理（今はまだ空）
  const handleLogin = () => {
    console.log('ログインしようとしています:', { email, password });
  };

  // ユーザー登録処理（今はまだ空）
  const handleSignUp = () => {
    console.log('ユーザー登録しようとしています:', { email, password });
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
            {isLogin ? 'アカウントをお持ちでないですか？ 新規登録' : 'すでにアカウントをお持ちですか？ ログイン'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Auth;