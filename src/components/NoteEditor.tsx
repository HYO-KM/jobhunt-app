import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { type User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const NoteEditor = () => {
  const { user } = useOutletContext<{ user: User }>();
  const { companyName: encodedCompanyName } = useParams<{ companyName: string }>();
  const companyName = encodedCompanyName ? decodeURIComponent(encodedCompanyName) : '';
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyName || !user) return;

    const fetchNote = async () => {
      const noteDocRef = doc(db, 'notes', user.uid, 'companyNotes', companyName);
      const docSnap = await getDoc(noteDocRef);

      if (docSnap.exists()) {
        setNote(docSnap.data().content);
      }
      setLoading(false);
    };

    fetchNote();
  }, [companyName, user]);

  const handleSaveNote = async () => {
    if (user && companyName) {
      const noteDocRef = doc(db, 'notes', user.uid, 'companyNotes', companyName);
      await setDoc(noteDocRef, {
        content: note,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      navigate('/notes');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {companyName} のメモ
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={20}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="説明会で聞いたことや、面接のポイントなどを記録しましょう。"
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/notes')}>
            キャンセル
          </Button>
          <Button variant="contained" onClick={handleSaveNote}>
            保存する
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NoteEditor;