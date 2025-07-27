import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

import AppLayout from './components/AppLayout';
import TaskList from './components/TaskList';
// import CompanyNotes from './components/CompanyNotes';
// import NoteEditor from './components/NoteEditor';
import Auth from './components/Auth';
import './App.css';
import CompanyNotes from './components/CompanyNotes';
import NoteEditor from './components/NoteEditor';
import { CustomThemeProvider } from './context/ThemeContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <Routes>
          {user ? (
            <Route path="/" element={<AppLayout user={user} />}>
              <Route index element={<TaskList />} />
              <Route path="notes" element={<CompanyNotes />} />
              <Route path="notes/:companyName" element={<NoteEditor />} />
            </Route>
          ) : (
            <Route path="*" element={<Auth />} />
          )}
        </Routes>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

export default App;