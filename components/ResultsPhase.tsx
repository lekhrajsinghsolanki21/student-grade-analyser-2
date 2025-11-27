import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { ArrowLeft, RefreshCcw, Trophy, AlertTriangle, CheckCircle, Download, FileText } from 'lucide-react';
import { Button } from './Button';
import { Student, AnalysisData, StudentResult, SubjectStats } from '../types';

interface ResultsPhaseProps {
  students: Student[];
  subjects: string[];
  maxMarks: number;
  onReset: () => void;
  onBack: () => void;
}

export const ResultsPhase: React.FC<ResultsPhaseProps> = ({ students, subjects, maxMarks, onReset, onBack }) => {

  // --- Calculations ---
  const analysisData: AnalysisData = useMemo(() => {
    const PASS_PERCENTAGE = 40; // 40% to pass
    
    // 1. Student Results
    const results: StudentResult[] = students.map(s => {
      const scores = Object.values(s.marks) as number[];
      const total = scores.reduce((a, b) => a + b, 0);
      const possibleTotal = subjects.length * maxMarks;
      
      // Calculate Percentage
      const percentage = possibleTotal > 0 ? (total / possibleTotal) * 100 : 0;
      
      return {
        student: s,
        total,
        percentage,
        status: percentage >= PASS_PERCENTAGE ? 'Pass' : 'Fail'
      };
    });

    // 2. Subject Stats
    const subjectStats: SubjectStats[] = subjects.map(sub => {
      const marks = students.map(s => s.marks[sub] || 0);
      const avgRaw = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
      
      // Normalize to percentage for chart
      const avgPercentage = (avgRaw / maxMarks) * 100;

      return {
        subject: sub,
        average: avgPercentage,
        highest: marks.length > 0 ? Math.max(...marks) : 0,
        lowest: marks.length > 0 ? Math.min(...marks) : 0
      };
    });

    // 3. Overall Stats
    const classAverage = results.length > 0 ? results.reduce((a, b) => a + b.percentage, 0) / results.length : 0;
    const passedCount = results.filter(r => r.status === 'Pass').length;
    const passPercentage = results.length > 0 ? (passedCount / results.length) * 100 : 0;
    const topPerformers = [...results].sort((a, b) => b.percentage - a.percentage).slice(0, 3);

    return { results, subjectStats, topPerformers, classAverage, passPercentage, maxMarks };
  }, [students, subjects, maxMarks]);

  const handleDownload = () => {
    // 1. Headers
    const headers = ['Enrollment No', 'Name', ...subjects, 'Total Score', 'Percentage', 'Status'];

    // 2. Rows
    const rows = analysisData.results.map(r => {
      const subjectMarks = subjects.map(sub => r.student.marks[sub] || 0);
      return [
        r.student.enrollmentNo,
        `"${r.student.name}"`, // Quote name to handle commas
        ...subjectMarks,
        r.total,
        r.percentage.toFixed(2),
        r.status
      ];
    });

    // 3. Combine
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // 4. Blob & Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `grade_report_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Analysis</h2>
          <p className="text-slate-600 dark:text-slate-400">Comprehensive report for {students.length} students (Max Marks: {maxMarks}).</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onBack} variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
            Edit Data
          </Button>
          <Button onClick={handleDownload} variant="primary" icon={<Download className="w-4 h-4" />}>
            Download Report
          </Button>
          <Button onClick={onReset} variant="ghost" icon={<RefreshCcw className="w-4 h-4" />}>
            New Class
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Class Average</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{analysisData.classAverage.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pass Rate</p>
          <p className={`text-3xl font-bold mt-2 ${analysisData.passPercentage >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {analysisData.passPercentage.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Highest Score</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
            {analysisData.results.length > 0 ? Math.max(...analysisData.results.map(r => r.percentage)).toFixed(1) : '0.0'}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Lowest Score</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
            {analysisData.results.length > 0 ? Math.min(...analysisData.results.map(r => r.percentage)).toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Subject Performance Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Subject Performance (Average %)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData.subjectStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      color: '#f8fafc'
                    }}
                  />
                  <Legend />
                  <Bar name="Avg %" dataKey="average" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Distribution Line Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Student Grade Distribution</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisData.results.sort((a,b) => a.percentage - b.percentage)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="student.name" hide /> 
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                    <RechartsTooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        color: '#f8fafc'
                      }}
                    />
                    <Line name="Percentage" type="monotone" dataKey="percentage" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
             <p className="text-xs text-center text-slate-400 mt-2">Students sorted by performance (Low to High)</p>
          </div>

          {/* Detailed Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Detailed Student Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Enrollment</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Percentage</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...analysisData.results].sort((a, b) => b.percentage - a.percentage).map((res) => (
                    <tr key={res.student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{res.student.enrollmentNo}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{res.student.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{res.percentage.toFixed(1)}%</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          res.status === 'Pass' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {res.status === 'Pass' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Top Performers */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 rounded-xl shadow-lg p-6 text-white border border-transparent dark:border-indigo-500/20">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <h3 className="text-lg font-bold">Top Performers</h3>
            </div>
            <div className="space-y-4">
              {analysisData.topPerformers.map((res, idx) => (
                <div key={res.student.id} className="flex items-center bg-white/10 dark:bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{res.student.name}</p>
                    <p className="text-indigo-200 text-xs">{res.student.enrollmentNo}</p>
                    <p className="text-indigo-100 font-bold text-sm">{res.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Data Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Export Report</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Download the complete class dataset for external records.
              </p>
            </div>
            
            <div className="p-6 flex-grow flex items-center justify-center">
              <Button 
                onClick={handleDownload} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                icon={<Download className="w-4 h-4" />}
              >
                Download CSV Report
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};