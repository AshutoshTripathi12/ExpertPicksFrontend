// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SearchBar from './components/SearchBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateRecommendationPage from './pages/CreateRecommendationPage';
import MyRecommendationsPage from './pages/MyRecommendationsPage';
import EditRecommendationPage from './pages/EditRecommendationPage';
import PublicProfilePage from './pages/PublicProfilePage';
import RecommendationDetailPage from './pages/RecommendationDetailPage';
import CollaborationRequestsPage from './pages/CollaborationRequestsPage';
import { getPendingRequestCount } from './services/collaboration.service';

// --- Navbar Component ---
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ====================================================================
  // ==> THIS IS THE MISSING LINE THAT NEEDS TO BE ADDED
  // ====================================================================
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // useEffect to fetch notification count when user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCount = async () => {
        try {
          const data = await getPendingRequestCount();
          setPendingRequestCount(data.pendingCount || 0);
        } catch (error) {
          console.error("Could not fetch notification count:", error);
          setPendingRequestCount(0); // Reset on error
        }
      };
      
      fetchCount(); // Fetch immediately on login
      
      const interval = setInterval(fetchCount, 60000); // Poll for new notifications every minute
      
      return () => clearInterval(interval); // Cleanup when component unmounts or user logs out
    } else {
      setPendingRequestCount(0); // Reset count on logout
    }
  }, [isAuthenticated]);

  return (
    <nav className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex-shrink-0 text-2xl font-bold text-text-main hover:text-indigo-600 transition-colors">
              ExpertPicks
            </Link>
          </div>
          <div className="hidden md:flex flex-grow justify-center px-4">
            <SearchBar />
          </div>
          <div className="hidden md:flex items-center justify-end">
            <div className="flex items-center ml-4 space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/my-recommendations" className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">My Recs</Link>
                  
                  <Link to="/collaboration-requests" className="relative px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">
                    <span>Requests</span>
                    {pendingRequestCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </Link>

                  <Link to="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">Profile</Link>
                  {user?.roles?.includes('ROLE_ADMIN') && ( <Link to="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">Admin</Link> )}
                  <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">Login</Link>
                  <Link to="/register" className="px-4 py-2 rounded-md text-sm font-medium text-primary-text bg-primary hover:bg-primary-hover shadow-sm">Sign Up</Link>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-text-main hover:bg-surface" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? ( <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> ) : ( <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg> )}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="p-4 border-y border-border-color"> <SearchBar /> </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile menu links */}
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Protected Route and Admin Route Components ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-500">Checking authentication...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-500">Checking authentication state...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user || !user.roles || !user.roles.includes('ROLE_ADMIN')) {
    alert("Access Denied: You do not have administrator privileges.");
    return <Navigate to="/" replace />;
  }
  return children;
};

// --- Main App Structure ---
function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto mt-6 mb-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/users/:userId" element={<PublicProfilePage />} />
          <Route path="/recommendations/:recommendationId" element={<RecommendationDetailPage />} />
          
          <Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute> } />
          <Route path="/create-recommendation" element={ <ProtectedRoute> <CreateRecommendationPage /> </ProtectedRoute> } />
          <Route path="/my-recommendations" element={ <ProtectedRoute> <MyRecommendationsPage /> </ProtectedRoute> } />
          <Route path="/edit-recommendation/:recommendationId" element={ <ProtectedRoute> <EditRecommendationPage /> </ProtectedRoute> } />
          
          <Route path="/collaboration-requests" element={ <ProtectedRoute> <CollaborationRequestsPage /> </ProtectedRoute> } />

          <Route path="/admin/dashboard" element={ <AdminRoute> <AdminDashboardPage /> </AdminRoute> }/>
        </Routes>
      </main>
      <footer className="bg-surface border-t border-border-color text-center p-6">
        <p className="text-sm text-text-muted">© {new Date().getFullYear()} ExpertPicks. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;