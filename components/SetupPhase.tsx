import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, BookOpen, Users, Sliders } from 'lucide-react';
import { Button } from './Button';

interface SetupPhaseProps {
  onComplete: (subjects: string[], studentCount: number, maxMarks: number) => void;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onComplete }) => {
  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Science']);
  const [newSubject, setNewSubject] = useState('');
  const [studentCount, setStudentCount] = useState<number>(5);
  const [maxMarks, setMaxMarks] = useState<number>(100);

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (subjects.length > 0 && studentCount > 0 && maxMarks > 0) {
      onComplete(subjects, studentCount, maxMarks);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Class Configuration</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Set up your assessment criteria to begin analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Size */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Initial Class Size</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="100"
              value={studentCount}
              onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border transition-colors"
            />
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Students</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">You can add more students later.</p>
        </div>

        {/* Max Marks */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Maximum Marks</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="10"
              max="1000"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseInt(e.target.value) || 0)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border transition-colors"
            />
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Points</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Applied to all subjects.</p>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Subjects</h3>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
            placeholder="E.g. History"
            className="block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border transition-colors"
          />
          <Button onClick={addSubject} variant="secondary" icon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {subjects.map((sub, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {sub}
              <button onClick={() => removeSubject(idx)} className="ml-2 text-indigo-400 dark:text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {subjects.length === 0 && (
            <p className="text-sm text-slate-400 italic">No subjects added yet.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext} 
          disabled={subjects.length === 0 || studentCount <= 0 || maxMarks <= 0}
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full md:w-auto"
        >
          Start Data Entry
        </Button>
      </div>
    </div>
  );
};