import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseAvailable } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { scheduleTaskReminder, cancelTaskReminder } from "../services/notifications";

const TasksContext = createContext(null);

function freshId() {
  return String(Date.now()) + "_" + Math.random().toString(36).slice(2, 7);
}

function makeTask(taskData, userId) {
  const now = new Date().toISOString();
  return {
    id: freshId(),
    userId,
    title: (taskData.title || "").trim(),
    description: (taskData.description || "").trim(),
    category: taskData.category || "Other",
    status: taskData.status || "pending",
    deadline: taskData.deadline || null,
    reminderAt: taskData.reminderAt || null,
    notificationId: taskData.notificationId || null,
    soundName: taskData.soundName || "default",
    createdAt: now,
    updatedAt: now,
  };
}

function mapDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId,
    title: data.title,
    description: data.description || "",
    category: data.category,
    status: data.status,
    deadline: data.deadline ? data.deadline.toDate().toISOString() : null,
    reminderAt: data.reminderAt ? data.reminderAt.toDate().toISOString() : null,
    notificationId: data.notificationId || null,
    soundName: data.soundName || "default",
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
  };
}

export function TasksProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const unsubscribeRef = useRef(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  function pushNotification(type, taskTitle) {
    const notif = { id: freshId(), type, taskTitle, timestamp: new Date().toISOString() };
    setNotifications((prev) => [notif, ...prev].slice(0, 20));
  }

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (!firebaseAvailable) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(mapDoc);
      setTasks(list);
      setLoading(false);
    });

    unsubscribeRef.current = unsub;
    return () => unsub();
  }, [user]);

  const addTask = useCallback(
    async (taskData) => {
      if (!user) return;
      const task = makeTask(taskData, user.uid);
      if (task.reminderAt) {
        const nid = await scheduleTaskReminder(task).catch(() => null);
        task.notificationId = nid;
      }
      if (!firebaseAvailable) {
        setTasks((prev) => [task, ...prev]);
        return task.id;
      }
      const docRef = await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        title: taskData.title.trim(),
        description: (taskData.description || "").trim(),
        category: taskData.category,
        status: taskData.status || "pending",
        deadline: taskData.deadline ? new Date(taskData.deadline) : null,
        reminderAt: taskData.reminderAt ? new Date(taskData.reminderAt) : null,
        notificationId: task.notificationId,
        soundName: taskData.soundName || "default",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [user]
  );

  const updateTask = useCallback(async (id, taskData) => {
    const existing = tasksRef.current.find((t) => t.id === id);
    let newNotificationId = existing?.notificationId || null;

    const reminderChanged = taskData.reminderAt !== existing?.reminderAt;
    if (reminderChanged) {
      if (existing?.notificationId) {
        await cancelTaskReminder(existing.notificationId).catch(() => {});
      }
      if (taskData.reminderAt) {
        newNotificationId = await scheduleTaskReminder({ ...existing, ...taskData, id }).catch(() => null);
      } else {
        newNotificationId = null;
      }
    }

    if (!firebaseAvailable) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: (taskData.title || "").trim(),
                description: (taskData.description || "").trim(),
                category: taskData.category,
                status: taskData.status,
                deadline: taskData.deadline || null,
                reminderAt: taskData.reminderAt || null,
                notificationId: newNotificationId,
                soundName: taskData.soundName || "default",
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      return;
    }
    await updateDoc(doc(db, "tasks", id), {
      title: taskData.title.trim(),
      description: (taskData.description || "").trim(),
      category: taskData.category,
      status: taskData.status,
      deadline: taskData.deadline ? new Date(taskData.deadline) : null,
      reminderAt: taskData.reminderAt ? new Date(taskData.reminderAt) : null,
      notificationId: newNotificationId,
      soundName: taskData.soundName || "default",
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteTask = useCallback(async (id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (task?.notificationId) {
      await cancelTaskReminder(task.notificationId).catch(() => {});
    }
    if (!firebaseAvailable) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (task) pushNotification("deleted", task.title);
      return;
    }
    await deleteDoc(doc(db, "tasks", id));
    if (task) pushNotification("deleted", task.title);
  }, []);

  const toggleComplete = useCallback(async (id, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const task = tasksRef.current.find((t) => t.id === id);
    if (newStatus === "completed" && task?.notificationId) {
      await cancelTaskReminder(task.notificationId).catch(() => {});
    }
    if (!firebaseAvailable) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                notificationId: newStatus === "completed" ? null : t.notificationId,
              }
            : t
        )
      );
      if (newStatus === "completed" && task) pushNotification("completed", task.title);
      return;
    }
    await updateDoc(doc(db, "tasks", id), {
      status: newStatus,
      notificationId: newStatus === "completed" ? null : task?.notificationId || null,
      updatedAt: serverTimestamp(),
    });
    if (newStatus === "completed" && task) pushNotification("completed", task.title);
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <TasksContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, toggleComplete, notifications, clearNotifications }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
