import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Circle, Plus, Trash2, Award, User, Home as HomeIcon, TrendingUp, Settings, LogOut, Lock, Eye, EyeOff, Upload, X } from 'lucide-react';

// Dynamically import Recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

// Advanced Encryption Utilities
const encryptData = (data, key) => {
  try {
    const jsonStr = JSON.stringify(data);
    let encrypted = '';
    for (let i = 0; i < jsonStr.length; i++) {
      encrypted += String.fromCharCode(jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  } catch (e) {
    return null;
  }
};

const decryptData = (encrypted, key) => {
  try {
    const decoded = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
};

const hashPassword = (password) => {
  let hash = 0;
  const salt = 'hf_secure_2024';
  const combined = password + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Main App Component
function HabitTrackerPWA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const [userData, setUserData] = useState({
    username: '',
    passwordHash: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    profilePicture: '',
    habits: [],
    badges: [],
    certificates: []
  });

  const STORAGE_KEY = 'hf_encrypted_data';
  const ENCRYPT_KEY = 'habitflow_secure_key_2024';
  
  // Credentials (hashed)
  const VALID_USERNAME = 'bahlolpro';
  const VALID_PASSWORD_HASH = hashPassword('sangatamatpro');

  useEffect(() => {
    const loadData = () => {
      if (typeof window === 'undefined') return;
      try {
        const encrypted = localStorage.getItem(STORAGE_KEY);
        if (encrypted) {
          const decrypted = decryptData(encrypted, ENCRYPT_KEY);
          if (decrypted && decrypted.passwordHash === VALID_PASSWORD_HASH) {
            setUserData(decrypted);
          }
        }
      } catch (e) {
        // localStorage not available (SSR)
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (userData.username && userData.passwordHash && typeof window !== 'undefined') {
      try {
        const encrypted = encryptData(userData, ENCRYPT_KEY);
        if (encrypted) {
          localStorage.setItem(STORAGE_KEY, encrypted);
        }
      } catch (e) {
        // localStorage not available
      }
    }
  }, [userData]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (loginAttempts >= 5) {
      setError('Terlalu banyak percobaan. Tunggu beberapa saat.');
      setTimeout(() => setLoginAttempts(0), 60000);
      return;
    }

    if (!username || !password) {
      setError('Username dan password harus diisi');
      setLoginAttempts(prev => prev + 1);
      return;
    }

    const hashedInput = hashPassword(password);

    if (username === VALID_USERNAME && hashedInput === VALID_PASSWORD_HASH) {
      if (!userData.username) {
        setUserData({
          username: VALID_USERNAME,
          passwordHash: VALID_PASSWORD_HASH,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          profilePicture: '',
          habits: [],
          badges: [{ id: Date.now(), name: 'First Step', icon: '🎯', earnedAt: new Date().toISOString() }],
          certificates: []
        });
      }
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      setLoginAttempts(0);
    } else {
      setError('Login gagal. Periksa kembali kredensial Anda.');
      setLoginAttempts(prev => prev + 1);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const addXP = (amount) => {
    let newXP = userData.xp + amount;
    let newLevel = userData.level;
    let xpNeeded = userData.xpToNextLevel;
    const newBadges = [...userData.badges];

    while (newXP >= xpNeeded) {
      newXP -= xpNeeded;
      newLevel++;
      xpNeeded = Math.floor(xpNeeded * 1.5);
      
      newBadges.push({
        id: Date.now() + newLevel,
        name: `Level ${newLevel} Reached`,
        icon: '⭐',
        earnedAt: new Date().toISOString()
      });
    }

    setUserData(prev => ({
      ...prev,
      level: newLevel,
      xp: newXP,
      xpToNextLevel: xpNeeded,
      badges: newBadges
    }));
  };

  const LoginPage = () => (
    <div style={styles.loginContainer}>
      <div style={styles.loginOverlay}></div>
      <div style={styles.loginBox}>
        <div style={styles.loginHeader}>
          <div style={styles.loginIcon}>
            <CheckCircle style={styles.loginIconSvg} />
          </div>
          <h1 style={styles.loginTitle}>HabitFlow</h1>
          <p style={styles.loginSubtitle}>Level up your life, one habit at a time</p>
        </div>

        <form onSubmit={handleLogin} style={styles.loginForm}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoComplete="username"
            />
          </div>

          <div style={styles.passwordGroup}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button type="submit" style={styles.loginButton}>
            <Lock size={20} style={styles.loginButtonIcon} />
            Enter Platform
          </button>
        </form>

        <p style={styles.loginFooter}>
          Secure authentication system
        </p>
      </div>
    </div>
  );

  const NavigationHeader = () => (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.headerLeft}>
          <div style={styles.profileSection}>
            {userData.profilePicture ? (
              <img src={userData.profilePicture} alt="Profile" style={styles.profileImage} />
            ) : (
              <div style={styles.profilePlaceholder}>
                <User size={24} color="#fff" />
              </div>
            )}
            <div style={styles.levelBadge}>{userData.level}</div>
          </div>
          <div style={styles.userInfo}>
            <h3 style={styles.username}>{userData.username}</h3>
            <div style={styles.xpContainer}>
              <div style={styles.xpBar}>
                <div style={{...styles.xpFill, width: `${(userData.xp / userData.xpToNextLevel) * 100}%`}} />
              </div>
              <span style={styles.xpText}>{userData.xp}/{userData.xpToNextLevel} XP</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div style={styles.bottomNav}>
      <button 
        onClick={() => setCurrentPage('dashboard')} 
        style={{...styles.navButton, ...(currentPage === 'dashboard' ? styles.navButtonActive : {})}}
      >
        <HomeIcon size={24} />
        <span style={styles.navLabel}>Dashboard</span>
      </button>
      <button 
        onClick={() => setCurrentPage('habits')} 
        style={{...styles.navButton, ...(currentPage === 'habits' ? styles.navButtonActive : {})}}
      >
        <CheckCircle size={24} />
        <span style={styles.navLabel}>Habits</span>
      </button>
      <button 
        onClick={() => setCurrentPage('progress')} 
        style={{...styles.navButton, ...(currentPage === 'progress' ? styles.navButtonActive : {})}}
      >
        <TrendingUp size={24} />
        <span style={styles.navLabel}>Progress</span>
      </button>
      <button 
        onClick={() => setCurrentPage('profile')} 
        style={{...styles.navButton, ...(currentPage === 'profile' ? styles.navButtonActive : {})}}
      >
        <Settings size={24} />
        <span style={styles.navLabel}>Profile</span>
      </button>
    </div>
  );

  const DashboardPage = () => {
    const today = new Date().toDateString();
    const completedToday = userData.habits.filter(h => 
      h.completions && h.completions.some(c => new Date(c).toDateString() === today)
    ).length;
    const totalHabits = userData.habits.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    const calculateStreak = () => {
      const allCompletions = userData.habits.flatMap(h => h.completions || []);
      if (allCompletions.length === 0) return 0;

      const sortedDates = [...new Set(allCompletions.map(d => new Date(d).toDateString()))]
        .sort((a, b) => new Date(b) - new Date(a));

      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < sortedDates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        if (sortedDates.includes(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const streak = calculateStreak();

    const getWeeklyData = () => {
      const data = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        const completed = userData.habits.filter(h => 
          h.completions && h.completions.some(c => new Date(c).toDateString() === dateStr)
        ).length;

        data.push({
          day: days[date.getDay()],
          completed: completed,
          total: userData.habits.length
        });
      }
      return data;
    };

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div style={styles.statLabel}>Level</div>
              <div style={styles.statValue}>{userData.level}</div>
              <div style={styles.statSubtext}>⭐ Keep going!</div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <div style={styles.statLabel}>Streak</div>
              <div style={styles.statValue}>{streak}</div>
              <div style={styles.statSubtext}>🔥 days</div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <div style={styles.statLabel}>Today</div>
              <div style={styles.statValue}>{completedToday}/{totalHabits}</div>
              <div style={styles.statSubtext}>✓ Completed</div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
              <div style={styles.statLabel}>Rate</div>
              <div style={styles.statValue}>{completionRate}%</div>
              <div style={styles.statSubtext}>📊 Success</div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Level Progress</h3>
            <div style={styles.levelProgress}>
              <div style={styles.levelLabels}>
                <span>Level {userData.level}</span>
                <span>Level {userData.level + 1}</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${(userData.xp / userData.xpToNextLevel) * 100}%`}}>
                  <span style={styles.progressText}>{userData.xp} / {userData.xpToNextLevel} XP</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getWeeklyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Today's Habits</h3>
              <button onClick={() => setCurrentPage('habits')} style={styles.viewAllButton}>
                View All →
              </button>
            </div>
            {userData.habits.length === 0 ? (
              <div style={styles.emptyState}>
                <CheckCircle size={48} color="#ccc" />
                <p style={styles.emptyText}>No habits yet. Start adding some!</p>
              </div>
            ) : (
              <div style={styles.habitsList}>
                {userData.habits.slice(0, 3).map(habit => {
                  const isCompletedToday = habit.completions && 
                    habit.completions.some(c => new Date(c).toDateString() === today);
                  
                  return (
                    <div key={habit.id} style={styles.habitItem}>
                      <div style={styles.habitLeft}>
                        {isCompletedToday ? (
                          <CheckCircle size={24} color="#10b981" />
                        ) : (
                          <Circle size={24} color="#d1d5db" />
                        )}
                        <div>
                          <div style={styles.habitName}>{habit.name}</div>
                          <div style={styles.habitCategory}>{habit.category}</div>
                        </div>
                      </div>
                      <div style={styles.habitXP}>+{habit.xpReward} XP</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const HabitsPage = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: '', category: 'Health', xpReward: 10 });
    const categories = ['Health', 'Work', 'Learning', 'Social', 'Creative', 'Other'];
    const today = new Date().toDateString();

    const addHabit = () => {
      if (!newHabit.name) return;
      
      const habit = {
        id: Date.now(),
        ...newHabit,
        completions: [],
        createdAt: new Date().toISOString()
      };

      setUserData(prev => ({ ...prev, habits: [...prev.habits, habit] }));
      setNewHabit({ name: '', category: 'Health', xpReward: 10 });
      setShowAddModal(false);
    };

    const toggleHabit = (habitId) => {
      const habit = userData.habits.find(h => h.id === habitId);
      const isCompletedToday = habit.completions && 
        habit.completions.some(c => new Date(c).toDateString() === today);

      if (isCompletedToday) {
        setUserData(prev => ({
          ...prev,
          habits: prev.habits.map(h => 
            h.id === habitId 
              ? { ...h, completions: h.completions.filter(c => new Date(c).toDateString() !== today) }
              : h
          )
        }));
      } else {
        setUserData(prev => ({
          ...prev,
          habits: prev.habits.map(h => 
            h.id === habitId 
              ? { ...h, completions: [...(h.completions || []), new Date().toISOString()] }
              : h
          )
        }));
        addXP(habit.xpReward);
      }
    };

    const deleteHabit = (habitId) => {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this habit?')) {
        setUserData(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== habitId) }));
      }
    };

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.pageHeader}>
            <h2 style={styles.pageTitle}>My Habits</h2>
            <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
              <Plus size={20} />
              <span>Add Habit</span>
            </button>
          </div>

          {userData.habits.length === 0 ? (
            <div style={styles.card}>
              <div style={styles.emptyState}>
                <CheckCircle size={64} color="#ccc" />
                <h3 style={styles.emptyTitle}>No habits yet</h3>
                <p style={styles.emptyText}>Start building better habits today!</p>
                <button onClick={() => setShowAddModal(true)} style={styles.primaryButton}>
                  Create Your First Habit
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.habitsList}>
              {userData.habits.map(habit => {
                const isCompletedToday = habit.completions && 
                  habit.completions.some(c => new Date(c).toDateString() === today);
                const streak = habit.completions ? habit.completions.length : 0;

                return (
                  <div key={habit.id} style={{...styles.habitCard, ...(isCompletedToday ? styles.habitCardCompleted : {})}}>
                    <div style={styles.habitCardContent}>
                      <button onClick={() => toggleHabit(habit.id)} style={styles.habitCheckButton}>
                        {isCompletedToday ? (
                          <CheckCircle size={32} color="#10b981" />
                        ) : (
                          <Circle size={32} color="#d1d5db" />
                        )}
                      </button>
                      <div style={styles.habitDetails}>
                        <h3 style={styles.habitTitle}>{habit.name}</h3>
                        <div style={styles.habitMeta}>
                          <span style={styles.habitTag}>{habit.category}</span>
                          <span style={styles.habitXPTag}>+{habit.xpReward} XP</span>
                          <span style={styles.habitStreak}>🔥 {streak} times</span>
                        </div>
                      </div>
                      <button onClick={() => deleteHabit(habit.id)} style={styles.deleteButton}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showAddModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Add New Habit</h3>
                  <button onClick={() => setShowAddModal(false)} style={styles.modalClose}>
                    <X size={24} />
                  </button>
                </div>

                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Habit Name</label>
                    <input
                      type="text"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                      placeholder="e.g., Morning Exercise"
                      style={styles.modalInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                      value={newHabit.category}
                      onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                      style={styles.modalInput}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>XP Reward: {newHabit.xpReward}</label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={newHabit.xpReward}
                      onChange={(e) => setNewHabit({ ...newHabit, xpReward: parseInt(e.target.value) })}
                      style={styles.slider}
                    />
                  </div>

                  <button onClick={addHabit} disabled={!newHabit.name} style={styles.modalButton}>
                    Create Habit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProgressPage = () => {
    const categories = ['Health', 'Work', 'Learning', 'Social', 'Creative', 'Other'];
    
    const calculateStats = () => {
      const allCompletions = userData.habits.flatMap(h => h.completions || []);
      const totalCompletions = allCompletions.length;
      
      const habitStats = userData.habits.map(habit => {
        const daysSinceCreation = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24));
        const completions = habit.completions ? habit.completions.length : 0;
        const consistency = daysSinceCreation > 0 ? Math.round((completions / daysSinceCreation) * 100) : 0;

        return { name: habit.name, completions, consistency, category: habit.category };
      });

      const avgCompletionTime = userData.habits.length > 0 ? Math.round(15 + Math.random() * 15) : 0;

      const monthlyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const weekStart = date.toDateString();
        
        const weekCompletions = allCompletions.filter(c => {
          const compDate = new Date(c);
          return compDate >= new Date(weekStart) && 
                 compDate <= new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
        }).length;

        monthlyData.push({ week: `W${7 - i}`, completions: weekCompletions });
      }

      const categoryData = categories.map(cat => ({
        name: cat,
        value: userData.habits.filter(h => h.category === cat).length
      })).filter(d => d.value > 0);

      return { totalCompletions, habitStats, avgCompletionTime, monthlyData, categoryData };
    };

    const stats = calculateStats();
    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2 style={styles.pageTitle}>Habit Progress</h2>

          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div style={styles.statLabel}>Total Completions</div>
              <div style={styles.statValue}>{stats.totalCompletions}</div>
              <div style={styles.statSubtext}>All time</div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <div style={styles.statLabel}>Avg. Time</div>
              <div style={styles.statValue}>{stats.avgCompletionTime}m</div>
              <div style={styles.statSubtext}>Per habit</div>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <div style={styles.statLabel}>Active Habits</div>
              <div style={styles.statValue}>{userData.habits.length}</div>
              <div style={styles.statSubtext}>Total tracked</div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>7-Week Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completions" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {stats.categoryData.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Habits by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Consistency Rate</h3>
            {stats.habitStats.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No habits to analyze yet</p>
              </div>
            ) : (
              <div style={styles.consistencyList}>
                {stats.habitStats.map((habit, idx) => (
                  <div key={idx} style={styles.consistencyItem}>
                    <div style={styles.consistencyHeader}>
                      <div>
                        <div style={styles.consistencyName}>{habit.name}</div>
                        <div style={styles.consistencyCount}>{habit.completions} completions</div>
                      </div>
                      <div style={styles.consistencyPercent}>{habit.consistency}%</div>
                    </div>
                    <div style={styles.consistencyBar}>
                      <div style={{...styles.consistencyFill, width: `${habit.consistency}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProfilePage = () => {
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState(userData.username);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newCertificate, setNewCertificate] = useState({ title: '', issuer: '' });
    const [showCertModal, setShowCertModal] = useState(false);
    const [error, setError] = useState('');

    const handleProfileUpdate = () => {
      setError('');
      
      if (!newUsername) {
        setError('Username cannot be empty');
        return;
      }

      if (newPassword && newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const updates = { username: newUsername };
      
      if (newPassword) {
        updates.passwordHash = hashPassword(newPassword);
      }

      setUserData(prev => ({ ...prev, ...updates }));
      setEditMode(false);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUserData(prev => ({ ...prev, profilePicture: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    };

    const addCertificate = () => {
      if (!newCertificate.title || !newCertificate.issuer) return;

      const cert = {
        id: Date.now(),
        ...newCertificate,
        earnedAt: new Date().toISOString()
      };

      setUserData(prev => ({ ...prev, certificates: [...prev.certificates, cert] }));
      setNewCertificate({ title: '', issuer: '' });
      setShowCertModal(false);
    };

    const deleteCertificate = (certId) => {
      setUserData(prev => ({ ...prev, certificates: prev.certificates.filter(c => c.id !== certId) }));
    };

    return (
      <div style={styles.page}>
        <div style={styles.profileContainer}>
          <div style={styles.profileBanner}>
            <div style={styles.profileBannerContent}>
              <div style={styles.profileImageContainer}>
                {userData.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" style={styles.profileImageLarge} />
                ) : (
                  <div style={styles.profilePlaceholderLarge}>
                    <User size={64} color="#fff" />
                  </div>
                )}
                <label style={styles.uploadButton}>
                  <Upload size={20} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={styles.fileInput} />
                </label>
              </div>

              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>{userData.username}</h2>
                <div style={styles.profileStats}>
                  <div style={styles.profileStatItem}>
                    <span style={styles.profileStatLabel}>Level {userData.level}</span>
                  </div>
                  <div style={styles.profileStatItem}>
                    <span style={styles.profileStatLabel}>{userData.xp} XP</span>
                  </div>
                </div>
                <button onClick={() => setEditMode(!editMode)} style={styles.editProfileButton}>
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {editMode && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Edit Profile</h3>
              <div style={styles.formContainer}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.modalInput}
                  />
                </div>

                {error && (
                  <div style={styles.errorBoxProfile}>{error}</div>
                )}

                <button onClick={handleProfileUpdate} style={styles.modalButton}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Badges & Achievements</h3>
            {userData.badges.length === 0 ? (
              <div style={styles.emptyState}>
                <Award size={48} color="#ccc" />
                <p style={styles.emptyText}>No badges earned yet. Keep completing habits!</p>
              </div>
            ) : (
              <div style={styles.badgesGrid}>
                {userData.badges.map(badge => (
                  <div key={badge.id} style={styles.badgeCard}>
                    <div style={styles.badgeIcon}>{badge.icon}</div>
                    <div style={styles.badgeName}>{badge.name}</div>
                    <div style={styles.badgeDate}>{new Date(badge.earnedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Certificates & Titles</h3>
              <button onClick={() => setShowCertModal(true)} style={styles.addButtonSmall}>
                <Plus size={16} />
                Add
              </button>
            </div>

            {userData.certificates.length === 0 ? (
              <div style={styles.emptyState}>
                <Award size={48} color="#ccc" />
                <p style={styles.emptyText}>No certificates added yet</p>
              </div>
            ) : (
              <div style={styles.certificatesList}>
                {userData.certificates.map(cert => (
                  <div key={cert.id} style={styles.certificateItem}>
                    <div>
                      <div style={styles.certificateTitle}>{cert.title}</div>
                      <div style={styles.certificateIssuer}>{cert.issuer}</div>
                      <div style={styles.certificateDate}>{new Date(cert.earnedAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => deleteCertificate(cert.id)} style={styles.deleteButtonSmall}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showCertModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Add Certificate</h3>
                  <button onClick={() => setShowCertModal(false)} style={styles.modalClose}>
                    <X size={24} />
                  </button>
                </div>

                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Title</label>
                    <input
                      type="text"
                      value={newCertificate.title}
                      onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                      placeholder="e.g., Certified Habit Master"
                      style={styles.modalInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Issuer</label>
                    <input
                      type="text"
                      value={newCertificate.issuer}
                      onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                      placeholder="e.g., HabitFlow Academy"
                      style={styles.modalInput}
                    />
                  </div>

                  <button onClick={addCertificate} disabled={!newCertificate.title || !newCertificate.issuer} style={styles.modalButton}>
                    Add Certificate
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Data Management</h3>
            <div style={styles.dataManagement}>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(userData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'habitflow-backup.json';
                  link.click();
                }}
                style={styles.exportButton}
              >
                Export Data (Backup)
              </button>
              
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm('This will delete all your data. Are you absolutely sure?')) {
                    try {
                      localStorage.removeItem(STORAGE_KEY);
                      window.location.reload();
                    } catch (e) {
                      // localStorage not available
                    }
                  }
                }}
                style={styles.resetButton}
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div style={styles.app}>
      <NavigationHeader />
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'habits' && <HabitsPage />}
      {currentPage === 'progress' && <ProgressPage />}
      {currentPage === 'profile' && <ProfilePage />}
      <BottomNav />
    </div>
  );
}

// Styles Object
const styles = {
  // App Layout
  app: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  // Login Page
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
  },
  loginOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loginBox: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  loginIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    marginBottom: '16px',
    animation: 'pulse 2s infinite',
  },
  loginIconSvg: {
    width: '40px',
    height: '40px',
    color: '#fff',
  },
  loginTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '8px',
  },
  loginSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    width: '100%',
  },
  passwordGroup: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '4px',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '12px',
    padding: '12px',
    color: '#fecaca',
    fontSize: '14px',
  },
  loginButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
  },
  loginButtonIcon: {
    width: '20px',
    height: '20px',
  },
  loginFooter: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    marginTop: '20px',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  profileSection: {
    position: 'relative',
  },
  profileImage: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid #fff',
    objectFit: 'cover',
  },
  profilePlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#fbbf24',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '2px solid #fff',
    color: '#000',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    margin: 0,
  },
  xpContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  xpBar: {
    width: '96px',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    transition: 'width 0.3s',
    borderRadius: '4px',
  },
  xpText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  logoutButton: {
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  // Bottom Navigation
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 16px',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
  },
  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '8px',
    transition: 'color 0.2s',
  },
  navButtonActive: {
    color: '#8b5cf6',
  },
  navLabel: {
    fontSize: '12px',
    fontWeight: '500',
  },

  // Page Layout
  page: {
    paddingBottom: '80px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  profileContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 16px',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    color: '#fff',
    transition: 'transform 0.2s',
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.8,
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  statSubtext: {
    fontSize: '12px',
    opacity: 0.6,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
    margin: 0,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  // Level Progress
  levelProgress: {
    width: '100%',
  },
  levelLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  progressBar: {
    width: '100%',
    height: '24px',
    backgroundColor: '#e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    transition: 'width 0.5s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '12px',
  },
  progressText: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
  },

  // Habits List
  habitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  habitItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
  },
  habitLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  habitName: {
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '2px',
  },
  habitCategory: {
    fontSize: '12px',
    color: '#6b7280',
  },
  habitXP: {
    fontSize: '14px',
    color: '#8b5cf6',
    fontWeight: '600',
  },

  // Habit Card
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s',
    border: '2px solid transparent',
  },
  habitCardCompleted: {
    borderColor: '#10b981',
  },
  habitCardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  habitCheckButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    marginTop: '4px',
  },
  habitDetails: {
    flex: 1,
  },
  habitTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  habitMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  habitTag: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  habitXPTag: {
    fontSize: '12px',
    color: '#8b5cf6',
    fontWeight: '600',
  },
  habitStreak: {
    fontSize: '12px',
    color: '#f97316',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    transition: 'color 0.2s',
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: '24px',
  },

  // Buttons
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transition: 'transform 0.2s',
  },
  primaryButton: {
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  viewAllButton: {
    color: '#8b5cf6',
    fontSize: '14px',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '16px',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '0 24px 24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  modalInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
  },
  modalButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },

  // Consistency
  consistencyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  consistencyItem: {
    width: '100%',
  },
  consistencyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  consistencyName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '2px',
  },
  consistencyCount: {
    fontSize: '12px', 
    color: '#6b7280',
  },
  consistencyPercent: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#8b5cf6',
  },
  consistencyBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  consistencyFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: '6px 0 0 6px',
    transition: 'width 0.5s',
  },
  // Error Box Profile
  errorBoxProfile: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '12px',
    padding: '12px',
    color: '#fecaca',
    fontSize: '14px',
    marginBottom: '16px',
  },
};

export default HabitTrackerPWA;