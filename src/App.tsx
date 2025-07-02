import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  // ログインしているユーザーの情報を保持するための状態
  // ユーザーがいればUserオブジェクトが、いなければnullが入る
  const [user, setUser] = useState<User | null>(null);

  // 認証状態の監視を開始する副作用フック
  useEffect(() => {
    // onAuthStateChangedはログイン状態の変化を監視するリスナー
    // ユーザーがログインするとuserオブジェクトが、ログアウトするとnullが返ってくる
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // コンポーネントが不要になった時にリスナーを解除するクリーンアップ処理
    return () => {
      unsubscribe();
    };
  }, []); // 空の配列を渡すことで、最初のレンダリング時に一度だけ実行される

  return (
    <div className="App">
      {/* userが存在すればTaskListを、存在しなければAuthコンポーネントを表示 */}
      {user ? <TaskList /> : <Auth />}
    </div>
  );
}

export default App;