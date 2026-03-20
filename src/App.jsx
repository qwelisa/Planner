import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import List from './components/List';
import Task from './components/Task';
import Calendar from './components/Calendar';
import pb from './pocketbase';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", date: "" });

  const [user, setUser] = useState(pb.authStore.model);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
    return unsubscribe;
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const res = await pb.collection('lists').getFullList({
        filter: `created_by = "${user.id}"`,
      });
      setLists(res);
      const savedListId = localStorage.getItem('selectedListId');
      const found = res.find(l => l.id === savedListId);
      if (found) setSelectedList(found);
      else setSelectedList(null);
    } catch (err) {
      console.error("Errore caricamento liste:", err);
      setLists([]);
      setSelectedList(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLists([]);
      setTasks([]);
      setSelectedList(null);
      setLoading(false);
      return;
    }
    fetchLists();
    const unsubLists = pb.collection('lists').subscribe('*', fetchLists);
    return () => pb.collection('lists').unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedList) {
      setTasks([]);
      return;
    }
    setLoading(true);
    const fetchTasks = async () => {
      try {
        const res = await pb.collection('tasks').getFullList({
          filter: `list = '${selectedList.id}'`,
        });
        setTasks(res);
      } catch (err) {
        console.error("Errore caricamento task:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    const unsubTasks = pb.collection('tasks').subscribe('*', fetchTasks);
    return () => pb.collection('tasks').unsubscribe();
  }, [selectedList, user]);

  // Persist selected list
  useEffect(() => {
    if (selectedList) localStorage.setItem('selectedListId', selectedList.id);
  }, [selectedList]);

  // Add list
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim() || !user) return;
    try {
      const created = await pb.collection('lists').create({
        name: newListName,
        created_by: user.id
      });
      setNewListName("");
      setLists(prev => [created, ...prev]);
      setSelectedList(created);
    } catch (err) {
      alert("Errore nella creazione della lista");
      console.error(err);
    }
  };

  // Add task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !selectedList) return;
    try {
      const created = await pb.collection('tasks').create({
        ...newTask,
        list: selectedList.id
      });
      // Aggiorna la lista dei task immediatamente
      setTasks(prev => [created, ...prev]);
      setNewTask({ title: "", description: "", date: "" });
    } catch (err) {
      alert("Errore nella creazione del task");
      console.error(err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        await pb.collection('users').create({
          email: authEmail,
          password: authPassword,
          passwordConfirm: authPassword,
          username: authEmail,
        });
      }
      await pb.collection('users').authWithPassword(authEmail, authPassword);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      console.error(err);
      setAuthError(err?.message || 'Errore autenticazione');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setUser(null);
    setSelectedList(null);
    setLists([]);
    setTasks([]);
    localStorage.removeItem('selectedListId');
  };

  if (authLoading) return <div className="loader">Autenticazione in corso...</div>;

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>{authMode === 'login' ? 'Accedi' : 'Registrati'}</h2>
          <form onSubmit={handleAuthSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
            {authError && <div className="auth-error">{authError}</div>}
            <button type="submit">{authMode === 'login' ? 'Accedi' : 'Registrati'}</button>
          </form>
          <button
            className="auth-switch"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setAuthError('');
            }}
          >
            {authMode === 'login'
              ? 'Non hai un account? Registrati'
              : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loader">Caricamento...</div>;

  // --- UI ---
  return (
    <div className="app-modern-layout">
      <aside className="sidebar-modern">
        <div className="sidebar-header">
          <h1>Planner</h1>
          <div className="user-info">
            <span>{user?.email}</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>Esci</button>
          </div>
        </div>
        <form onSubmit={handleAddList} className="add-list-form">
          <input
            type="text"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            placeholder="Nuova lista..."
          />
          <button type="submit">Aggiungi</button>
        </form>
        <div className="lists-container">
          {lists.length === 0 ? (
            <p className="empty-msg">Nessuna lista. Creane una!</p>
          ) : (
            lists.map(list => (
              <div
                key={list.id}
                className={`list-item-modern ${selectedList?.id === list.id ? 'active' : ''}`}
                onClick={() => setSelectedList(list)}
                style={{ borderLeft: `6px solid #${(list.id || '').substring(0, 6)}` }}
              >
                <span>{list.name}</span>
              </div>
            ))
          )}
        </div>
      </aside>
      <main className="main-area-modern">
        <div className="main-content-wrapper">
          {!selectedList ? (
            <div className="welcome-area">
              <h2>Crea o seleziona una lista</h2>
              <p>Organizza i tuoi task in modo semplice e visualizzali nel calendario!</p>
            </div>
          ) : (
            <div className="list-area-modern">
              <header className="list-header">
                <h2 style={{ color: `#${(selectedList.id || '').substring(0, 6)}` }}>{selectedList.name}</h2>
                <button className="back-btn" onClick={() => setSelectedList(null)}>← Torna alle liste</button>
              </header>
              <form onSubmit={handleAddTask} className="add-task-form">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Cosa devi fare?"
                  required
                />
                <input
                  type="date"
                  value={newTask.date}
                  onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                />
                <input
                  type="text"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descrizione (opzionale)"
                />
                <button type="submit">Aggiungi Task</button>
              </form>
              <div className="tasks-grid-modern">
                {tasks.length === 0 ? (
                  <p>Nessun task in questa lista.</p>
                ) : (
                  tasks.map(task => <Task key={task.id} task={task} />)
                )}
              </div>
              <Calendar tasks={tasks} lists={lists} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;