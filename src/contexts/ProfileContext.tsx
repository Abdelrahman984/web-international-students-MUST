import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface ProfileState {
  isEditing: boolean;
  profile: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    nationality: string;
    gender: string;
    faculty: string;
    department: string;
    enrollmentDate: string;
    expectedGraduation: string;
    address: string;
    password?: string; // sensitive
  };
  documents: Array<{
    name: string;
    date: string;
    status: string;
    file?: File | null;
    preview?: string;
  }>;
}

type ProfileAction = 
  | { type: 'TOGGLE_EDIT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<ProfileState['profile']> }
  | { type: 'SAVE_PROFILE' }
  | { type: 'TOGGLE_PASSWORD' }
  | { type: 'ADD_DOCUMENT'; payload: { name: string; date: string; status: string; file?: File; preview?: string } }
  | { type: 'UPDATE_DOCUMENT_PREVIEW'; payload: { index: number; preview: string } };

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'TOGGLE_EDIT':
      return { ...state, isEditing: !state.isEditing };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload }
      };
    case 'SAVE_PROFILE':
      localStorage.setItem('profileData', JSON.stringify(state.profile));
      return state;
    case 'TOGGLE_PASSWORD':
      return {
        ...state,
        profile: {
          ...state.profile,
          password: state.profile.password ? undefined : '••••••••'
        }
      };
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload]
      };
    case 'UPDATE_DOCUMENT_PREVIEW': {
      const newDocs = [...state.documents];
      newDocs[action.payload.index] = {
        ...newDocs[action.payload.index],
        preview: action.payload.preview
      };
      return { ...state, documents: newDocs };
    }
    default:
      return state;
  }
};

const initialProfile: ProfileState = {
  isEditing: false,
  profile: {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@student.must.edu.eg',
    phone: '+20 123 456 7890',
    dob: '15 May 2002',
    nationality: 'Jordanian',
    gender: 'Male',
    faculty: 'Information Technology',
    department: 'Computer Science',
    enrollmentDate: 'September 2023',
    expectedGraduation: 'June 2027',
    address: 'Building 4, Al Motamayez District, 6th of October, Giza, Egypt'
  },
  documents: [
    { name: 'Passport Copy', date: 'Aug 10, 2023', status: 'Valid' },
    { name: 'Student Visa', date: 'Sep 05, 2024', status: 'Expiring Soon' },
    { name: 'High School Certificate', date: 'Aug 10, 2023', status: 'Verified' }
  ]
};

interface ProfileContextType {
  state: ProfileState;
  dispatch: React.Dispatch<ProfileAction>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialProfile);

  useEffect(() => {
    const saved = localStorage.getItem('profileData');
    if (saved) {
      dispatch({ type: 'UPDATE_PROFILE', payload: JSON.parse(saved) });
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ state, dispatch }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};

