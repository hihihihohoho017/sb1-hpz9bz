import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

interface DefenseSchedulerProps {
  projectId: string;
  onScheduled: () => void;
}

export function DefenseScheduler({ projectId, onScheduled }: DefenseSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { scheduleDefense, loading } = useProjectStore();

  const handleScheduleDefense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    const date = new Date(selectedDate);
    if (date < new Date()) {
      setError('Cannot schedule defense for past dates');
      return;
    }

    try {
      await scheduleDefense(projectId, date);
      onScheduled();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <form onSubmit={handleScheduleDefense} className="space-y-4">
        <div>
          <label htmlFor="defenseDate" className="block text-sm font-medium text-gray-700">
            Select Defense Date
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="defenseDate"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? 'Scheduling...' : 'Schedule Defense'}
        </button>
      </form>
    </div>
  );
}