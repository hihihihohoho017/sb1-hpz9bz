import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ArrowRight, CheckCircle, XCircle, Users, Archive, AlertCircle, MapPin, FileText } from 'lucide-react';
import { PROJECT_PROGRESS, PROJECT_STATUS } from '../lib/constants';
import { useProjectStore } from '../store/projectStore';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onMoveToInventory?: (id: string) => void;
  showMoveToInventory?: boolean;
  error?: string | null;
}

const ProjectModal = ({ 
  isOpen, 
  onClose, 
  project: initialProject, 
  onMoveToInventory, 
  showMoveToInventory,
  error 
}: ProjectModalProps) => {
  const [showMoveToFinal, setShowMoveToFinal] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localProject, setLocalProject] = useState(initialProject);
  const { moveToFinals, setDefenseResult } = useProjectStore();

  // Update local project when initial project changes
  React.useEffect(() => {
    setLocalProject(initialProject);
  }, [initialProject]);

  if (!localProject) return null;

  const handleMoveToFinals = async () => {
    try {
      setLocalError('');
      await moveToFinals(localProject.id);
      onClose();
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleDefenseResult = async (result: 'passed' | 'failed') => {
    try {
      setLocalError('');
      await setDefenseResult(localProject.id, result);
      
      // Update local state immediately
      setLocalProject(prev => ({
        ...prev,
        defenseResult: result,
        status: result === 'passed' ? PROJECT_STATUS.APPROVED : PROJECT_STATUS.REJECTED,
        progress: result === 'passed' 
          ? (prev.type === 'proposal' 
              ? PROJECT_PROGRESS.PROPOSAL_DEFENDED 
              : PROJECT_PROGRESS.FINAL_DEFENDED)
          : prev.progress
      }));

      if (result === 'passed') {
        setShowMoveToFinal(true);
      }
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const getProgressBadge = () => {
    if (localProject.status === PROJECT_STATUS.APPROVED && !localProject.defenseResult) {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {localProject.progress || PROJECT_PROGRESS.IN_PROGRESS}
        </span>
      );
    }
    return null;
  };

  const getDefenseBadge = () => {
    if (localProject.defenseResult === 'passed') {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {localProject.type === 'final' ? 'Capstone Defended' : 'Proposal Defended'}
        </span>
      );
    } else if (localProject.defenseResult === 'failed') {
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Defense Failed
        </span>
      );
    }
    return null;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>

          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-4">
            {localProject.title}
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">College</h3>
              <p className="text-gray-600">{localProject.college}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Department</h3>
              <p className="text-gray-600">{localProject.department}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Group Members</h3>
              <ul className="list-disc list-inside text-gray-600">
                {localProject.members.map((member: string, index: number) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Adviser</h3>
              <p className="text-gray-600">{localProject.adviser}</p>
            </div>

            {localProject.defenseSchedule && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Defense Details</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    Schedule: {new Date(localProject.defenseSchedule).toLocaleDateString()} {new Date(localProject.defenseSchedule).toLocaleTimeString()}
                  </p>
                  
                  {localProject.venue && (
                    <p className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      Venue: {localProject.venue}
                    </p>
                  )}

                  {localProject.panelMembers && localProject.panelMembers.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Panel Members:</p>
                        <ul className="list-disc list-inside text-gray-600">
                          {localProject.panelMembers.map((member: string, index: number) => (
                            <li key={index}>{member}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {localProject.documenter && (
                    <p className="flex items-center text-gray-600">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      Documenter: {localProject.documenter}
                    </p>
                  )}

                  {!localProject.defenseResult && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleDefenseResult('passed')}
                        className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark as Passed
                      </button>
                      <button
                        onClick={() => handleDefenseResult('failed')}
                        className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Mark as Failed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-900">Status</h3>
              <div className="flex items-center flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    localProject.status === PROJECT_STATUS.PENDING
                      ? 'bg-yellow-100 text-yellow-800'
                      : localProject.status === PROJECT_STATUS.APPROVED
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {localProject.status}
                </span>
                {getProgressBadge()}
                {getDefenseBadge()}
              </div>
            </div>

            {(error || localError) && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error || localError}</p>
              </div>
            )}

            {localProject.type === 'proposal' && 
             localProject.status === PROJECT_STATUS.APPROVED && 
             localProject.defenseResult === 'passed' && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    This proposal has been successfully defended.
                  </p>
                  {!showMoveToFinal ? (
                    <button
                      onClick={() => setShowMoveToFinal(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Proceed to Final
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowMoveToFinal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleMoveToFinals}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showMoveToInventory && 
             localProject.type === 'final' && 
             localProject.status === PROJECT_STATUS.APPROVED && 
             localProject.defenseResult === 'passed' && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    This final project has been successfully defended.
                  </p>
                  <button
                    onClick={() => onMoveToInventory?.(localProject.id)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Move to Inventory
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProjectModal;