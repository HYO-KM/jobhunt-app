import { useState, useEffect } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import type { Task, UpdateTaskData } from '../types';

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (taskId: string, dataToUpdate: UpdateTaskData) => Promise<void>;
}

const EditTaskModal = ({ open, onClose, task, onUpdate }: EditTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState<Dayjs | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('未着手');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCompanyName(task.companyName);
      setStatus(task.status);
      setDeadline(task.deadline ? dayjs(task.deadline) : null);
    }
  }, [task]);

  const handleUpdate = () => {
    if (task) {
      onUpdate(task.id, { title, companyName, status, deadline });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>タスクを編集</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField autoFocus margin="dense" label="タスク名" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField margin="dense" label="企業名" fullWidth value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <FormControl fullWidth margin="dense">
            <InputLabel>ステータス</InputLabel>
            <Select value={status} label="ステータス" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="未着手">未着手</MenuItem>
              <MenuItem value="進行中">進行中</MenuItem>
              <MenuItem value="完了">完了</MenuItem>
            </Select>
          </FormControl>
          <DatePicker label="締切日" value={deadline} onChange={setDeadline} format="YYYY/MM/DD" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleUpdate} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskModal;