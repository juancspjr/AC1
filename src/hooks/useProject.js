import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Contexto del Proyecto
const ProjectContext = createContext();

// Estados iniciales
const initialState = {
  currentProject: null,
  projectType: null,
  currentPhase: 1,
  completedPhases: [],
  isLoading: false,
  error: null,
  projects: [],
  seriesData: null
};

// Reducer para manejo de estado
const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_PROJECT_TYPE':
      return { 
        ...state, 
        projectType: action.payload.type,
        seriesData: action.payload.seriesData || null
      };
    
    case 'CREATE_PROJECT':
      const newProject = {
        id: uuidv4(),
        type: state.projectType,
        parentProjectId: action.payload.parentProjectId || null,
        seriesId: action.payload.seriesId || null,
        seriesName: action.payload.seriesName || null,
        chapterNumber: action.payload.chapterNumber || null,
        title: action.payload.title || '',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phase1Data: null,
        phase2Data: null,
        phase3Data: null,
        phase4Data: null,
        coherenceData: null
      };
      
      return {
        ...state,
        currentProject: newProject,
        currentPhase: 1,
        completedPhases: [],
        projects: [...state.projects, newProject]
      };
    
    case 'UPDATE_PROJECT':
      const updatedProject = { 
        ...state.currentProject, 
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
      
      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        )
      };
    
    case 'SET_CURRENT_PHASE':
      return { ...state, currentPhase: action.payload };
    
    case 'COMPLETE_PHASE':
      const newCompletedPhases = [...state.completedPhases];
      if (!newCompletedPhases.includes(action.payload)) {
        newCompletedPhases.push(action.payload);
      }
      
      return {
        ...state,
        completedPhases: newCompletedPhases,
        currentPhase: Math.min(action.payload + 1, 4)
      };
    
    case 'LOAD_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'LOAD_PROJECT':
      return { 
        ...state, 
        currentProject: action.payload,
        currentPhase: action.payload.currentPhase || 1,
        completedPhases: action.payload.completedPhases || []
      };
    
    case 'RESET_CURRENT_PROJECT_PHASE_DATA':
      return {
        ...state,
        currentProject: state.currentProject ? {
          ...state.currentProject,
          phase1Data: null,
          phase2Data: null,
          phase3Data: null,
          phase4Data: null,
          coherenceData: null
        } : null,
        currentPhase: 1,
        completedPhases: []
      };
    
    default:
      return state;
  }
};

// Provider del contexto
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Cargar proyectos al inicializar
  useEffect(() => {
    loadProjectsFromStorage();
  }, []);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    if (state.currentProject) {
      localStorage.setItem('currentProject', JSON.stringify(state.currentProject));
    }
    localStorage.setItem('projects', JSON.stringify(state.projects));
  }, [state.currentProject, state.projects]);

  const loadProjectsFromStorage = () => {
    try {
      const savedProjects = localStorage.getItem('projects');
      const savedCurrentProject = localStorage.getItem('currentProject');
      
      if (savedProjects) {
        dispatch({ type: 'LOAD_PROJECTS', payload: JSON.parse(savedProjects) });
      }
      
      if (savedCurrentProject) {
        dispatch({ type: 'LOAD_PROJECT', payload: JSON.parse(savedCurrentProject) });
      }
    } catch (error) {
      console.error('Error loading projects from storage:', error);
    }
  };

  const setProjectType = (type, seriesData = null) => {
    dispatch({ 
      type: 'SET_PROJECT_TYPE', 
      payload: { type, seriesData } 
    });
    // Resetear los datos de fase del proyecto actual al cambiar el tipo de proyecto
    resetCurrentProjectPhaseData();
  };

  const createProject = (projectData = {}) => {
    dispatch({ type: 'CREATE_PROJECT', payload: projectData });
  };

  const updateProject = (updates) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: updates });
  };

  const updatePhase1 = (phase1Data) => {
    updateProject({ phase1Data });
    dispatch({ type: 'COMPLETE_PHASE', payload: 1 });
  };

  const updatePhase2 = (phase2Data) => {
    updateProject({ phase2Data });
    dispatch({ type: 'COMPLETE_PHASE', payload: 2 });
  };

  const updatePhase3 = (phase3Data) => {
    updateProject({ phase3Data });
    dispatch({ type: 'COMPLETE_PHASE', payload: 3 });
  };

  const updatePhase4 = (phase4Data) => {
    updateProject({ phase4Data, status: 'completed' });
    dispatch({ type: 'COMPLETE_PHASE', payload: 4 });
  };

  const setCurrentPhase = (phase) => {
    dispatch({ type: 'SET_CURRENT_PHASE', payload: phase });
  };

  const getProjectById = (id) => {
    return state.projects.find(p => p.id === id);
  };

  const getSeriesProjects = (seriesId) => {
    return state.projects.filter(p => p.seriesId === seriesId);
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetCurrentProjectPhaseData = () => {
    dispatch({ type: 'RESET_CURRENT_PROJECT_PHASE_DATA' });
  };

  const value = {
    ...state,
    setProjectType,
    createProject,
    updateProject,
    updatePhase1,
    updatePhase2,
    updatePhase3,
    updatePhase4,
    setCurrentPhase,
    getProjectById,
    getSeriesProjects,
    setLoading,
    setError,
    loadProjectsFromStorage,
    resetCurrentProjectPhaseData
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook personalizado
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};