import { create } from 'zustand';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLEGES, DEPARTMENTS } from '../lib/constants';

interface FacultyMember {
  id: string;
  name: string;
  college: string;
  department: string;
}

interface FacultyStore {
  faculty: FacultyMember[];
  loading: boolean;
  error: string | null;
  fetchFaculty: () => Promise<void>;
  addFaculty: (faculty: Omit<FacultyMember, 'id'>) => Promise<void>;
}

export const useFacultyStore = create<FacultyStore>((set, get) => ({
  faculty: [],
  loading: false,
  error: null,

  fetchFaculty: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'faculty'));
      const faculty = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FacultyMember[];
      set({ faculty, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addFaculty: async (facultyData) => {
    set({ loading: true, error: null });
    try {
      if (!COLLEGES.includes(facultyData.college)) {
        throw new Error('Invalid college selected');
      }

      const validDepartments = DEPARTMENTS[facultyData.college as keyof typeof DEPARTMENTS] || [];
      if (!validDepartments.includes(facultyData.department)) {
        throw new Error('Invalid department selected');
      }

      const q = query(
        collection(db, 'faculty'),
        where('name', '==', facultyData.name),
        where('department', '==', facultyData.department)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Faculty member already exists in this department');
      }

      await addDoc(collection(db, 'faculty'), facultyData);
      await get().fetchFaculty();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  }
}));