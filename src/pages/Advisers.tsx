import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Building2, Plus, ExternalLink } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { COLLEGES, DEPARTMENTS } from '../lib/constants';
import { useProjectStore } from '../store/projectStore';
import { useFacultyStore } from '../store/facultyStore';
import AddFacultyModal from '../components/AddFacultyModal';

const Faculty = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { projects } = useProjectStore();
  const { faculty, fetchFaculty, loading, error } = useFacultyStore();

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const getFacultyProjects = (facultyName) => {
    return projects.filter(project => project.adviser === facultyName);
  };

  const filteredFaculty = faculty
    .filter(member => 
      (!selectedCollege || member.college === selectedCollege) &&
      (!selectedDepartment || member.department === selectedDepartment) &&
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleViewDetails = (faculty) => {
    setSelectedFaculty({
      ...faculty,
      projects: getFacultyProjects(faculty.name)
    });
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search faculty..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setSelectedDepartment('');
              }}
            >
              <option value="">All Colleges</option>
              {COLLEGES.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
            {selectedCollege && DEPARTMENTS[selectedCollege as keyof typeof DEPARTMENTS] && (
              <select
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS[selectedCollege as keyof typeof DEPARTMENTS].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Faculty
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((faculty) => (
          <div key={faculty.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{faculty.name}</h3>
                  <p className="text-sm text-gray-500">{faculty.department}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{faculty.college}</span>
            </div>

            <button
              onClick={() => handleViewDetails(faculty)}
              className="w-full mt-2 flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Faculty Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg w-full max-w-3xl mx-4 p-6">
            {selectedFaculty && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-100 rounded-full p-4">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFaculty.name}</h2>
                    <p className="text-gray-600">{selectedFaculty.department}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedFaculty.projects.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                      <div className="divide-y divide-gray-100">
                        {selectedFaculty.projects.map((project) => (
                          <div key={project.id} className="py-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-md font-medium text-gray-900">{project.title}</h4>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                                {project.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-700">Group Members:</p>
                              <ul className="text-sm text-gray-600 pl-4">
                                {project.members.map((member, index) => (
                                  <li key={index} className="list-disc">{member}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No projects assigned yet</p>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>

      <AddFacultyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default Faculty;