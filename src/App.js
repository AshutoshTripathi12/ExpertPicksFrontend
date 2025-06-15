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
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingRequestCount } from './services/collaboration.service';
import { pingBackend } from './services/health.service'; // Import the new ping service
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
// --- Navbar Component ---
const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ====================================================================
  // ==> THIS IS THE MISSING LINE THAT NEEDS TO BE ADDED
  // ====================================================================
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // useEffect to fetch notification count when user is logged in
 const canViewCollabRequests = user?.roles?.includes('ROLE_EXPERT_VERIFIED') || user?.roles?.includes('ROLE_BRAND_VERIFIED');

  useEffect(() => {
    // Only fetch count if the user is eligible to see the tab
    if (isAuthenticated && canViewCollabRequests) {
      const fetchCount = async () => {
        const data = await getPendingRequestCount();
        setPendingRequestCount(data.pendingCount || 0);
      };
      
      fetchCount();
      const interval = setInterval(fetchCount, 60000); // Poll every minute
      
      return () => clearInterval(interval);
    } else {
      setPendingRequestCount(0);
    }
  }, [isAuthenticated, canViewCollabRequests]);

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
                  
               {canViewCollabRequests && (
                    <Link to="/collaboration-requests" className="relative px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface">
                      <span>Requests</span>
                      {pendingRequestCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Link>
                  )}

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
          <div className="p-4 border-y border-border-color">
            <SearchBar />
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/create-recommendation" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">Add New</Link>
                <Link to="/my-recommendations" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">My Recommendations</Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">My Profile</Link>
                {user?.roles?.includes('ROLE_ADMIN') && (
                   <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-text-main hover:bg-surface">Sign Up</Link>
              </>
            )}
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
  const location = useLocation();
   // --- KEEP-ALIVE LOGIC (MOVED TO THE CORRECT LOCATION) ---
  useEffect(() => {
    // This function pings the backend
    const keepBackendAwake = () => {
      pingBackend()
        .then(data => console.log("Backend ping successful:", data.status))
        .catch(err => console.error("Backend ping failed. Server may be asleep.", err.message));
    };

    // Ping immediately when the application loads
    keepBackendAwake();

    // Set up an interval to ping every 2.5 minutes (150000 milliseconds)
    const intervalId = setInterval(keepBackendAwake, 150000);

    // This cleanup function runs when the app is closed.
    // It's important to clear the interval to prevent memory leaks.
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto mt-6 mb-6 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
         <Route path="/about" element={<AboutPage />}/>
           <Route path="/contact" element={<ContactPage />} /> {/* <-- ADD NEW ROUTE */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* <-- ADD NEW ROUTE */}
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
        </AnimatePresence>
      </main>
      <Footer />
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