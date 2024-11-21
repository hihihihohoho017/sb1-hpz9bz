import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Calendar, X, AlertCircle, Clock, Users, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useProjectStore } from '../store/projectStore';
import { useFacultyStore } from '../store/facultyStore';

interface DefenseScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

const DefenseScheduleModal = ({ isOpen, onClose, project }: DefenseScheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [venue, setVenue] = useState('');
  const [panelSearch1, setPanelSearch1] = useState('');
  const [panelSearch2, setPanelSearch2] = useState('');
  const [panelSearch3, setPanelSearch3] = useState('');
  const [documenterSearch, setDocumenterSearch] = useState('');
  const [panelMember1, setPanelMember1] = useState('');
  const [panelMember2, setPanelMember2] = useState('');
  const [panelMember3, setPanelMember3] = useState('');
  const [documenter, setDocumenter] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [scheduledDefenses, setScheduledDefenses] = useState<number>(0);
  const { scheduleDefense, checkDefenseScheduleAvailability, projects } = useProjectStore();
  const { faculty, fetchFaculty } = useFacultyStore();

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const availableFaculty = faculty
    .filter(f => f.name !== project?.adviser)
    .map(f => f.name);

  const filteredPanel1 = availableFaculty
    .filter(f => 
      f.toLowerCase().includes(panelSearch1.toLowerCase()) &&
      f !== panelMember2 &&
      f !== panelMember3 &&
      f !== documenter
    );

  const filteredPanel2 = availableFaculty
    .filter(f => 
      f.toLowerCase().includes(panelSearch2.toLowerCase()) &&
      f !== panelMember1 &&
      f !== panelMember3 &&
      f !== documenter
    );

  const filteredPanel3 = availableFaculty
    .filter(f => 
      f.toLowerCase().includes(panelSearch3.toLowerCase()) &&
      f !== panelMember1 &&
      f !== panelMember2 &&
      f !== documenter
    );

  const filteredDocumenters = availableFaculty
    .filter(f => 
      f.toLowerCase().includes(documenterSearch.toLowerCase()) &&
      f !== panelMember1 &&
      f !== panelMember2 &&
      f !== panelMember3
    );

  useEffect(() => {
    const checkSchedule = async () => {
      if (selectedDate && selectedTime) {
        setIsChecking(true);
        setError('');
        setWarning('');
        
        try {
          const dateTime = new Date(`${selectedDate}T${selectedTime}`);
          const count = projects.filter(p => {
            if (!p.defenseSchedule) return false;
            const defenseDate = new Date(p.defenseSchedule);
            return defenseDate.toDateString() === dateTime.toDateString();
          }).length;
          
          setScheduledDefenses(count);
          
          if (count >= 4) {
            setError('This date has reached the maximum number of scheduled defenses (4)');
          } else if (count >= 3) {
            setWarning(`Warning: This date already has ${count} scheduled defenses`);
          }
          
          const isAvailable = await checkDefenseScheduleAvailability(dateTime);
          if (!isAvailable) {
            setError('This time slot is not available');
          }
        } catch (err) {
          setError('Failed to check schedule availability');
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkSchedule();
  }, [selectedDate, selectedTime, projects, checkDefenseScheduleAvailability]);

  const handleSchedule = async () => {
    try {
      setError('');
      
      if (!selectedDate || !selectedTime) {
        setError('Please select both date and time');
        return;
      }

      if (!venue.trim()) {
        setError('Please enter a venue');
        return;
      }

      if (!panelMember1 || !panelMember2) {
        setError('Please select at least two panel members');
        return;
      }

      if (!documenter) {
        setError('Please select a documenter');
        return;
      }

      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      if (dateTime < new Date()) {
        setError('Cannot schedule defense for past dates');
        return;
      }

      if (scheduledDefenses >= 4) {
        setError('Maximum number of defenses reached for this date');
        return;
      }

      const panelMembers = [panelMember1, panelMember2];
      if (panelMember3) {
        panelMembers.push(panelMember3);
      }

      await scheduleDefense(project.id, dateTime, {
        panelMembers,
        documenter,
        venue
      });
      onClose();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const timeSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = i + 9;
    return {
      value: `${hour.toString().padStart(2, '0')}:00`,
      label: format(new Date().setHours(hour, 0), 'h:mm a')
    };
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>

          <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
            Schedule Defense
          </Dialog.Title>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    min={today}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {timeSlots.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Enter venue"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Panel Members
              </label>
              
              {/* Panel Member 1 */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Panel Member 1"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={panelSearch1}
                  onChange={(e) => setPanelSearch1(e.target.value)}
                />
                {panelSearch1 && filteredPanel1.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {filteredPanel1.map((faculty) => (
                      <li
                        key={faculty}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setPanelMember1(faculty);
                          setPanelSearch1(faculty);
                        }}
                      >
                        {faculty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Panel Member 2 */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Panel Member 2"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={panelSearch2}
                  onChange={(e) => setPanelSearch2(e.target.value)}
                />
                {panelSearch2 && filteredPanel2.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {filteredPanel2.map((faculty) => (
                      <li
                        key={faculty}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setPanelMember2(faculty);
                          setPanelSearch2(faculty);
                        }}
                      >
                        {faculty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Panel Member 3 (Optional) */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Panel Member 3 (Optional)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={panelSearch3}
                  onChange={(e) => setPanelSearch3(e.target.value)}
                />
                {panelSearch3 && filteredPanel3.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {filteredPanel3.map((faculty) => (
                      <li
                        key={faculty}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setPanelMember3(faculty);
                          setPanelSearch3(faculty);
                        }}
                      >
                        {faculty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Documenter */}
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Documenter"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={documenterSearch}
                  onChange={(e) => setDocumenterSearch(e.target.value)}
                />
                {documenterSearch && filteredDocumenters.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                    {filteredDocumenters.map((faculty) => (
                      <li
                        key={faculty}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setDocumenter(faculty);
                          setDocumenterSearch(faculty);
                        }}
                      >
                        {faculty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {warning && !error && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{warning}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={!selectedDate || !selectedTime || !venue || !panelMember1 || !panelMember2 || !documenter || isChecking || !!error}
              >
                {isChecking ? 'Checking availability...' : 'Schedule Defense'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DefenseScheduleModal;