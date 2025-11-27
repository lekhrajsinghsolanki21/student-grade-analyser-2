import React, { useState, useEffect } from 'react';
import { GraduationCap, Moon, Sun, Database } from 'lucide-react';
import { SetupPhase } from './components/SetupPhase';
import { DataEntryPhase } from './components/DataEntryPhase';
import { ResultsPhase } from './components/ResultsPhase';
import { AppPhase, Student } from './types';

function App() {
  // State
  const [phase, setPhase] = useState<AppPhase>(AppPhase.SETUP);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [studentCount, setStudentCount] = useState<number>(5);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Theme & Database State
  const [darkMode, setDarkMode] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Initialize App (Theme, Database Mock)
  useEffect(() => {
    // Check local storage for theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Connect to "Database" (LocalStorage)
    const savedData = localStorage.getItem('gradewise_db');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSubjects(parsed.subjects || []);
        setStudents(parsed.students || []);
        setMaxMarks(parsed.maxMarks || 100);
        setStudentCount(parsed.studentCount || 5);
        setPhase(parsed.phase || AppPhase.SETUP);
        setDbConnected(true);
      } catch (e) {
        console.error("DB Load Error", e);
      }
    } else {
      setDbConnected(true);
    }
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Database Persistence Effect
  useEffect(() => {
    if (dbConnected) {
      localStorage.setItem('gradewise_db', JSON.stringify({
        subjects,
        students,
        maxMarks,
        studentCount,
        phase
      }));
    }
  }, [subjects, students, maxMarks, studentCount, phase, dbConnected]);

  const handleSetupComplete = (newSubjects: string[], count: number, max: number) => {
    setSubjects(newSubjects);
    setStudentCount(count);
    setMaxMarks(max);
    
    // Initialize empty students if starting fresh, or keep existing if matching count logic
    // But usually Setup resets data if changed significantly. 
    // For this flow, we'll re-initialize students in the Entry phase if empty.
    
    setPhase(AppPhase.ENTRY);
  };

  const handleAnalysis = (data: Student[]) => {
    setStudents(data);
    setPhase(AppPhase.RESULTS);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will clear all current class data.")) {
      setPhase(AppPhase.SETUP);
      setStudents([]);
      setSubjects([]);
      localStorage.removeItem('gradewise_db');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
                Student Grade Analyser
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Steps Indicator - Hidden on mobile */}
              <div className="hidden md:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                 {phase === AppPhase.SETUP && <span className="text-indigo-600 dark:text-indigo-400">Step 1: Configuration</span>}
                 {phase === AppPhase.ENTRY && <span className="text-indigo-600 dark:text-indigo-400">Step 2: Data Entry</span>}
                 {phase === AppPhase.RESULTS && <span className="text-indigo-600 dark:text-indigo-400">Step 3: Analysis</span>}
              </div>

              {/* User & Controls */}
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2" title="Database Connected">
                    <div className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <Database className="w-4 h-4 text-slate-400" />
                 </div>

                 <button 
                   onClick={toggleTheme}
                   className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                 >
                   {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        {phase === AppPhase.SETUP && (
          <SetupPhase onComplete={handleSetupComplete} />
        )}
        {phase === AppPhase.ENTRY && (
          <DataEntryPhase 
            subjects={subjects} 
            maxMarks={maxMarks}
            studentCount={studentCount}
            initialStudents={students} // Pass existing students if returning from DB or back button
            onBack={() => setPhase(AppPhase.SETUP)}
            onAnalyze={handleAnalysis}
          />
        )}
        {phase === AppPhase.RESULTS && (
          <ResultsPhase 
            students={students}
            subjects={subjects}
            maxMarks={maxMarks}
            onBack={() => setPhase(AppPhase.ENTRY)}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Student Grade Analyser. Connected to LocalDB.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;