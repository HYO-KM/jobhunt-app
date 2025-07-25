import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { type Task, type NewTask, type UpdateTaskData } from '../types';

export const useTasks = (user: User, sortOrder: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // データ取得 (onSnapshot)
  useEffect(() => {
    let q;
    const tasksCollectionRef = collection(db, 'tasks', user.uid, 'userTasks');

    if (sortOrder === 'deadline_asc') {
      q = query(tasksCollectionRef, orderBy('deadline', 'asc'));
    } else if (sortOrder === 'deadline_desc') {
      q = query(tasksCollectionRef, orderBy('deadline', 'desc'));
    } else {
      q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    });

    return () => unsub();
  }, [user, sortOrder]);

  // タスク追加
  const addTask = async (newTask: NewTask) => {
    if (newTask.title.trim() === '') return;
    await addDoc(collection(db, 'tasks', user.uid, 'userTasks'), {
      ...newTask,
      deadline: newTask.deadline ? newTask.deadline.toISOString() : null,
      color: newTask.color,
      completed: false,
      createdAt: serverTimestamp(),
    });
  };

  // タスク更新
  const updateTask = async (taskId: string, dataToUpdate: UpdateTaskData) => {
    const taskDocRef = doc(db, 'tasks', user.uid, 'userTasks', taskId);
    await updateDoc(taskDocRef, {
      ...dataToUpdate,
      color: dataToUpdate.color,
      deadline: dataToUpdate.deadline ? dataToUpdate.deadline.toISOString() : null,
    });
  };

  // タスク削除
  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', user.uid, 'userTasks', taskId));
  };

  // タスクの完了状態トグル
  const toggleComplete = async (task: Task) => {
    const taskDocRef = doc(db, 'tasks', user.uid, 'userTasks', task.id);
    await updateDoc(taskDocRef, {
      completed: !task.completed,
    });
  };

  return { tasks, addTask, updateTask, deleteTask, toggleComplete };
};