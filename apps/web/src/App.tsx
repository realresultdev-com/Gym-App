import { useState, useEffect, useMemo } from 'react';
import type { WorkoutProgram, SetItem, GymMember, NotificationItem } from './types/gym';
import { loadGymState, saveGymState, type GymAppState } from './services/gymStorage';
import { fetchHealthPing } from './services/api';

export default function App() {
  // -------------------------------------------------------------
  // Persistent Gym State
  // -------------------------------------------------------------
  const [gymState, setGymState] = useState<GymAppState>(() => loadGymState());

  // Save to localStorage whenever gymState updates ("stay in application")
  useEffect(() => {
    saveGymState(gymState);
  }, [gymState]);

  // Active Navigation & Filters
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'attendance' | 'admin'>('home');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newProgramModalOpen, setNewProgramModalOpen] = useState(false);
  const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [attendanceHistoryOpen, setAttendanceHistoryOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState('All Type');
  const [peakDay, setPeakDay] = useState('DO');

  // Cloudflare Worker Live Health & Telemetry
  const [workerLatency, setWorkerLatency] = useState<number | null>(null);
  const [workerStatus, setWorkerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    fetchHealthPing().then((res) => {
      if (res.ok) {
        setWorkerStatus('online');
        setWorkerLatency(res.latency);
      } else {
        setWorkerStatus('offline');
      }
    });

    const interval = setInterval(() => {
      fetchHealthPing().then((res) => {
        if (res.ok) {
          setWorkerStatus('online');
          setWorkerLatency(res.latency);
        } else {
          setWorkerStatus('offline');
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------
  // Dynamic Attendance Check-In Duration Calculation
  // -------------------------------------------------------------
  const [elapsedCheckInSeconds, setElapsedCheckInSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (gymState.activeCheckIn.isCheckedIn && gymState.activeCheckIn.checkInTimestamp) {
      const updateElapsed = () => {
        const diffMs = Date.now() - (gymState.activeCheckIn.checkInTimestamp || Date.now());
        setElapsedCheckInSeconds(Math.max(0, Math.floor(diffMs / 1000)));
      };
      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedCheckInSeconds(0);
    }
    return () => clearInterval(interval);
  }, [gymState.activeCheckIn]);

  const handleToggleCheckIn = () => {
    if (!gymState.activeCheckIn.isCheckedIn) {
      // CHECK IN ACTION
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const recordId = `att-${Date.now()}`;

      setGymState((prev) => ({
        ...prev,
        activeCheckIn: {
          isCheckedIn: true,
          checkInTimestamp: now,
          activeRecordId: recordId,
        },
        attendanceHistory: [
          {
            id: recordId,
            memberId: 'usr-member-0001',
            memberName: 'Martin Vance',
            date: 'Today',
            checkInTime: timeStr,
            checkOutTime: undefined,
            status: 'CHECKED_IN',
            method: 'Touchless QR',
          },
          ...prev.attendanceHistory,
        ],
      }));
    } else {
      // CHECK OUT ACTION
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const durationMins = Math.max(1, Math.round(elapsedCheckInSeconds / 60));

      setGymState((prev) => {
        const activeRecId = prev.activeCheckIn.activeRecordId;
        const updatedHistory = prev.attendanceHistory.map((rec) => {
          if (rec.id === activeRecId) {
            return {
              ...rec,
              checkOutTime: timeStr,
              durationMinutes: durationMins,
              status: 'COMPLETED' as const,
            };
          }
          return rec;
        });

        return {
          ...prev,
          activeCheckIn: {
            isCheckedIn: false,
            checkInTimestamp: null,
            activeRecordId: null,
          },
          streakDays: prev.streakDays + 1,
          attendanceHistory: updatedHistory,
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: '🎯 Check-Out Completed',
              message: `Great workout! Session logged for ${durationMins} minutes. Streak increased to ${prev.streakDays + 1} days!`,
              type: 'ATTENDANCE',
              createdAt: 'Just now',
              read: false,
              author: 'FITPULSE Front Desk',
            },
            ...prev.notifications,
          ],
        };
      });
    }
  };

  // -------------------------------------------------------------
  // Dynamic Workout Stopwatch & Sets
  // -------------------------------------------------------------
  useEffect(() => {
    let interval: any;
    if (gymState.activeWorkout.isRunning) {
      interval = setInterval(() => {
        setGymState((prev) => ({
          ...prev,
          activeWorkout: {
            ...prev.activeWorkout,
            timerSeconds: prev.activeWorkout.timerSeconds + 1,
          },
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gymState.activeWorkout.isRunning]);

  const toggleTimerRunning = () => {
    setGymState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        isRunning: !prev.activeWorkout.isRunning,
      },
    }));
  };

  const resetTimer = () => {
    setGymState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        timerSeconds: 0,
      },
    }));
  };

  const toggleSetCompleted = (index: number) => {
    setGymState((prev) => {
      const updatedSets = prev.activeWorkout.sets.map((item, idx) =>
        idx === index ? { ...item, completed: !item.completed } : item
      );
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          sets: updatedSets,
        },
      };
    });
  };

  const handleAddSet = () => {
    setGymState((prev) => {
      const nextSetNum = prev.activeWorkout.sets.length + 1;
      const lastWeight = prev.activeWorkout.sets[prev.activeWorkout.sets.length - 1]?.weight || 'Bodyweight';
      const lastReps = prev.activeWorkout.sets[prev.activeWorkout.sets.length - 1]?.reps || 10;
      const newSet: SetItem = {
        id: `set-${Date.now()}`,
        set: nextSetNum,
        reps: lastReps,
        weight: lastWeight,
        completed: false,
      };
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          sets: [...prev.activeWorkout.sets, newSet],
        },
      };
    });
  };

  const handleDeleteSet = (id: string) => {
    setGymState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        sets: prev.activeWorkout.sets
          .filter((s) => s.id !== id)
          .map((s, idx) => ({ ...s, set: idx + 1 })),
      },
    }));
  };

  const handleUpdateSetReps = (index: number, newReps: number) => {
    if (newReps < 1) return;
    setGymState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        sets: prev.activeWorkout.sets.map((s, idx) =>
          idx === index ? { ...s, reps: newReps } : s
        ),
      },
    }));
  };

  const handleUpdateSetWeight = (index: number, newWeight: string) => {
    setGymState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        sets: prev.activeWorkout.sets.map((s, idx) =>
          idx === index ? { ...s, weight: newWeight } : s
        ),
      },
    }));
  };

  const handleFinishWorkout = () => {
    const completedCount = gymState.activeWorkout.sets.filter((s) => s.completed).length;
    const totalCount = gymState.activeWorkout.sets.length;

    const newSessionLog = {
      id: `session-${Date.now()}`,
      programId: gymState.activeWorkout.programId,
      programTitle: gymState.activeWorkout.programTitle,
      startedAt: new Date(Date.now() - gymState.activeWorkout.timerSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: gymState.activeWorkout.timerSeconds,
      setsCompleted: completedCount,
      totalSets: totalCount,
    };

    setGymState((prev) => ({
      ...prev,
      completedSessions: [newSessionLog, ...prev.completedSessions],
      streakDays: prev.streakDays + 1,
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: '🔥 Workout Logged Successfully!',
          message: `Completed ${completedCount}/${totalCount} sets for ${gymState.activeWorkout.programTitle}. Log saved to Cloudflare D1 storage.`,
          type: 'WORKOUT',
          createdAt: 'Just now',
          read: false,
          author: 'FITPULSE Tracker',
        },
        ...prev.notifications,
      ],
      activeWorkout: {
        ...prev.activeWorkout,
        timerSeconds: 0,
        isRunning: false,
        sets: prev.activeWorkout.sets.map((s) => ({ ...s, completed: false })),
      },
    }));

    alert(`🎉 Workout session completed and saved to D1!\n${completedCount}/${totalCount} sets logged.\nActive streak is now ${gymState.streakDays + 1} days!`);
    setActiveTab('home');
  };

  const selectProgramForWorkout = (prog: WorkoutProgram) => {
    setGymState((prev) => ({
      ...prev,
      activeWorkout: {
        programId: prog.id,
        programTitle: prog.title,
        timerSeconds: 0,
        isRunning: true,
        sets: [
          { id: 'set-1', set: 1, reps: 12, weight: 'Bodyweight', completed: false },
          { id: 'set-2', set: 2, reps: 10, weight: 'Bodyweight', completed: false },
          { id: 'set-3', set: 3, reps: 8, weight: 'Bodyweight', completed: false },
        ],
      },
    }));
    setActiveTab('workout');
  };

  // -------------------------------------------------------------
  // Dynamic Program Form State
  // -------------------------------------------------------------
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgCategory, setNewProgCategory] = useState<'Chest' | 'Arms' | 'Cardio' | 'Yoga' | 'Strength' | 'Back' | 'Legs'>('Chest');
  const [newProgDuration, setNewProgDuration] = useState(15);
  const [newProgSetsReps, setNewProgSetsReps] = useState('3 x 12 reps');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgImage, setNewProgImage] = useState('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400');

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) return;

    const newProg: WorkoutProgram = {
      id: `prog-${Date.now()}`,
      title: newProgTitle.trim(),
      category: newProgCategory,
      durationMin: Number(newProgDuration) || 15,
      setsReps: newProgSetsReps.trim() || '3 x 12 reps',
      description: newProgDesc.trim() || 'Custom training routine.',
      imageUrl: newProgImage || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400',
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: 'ALL',
    };

    setGymState((prev) => ({
      ...prev,
      programs: [newProg, ...prev.programs],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: `📋 New Program Added: ${newProg.title}`,
          message: `Category: ${newProg.category} • ${newProg.durationMin} mins • Saved to database.`,
          type: 'WORKOUT',
          createdAt: 'Just now',
          read: false,
          author: gymState.role === 'TRAINER' ? 'Coach Alex Hunter' : 'Sarah Connor',
        },
        ...prev.notifications,
      ],
    }));

    setNewProgTitle('');
    setNewProgDesc('');
    setNewProgramModalOpen(false);
  };

  // -------------------------------------------------------------
  // Dynamic Member Registration Form State
  // -------------------------------------------------------------
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemPlan, setNewMemPlan] = useState<'Monthly All-Access' | 'Quarterly Pro Athlete' | 'VIP Elite Annual'>('Monthly All-Access');
  const [newMemGoal, setNewMemGoal] = useState('Build lean muscle and improve stamina');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName.trim()) return;

    const newMem: GymMember = {
      id: `mem-${Date.now()}`,
      name: newMemName.trim(),
      email: newMemEmail.trim() || `member${Date.now()}@gym.com`,
      phone: newMemPhone.trim() || '+1 555-0100',
      plan: newMemPlan,
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().split('T')[0],
      assignedTrainer: 'Alex Hunter (CSCS)',
      fitnessGoal: newMemGoal.trim(),
      streakDays: 1,
    };

    setGymState((prev) => ({
      ...prev,
      members: [newMem, ...prev.members],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: `👥 New Member Onboarded: ${newMem.name}`,
          message: `Plan: ${newMem.plan} • Assigned to Coach Alex Hunter.`,
          type: 'ANNOUNCEMENT',
          createdAt: 'Just now',
          read: false,
          author: 'Sarah Connor (Admin)',
        },
        ...prev.notifications,
      ],
    }));

    setNewMemName('');
    setNewMemEmail('');
    setNewMemPhone('');
    setNewMemberModalOpen(false);
  };

  // -------------------------------------------------------------
  // Dynamic Gym Broadcast Announcement Form State
  // -------------------------------------------------------------
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `📢 ${broadcastTitle.trim()}`,
      message: broadcastMsg.trim(),
      type: 'ANNOUNCEMENT',
      createdAt: 'Just now',
      read: false,
      author: 'Sarah Connor (Admin)',
    };

    setGymState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));

    setBroadcastTitle('');
    setBroadcastMsg('');
    setBroadcastModalOpen(false);
    alert('Gym broadcast published! All members and trainers received this notification.');
  };

  const handleMarkAllNotificationsRead = () => {
    setGymState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleDeleteNotification = (id: string) => {
    setGymState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  };

  // -------------------------------------------------------------
  // Dynamic Reception QR Code Timer (120s rotation)
  // -------------------------------------------------------------
  const [qrCountdown, setQrCountdown] = useState(120);
  const [qrToken, setQrToken] = useState('TOKEN-D1-8493-SECRET');

  useEffect(() => {
    if (!qrModalOpen) return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(`TOKEN-D1-${Math.floor(1000 + Math.random() * 9000)}-SECRET`);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrModalOpen]);

  // -------------------------------------------------------------
  // Dynamic Computed Metrics
  // -------------------------------------------------------------
  const activeMembersCount = useMemo(() => {
    return gymState.members.filter((m) => m.status === 'ACTIVE').length;
  }, [gymState.members]);

  const dynamicRevenue = useMemo(() => {
    return gymState.members.reduce((acc, m) => {
      if (m.plan === 'Monthly All-Access') return acc + 49;
      if (m.plan === 'Quarterly Pro Athlete') return acc + 129;
      if (m.plan === 'VIP Elite Annual') return acc + 399;
      return acc + 49;
    }, 0);
  }, [gymState.members]);

  const todayCheckInCount = useMemo(() => {
    const todayList = gymState.attendanceHistory.filter(
      (a) => a.date === 'Today' || a.status === 'CHECKED_IN'
    );
    return todayList.length + (gymState.activeCheckIn.isCheckedIn ? 1 : 0);
  }, [gymState.attendanceHistory, gymState.activeCheckIn.isCheckedIn]);

  const unreadNotificationCount = useMemo(() => {
    return gymState.notifications.filter((n) => !n.read).length;
  }, [gymState.notifications]);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    if (selectedCategory === 'All Type') return gymState.programs;
    return gymState.programs.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [gymState.programs, selectedCategory]);

  // Formatter utilities
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCheckInDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-amber-400 selection:text-black">
      
      {/* =========================================================
          FULL-WIDTH RESPONSIVE NAVIGATION HEADER
      ========================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title with Live Edge Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-400/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900">FITPULSE</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                  STUDIO
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500">
                <span className={`w-2 h-2 rounded-full ${workerStatus === 'online' ? 'bg-emerald-500 animate-pulse' : workerStatus === 'checking' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
                <span>{workerStatus === 'online' ? `Edge API Online (${workerLatency}ms)` : workerStatus === 'checking' ? 'Connecting to Edge...' : 'Edge Storage Active'}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on Tablet & Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>🏠</span>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('workout')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'workout'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>🏋️</span>
              <span>Workout Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>📱</span>
              <span>Check-In</span>
            </button>

            {gymState.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>👑</span>
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* User Profile, Notifications & Role Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Dynamic Role Switcher Pill */}
            <button
              onClick={() => setRoleModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm ${
                gymState.role === 'ADMIN'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : gymState.role === 'TRAINER'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100'
              }`}
            >
              <span>{gymState.role === 'ADMIN' ? '👑' : gymState.role === 'TRAINER' ? '💪' : '🏋️'}</span>
              <span>{gymState.role}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {/* Dynamic Notification Bell with Live Unread Badge */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center relative cursor-pointer hover:bg-slate-200 transition"
              title="Notifications"
            >
              <span className="text-base">🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Profile Avatar & Greeting */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 cursor-pointer" onClick={() => setRoleModalOpen(true)}>
              <img
                src={
                  gymState.role === 'MEMBER'
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
                    : gymState.role === 'TRAINER'
                    ? 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200'
                    : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'
                }
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {gymState.role === 'MEMBER' ? 'Martin Vance' : gymState.role === 'TRAINER' ? 'Alex Hunter' : 'Sarah Connor'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {gymState.role === 'MEMBER' ? 'All-Access VIP' : gymState.role === 'TRAINER' ? 'Head Coach (CSCS)' : 'Gym Director'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN RESPONSIVE CONTENT CONTAINER
      ========================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">

        {/* =========================================================
            VIEW 1: ADMIN COMMAND CENTER (DYNAMIC METRICS & CONTROLS)
        ========================================================== */}
        {gymState.role === 'ADMIN' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Command Center</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Cloudflare Workers D1 Edge Relational Database • Real-Time Dynamic Storage
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setNewMemberModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition shadow-sm cursor-pointer"
                >
                  + Add Member
                </button>
                <button
                  onClick={() => setBroadcastModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-sm cursor-pointer"
                >
                  📢 Broadcast Alert
                </button>
              </div>
            </div>

            {/* Dynamic Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Members</p>
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">👥</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">{activeMembersCount}</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">✓ Active in Cloudflare D1</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Programs</p>
                  <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">📋</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">{gymState.programs.length}</p>
                <p className="text-xs font-bold text-emerald-600 mt-1">Curated Daily Routines</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Today Check-Ins</p>
                  <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">📱</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">{todayCheckInCount}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {gymState.activeCheckIn.isCheckedIn ? '1 Session active right now' : 'All sessions logged'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">💰</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mt-2">${dynamicRevenue.toLocaleString()}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Dynamic Subscription Tiers</p>
              </div>
            </div>

            {/* Quick Actions & Reception QR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setQrModalOpen(true)}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-bold">
                    🎟
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Dynamic Reception QR Code</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Rotates every 120s with cryptographic HMAC token signature
                    </p>
                  </div>
                </div>
                <span className="text-lg text-slate-400 font-bold">→</span>
              </div>

              <div
                onClick={() => setBroadcastModalOpen(true)}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
                    📢
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Send Gym-Wide Broadcast Alert</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Delivers instant in-app notification to all active gym members
                    </p>
                  </div>
                </div>
                <span className="text-lg text-slate-400 font-bold">→</span>
              </div>
            </div>

            {/* Active Members Table */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Member Directory</h3>
                  <p className="text-xs font-semibold text-slate-500">Live roster saved to local and D1 storage</p>
                </div>
                <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                  {gymState.members.length} Total Registered
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Goal</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gymState.members.map((mem) => (
                      <tr key={mem.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <p className="font-black text-slate-900">{mem.name}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{mem.email}</p>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">{mem.plan}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{mem.fitnessGoal}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-600">⚡ {mem.streakDays}d</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {mem.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : gymState.role === 'TRAINER' ? (
          /* =========================================================
              VIEW 2: TRAINER STUDIO (ATHLETE ROSTER & PROGRAM BUILDER)
          ========================================================== */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trainer Studio</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Coach Alex Hunter • Certified Strength & Conditioning Specialist (CSCS)
                </p>
              </div>
              <button
                onClick={() => setNewProgramModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition cursor-pointer shadow-md"
              >
                + Create Program Template
              </button>
            </div>

            {/* Trainer Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl">
                  💪
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Assigned Athlete Roster</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {gymState.members.length} Athletes Active • Dynamic Training Plans
                  </p>
                  <p className="text-xs font-black text-emerald-600 mt-1">✓ Live attendance and progression synced</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 border border-slate-200 text-slate-800">
                  {gymState.programs.length} Active Templates
                </span>
              </div>
            </div>

            {/* Athlete Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gymState.members.map((mem) => (
                <div key={mem.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                      alt={mem.name}
                      className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm"
                    />
                    <div>
                      <h4 className="text-base font-black text-slate-900">{mem.name}</h4>
                      <p className="text-xs font-semibold text-slate-500">{mem.plan}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {mem.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold space-y-1">
                    <p className="text-slate-500">Fitness Goal:</p>
                    <p className="text-slate-900 font-black">{mem.fitnessGoal}</p>
                    <p className="text-indigo-600 font-bold mt-1">Streak: {mem.streakDays} Days • Joined: {mem.joinedDate}</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => setAttendanceHistoryOpen(true)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => {
                        setNewProgramModalOpen(true);
                        setNewProgTitle(`Custom Plan for ${mem.name}`);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer shadow-sm"
                    >
                      Assign Workout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* =========================================================
              VIEW 3: MEMBER DASHBOARD (EXPANSIVE 2-COLUMN DESKTOP GRID)
          ========================================================== */
          <div>
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ----------------------------------------------------
                    LEFT / MAIN COLUMN (8 of 12 columns on desktop)
                ----------------------------------------------------- */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Hero Challenge Banner (Image 1 Right Style) */}
                  <div
                    onClick={() => setActiveTab('workout')}
                    className="w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg shadow-amber-400/20 cursor-pointer transition-transform hover:scale-[1.008]"
                    style={{ backgroundColor: '#fbbf24' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-slate-950 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                        Today's Focus
                      </span>
                      <div className="w-9 h-9 rounded-full bg-slate-950/15 flex items-center justify-center text-base">
                        🔖
                      </div>
                    </div>

                    <div className="max-w-[70%] sm:max-w-[60%]">
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight tracking-tight">
                        {gymState.activeWorkout.programTitle || 'Full Body Challenge'}
                      </h2>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-6">
                        Complete your scheduled program before 09:00 AM • 35 min
                      </p>

                      {/* Stacked Member Avatars */}
                      <div className="flex items-center -space-x-2.5">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center border-2 border-white text-xs font-black">
                          +{activeMembersCount}
                        </div>
                        <span className="pl-4 text-xs font-black text-slate-900">Members active now</span>
                      </div>
                    </div>

                    <img
                      src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400"
                      className="absolute -right-2 sm:right-6 -bottom-6 w-44 sm:w-56 h-56 sm:h-72 object-cover pointer-events-none opacity-95"
                    />
                  </div>

                  {/* Dynamic Streak Card */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-300 text-lg font-bold text-emerald-700">
                        ⚡
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{gymState.streakDays} Days Active Streak</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {gymState.completedSessions.length} total workouts completed • Keep it up!
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-lg hidden sm:block">›</span>
                  </div>

                  {/* Weekday Strip */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">Weekly Schedule</h3>
                      <span className="text-xs font-semibold text-slate-500">October 2026</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { day: 'Mon', date: 22 },
                        { day: 'Tue', date: 23 },
                        { day: 'Wed', date: 24 },
                        { day: 'Thu', date: 25 },
                        { day: 'Fri', date: 26 },
                        { day: 'Sat', date: 27 },
                        { day: 'Sun', date: 28 },
                      ].map((item) => {
                        const isSelected = item.date === selectedDay;
                        return (
                          <button
                            key={item.date}
                            onClick={() => setSelectedDay(item.date)}
                            className={`py-3 sm:py-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              {item.day}
                            </span>
                            <span className="text-sm sm:text-base font-black mt-1">{item.date}</span>
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-amber-400' : 'bg-transparent'}`}></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Programs Header & Filter Pills */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Daily Program</h3>
                        <p className="text-xs font-semibold text-slate-500">
                          {filteredPrograms.length} dynamic routines available
                        </p>
                      </div>
                      <button
                        onClick={() => setNewProgramModalOpen(true)}
                        className="text-xs font-black text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-200 cursor-pointer transition"
                      >
                        + Add Program
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                      {['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga', 'Strength', 'Back'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-xs font-black border transition cursor-pointer shrink-0 ${
                            cat === selectedCategory
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Responsive Grid of Program Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredPrograms.map((prog) => (
                        <div
                          key={prog.id}
                          onClick={() => selectProgramForWorkout(prog)}
                          className="rounded-3xl bg-white p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="h-36 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
                              <img src={prog.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                                  <span className="text-slate-900 text-sm ml-0.5">▶</span>
                                </div>
                              </div>
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/60 text-white backdrop-blur-sm">
                                {prog.category}
                              </span>
                            </div>
                            <h4 className="text-slate-900 font-black text-base truncate">{prog.title}</h4>
                            <p className="text-slate-500 text-xs font-semibold line-clamp-2 mb-3">{prog.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">⏱ {prog.durationMin} min</span>
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{prog.setsReps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    RIGHT COLUMN / DESKTOP SIDE PANEL (4 of 12 columns)
                ----------------------------------------------------- */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Dynamic Studio Check-In Card */}
                  <div
                    className="p-6 rounded-3xl shadow-md transition-all relative overflow-hidden"
                    style={{ backgroundColor: gymState.activeCheckIn.isCheckedIn ? '#ffffff' : '#f43f5e' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                        gymState.activeCheckIn.isCheckedIn ? 'bg-slate-100 text-slate-900' : 'bg-white/20 text-white'
                      }`}>
                        📱
                      </div>
                      {gymState.activeCheckIn.isCheckedIn ? (
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Session Active</span>
                        </div>
                      ) : (
                        <span className="bg-white/20 text-white text-[11px] font-black px-3 py-1 rounded-full">
                          FITPULSE Studio
                        </span>
                      )}
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      gymState.activeCheckIn.isCheckedIn ? 'text-slate-900' : 'text-white'
                    }`}>
                      {gymState.activeCheckIn.isCheckedIn ? 'Checked In' : 'Studio Check-In'}
                    </h3>
                    <p className={`text-xs font-semibold mt-1 mb-6 ${
                      gymState.activeCheckIn.isCheckedIn ? 'text-slate-500' : 'text-white/90'
                    }`}>
                      {gymState.activeCheckIn.isCheckedIn
                        ? `Floor duration: ${formatCheckInDuration(elapsedCheckInSeconds)}`
                        : 'Schnell einchecken und Training starten'}
                    </p>

                    <button
                      onClick={handleToggleCheckIn}
                      className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition cursor-pointer ${
                        gymState.activeCheckIn.isCheckedIn
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {gymState.activeCheckIn.isCheckedIn ? 'Session Beenden / Check-Out' : 'QR Check-In öffnen'}
                    </button>
                  </div>

                  {/* Stoßzeiten (Peak Hours Timeline with Live Sensor) */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Stoßzeiten</h4>
                        <p className="text-xs font-semibold text-slate-500">Peak Occupancy Forecast</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Live Sensor</span>
                    </div>

                    {/* Day selector pills */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setPeakDay(d)}
                          className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                            d === peakDay
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    {/* Live Indicator calculated dynamically */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-2.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="font-bold text-slate-800 flex-1">Live: Nicht zu stark besucht</span>
                      <span className="font-mono font-bold text-slate-500">
                        {todayCheckInCount} / 120 ({Math.round((todayCheckInCount / 120) * 100)}%)
                      </span>
                    </div>

                    {/* Hourly Distribution Visual Bars */}
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Crowd Density Today</p>
                      <div className="flex items-end space-x-1.5 h-20 pt-4 px-1">
                        {[
                          { h: '06h', v: 20 },
                          { h: '09h', v: 45 },
                          { h: '12h', v: 35 },
                          { h: '15h', v: 50 },
                          { h: '18h', v: 85 },
                          { h: '20h', v: 65 },
                          { h: '22h', v: 25 },
                        ].map((bar) => (
                          <div key={bar.h} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full rounded-t-lg transition-all ${
                                bar.v > 75 ? 'bg-red-400' : bar.v > 40 ? 'bg-amber-400' : 'bg-slate-300'
                              }`}
                              style={{ height: `${bar.v}%` }}
                            ></div>
                            <span className="text-[10px] font-bold text-slate-400">{bar.h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Member Profile Quick Card */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Membership Status</h4>
                      <button
                        onClick={() => setAttendanceHistoryOpen(true)}
                        className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        History ({gymState.attendanceHistory.length})
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-slate-100">
                      <span className="text-slate-500">Current Plan</span>
                      <span className="text-slate-900 font-black">Quarterly Pro Athlete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold py-1 border-b border-slate-100">
                      <span className="text-slate-500">Active Streak</span>
                      <span className="text-emerald-700 font-black">{gymState.streakDays} Consecutive Days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold py-1">
                      <span className="text-slate-500">Assigned Coach</span>
                      <span className="text-slate-900 font-black">Alex Hunter (CSCS)</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* =========================================================
                WORKOUT TRACKER VIEW (DYNAMIC EXERCISE LOGGER)
            ========================================================== */}
            {activeTab === 'workout' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Exercise Hero Image & Live Timer */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 relative border border-slate-200 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-black text-slate-900">
                      ⚡ {gymState.activeWorkout.programTitle}
                    </div>

                    {/* Timer Controls */}
                    <div className="absolute bottom-5 left-5 flex items-center space-x-2">
                      <button
                        onClick={toggleTimerRunning}
                        className="bg-white/95 px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center space-x-2.5 shadow-lg cursor-pointer hover:bg-white transition"
                      >
                        <span className="text-amber-500 text-sm font-bold">
                          {gymState.activeWorkout.isRunning ? '⏸' : '▶'}
                        </span>
                        <span className="text-slate-900 text-base font-mono font-black tracking-wider">
                          ⏱ {formatTimer(gymState.activeWorkout.timerSeconds)}
                        </span>
                      </button>
                      <button
                        onClick={resetTimer}
                        title="Reset Timer"
                        className="bg-white/95 w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-lg cursor-pointer"
                      >
                        ↺
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">{gymState.activeWorkout.programTitle}</h2>
                      <p className="text-sm font-bold text-slate-500 mt-0.5">Target: Primary and Secondary Stabilizers</p>
                    </div>
                    <span className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 text-xs font-black text-slate-900">
                      {gymState.activeWorkout.sets.filter((s) => s.completed).length} of {gymState.activeWorkout.sets.length} Completed
                    </span>
                  </div>
                </div>

                {/* Right Side: Form Cues & Dynamic Set Logger Table */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* Form Cues */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Biomechanics & Form Cues</h3>
                    <div className="flex items-start space-x-3.5">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        1
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                        Grip the bar: Hold the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        2
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                        Hang with control: Start off the ground with your arms fully extended and scapulae retracted before driving upward.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Set Performance Table */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Exercise Sets</span>
                      <button
                        onClick={handleAddSet}
                        className="text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer transition"
                      >
                        + Add Set
                      </button>
                    </div>

                    <div className="flex justify-between py-1 px-2 text-[11px] font-black text-slate-400">
                      <span className="w-14">SET</span>
                      <span className="w-20 text-center">REPS</span>
                      <span className="w-24 text-center">WEIGHT</span>
                      <span className="w-20 text-right">ACTION</span>
                    </div>

                    {gymState.activeWorkout.sets.map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between py-2 px-2 border-b border-slate-50 text-xs sm:text-sm">
                        <span className="w-14 font-black text-slate-900">Set #{s.set}</span>
                        
                        {/* Inline Reps editor */}
                        <div className="w-20 flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleUpdateSetReps(idx, s.reps - 1)}
                            className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-800">{s.reps}</span>
                          <button
                            onClick={() => handleUpdateSetReps(idx, s.reps + 1)}
                            className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Inline Weight editor */}
                        <div className="w-24 text-center">
                          <input
                            type="text"
                            value={s.weight}
                            onChange={(e) => handleUpdateSetWeight(idx, e.target.value)}
                            className="w-20 text-center py-1 px-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div className="w-20 flex items-center justify-end space-x-1">
                          <button
                            onClick={() => toggleSetCompleted(idx)}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs text-center cursor-pointer transition ${
                              s.completed
                                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {s.completed ? '✓' : 'Log'}
                          </button>
                          {gymState.activeWorkout.sets.length > 1 && (
                            <button
                              onClick={() => handleDeleteSet(s.id)}
                              className="text-slate-300 hover:text-red-500 text-xs p-1"
                              title="Delete set"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Complete Workout Button */}
                  <button
                    onClick={handleFinishWorkout}
                    className="w-full py-4 rounded-2xl bg-slate-950 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    Finish Workout Session
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================
                STUDIO CHECK-IN TAB
            ========================================================== */}
            {activeTab === 'attendance' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Studio Attendance</h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1">
                      Touchless check-in and dynamic floor occupancy.
                    </p>
                  </div>
                  <button
                    onClick={() => setAttendanceHistoryOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
                  >
                    View History
                  </button>
                </div>

                <div
                  className="p-8 rounded-3xl shadow-lg transition-all relative overflow-hidden"
                  style={{ backgroundColor: gymState.activeCheckIn.isCheckedIn ? '#ffffff' : '#f43f5e' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">📱</span>
                    {gymState.activeCheckIn.isCheckedIn ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Session Active
                      </span>
                    ) : (
                      <span className="bg-white/20 text-white text-xs font-black px-3.5 py-1 rounded-full">
                        Touchless Mobile Check-In
                      </span>
                    )}
                  </div>

                  <h3 className={`text-3xl font-black tracking-tight ${gymState.activeCheckIn.isCheckedIn ? 'text-slate-900' : 'text-white'}`}>
                    {gymState.activeCheckIn.isCheckedIn ? 'Currently Checked In' : 'Studio Check-In'}
                  </h3>
                  <p className={`text-sm font-semibold mt-1 mb-6 ${gymState.activeCheckIn.isCheckedIn ? 'text-slate-500' : 'text-white/90'}`}>
                    {gymState.activeCheckIn.isCheckedIn
                      ? `Active gym floor duration: ${formatCheckInDuration(elapsedCheckInSeconds)}`
                      : 'Schnell einchecken und Training starten'}
                  </p>

                  <button
                    onClick={handleToggleCheckIn}
                    className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition cursor-pointer ${
                      gymState.activeCheckIn.isCheckedIn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {gymState.activeCheckIn.isCheckedIn ? 'Session Beenden / Check-Out' : 'QR Check-In öffnen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================
          MOBILE-ONLY BOTTOM NAVIGATION BAR (Hidden on md+ screens)
      ========================================================== */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex items-center justify-around z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-2xl flex items-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'home' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>🏠</span>
          {activeTab === 'home' && <span className="font-black text-xs">Home</span>}
        </button>

        <button
          onClick={() => setActiveTab('workout')}
          className={`px-4 py-2 rounded-2xl flex items-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'workout' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>🏋️</span>
          {activeTab === 'workout' && <span className="font-black text-xs">Workout</span>}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-2xl flex items-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'attendance' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>📱</span>
          {activeTab === 'attendance' && <span className="font-black text-xs">Check-In</span>}
        </button>

        <button
          onClick={() => setRoleModalOpen(true)}
          className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <span>👤</span>
        </button>
      </nav>

      {/* =========================================================
          MODAL 1: ROLE SWITCHER MODAL
      ========================================================== */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Switch Application Role</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Currently active: <span className="text-slate-950 font-black">{gymState.role}</span>
                </p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => { setGymState((prev) => ({ ...prev, role: 'MEMBER' })); setRoleModalOpen(false); }}
                className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition ${
                  gymState.role === 'MEMBER'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-3xl">🏋️</span>
                <div className="flex-1">
                  <p className="text-sm font-black">Martin Vance (Member View)</p>
                  <p className={`text-xs mt-0.5 ${gymState.role === 'MEMBER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Full Body Challenge, program cards, attendance QR check-in & workout logger.
                  </p>
                </div>
                {gymState.role === 'MEMBER' && <span className="text-amber-400 font-black text-lg">✓</span>}
              </div>

              <div
                onClick={() => { setGymState((prev) => ({ ...prev, role: 'TRAINER' })); setRoleModalOpen(false); }}
                className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition ${
                  gymState.role === 'TRAINER'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-3xl">💪</span>
                <div className="flex-1">
                  <p className="text-sm font-black">Alex Hunter (Trainer View)</p>
                  <p className={`text-xs mt-0.5 ${gymState.role === 'TRAINER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Assigned athletes roster, workout plan custom builder & athlete progress.
                  </p>
                </div>
                {gymState.role === 'TRAINER' && <span className="text-amber-400 font-black text-lg">✓</span>}
              </div>

              <div
                onClick={() => { setGymState((prev) => ({ ...prev, role: 'ADMIN' })); setRoleModalOpen(false); }}
                className={`p-4 rounded-2xl border flex items-center space-x-3.5 cursor-pointer transition ${
                  gymState.role === 'ADMIN'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <span className="text-3xl">👑</span>
                <div className="flex-1">
                  <p className="text-sm font-black">Sarah Connor (Admin View)</p>
                  <p className={`text-xs mt-0.5 ${gymState.role === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Revenue metrics, reception dynamic QR generator & Cloudflare Free-Tier monitor.
                  </p>
                </div>
                {gymState.role === 'ADMIN' && <span className="text-amber-400 font-black text-lg">✓</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: NOTIFICATIONS DRAWER
      ========================================================== */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Notifications & Broadcasts</h3>
                <p className="text-xs text-slate-500 font-semibold">Dynamic Cloudflare feed</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {gymState.notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 font-semibold">No notifications right now.</p>
              ) : (
                gymState.notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition relative ${
                      n.read ? 'bg-slate-50/70 border-slate-200' : 'bg-amber-50/60 border-amber-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-black text-slate-900">{n.title}</h4>
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        className="text-slate-400 hover:text-slate-600 text-xs ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-bold">
                      <span>By {n.author}</span>
                      <span>{n.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: CREATE NEW WORKOUT PROGRAM
      ========================================================== */}
      {newProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Workout Program</h3>
                <p className="text-xs text-slate-500 font-semibold">Saves dynamically to your program library</p>
              </div>
              <button
                onClick={() => setNewProgramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Bench & Dips"
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Category</label>
                  <select
                    value={newProgCategory}
                    onChange={(e: any) => setNewProgCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Arms">Arms</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Strength">Strength</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newProgDuration}
                    onChange={(e) => setNewProgDuration(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Sets & Reps Scheme</label>
                <input
                  type="text"
                  placeholder="e.g. 4 x 10 reps"
                  value={newProgSetsReps}
                  onChange={(e) => setNewProgSetsReps(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProgImage}
                  onChange={(e) => setNewProgImage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Focus on eccentric control and form..."
                  value={newProgDesc}
                  onChange={(e) => setNewProgDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition shadow-md cursor-pointer mt-2"
              >
                Save Program to Library
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: ONBOARD NEW MEMBER (ADMIN)
      ========================================================== */}
      {newMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Onboard New Member</h3>
                <p className="text-xs text-slate-500 font-semibold">Instantly creates account and updates revenue</p>
              </div>
              <button
                onClick={() => setNewMemberModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={newMemEmail}
                    onChange={(e) => setNewMemEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Membership Plan</label>
                  <select
                    value={newMemPlan}
                    onChange={(e: any) => setNewMemPlan(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                  >
                    <option value="Monthly All-Access">Monthly All-Access ($49/mo)</option>
                    <option value="Quarterly Pro Athlete">Quarterly Pro Athlete ($129/qtr)</option>
                    <option value="VIP Elite Annual">VIP Elite Annual ($399/yr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Fitness Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Lean muscle & conditioning"
                  value={newMemGoal}
                  onChange={(e) => setNewMemGoal(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition shadow-md cursor-pointer mt-2"
              >
                Register & Save to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: BROADCAST ANNOUNCEMENT
      ========================================================== */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Broadcast Gym Alert</h3>
                <p className="text-xs text-slate-500 font-semibold">Sends dynamic notification to all members</p>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Sauna Maintenance / New Class"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write message for athletes and members..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-md cursor-pointer mt-2"
              >
                Send Gym-Wide Broadcast
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: DYNAMIC RECEPTION QR CODE WITH LIVE 120S ROTATION
      ========================================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900">RECEPTION TOUCHLESS QR</span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* QR Mockup Canvas */}
            <div className="w-52 h-52 mx-auto bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center text-white relative shadow-inner">
              <div className="w-40 h-40 border-4 border-dashed border-amber-400 rounded-xl flex flex-col items-center justify-center">
                <span className="text-4xl mb-1">📱</span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300">
                  {qrToken.substring(0, 14)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-black text-slate-900">Scan at Entrance to Check In</p>
              <p className="text-[11px] font-bold text-slate-500">
                Rotates in: <span className="font-mono text-amber-600 font-black">{qrCountdown}s</span>
              </p>
            </div>

            <button
              onClick={() => {
                setQrToken(`TOKEN-D1-${Math.floor(1000 + Math.random() * 9000)}-SECRET`);
                setQrCountdown(120);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition"
            >
              Force Token Refresh
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 7: ATTENDANCE HISTORY
      ========================================================== */}
      {attendanceHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Attendance History</h3>
                <p className="text-xs text-slate-500 font-semibold">Persisted check-ins in Cloudflare D1</p>
              </div>
              <button
                onClick={() => setAttendanceHistoryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {gymState.attendanceHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 font-semibold">No attendance sessions logged yet.</p>
              ) : (
                gymState.attendanceHistory.map((att) => (
                  <div key={att.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black text-slate-900">{att.date} • In at {att.checkInTime}</p>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {att.checkOutTime ? `Out at ${att.checkOutTime} (${att.durationMinutes || 0} mins)` : 'Session actively in progress'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      att.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
