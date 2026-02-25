import React, { useEffect, useState } from 'react';
import pb from './pocketbase';
import Task from './components/Task';
import Calendar from './components/Calendar';
import './App.css';

xport default function App() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [newTask, setNewTask] = useState({ title: "", date: "", description: "" });
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayTasks, setShowDayTasks] = useState(false);
  const [search, setSearch] = useState("");
  const [taskDetail, setTaskDetail] = useState(null);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [tasksNeedRefresh, setTasksNeedRefresh] = useState(false);
  const [user, setUser] = useState(pb.authStore.model);
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", passwordConfirm: "" });
  const [registerError, setRegisterError] = useState("");

  / Caricamento Liste Iniziale
  useEffect(() => {
    if (!user) return;
    const initData = async () => {
      try {
        // Filtro le liste per utente loggato
        const res = await pb.collection('lists').getFullList({
          filter: `user = '${user.id}'`
        });
        setLists(res);
        const savedId = localStorage.getItem('selectedListId');
        if (savedId) setSelectedList(res.find(l => l.id === savedId));
      } finally {
        setLoading(false);
      }
    };
    initData();
    pb.collection('lists').subscribe('*', initData);
    return () => pb.collection('lists').unsubscribe();
  }, [user]);