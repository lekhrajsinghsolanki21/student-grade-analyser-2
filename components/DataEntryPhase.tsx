import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart2, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Student } from '../types';

interface DataEntryPhaseProps {
  subjects: string[];
  maxMarks: number;
  studentCount: number;
  initialStudents: Student[];
  onBack: () => void;
  onAnalyze: (students: Student[]) => void;
}

export const DataEntryPhase: React.FC<DataEntryPhaseProps> = ({ 
  subjects, 
  maxMarks,
  studentCount,
  initialStudents,
  onBack, 
  onAnalyze 
}) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [error, setError] = useState<string | null>(null);

  // Initialize students if empty or handle new setups
  useEffect(() => {
    if (students.length === 0) {
      const generateEnrollment = (idx: number) => {
        const year = new Date().getFullYear();
        return `${year}-${String(idx + 1).padStart(3, '0')}`;
      };

      // Use the passed studentCount prop instead of hardcoded value
      const countToUse = studentCount > 0 ? studentCount : 5;
      
      const newStudents: Student[] = Array.from({ length: countToUse }, (_, i) => ({
        id: `st-${Date.now()}-${i}`,
        enrollmentNo: generateEnrollment(i),
        name: `Student ${i + 1}`,
        marks: subjects.reduce((acc, sub) => ({ ...acc, [sub]: 0 }), {})
      }));
      setStudents(newStudents);
    }
  }, []); // Run once on mount if empty

  const addStudent = () => {
    const year = new Date().getFullYear();
    const nextSeq = students.length + 1;
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      enrollmentNo: `${year}-${String(nextSeq).padStart(3, '0')}`,
      name: `Student ${nextSeq}`,
      marks: subjects.reduce((acc, sub) => ({ ...acc, [sub]: 0 }), {})
    };
    setStudents([...students, newStudent]);
  };

  const handleNameChange = (id: string, name: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleEnrollmentChange = (id: string, enrollmentNo: string) => {
    const trimmedEnrollment = enrollmentNo.trim();
    
    // Check for duplicates immediately
    const isDuplicate = students.some(s => s.id !== id && s.enrollmentNo.trim().toLowerCase() === trimmedEnrollment.toLowerCase());
    
    if (isDuplicate) {
      setError(`Enrollment number "${enrollmentNo}" must be unique.`);
    } else {
      // Only clear error if the current error is about enrollment
      if (error && error.includes('Enrollment')) {
        setError(null);
      }
    }

    setStudents(prev => prev.map(s => s.id === id ? { ...s, enrollmentNo } : s));
  };

  const handleMarkChange = (id: string, subject: string, markStr: string) => {
    setError(null);
    const mark = parseFloat(markStr);
    
    // Check constraints
    if (mark > maxMarks) {
      setError(`Marks cannot exceed maximum (${maxMarks})`);
      return; 
    }

    const validMark = isNaN(mark) ? 0 : Math.max(0, mark);
    
    setStudents(prev => prev.map(s => 
      s.id === id 
        ? { ...s, marks: { ...s.marks, [subject]: validMark } } 
        : s
    ));
  };

  const handleAnalyzeClick = () => {
    // Final Validation
    const enrollments = students.map(s => s.enrollmentNo.trim().toLowerCase());
    const uniqueEnrollments = new Set(enrollments);
    
    if (uniqueEnrollments.size !== enrollments.length) {
      setError("Cannot proceed: Duplicate enrollment numbers detected.");
      return;
    }

    if (error) return; // Don't proceed if there are other errors

    onAnalyze(students);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enter Student Grades</h2>
          <p className="text-slate-600 dark:text-slate-400">Input marks for {subjects.length} subjects.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Max Marks: <span className="font-semibold text-slate-900 dark:text-white">{maxMarks}</span>
          </span>
          {error && (
            <span className="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full animate-pulse border border-red-200 dark:border-red-900">
              <AlertCircle className="w-3 h-3 mr-1" />
              {error}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 whitespace-nowrap min-w-[140px]">
                  Enrollment No.
                </th>
                <th scope="col" className="px-6 py-3 sticky left-0 bg-slate-50 dark:bg-slate-950 z-10 w-48 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                  Student Name
                </th>
                {subjects.map(sub => (
                  <th key={sub} scope="col" className="px-6 py-3 min-w-[120px]">
                    {sub}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {students.map((student) => (
                <tr key={student.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-500 font-mono text-xs">
                    <input 
                      type="text" 
                      value={student.enrollmentNo}
                      onChange={(e) => handleEnrollmentChange(student.id, e.target.value)}
                      className="block w-full border-0 bg-transparent p-0 focus:ring-0 font-mono text-xs text-slate-900 dark:text-slate-300 placeholder-slate-400 focus:text-indigo-600 dark:focus:text-indigo-400"
                      placeholder="Enrollment #"
                    />
                  </td>
                  <td className="px-6 py-3 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-100 dark:border-slate-800">
                    <input 
                      type="text" 
                      value={student.name}
                      onChange={(e) => handleNameChange(student.id, e.target.value)}
                      className="block w-full border-0 bg-transparent p-0 focus:ring-0 font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:text-indigo-600 dark:focus:text-indigo-400"
                      placeholder="Enter Name"
                    />
                  </td>
                  {subjects.map(sub => {
                    const mark = student.marks[sub];
                    const isInvalid = mark > maxMarks;
                    return (
                      <td key={sub} className="px-6 py-3">
                        <input 
                          type="number" 
                          min="0"
                          max={maxMarks}
                          value={mark || ''} 
                          onChange={(e) => handleMarkChange(student.id, sub, e.target.value)}
                          className={`block w-full rounded-md shadow-sm sm:text-sm p-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border transition-colors
                            ${isInvalid 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'}`}
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer of table for Add button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={addStudent}
            className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student Row
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button onClick={handleAnalyzeClick} icon={<BarChart2 className="w-4 h-4" />}>
          Generate Analysis
        </Button>
      </div>
    </div>
  );
};