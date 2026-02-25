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