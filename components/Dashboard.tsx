import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RecipeGenerator } from './RecipeGenerator';
import { MealPlanner } from './MealPlanner';
import { DishVisualizer } from './DishVisualizer';
import { ProfilePage } from './ProfilePage';
import { RecipeFinder } from './RecipeFinder';

type View = 'recipe' | 'planner' | 'visualizer' | 'finder' | 'profile';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('recipe');
  const { logout, currentUser } = useAuth();

  const NavItem: React.FC<{ view: View; label: string; icon: JSX.Element }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors duration-200 ${
        activeView === view
          ? 'bg-green-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-green-100 hover:text-green-800'
      }`}
      aria-current={activeView === view ? 'page' : undefined}
    >
      {icon}
      {label}
    </button>
  );

  const viewContent = useMemo(() => {
    switch (activeView) {
      case 'recipe':
        return { title: 'Recipe Generator', component: <RecipeGenerator /> };
      case 'planner':
        return { title: 'Meal Planner', component: <MealPlanner /> };
      case 'visualizer':
        return { title: 'Dish Visualizer', component: <DishVisualizer /> };
      case 'finder':
        return { title: 'Recipe Finder', component: <RecipeFinder /> };
      case 'profile':
        return { title: 'User Profile', component: <ProfilePage /> };
      default:
        return { title: 'Recipe Generator', component: <RecipeGenerator /> };
    }
  }, [activeView]);

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 shadow-sm">
        <div className="flex items-center gap-3 px-2 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.5 13.63V8.81a7.5 7.5 0 0 0-5.4-7.23 7.5 7.5 0 0 0-9.6 7.23v4.82" />
                <path d="M19.5 13.63A4.5 4.5 0 0 1 15 18.13h-6a4.5 4.5 0 0 1-4.5-4.5v0" />
                <path d="M4.5 13.63V8.81" /><path d="M4.5 8.81A7.5 7.5 0 0 1 9.6 1.58" />
                <path d="M14.1 1.58A7.5 7.5 0 0 1 19.5 8.81" /><path d="M9 18.13h6" /><path d="M9 14h6" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI Kitchen</h1>
        </div>
        <nav className="flex-1 space-y-2">
            <NavItem view="recipe" label="Recipe Generator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>} />
            <NavItem view="planner" label="Meal Planner" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>} />
            <NavItem view="visualizer" label="Dish Visualizer" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>} />
            <NavItem view="finder" label="Recipe Finder" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>} />
             <NavItem view="profile" label="Profile" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} />
        </nav>
        <div className="mt-auto">
             <div className="px-2 py-3 mb-2 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
            <button
                onClick={logout}
                className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4">
                <h2 className="text-2xl font-bold text-gray-800">{viewContent.title}</h2>
            </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {viewContent.component}
        </main>
      </div>
    </div>
  );
};
