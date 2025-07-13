import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Auth from './components/Auth';
import AppLayout from './components/AppLayout';
import './App.css';
import { BrowserRouter } from 'react-router-dom';

function App() {
  // ログインしているユーザーの情報を保持するための状態
  // ユーザーがいればUserオブジェクトが、いなければnullが入る
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 認証状態の監視を開始する副作用フック
  useEffect(() => {
    // onAuthStateChangedはログイン状態の変化を監視するリスナー
    // ユーザーがログインするとuserオブジェクトが、ログアウトするとnullが返ってくる
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // コンポーネントが不要になった時にリスナーを解除するクリーンアップ処理
    return () => {
      unsubscribe();
    };
  }, []); // 空の配列を渡すことで、最初のレンダリング時に一度だけ実行される

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      {user ? <AppLayout /> : <Auth />}
    </BrowserRouter>
  );
}

export default App;