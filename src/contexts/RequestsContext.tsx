import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface Request {
  id: string;
  type: string;
  date: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  description?: string;
  files?: File[];
}

type RequestsAction = 
  | { type: 'ADD_REQUEST'; payload: Omit<Request, 'id' | 'date'> & { files?: File[] } }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { id: string; status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' } };

const requestsReducer = (state: Request[], action: RequestsAction): Request[] => {
  switch (action.type) {
    case 'ADD_REQUEST': {
      const newId = `REQ-${Date.now()}`;
      const newDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return [
        ...state,
        {
          id: newId,
          date: newDate,
          status: 'Pending' as const,
          type: action.payload.type,
          description: action.payload.description,
          files: action.payload.files
        }
      ];
    }
    case 'UPDATE_REQUEST_STATUS':
      return state.map(req => 
        req.id === action.payload.id 
          ? { ...req, status: action.payload.status }
          : req
      );
    default:
      return state;
  }
};

interface RequestsContextType {
  requests: Request[];
  dispatch: React.Dispatch<RequestsAction>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, dispatch] = useReducer(requestsReducer, []);

  useEffect(() => {
    const saved = localStorage.getItem('studentRequests');
    if (saved) {
      // Load saved requests
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studentRequests', JSON.stringify(requests));
  }, [requests]);

  return (
    <RequestsContext.Provider value={{ requests, dispatch }}>
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error('useRequests must be used within RequestsProvider');
  }
  return context;
};

