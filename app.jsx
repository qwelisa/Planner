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

  // Caricamento di tutti i task globali
  useEffect(() => {
    let ignore = false;
    const fetchAllTasks = async () => {
      const res = await pb.collection('tasks').getFullList();
      // Conversione formato data: estraggo YYYY-MM-DD da ISO
      const fixed = res.map(t => ({
        ...t,
        date: t.date ? t.date.slice(0, 10) : ''
      }));
      if (!ignore) setAllTasks(fixed);
    };
    fetchAllTasks();
    const unsub = pb.collection('tasks').subscribe('*', () => setTasksNeedRefresh(t => !t));
    return () => {
      ignore = true;
      pb.collection('tasks').unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchAllTasks = async () => {
      const res = await pb.collection('tasks').getFullList();
      const fixed = res.map(t => ({
        ...t,
        date: t.date ? t.date.slice(0, 10) : ''
      }));
      setAllTasks(fixed);
    };
    fetchAllTasks();
  }, [tasksNeedRefresh]);
 

  // Gestione login/logout
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await pb.collection('users').authWithPassword(authForm.email, authForm.password);
      setUser(pb.authStore.model);
    } catch (err) {
      setAuthError("Credenziali non valide");
    }
  };
  const handleLogout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    if (registerForm.password !== registerForm.passwordConfirm) {
      setRegisterError("Le password non coincidono");
      return;
    }
    try {
      await pb.collection('users').create({
        email: registerForm.email,
        password: registerForm.password,
        passwordConfirm: registerForm.passwordConfirm
      });
      setShowRegister(false);
      setAuthForm({ email: registerForm.email, password: registerForm.password });
    } catch (err) {
      setRegisterError("Errore nella registrazione: " + (err?.message || '')); 
    }
  };


  // Handlers
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    // Collego la lista all'utente loggato
    const created = await pb.collection('lists').create({ name: newListName, user: user.id });
    setNewListName("");
    setSelectedList(created);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !selectedList) return;
    // Assicuro che la data sia sempre nel formato YYYY-MM-DD
    let date = newTask.date;
    if (date) {
      const d = new Date(date);
      date = d.toISOString().slice(0, 10);
    } else {
      date = '';
    }
    await pb.collection('tasks').create({ ...newTask, date, list: selectedList.id });
    setNewTask({ title: "", date: "", description: "" });
  };

  // Filtra i task per lista selezionata e ricerca
  const filteredTasks = allTasks.filter(t =>
    t.list === selectedList?.id &&
    (t.title.toLowerCase().includes(search.toLowerCase()) ||
     (t.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loader">Caricamento...</div>;

  if (!user) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <h2>Registrati</h2>
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Conferma Password"
              value={registerForm.passwordConfirm}
              onChange={e => setRegisterForm(f => ({ ...f, passwordConfirm: e.target.value }))}
              required
            />
            <button type="submit">Registrati</button>
            <button type="button" onClick={() => setShowRegister(false)} style={{marginTop:'0.5rem'}}>Hai già un account? Accedi</button>
            {registerError && <div className="auth-error">{registerError}</div>}
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Accedi</h2>
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            <button type="submit">Accedi</button>
            <button type="button" onClick={() => setShowRegister(true)} style={{marginTop:'0.5rem'}}>Non hai un account? Registrati</button>
            {authError && <div className="auth-error">{authError}</div>}
          </form>
        )}
      </div>
    );
  }
