import { useState, useEffect, useMemo } from 'react';
import type { UserRole, AuthUser, WorkoutProgram, SetItem, GymMember, NotificationItem } from './types/gym';
import { loadGymState, saveGymState, type GymAppState } from './services/gymStorage';
import { LoginPage } from './components/LoginPage';
import {
  IconDashboard,
  IconDumbbell,
  IconQrCode,
  IconShield,
  IconBell,
  IconCheck,
  IconClose,
  IconPlay,
  IconPause,
  IconChevronRight,
} from './components/Icons';

export default function App() {
  // -------------------------------------------------------------
  // Persistent Gym State
  // -------------------------------------------------------------
  const [gymState, setGymState] = useState<GymAppState>(() => loadGymState());

  useEffect(() => {
    saveGymState(gymState);
  }, [gymState]);

  const handleLoginSuccess = (user: AuthUser, role: UserRole) => {
    setGymState((prev) => ({
      ...prev,
      role,
      auth: {
        isAuthenticated: true,
        user,
      },
    }));
    setActiveTab('home');
  };

  const handleSignOut = () => {
    setGymState((prev) => ({
      ...prev,
      auth: {
        isAuthenticated: false,
        user: null,
      },
    }));
    setRoleModalOpen(false);
  };

  // Navigation & Modals
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
  const [peakDay, setPeakDay] = useState('Thu');

  // -------------------------------------------------------------
  // Attendance Duration Tracker
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
              title: 'Check-Out Logged',
              message: `Your training session of ${durationMins} minutes was recorded. Active streak: ${prev.streakDays + 1} days.`,
              type: 'ATTENDANCE',
              createdAt: 'Just now',
              read: false,
              author: 'Front Desk',
            },
            ...prev.notifications,
          ],
        };
      });
    }
  };

  // -------------------------------------------------------------
  // Workout Stopwatch & Sets
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
          title: 'Workout Completed',
          message: `Completed ${completedCount} of ${totalCount} sets for ${gymState.activeWorkout.programTitle}.`,
          type: 'WORKOUT',
          createdAt: 'Just now',
          read: false,
          author: 'Workout Tracker',
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

    alert(`Workout completed!\n${completedCount} of ${totalCount} sets recorded.\nActive streak: ${gymState.streakDays + 1} days.`);
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
          title: `New Routine Added: ${newProg.title}`,
          message: `${newProg.category} • ${newProg.durationMin} minutes. Available in your program library.`,
          type: 'WORKOUT',
          createdAt: 'Just now',
          read: false,
          author: gymState.role === 'TRAINER' ? 'Coach Alex Hunter' : 'Studio Management',
        },
        ...prev.notifications,
      ],
    }));

    setNewProgTitle('');
    setNewProgDesc('');
    setNewProgramModalOpen(false);
  };

  // -------------------------------------------------------------
  // Dynamic Member Form State
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
          title: `Member Registered: ${newMem.name}`,
          message: `${newMem.plan} plan activated.`,
          type: 'ANNOUNCEMENT',
          createdAt: 'Just now',
          read: false,
          author: 'Front Desk',
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
  // Broadcast Announcement State
  // -------------------------------------------------------------
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: broadcastTitle.trim(),
      message: broadcastMsg.trim(),
      type: 'ANNOUNCEMENT',
      createdAt: 'Just now',
      read: false,
      author: 'Studio Management',
    };

    setGymState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));

    setBroadcastTitle('');
    setBroadcastMsg('');
    setBroadcastModalOpen(false);
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
  // Dynamic Reception QR Code (120s rotation)
  // -------------------------------------------------------------
  const [qrCountdown, setQrCountdown] = useState(120);
  const [qrToken, setQrToken] = useState('FP-8493-ACCESS');

  useEffect(() => {
    if (!qrModalOpen) return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setQrToken(`FP-${Math.floor(1000 + Math.random() * 9000)}-ACCESS`);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrModalOpen]);

  // Computed Metrics
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

  const filteredPrograms = useMemo(() => {
    if (selectedCategory === 'All Type') return gymState.programs;
    return gymState.programs.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [gymState.programs, selectedCategory]);

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

  if (!gymState.auth?.isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-amber-400 selection:text-black font-sans">
      
      {/* =========================================================
          TOP NAVIGATION BAR (Clean, Studio / Linear Style)
      ========================================================== */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm shrink-0">
              <img src="/fitpulse-logo.png" alt="FITPULSE Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-slate-900">FITPULSE</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                STUDIO
              </span>
            </div>
          </div>

          {/* Clean Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('workout')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'workout'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconDumbbell className="w-3.5 h-3.5" />
              <span>Workout</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconQrCode className="w-3.5 h-3.5" />
              <span>Check-In</span>
            </button>

            {gymState.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <IconShield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* User Profile, Notifications & Role Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Role Switcher Pill */}
            <button
              onClick={() => setRoleModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-slate-700 flex items-center space-x-1.5"
            >
              <span>{gymState.role === 'ADMIN' ? 'Admin' : gymState.role === 'TRAINER' ? 'Trainer' : 'Member'}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center relative cursor-pointer hover:bg-slate-50 transition text-slate-700"
              title="Notifications"
            >
              <IconBell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>

            {/* Profile Avatar */}
            <div
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 cursor-pointer"
              onClick={() => setRoleModalOpen(true)}
            >
              <img
                src={
                  gymState.role === 'MEMBER'
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
                    : gymState.role === 'TRAINER'
                    ? 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200'
                    : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {gymState.role === 'MEMBER' ? 'Martin Vance' : gymState.role === 'TRAINER' ? 'Alex Hunter' : 'Sarah Connor'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {gymState.role === 'MEMBER' ? 'Member' : gymState.role === 'TRAINER' ? 'Trainer' : 'Director'}
                </p>
              </div>
            </div>

            {/* Sign Out Action */}
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Sign Out"
            >
              Sign out
            </button>

          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT AREA
      ========================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">

        {/* =========================================================
            ADMIN VIEW
        ========================================================== */}
        {gymState.role === 'ADMIN' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Studio Operations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Membership analytics, access control, and roster</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNewMemberModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  New Member
                </button>
                <button
                  onClick={() => setBroadcastModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Send Announcement
                </button>
              </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Active Members</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeMembersCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">Verified accounts</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Training Routines</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{gymState.programs.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Active in library</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Today Check-Ins</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{todayCheckInCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">Floor visits today</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${dynamicRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Active subscriptions</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setQrModalOpen(true)}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Front Desk QR Scanner</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Generate active entrance code for turnstiles</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => setBroadcastModalOpen(true)}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Studio Announcement</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Notify members regarding schedules or facility updates</p>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Member Directory */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Member Directory</h3>
                  <p className="text-xs text-slate-500">Registered athletes and active plans</p>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {gymState.members.length} members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-medium">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Target Goal</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gymState.members.map((mem) => (
                      <tr key={mem.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{mem.name}</p>
                          <p className="text-[11px] text-slate-400">{mem.email}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{mem.plan}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{mem.fitnessGoal}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{mem.streakDays} days</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
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
              TRAINER VIEW
          ========================================================== */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trainer Studio</h2>
                <p className="text-xs text-slate-500 mt-0.5">Coach Alex Hunter • Athlete Roster & Program Management</p>
              </div>
              <button
                onClick={() => setNewProgramModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                + New Routine Template
              </button>
            </div>

            {/* Athlete Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gymState.members.map((mem) => (
                <div key={mem.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                      alt={mem.name}
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{mem.name}</h4>
                      <p className="text-xs text-slate-500">{mem.plan}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {mem.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-0.5">
                    <p className="text-slate-500 font-medium">Goal:</p>
                    <p className="text-slate-800 font-medium">{mem.fitnessGoal}</p>
                    <p className="text-slate-500 text-[11px] pt-1">Streak: {mem.streakDays} days</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => setAttendanceHistoryOpen(true)}
                      className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                    >
                      History
                    </button>
                    <button
                      onClick={() => {
                        setNewProgramModalOpen(true);
                        setNewProgTitle(`Custom Plan: ${mem.name}`);
                      }}
                      className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
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
              MEMBER VIEW (Clean, Responsive Multi-Column Layout)
          ========================================================== */
          <div>
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Main Column */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Hero Challenge Card */}
                  <div
                    onClick={() => setActiveTab('workout')}
                    className="w-full rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-[1.005]"
                    style={{ backgroundColor: '#fbbf24' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        TODAY'S WORKOUT
                      </span>
                    </div>

                    <div className="max-w-[70%] sm:max-w-[60%]">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight tracking-tight">
                        {gymState.activeWorkout.programTitle || 'Full Body Challenge'}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 mt-1.5 mb-5">
                        Scheduled program before 09:00 AM • 35 min
                      </p>

                      {/* Active Members */}
                      <div className="flex items-center -space-x-2">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                        <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center border-2 border-white text-[10px] font-bold">
                          +{activeMembersCount}
                        </div>
                        <span className="pl-3 text-xs font-semibold text-slate-900">Members training today</span>
                      </div>
                    </div>

                    <img
                      src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400"
                      className="absolute -right-2 sm:right-6 -bottom-6 w-40 sm:w-52 h-52 sm:h-64 object-cover pointer-events-none opacity-95"
                    />
                  </div>

                  {/* Clean Streak Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{gymState.streakDays} Days Active Streak</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {gymState.completedSessions.length} total workouts completed • Consistent progress
                      </p>
                    </div>
                    <IconChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Weekday Schedule Strip */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Weekly Schedule</h3>
                      <span className="text-xs text-slate-400">October 2026</span>
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
                            className={`py-3 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              {item.day}
                            </span>
                            <span className="text-sm font-bold mt-0.5">{item.date}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Programs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Daily Programs</h3>
                        <p className="text-xs text-slate-500">Available routines for today</p>
                      </div>
                      <button
                        onClick={() => setNewProgramModalOpen(true)}
                        className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200/80 cursor-pointer transition"
                      >
                        + Add Program
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                      {['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga', 'Strength', 'Back'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                            cat === selectedCategory
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Program Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredPrograms.map((prog) => (
                        <div
                          key={prog.id}
                          onClick={() => selectProgramForWorkout(prog)}
                          className="rounded-2xl bg-white p-3 border border-slate-200/80 shadow-sm hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                              <img src={prog.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                                  <IconPlay className="w-3.5 h-3.5 text-slate-900 ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                                {prog.category}
                              </span>
                            </div>
                            <h4 className="text-slate-900 font-semibold text-sm truncate">{prog.title}</h4>
                            <p className="text-slate-500 text-xs line-clamp-2 mt-0.5 mb-3">{prog.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 pt-2 border-t border-slate-100">
                            <span>{prog.durationMin} min</span>
                            <span>{prog.setsReps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Side Panel */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Studio Check-In Card */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Studio Check-In</h4>
                      <span className={`w-2 h-2 rounded-full ${gymState.activeCheckIn.isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {gymState.activeCheckIn.isCheckedIn ? 'Session Active' : 'Touchless Entry'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {gymState.activeCheckIn.isCheckedIn
                          ? `Floor duration: ${formatCheckInDuration(elapsedCheckInSeconds)}`
                          : 'Tap to record your studio arrival'}
                      </p>
                    </div>

                    <button
                      onClick={handleToggleCheckIn}
                      className={`w-full py-3 rounded-xl font-semibold text-xs transition cursor-pointer shadow-sm ${
                        gymState.activeCheckIn.isCheckedIn
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {gymState.activeCheckIn.isCheckedIn ? 'End Visit & Check Out' : 'Check In Now'}
                    </button>
                  </div>

                  {/* Peak Hours Timeline */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Peak Hours</h4>
                      <p className="text-xs text-slate-500">Average studio crowd density</p>
                    </div>

                    {/* Day selector pills */}
                    <div className="grid grid-cols-7 gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setPeakDay(d)}
                          className={`py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                            d === peakDay
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    {/* Density Visual Bars */}
                    <div className="pt-2">
                      <div className="flex items-end space-x-2 h-20 pt-2 px-1">
                        {[
                          { h: '6a', v: 25 },
                          { h: '9a', v: 55 },
                          { h: '12p', v: 40 },
                          { h: '3p', v: 50 },
                          { h: '6p', v: 85 },
                          { h: '8p', v: 65 },
                          { h: '10p', v: 20 },
                        ].map((bar) => (
                          <div key={bar.h} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                              className={`w-full rounded-t-sm transition-all ${
                                bar.v > 75 ? 'bg-amber-500' : 'bg-slate-200'
                              }`}
                              style={{ height: `${bar.v}%` }}
                            ></div>
                            <span className="text-[10px] text-slate-400">{bar.h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Membership Card */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membership</h4>
                      <button
                        onClick={() => setAttendanceHistoryOpen(true)}
                        className="text-xs text-slate-600 font-semibold hover:text-slate-900 cursor-pointer"
                      >
                        History ({gymState.attendanceHistory.length})
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-500">Tier</span>
                      <span className="text-slate-900 font-semibold">Quarterly Pro Athlete</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-500">Active Streak</span>
                      <span className="text-slate-900 font-semibold">{gymState.streakDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-500">Trainer</span>
                      <span className="text-slate-900 font-semibold">Alex Hunter</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* =========================================================
                WORKOUT TRACKER VIEW
            ========================================================== */}
            {activeTab === 'workout' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Exercise Hero Image & Live Timer */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-200/80 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-slate-900">
                      {gymState.activeWorkout.programTitle}
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                      <button
                        onClick={toggleTimerRunning}
                        className="bg-white/95 px-4 py-2 rounded-xl border border-slate-200 flex items-center space-x-2 shadow-sm cursor-pointer hover:bg-white transition text-slate-900 text-xs font-semibold"
                      >
                        {gymState.activeWorkout.isRunning ? <IconPause className="w-3.5 h-3.5" /> : <IconPlay className="w-3.5 h-3.5" />}
                        <span className="font-mono text-sm">{formatTimer(gymState.activeWorkout.timerSeconds)}</span>
                      </button>
                      <button
                        onClick={resetTimer}
                        title="Reset Timer"
                        className="bg-white/95 w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm cursor-pointer text-xs"
                      >
                        ↺
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{gymState.activeWorkout.programTitle}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Primary Target: Latissimus Dorsi & Posterior Chain</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {gymState.activeWorkout.sets.filter((s) => s.completed).length} of {gymState.activeWorkout.sets.length} sets logged
                    </span>
                  </div>
                </div>

                {/* Right Side: Form Cues & Set Logger */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Form Cues */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Form Cues</h3>
                    <div className="flex items-start space-x-3 text-xs text-slate-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <p>Overhand grip slightly wider than shoulder width. Retract scapulae prior to pull.</p>
                    </div>
                    <div className="flex items-start space-x-3 text-xs text-slate-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <p>Full extension at bottom. Drive elbows toward ribcage with controlled eccentric.</p>
                    </div>
                  </div>

                  {/* Set Performance Table */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-900">Target Sets</span>
                      <button
                        onClick={handleAddSet}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        + Add Set
                      </button>
                    </div>

                    <div className="flex justify-between py-1 text-[11px] font-medium text-slate-400">
                      <span className="w-12">SET</span>
                      <span className="w-20 text-center">REPS</span>
                      <span className="w-24 text-center">WEIGHT</span>
                      <span className="w-16 text-right">STATUS</span>
                    </div>

                    {gymState.activeWorkout.sets.map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
                        <span className="w-12 font-semibold text-slate-900">#{s.set}</span>
                        
                        <div className="w-20 flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleUpdateSetReps(idx, s.reps - 1)}
                            className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-medium text-slate-800">{s.reps}</span>
                          <button
                            onClick={() => handleUpdateSetReps(idx, s.reps + 1)}
                            className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        <div className="w-24 text-center">
                          <input
                            type="text"
                            value={s.weight}
                            onChange={(e) => handleUpdateSetWeight(idx, e.target.value)}
                            className="w-20 text-center py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
                          />
                        </div>

                        <div className="w-16 flex items-center justify-end space-x-1">
                          <button
                            onClick={() => toggleSetCompleted(idx)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                              s.completed
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {s.completed ? 'Done' : 'Log'}
                          </button>
                          {gymState.activeWorkout.sets.length > 1 && (
                            <button
                              onClick={() => handleDeleteSet(s.id)}
                              className="text-slate-300 hover:text-slate-600 p-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleFinishWorkout}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer shadow-sm"
                  >
                    Finish Workout
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Studio Check-In</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Front desk and turnstile arrival</p>
                </div>

                <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
                    <IconQrCode className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {gymState.activeCheckIn.isCheckedIn ? 'Checked In' : 'Ready to Check In'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {gymState.activeCheckIn.isCheckedIn
                        ? `Current visit duration: ${formatCheckInDuration(elapsedCheckInSeconds)}`
                        : 'Tap below to register your session at FITPULSE Studio.'}
                    </p>
                  </div>

                  <button
                    onClick={handleToggleCheckIn}
                    className={`w-full py-3.5 rounded-xl font-semibold text-xs transition cursor-pointer shadow-sm ${
                      gymState.activeCheckIn.isCheckedIn
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {gymState.activeCheckIn.isCheckedIn ? 'Check Out & Finish Visit' : 'Check In Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================
          MOBILE BOTTOM NAV
      ========================================================== */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex items-center justify-around z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
            activeTab === 'home' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'
          }`}
        >
          <IconDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('workout')}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
            activeTab === 'workout' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'
          }`}
        >
          <IconDumbbell className="w-4 h-4" />
          <span>Workout</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
            activeTab === 'attendance' ? 'text-slate-900 bg-slate-100' : 'text-slate-500'
          }`}
        >
          <IconQrCode className="w-4 h-4" />
          <span>Check-In</span>
        </button>

        <button
          onClick={() => setRoleModalOpen(true)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900"
        >
          <span className="text-xs font-semibold">Account</span>
        </button>
      </nav>

      {/* =========================================================
          NOTIFICATIONS MODAL (Clean, Human, High-End Style)
      ========================================================== */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">Updates and studio announcements</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 transition"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
              {gymState.notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No notifications at this time.</p>
              ) : (
                gymState.notifications.map((n) => (
                  <div
                    key={n.id}
                    className="pt-3 first:pt-0 pb-1 flex items-start justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">
                        {n.title.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '').trim()}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {n.author} • {n.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 text-xs p-1 transition cursor-pointer"
                      title="Dismiss"
                    >
                      <IconClose className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ROLE SWITCHER MODAL
      ========================================================== */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Switch Profile</h3>
                <p className="text-xs text-slate-500">Active account view</p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { role: 'MEMBER' as const, name: 'Martin Vance', label: 'Member View', desc: 'Workout tracker, daily programs, and attendance' },
                { role: 'TRAINER' as const, name: 'Alex Hunter', label: 'Trainer View', desc: 'Assigned athletes and program assignment' },
                { role: 'ADMIN' as const, name: 'Sarah Connor', label: 'Admin View', desc: 'Studio analytics, member roster, and announcements' },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => { setGymState((prev) => ({ ...prev, role: item.role })); setRoleModalOpen(false); }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    gymState.role === item.role
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold">{item.name} ({item.label})</p>
                    <p className={`text-[11px] mt-0.5 ${gymState.role === item.role ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </p>
                  </div>
                  {gymState.role === item.role && <IconCheck className="w-4 h-4 text-amber-400" />}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Want to switch account?</span>
              <button
                onClick={handleSignOut}
                className="text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ADD PROGRAM MODAL
      ========================================================== */}
      {newProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add Workout Routine</h3>
                <p className="text-xs text-slate-500">Save to studio program library</p>
              </div>
              <button
                onClick={() => setNewProgramModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1">Routine Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Bench & Dips"
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Category</label>
                  <select
                    value={newProgCategory}
                    onChange={(e: any) => setNewProgCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
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
                  <label className="block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newProgDuration}
                    onChange={(e) => setNewProgDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Sets & Reps</label>
                <input
                  type="text"
                  placeholder="e.g. 4 x 10 reps"
                  value={newProgSetsReps}
                  onChange={(e) => setNewProgSetsReps(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProgImage}
                  onChange={(e) => setNewProgImage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Focus on eccentric control and form..."
                  value={newProgDesc}
                  onChange={(e) => setNewProgDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer mt-2"
              >
                Save Routine
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          ADD MEMBER MODAL
      ========================================================== */}
      {newMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">New Member Registration</h3>
                <p className="text-xs text-slate-500">Create athlete profile</p>
              </div>
              <button
                onClick={() => setNewMemberModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
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
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">Plan</label>
                  <select
                    value={newMemPlan}
                    onChange={(e: any) => setNewMemPlan(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  >
                    <option value="Monthly All-Access">Monthly ($49)</option>
                    <option value="Quarterly Pro Athlete">Quarterly ($129)</option>
                    <option value="VIP Elite Annual">Annual ($399)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Training Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertrophy & mobility"
                  value={newMemGoal}
                  onChange={(e) => setNewMemGoal(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer mt-2"
              >
                Register Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          BROADCAST ALERT MODAL
      ========================================================== */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Studio Announcement</h3>
                <p className="text-xs text-slate-500">Post notice to all athletes and trainers</p>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holiday Schedule Update"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Notice details..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer mt-2"
              >
                Post Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          RECEPTION QR MODAL
      ========================================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">FRONT DESK PASS</span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <IconClose className="w-3 h-3" />
              </button>
            </div>

            <div className="w-44 h-44 mx-auto bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-white">
              <div className="w-36 h-36 border-2 border-dashed border-amber-400 rounded-lg flex flex-col items-center justify-center">
                <IconQrCode className="w-10 h-10 text-white mb-2" />
                <span className="text-[10px] font-mono text-amber-300 font-bold">{qrToken}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-900">Scan at Turnstile</p>
              <p className="text-[11px] text-slate-500">
                Rotates in: <span className="font-mono font-bold text-slate-900">{qrCountdown}s</span>
              </p>
            </div>

            <button
              onClick={() => {
                setQrToken(`FP-${Math.floor(1000 + Math.random() * 9000)}-ACCESS`);
                setQrCountdown(120);
              }}
              className="w-full py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
            >
              Refresh Pass
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          ATTENDANCE HISTORY MODAL
      ========================================================== */}
      {attendanceHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Attendance Log</h3>
                <p className="text-xs text-slate-500">Studio visits record</p>
              </div>
              <button
                onClick={() => setAttendanceHistoryOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100">
              {gymState.attendanceHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recorded visits yet.</p>
              ) : (
                gymState.attendanceHistory.map((att) => (
                  <div key={att.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{att.date} • {att.checkInTime}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {att.checkOutTime ? `Departed ${att.checkOutTime} (${att.durationMinutes || 0} min)` : 'Currently on gym floor'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {att.status === 'CHECKED_IN' ? 'Active' : 'Completed'}
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
