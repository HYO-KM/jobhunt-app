import { useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import type { NewTask } from '../types';

interface TaskFormProps {
  onAddTask: (newTask: NewTask) => Promise<void>;
}

const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState<Dayjs | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('未着手');

  const handleSubmit = () => {
    onAddTask({ title, companyName, status, deadline });
    // フォームをクリア
    setTitle('');
    setDeadline(null);
    setCompanyName('');
    setStatus('未着手');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="タスク名" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField fullWidth label="企業名" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>ステータス</InputLabel>
            <Select value={status} label="ステータス" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="未着手">未着手</MenuItem>
              <MenuItem value="進行中">進行中</MenuItem>
              <MenuItem value="完了">完了</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker sx={{ width: '100%' }} label="締切日" value={deadline} onChange={setDeadline} format="YYYY/MM/DD" />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ height: '56px' }}>追加</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskForm;