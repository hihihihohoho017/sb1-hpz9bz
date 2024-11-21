import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../lib/firebase';
import { ProjectStatus, PROJECT_STATUS, PROJECT_PROGRESS } from '../lib/constants';

interface DefenseDetails {
  panelMembers: string[];
  documenter: string;
  venue: string;
}

interface Project {
  id: string;
  title: string;
  college: string;
  department: string;
  adviser: string;
  members: string[];
  description: string;
  status: ProjectStatus;
  progress?: string;
  type: 'proposal' | 'final' | 'inventory';
  createdAt: Date;
  defenseSchedule?: Date;
  defenseResult?: 'passed' | 'failed';
  panelMembers?: string[];
  documenter?: string;
  venue?: string;
}

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  updateProjectProgress: (id: string, progress: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  scheduleDefense: (id: string, date: Date, details: DefenseDetails) => Promise<void>;
  setDefenseResult: (id: string, result: 'passed' | 'failed') => Promise<void>;
  searchSimilarProjects: (title: string) => Promise<Project []>;
  moveToFinals: (id: string) => Promise<void>;
  moveToInventory: (id: string) => Promise<void>;
  checkDefenseScheduleAvailability: (date: Date) => Promise<boolean>;
}

const handleFirebaseError = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred';
  
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action';
      case 'unavailable':
        return 'Currently operating in offline mode. Changes will sync when connection is restored.';
      case 'not-found':
        return 'The requested resource was not found';
      case 'failed-precondition':
        return 'Operation failed. Please try again.';
      case 'invalid-argument':
        return 'Invalid data provided. Please check your input.';
      default:
        console.error('Firebase Error:', error);
        return error.message || 'An error occurred while processing your request';
    }
  }

  if (error instanceof Error) {
    console.error('Error:', error);
    return error.message;
  }

  console.error('Unexpected Error:', error);
  return 'An unexpected error occurred while processing your request';
};

const validateProjectData = (project: Partial<Project>) => {
  if (!project) throw new Error('Project data is required');
  if (!project.title?.trim()) throw new Error('Project title is required');
  if (!project.college) throw new Error('College is required');
  if (!project.department) throw new Error('Department is required');
  if (!project.adviser) throw new Error('Adviser is required');
  if (!project.members?.length) throw new Error('At least one group member is required');
  if (!project.type) throw new Error('Project type is required');
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        defenseSchedule: doc.data().defenseSchedule?.toDate()
      })) as Project[];
      set({ projects, loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  addProject: async (project) => {
    set({ loading: true, error: null });
    try {
      validateProjectData(project);

      const similarProjects = await get().searchSimilarProjects(project.title);
      if (similarProjects.length > 0) {
        throw new Error('A similar project title already exists');
      }

      const projectData = {
        ...project,
        createdAt: Timestamp.now(),
        status: PROJECT_STATUS.PENDING,
        progress: PROJECT_PROGRESS.IN_PROGRESS
      };

      await addDoc(collection(db, 'projects'), projectData);
      await get().fetchProjects();
      set({ loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  updateProjectStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, { status });
      await get().fetchProjects();
      set({ loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  updateProjectProgress: async (id, progress) => {
    set({ loading: true, error: null });
    try {
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, { progress });
      await get().fetchProjects();
      set({ loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'projects', id));
      const newProjects = get().projects.filter(p => p.id !== id);
      set({ projects: newProjects, loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  scheduleDefense: async (id, date, details) => {
    set({ loading: true, error: null });
    try {
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, {
        defenseSchedule: Timestamp.fromDate(date),
        panelMembers: details.panelMembers,
        documenter: details.documenter,
        venue: details.venue,
        status: PROJECT_STATUS.APPROVED
      });
      
      // Update local state immediately
      const updatedProjects = get().projects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            defenseSchedule: date,
            panelMembers: details.panelMembers,
            documenter: details.documenter,
            venue: details.venue,
            status: PROJECT_STATUS.APPROVED
          };
        }
        return p;
      });
      
      set({ projects: updatedProjects, loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  setDefenseResult: async (id, result) => {
    set({ loading: true, error: null });
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');

      const updateData: any = {
        defenseResult: result,
        status: result === 'passed' ? PROJECT_STATUS.APPROVED : PROJECT_STATUS.REJECTED
      };

      if (project.type === 'proposal' && result === 'passed') {
        updateData.progress = PROJECT_PROGRESS.PROPOSAL_DEFENDED;
      } else if (project.type === 'final' && result === 'passed') {
        updateData.progress = PROJECT_PROGRESS.FINAL_DEFENDED;
      }

      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, updateData);

      // Update local state immediately
      const updatedProjects = get().projects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updateData
          };
        }
        return p;
      });

      set({ projects: updatedProjects, loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  moveToFinals: async (id) => {
    set({ loading: true, error: null });
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');

      const batch = writeBatch(db);

      const finalProject = {
        title: project.title,
        college: project.college,
        department: project.department,
        adviser: project.adviser,
        members: project.members,
        description: project.description,
        type: 'final',
        status: PROJECT_STATUS.PENDING,
        progress: PROJECT_PROGRESS.IN_PROGRESS,
        createdAt: Timestamp.now(),
        proposalId: id
      };

      const finalRef = doc(collection(db, 'projects'));
      batch.set(finalRef, finalProject);
      
      const proposalRef = doc(db, 'projects', id);
      batch.delete(proposalRef);

      await batch.commit();
      await get().fetchProjects();
      set({ loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  moveToInventory: async (id) => {
    set({ loading: true, error: null });
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');

      const batch = writeBatch(db);
      
      const inventoryData = {
        title: project.title,
        college: project.college,
        department: project.department,
        adviser: project.adviser,
        members: project.members,
        description: project.description,
        type: 'inventory',
        status: PROJECT_STATUS.APPROVED,
        progress: PROJECT_PROGRESS.FINAL_DEFENDED,
        createdAt: Timestamp.now(),
        originalId: id,
        panelMembers: project.panelMembers,
        documenter: project.documenter,
        venue: project.venue,
        defenseSchedule: project.defenseSchedule
      };

      const inventoryRef = doc(collection(db, 'projects'));
      batch.set(inventoryRef, inventoryData);
      
      const projectRef = doc(db, 'projects', id);
      batch.delete(projectRef);

      await batch.commit();

      // Update local state immediately
      const newProjects = get().projects.filter(p => p.id !== id);
      newProjects.unshift({ ...inventoryData, id: inventoryRef.id });
      set({ projects: newProjects, loading: false });
    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  searchSimilarProjects: async (title) => {
    try {
      if (!title || title.length < 3) return [];

      const normalizedTitle = title.toLowerCase().trim();
      const q = query(collection(db, 'projects'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        .filter(project => {
          const projectTitle = project.title.toLowerCase();
          return projectTitle.includes(normalizedTitle) || 
                 normalizedTitle.includes(projectTitle);
        });
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  checkDefenseScheduleAvailability: async (date) => {
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      
      const q = query(
        collection(db, 'projects'),
        where('defenseSchedule', '>=', Timestamp.fromDate(start)),
        where('defenseSchedule', '<=', Timestamp.fromDate(end))
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size < 4;
    } catch (error) {
      console.error('Availability check error:', error);
      return true;
    }
  }
}));