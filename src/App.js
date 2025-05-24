import React, { useState, useEffect, useCallback, useContext } from 'react';

// Import Lucide icons
import {
    Home, Search, Compass, ShoppingBag, UserCircle, Settings, Edit3, PlusCircle, MessageCircle,
    Heart, Share2, Bookmark, MoreHorizontal, Grid, List, ExternalLink, AlertCircle, CheckCircle,
    UploadCloud, Link2, Tag, ArrowRight, X, Menu, Briefcase, LogIn, UserPlus, LogOut, Camera, ChevronLeft, Send, Info,
    Sparkles, Filter, ThumbsUp, Eye, Users as UsersIcon
} from 'lucide-react';

// --- Constants ---
const API_BASE_URL = 'http://localhost:8080/api'; // Ensure this matches your backend

// --- Notification Context ---
const NotificationContext = React.createContext(null);

// --- Helper Function: apiRequest ---
const apiRequest = async (url, method = 'GET', body = null, token = null, isFormData = false) => {
    const headers = {};
    if (!isFormData && body) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const config = { method, headers };
    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch (e) { errorData = await response.text(); }
            console.error("API Error Response:", url, response.status, errorData);
            throw new Error(errorData.message || errorData.error || errorData || `Request failed: ${response.status}`);
        }
        if (response.status === 204 || response.headers.get("content-length") === "0") return null;
        return response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
};

// --- Helper Function: compressImage ---
const compressImage = (file, quality = 0.6, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
                        else reject(new Error('Canvas toBlob returned null.'));
                    },
                    file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', quality
                );
            };
            img.onerror = (err) => reject(err);
            img.src = event.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

// --- Helper Function: callGeminiAPI ---
const callGeminiAPI = async (prompt) => {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Keep this empty or manage securely
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Gemini API Error Response Body:", errorBody);
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected Gemini API response structure:", result);
            throw new Error("Failed to extract text from Gemini API response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

// --- Main App Component ---
function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
    const [pageContext, setPageContext] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [pageTitle, setPageTitle] = useState('InfluenShop');
    const [showBackButton, setShowBackButton] = useState(false);
    const [previousPage, setPreviousPage] = useState(null);
    // --- NEW Global Search State ---
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // -----------------------------

    const addNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration);
    }, []);

    const navigate = useCallback((page, context = {}, options = {}) => {
        if (!['discover', 'shop'].includes(page)) {
           setIsSearchOpen(false);
           setGlobalSearchTerm('');
        }
        setCurrentPage(currentVal => {
            if (currentVal !== page || JSON.stringify(pageContext) !== JSON.stringify(context)) {
                setPreviousPage({ page: currentVal, context: pageContext, title: pageTitle, showBack: showBackButton });
            }
            return page;
        });
        setPageContext(context);
        setPageTitle(options.title || 'InfluenShop');
        setShowBackButton(options.showBackButton || false);
        window.scrollTo(0, 0);
    }, [pageContext, pageTitle, showBackButton]);

    const goBack = useCallback(() => {
        setIsSearchOpen(false);
        setGlobalSearchTerm('');
        if (previousPage) {
            const { page, context, title, showBack } = previousPage;
            setPreviousPage(null);
            setCurrentPage(page);
            setPageContext(context);
            setPageTitle(title);
            setShowBackButton(showBack);
        } else {
            navigate('home');
        }
    }, [previousPage, navigate]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        setJwtToken(null);
        setCurrentUser(null);
        setIsSearchOpen(false);
        setGlobalSearchTerm('');
        navigate('login');
        addNotification("Logged out successfully.", "info");
    }, [navigate, addNotification]);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setJwtToken(token);
            apiRequest('/influencers/profile', 'GET', null, token)
                .then(data => {
                    if (data && data.user) {
                        setCurrentUser({
                            id: data.user.id,
                            username: data.user.username,
                            role: data.user.role,
                            profilePictureUrl: data.profilePictureUrl
                        });
                    }
                })
                .catch(err => {
                    console.warn("Failed to fetch initial profile for UI:", err.message);
                    if (err.message?.toLowerCase().includes('unauthorized') || err.message?.toLowerCase().includes('401')) {
                        handleLogout();
                    }
                });
        }
    }, [jwtToken, handleLogout]);

    const handleLoginSuccess = (token, userDataFromLogin) => {
        localStorage.setItem('jwtToken', token);
        setJwtToken(token);
        apiRequest('/influencers/profile', 'GET', null, token)
            .then(profileData => {
                if (profileData && profileData.user) {
                    setCurrentUser({
                        id: profileData.user.id,
                        username: profileData.user.username,
                        role: profileData.user.role,
                        profilePictureUrl: profileData.profilePictureUrl
                    });
                    navigate('profile', {}, { title: profileData.user.username || 'Profile' });
                } else {
                    setCurrentUser(userDataFromLogin);
                    navigate('profile', {}, { title: userDataFromLogin?.username || 'Profile' });
                }
            })
            .catch(err => {
                console.error("Error fetching profile after login:", err);
                setCurrentUser(userDataFromLogin);
                navigate('profile', {}, { title: userDataFromLogin?.username || 'Profile' });
            });
    };

    const commonPageProps = { navigate, jwtToken, currentUser, API_BASE_URL, goBack, addNotification, globalSearchTerm, setGlobalSearchTerm };

    const renderPage = () => {
        if (!jwtToken && !['login', 'register', 'home', 'discover', 'shop', 'product-detail', 'profile'].includes(currentPage)) {
             if (currentPage === 'profile' && pageContext.id) {
                 return <InfluencerProfilePage {...commonPageProps} influencerId={pageContext.id} isOwnProfile={false} />;
            }
            navigate('login');
            return <LoginPage {...commonPageProps} onLoginSuccess={handleLoginSuccess} />;
        }

        switch (currentPage) {
            case 'home': return <HomePage {...commonPageProps} />;
            case 'discover': return <DiscoverPage {...commonPageProps} />;
            case 'shop': return <ShopPage {...commonPageProps} />;
            case 'add-post': return <AddProductPage {...commonPageProps} />;
            case 'profile':
                 const profileId = pageContext.id || currentUser?.id;
                 const isOwn = !pageContext.id || pageContext.id === currentUser?.id;
                 return <InfluencerProfilePage {...commonPageProps} influencerId={profileId} isOwnProfile={isOwn} />;
            case 'login': return <LoginPage {...commonPageProps} onLoginSuccess={handleLoginSuccess} />;
            case 'register': return <RegisterPage {...commonPageProps} onRegisterSuccess={() => navigate('login')} />;
            case 'edit-profile': return <EditInfluencerProfilePage {...commonPageProps} />;
            case 'product-detail': return <ProductDetailPage {...commonPageProps} productId={pageContext.id} setPageTitle={setPageTitle} setShowBackButton={setShowBackButton} />;
            default: return <NotFoundPage navigate={navigate} />;
        }
    };

    const showBottomNav = !['login', 'register', 'edit-profile'].includes(currentPage);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            <div className="flex flex-col h-screen font-sans bg-neutral-50 text-neutral-800">
                <TopBar
                    title={pageTitle}
                    showBackButton={showBackButton}
                    onBack={goBack}
                    navigate={navigate}
                    jwtToken={jwtToken}
                    currentUser={currentUser}
                    currentPage={currentPage}
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                    globalSearchTerm={globalSearchTerm}
                    setGlobalSearchTerm={setGlobalSearchTerm}
                />
                <main className={`flex-grow overflow-y-auto ${showBottomNav ? 'pb-16' : ''} pt-14 bg-white sm:bg-neutral-50`}>
                    <div className="mx-auto px-0 sm:px-0 py-0 sm:py-4">
                        {renderPage()}
                    </div>
                </main>
                {showBottomNav && <BottomNavigation currentPage={currentPage} navigate={navigate} currentUser={currentUser} />}
                <NotificationContainer notifications={notifications} />
            </div>
        </NotificationContext.Provider>
    );
}

// --- Reusable UI Component: NotificationContainer ---
const NotificationContainer = ({ notifications }) => {
    if (!notifications || notifications.length === 0) return null;
    return (
        <div className="fixed bottom-20 right-5 z-[100] space-y-2">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className={`p-3 rounded-md shadow-lg text-white text-xs sm:text-sm
                        ${n.type === 'success' ? 'bg-green-500' : ''}
                        ${n.type === 'error' ? 'bg-red-500' : ''}
                        ${n.type === 'info' ? 'bg-teal-500' : ''}
                        ${n.type === 'warning' ? 'bg-amber-500' : ''}
                    `}
                >
                    {n.type === 'success' && <CheckCircle className="inline mr-1.5" size={18} />}
                    {n.type === 'error' && <AlertCircle className="inline mr-1.5" size={18} />}
                    {n.type === 'info' && <Info className="inline mr-1.5" size={18} />}
                    {n.type === 'warning' && <AlertCircle className="inline mr-1.5" size={18} />}
                    {n.message}
                </div>
            ))}
        </div>
    );
};

// --- Reusable UI Component: Button ---
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, iconLeft, iconRight, fullWidth = false }) => {
    const baseStyles = `font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 ease-in-out inline-flex items-center justify-center shadow-sm hover:shadow ${fullWidth ? 'w-full' : ''}`;
    const variantStyles = {
        primary: `bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-400 ${disabled ? 'bg-teal-300 hover:bg-teal-300 cursor-not-allowed opacity-70' : ''}`,
        secondary: `bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400 ${disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-70' : ''}`,
        danger: `bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 ${disabled ? 'bg-red-300 cursor-not-allowed opacity-70' : ''}`,
        outline: `border border-neutral-300 text-neutral-700 hover:bg-neutral-100 focus:ring-teal-400 ${disabled ? 'border-neutral-200 text-neutral-400 cursor-not-allowed opacity-70' : ''}`,
        ghost: `bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-teal-400 ${disabled ? 'text-neutral-400 cursor-not-allowed opacity-70' : ''}`,
        accent: `bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400 ${disabled ? 'bg-rose-300 cursor-not-allowed opacity-70' : ''}`,
    };
    const sizeStyles = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
            {iconLeft && <span className={children ? "mr-2" : ""}>{iconLeft}</span>}
            {children}
            {iconRight && <span className={children ? "ml-2" : ""}>{iconRight}</span>}
        </button>
    );
};

// --- Reusable UI Component: Input ---
const Input = ({ type = 'text', placeholder, value, onChange, name, label, error, className = '', required = false, disabled = false, autoFocus = false }) => (
    <div className="w-full">
        {label && <label htmlFor={name} className="block text-xs font-medium text-neutral-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
        <input
            type={type} id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required} disabled={disabled} autoFocus={autoFocus}
            className={`w-full px-3 py-2 text-sm bg-neutral-100 border ${error ? 'border-red-400' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-teal-500 focus:border-teal-500'} transition-colors ${className} ${disabled ? 'bg-neutral-200 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

// --- Reusable UI Component: Textarea ---
const Textarea = ({ placeholder, value, onChange, name, label, error, className = '', rows = 3, required = false, disabled = false }) => (
    <div className="w-full">
        {label && <label htmlFor={name} className="block text-xs font-medium text-neutral-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
        <textarea
            id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} rows={rows} required={required} disabled={disabled}
            className={`w-full px-3 py-2 text-sm bg-neutral-100 border ${error ? 'border-red-400' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-teal-500 focus:border-teal-500'} transition-colors ${className} ${disabled ? 'bg-neutral-200 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

// --- Reusable UI Component: Modal ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-xl p-5 space-y-4 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100">
                        <X size={20} />
                    </button>
                </div>
                <div>{children}</div>
            </div>
            <style jsx global>{`
                @keyframes modalShow { to { opacity: 1; transform: scale(1); } }
                .animate-modalShow { animation: modalShow 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

// --- Reusable UI Component: LoadingSpinner ---
const LoadingSpinner = ({ size = "md", text = null, color = "border-neutral-700" }) => {
    const sizeClasses = { sm: "w-5 h-5 border-2", md: "w-7 h-7 border-[3px]", lg: "w-10 h-10 border-4" };
    return (
        <div className="flex flex-col items-center justify-center">
            <div className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}></div>
            {text && <p className="mt-2 text-sm text-neutral-500">{text}</p>}
        </div>
    );
};

// --- Reusable UI Component: ErrorDisplay ---
const ErrorDisplay = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md relative text-center text-sm" role="alert">
        <strong className="font-medium"><AlertCircle className="inline mr-1.5" /> Error: </strong>
        <span className="block sm:inline">{message || "Something went wrong."}</span>
        {onRetry && <Button onClick={onRetry} variant="danger" size="sm" className="mt-2.5">Try Again</Button>}
    </div>
);

// --- Navigation Component: TopBar (UPDATED) ---
const TopBar = ({ title, showBackButton, onBack, navigate, jwtToken, currentUser, currentPage, isSearchOpen, setIsSearchOpen, globalSearchTerm, setGlobalSearchTerm }) => {
    const { addNotification } = useContext(NotificationContext);
    const showSearchIcon = ['discover', 'shop'].includes(currentPage) && !isSearchOpen;
    const showLoginButton = !jwtToken && currentPage !== 'login' && currentPage !== 'register';

    const handleCancelSearch = () => {
        setIsSearchOpen(false);
        setGlobalSearchTerm('');
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 h-14 flex items-center justify-between px-4 z-50">
            {isSearchOpen ? (
                // --- Search View ---
                <div className="flex items-center w-full h-full">
                    <Search size={20} className="text-neutral-400 ml-1 mr-2 flex-shrink-0" />
                    <input
                        type="search"
                        placeholder="Search..."
                        value={globalSearchTerm}
                        onChange={(e) => setGlobalSearchTerm(e.target.value)}
                        className="flex-grow h-full bg-white border-none focus:ring-0 text-sm p-0 m-0"
                        name="globalSearch"
                        autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={handleCancelSearch} className="text-teal-600 px-3">
                        Cancel
                    </Button>
                </div>
            ) : (
                // --- Default View ---
                <>
                    <div className="flex items-center min-w-[60px]">
                        {showBackButton ? (
                            <button onClick={onBack} className="p-2 -ml-2 mr-2 text-neutral-700 hover:bg-neutral-100 rounded-full">
                                <ChevronLeft size={24} />
                            </button>
                        ) : (
                            <div onClick={() => navigate('home')} className="text-2xl font-bold font-['Lobster',_cursive] text-neutral-800 cursor-pointer">
                                InfluenShop
                            </div>
                        )}
                    </div>
                    <h1 className="text-md font-semibold text-neutral-800 absolute left-1/2 transform -translate-x-1/2 truncate max-w-[calc(100%-180px)]">
                        {title !== 'InfluenShop' ? title : ''}
                    </h1>
                    <div className="flex items-center space-x-1 sm:space-x-3 min-w-[60px] justify-end">
                        {showSearchIcon && (
                             <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsSearchOpen(true)}>
                                <Search size={24} />
                            </Button>
                        )}
                        {jwtToken ? (
                            <>
                                <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate('add-post', {}, { title: 'New Post', showBackButton: true })}>
                                    <PlusCircle size={24} />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-2" onClick={() => addNotification("Notifications coming soon!", "info")}>
                                    <Heart size={24} />
                                </Button>
                            </>
                        ) : (
                            showLoginButton && <Button onClick={() => navigate('login')} variant="primary" size="sm">Login</Button>
                        )}
                    </div>
                    <style jsx global>{`
                        @import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');
                        .font-\\[Lobster\\,_cursive\\] { font-family: 'Lobster', cursive; }
                    `}</style>
                </>
            )}
        </header>
    );
};

// --- Navigation Component: BottomNavigation ---
const BottomNavigation = ({ currentPage, navigate, currentUser }) => {
    const navItems = [
        { name: 'Home', path: 'home', icon: <Home size={26} />, activeIcon: <Home size={26} fill="currentColor"/> },
        { name: 'Discover', path: 'discover', icon: <Compass size={26} />, activeIcon: <Compass size={26} fill="currentColor"/> },
        { name: 'Shop', path: 'shop', icon: <ShoppingBag size={26} />, activeIcon: <ShoppingBag size={26} fill="currentColor"/> },
        {
            name: 'Profile', path: 'profile',
            icon: currentUser?.profilePictureUrl ? <img src={currentUser.profilePictureUrl} alt="profile" className={`w-7 h-7 rounded-full object-cover ${currentPage === 'profile' ? 'border-2 border-neutral-800': ''}`}/> : <UserCircle size={26} />,
            activeIcon: currentUser?.profilePictureUrl ? <img src={currentUser.profilePictureUrl} alt="profile" className="w-7 h-7 rounded-full object-cover border-2 border-neutral-800"/> : <UserCircle size={26} fill="currentColor"/>
        },
    ];
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 h-16 flex justify-around items-center z-50">
            {navItems.map(item => (
                <button
                    key={item.path}
                    onClick={() => {
                        if (item.path === 'profile') {
                            if (currentUser) navigate(item.path, { id: currentUser.id }, { title: currentUser.username || 'Profile' });
                            else navigate('login');
                        } else {
                            navigate(item.path, {}, {title: item.name === 'Home' ? 'InfluenShop' : item.name});
                        }
                    }}
                    className={`flex flex-col items-center justify-center h-full px-3 ${currentPage === item.path ? 'text-teal-600' : 'text-neutral-500 hover:text-neutral-700'} transition-colors`}
                >
                    {currentPage === item.path ? item.activeIcon : item.icon}
                </button>
            ))}
        </nav>
    );
};

// --- Page Component: HomePage (Feed) ---
const HomePage = ({ navigate, jwtToken, currentUser }) => {
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useContext(NotificationContext);

    useEffect(() => {
        const fetchFeedData = async () => {
            setLoading(true); setError('');
            try {
                const [influencersRes, productsRes] = await Promise.all([
                    apiRequest('/home/featured-influencers', 'GET', null, jwtToken).catch(e => { console.warn("Feed: Influencers fetch failed:", e.message); return []; }),
                    apiRequest('/home/trending-products', 'GET', null, jwtToken).catch(e => { console.warn("Feed: Products fetch failed:", e.message); return []; })
                ]);
                const combinedFeed = [];
                (influencersRes || []).slice(0, 3).forEach(inf => {
                    combinedFeed.push({ type: 'influencer_highlight', data: inf, id: `inflH-${inf.id}`, timestamp: new Date(Date.now() - Math.random() * 1e8).toISOString() });
                    (inf.products || []).slice(0, 2).forEach(prod => {
                        combinedFeed.push({ type: 'product_post', data: { ...prod, user: inf.user, profilePictureUrl: inf.profilePictureUrl }, id: `prod-${prod.id}`, timestamp: new Date(Date.now() - Math.random() * 1e8).toISOString() });
                    });
                });
                (productsRes || []).slice(0, 5).forEach(prod => {
                    if (!combinedFeed.find(item => item.id === `prod-${prod.id}`)) {
                        combinedFeed.push({ type: 'product_post', data: { ...prod, user: { username: "Popular Finds" } }, id: `prodG-${prod.id}`, timestamp: new Date(Date.now() - Math.random() * 1e8).toISOString() });
                    }
                });
                setFeedItems(combinedFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            } catch (err) { setError(err.message || 'Failed to load feed.'); }
            finally { setLoading(false); }
        };
        if (jwtToken) fetchFeedData();
        else setLoading(false);
    }, [jwtToken, addNotification]);

    if (loading) return <div className="mt-10"><LoadingSpinner /></div>;

    if (!jwtToken && !loading) {
        return (
            <div className="text-center py-20 px-4 text-neutral-500 max-w-md mx-auto">
                <Briefcase size={48} className="mx-auto mb-4 text-teal-500"/>
                <h2 className="text-xl font-semibold text-neutral-700 mb-2">Welcome to InfluenShop!</h2>
                <p className="mb-6">Log in or sign up to see your feed and discover products.</p>
                <div className="space-y-2">
                    <Button onClick={() => navigate('login')} variant="primary" fullWidth>Login</Button>
                    <Button onClick={() => navigate('register')} variant="outline" fullWidth>Sign Up</Button>
                </div>
            </div>
        );
    }
    if (error) return <div className="mt-10 px-4"><ErrorDisplay message={error} /></div>;

    return (
        <div className="max-w-xl mx-auto space-y-0 sm:space-y-4 sm:pt-0">
            {feedItems.length === 0 && !loading && (
                <div className="text-center py-20 text-neutral-500">
                    <Compass size={48} className="mx-auto mb-4"/>
                    <p className="text-lg">Your feed is empty.</p>
                    <Button onClick={() => navigate('discover')} variant="primary" className="mt-4">Discover Now</Button>
                </div>
            )}
            {feedItems.map(item => <PostCard key={item.id} item={item} navigate={navigate} /> )}
        </div>
    );
};

// --- UI Component: PostCard ---
const PostCard = ({ item, navigate }) => {
    const { addNotification } = useContext(NotificationContext);
    const postUser = item.type === 'influencer_highlight' ? item.data.user : item.data.user;
    const userToDisplay = postUser || { username: 'InfluenShop' };
    const imageAlt = item.type === 'influencer_highlight' ? userToDisplay.username : item.data.name;
    const imageUrl = item.type === 'influencer_highlight' ? item.data.profilePictureUrl : item.data.imageUrl;
    const defaultImageUrl = `https://placehold.co/600x400/E0E0E0/B0B0B0?text=${encodeURIComponent(imageAlt?.charAt(0) || '?')}`;
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 1000));

    const handleLike = () => { setIsLiked(!isLiked); setLikeCount(p => isLiked ? p - 1 : p + 1); addNotification(isLiked ? 'Unliked!' : 'Liked!', 'info'); };
    const navigateToDetail = () => {
        if (item.type === 'influencer_highlight') navigate('profile', { id: item.data.id }, { title: userToDisplay.username, showBackButton: true });
        else navigate('product-detail', { id: item.data.id }, { title: item.data.name, showBackButton: true });
    };
    const navigateToPosterProfile = () => {
        const id = userToDisplay?.id || (item.type === 'influencer_highlight' ? item.data.id : null);
        if (id) navigate('profile', { id: id }, { title: userToDisplay.username, showBackButton: true });
    };

    return (
        <div className="bg-white border-b border-neutral-200 sm:rounded-lg sm:border sm:shadow-sm">
            <div className="flex items-center p-3">
                <img src={userToDisplay.profilePictureUrl || `https://placehold.co/40x40/CBD5E1/475569?text=${userToDisplay.username?.charAt(0) || 'U'}`} alt={userToDisplay.username} className="w-8 h-8 rounded-full mr-3 object-cover cursor-pointer" onClick={navigateToPosterProfile} />
                <span className="font-semibold text-sm text-neutral-800 cursor-pointer hover:underline" onClick={navigateToPosterProfile}>{userToDisplay.username}</span>
            </div>
            <div className="w-full aspect-[4/5] bg-neutral-100 cursor-pointer" onClick={navigateToDetail}>
                <img src={imageUrl || defaultImageUrl} alt={imageAlt} className="w-full h-full object-cover" onError={(e) => e.target.src = defaultImageUrl} />
            </div>
            <div className="flex items-center p-3 space-x-3">
                <button onClick={handleLike} className={`hover:opacity-70 ${isLiked ? 'text-red-500' : 'text-neutral-700'}`}><Heart size={24} fill={isLiked ? "currentColor" : "none"} /></button>
                <button onClick={() => addNotification("Comments (mocked)", "info")} className="text-neutral-700 hover:opacity-70"><MessageCircle size={24} /></button>
                <button onClick={() => addNotification("Share (mocked)", "info")} className="text-neutral-700 hover:opacity-70"><Send size={24} /></button>
                <button onClick={() => addNotification("Bookmarked! (mocked)", "info")} className="ml-auto text-neutral-700 hover:opacity-70"><Bookmark size={24} /></button>
            </div>
            <div className="px-3 pb-2 text-sm">
                {likeCount > 0 && <p className="font-semibold text-neutral-800 mb-1">{likeCount.toLocaleString()} likes</p>}
                {item.type === 'influencer_highlight' && <p className="text-neutral-800"><span className="font-semibold cursor-pointer" onClick={navigateToPosterProfile}>{userToDisplay.username}</span> {item.data.profileBio?.substring(0, 100) || 'Check out my profile!'}</p>}
                {item.type === 'product_post' && <>
                    <p className="text-neutral-800"><span className="font-semibold cursor-pointer" onClick={navigateToPosterProfile}>{userToDisplay.username}</span> recommends <span className="font-semibold cursor-pointer" onClick={navigateToDetail}>{item.data.name}</span></p>
                    {item.data.description && <p className="text-neutral-600 mt-1 text-xs">{item.data.description.substring(0, 70)}...</p>}
                    {item.data.price && <p className="text-xs text-green-600 font-medium mt-0.5">${parseFloat(item.data.price).toFixed(2)}</p>}
                    <button onClick={navigateToDetail} className="text-teal-600 hover:underline text-xs mt-1 inline-block font-medium">View product details</button>
                </>}
                <p className="text-xs text-neutral-400 mt-2 uppercase">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

// --- Page Component: DiscoverPage (UPDATED) ---
const DiscoverPage = ({ navigate, jwtToken, globalSearchTerm }) => {
    const [influencers, setInfluencers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const { addNotification } = useContext(NotificationContext);
    const genres = ["Beauty", "Tech", "Fashion", "Fitness", "Travel", "Gaming", "Food", "Books", "Home Decor"];

    const fetchData = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const influencerParams = selectedGenre ? `?genre=${encodeURIComponent(selectedGenre)}` : '';
            const [influencerData, productData] = await Promise.all([
                apiRequest(`/influencers${influencerParams}`, 'GET', null, jwtToken),
                apiRequest(`/home/trending-products${influencerParams}`, 'GET', null, jwtToken) // Assuming genre can apply here too
            ]);
            setInfluencers(influencerData || []);
            setProducts(productData || []);
        } catch (err) {
            setError(`Failed to fetch data: ${err.message}.`);
            addNotification(`Failed to fetch data: ${err.message}`, 'error');
            setInfluencers([]); setProducts([]);
        } finally { setLoading(false); }
    }, [jwtToken, addNotification, selectedGenre]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const searchTerm = globalSearchTerm.toLowerCase();
    const filteredInfluencers = influencers.filter(inf =>
        inf.user?.username?.toLowerCase().includes(searchTerm) ||
        inf.profileBio?.toLowerCase().includes(searchTerm) ||
        inf.genre?.toLowerCase().includes(searchTerm)
    );
    const filteredProducts = products.filter(prod =>
        prod.name?.toLowerCase().includes(searchTerm) ||
        prod.description?.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="space-y-4">
            <div className="p-3 bg-white border-b border-neutral-200">
                 <h3 className="text-xs font-semibold text-neutral-500 mb-2">Filter by Genre:</h3>
                 <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2 custom-scrollbar">
                    <Button size="sm" variant={selectedGenre === '' ? "primary" : "outline"} onClick={() => setSelectedGenre('')} className="text-xs flex-shrink-0">All</Button>
                    {genres.map(genre => <Button key={genre} size="sm" variant={selectedGenre === genre ? "primary" : "outline"} onClick={() => setSelectedGenre(genre)} className="text-xs flex-shrink-0">{genre}</Button>)}
                </div>
            </div>

            {error && <div className="px-4 mt-4"><ErrorDisplay message={error} onRetry={fetchData} /></div>}
            {loading && <div className="mt-10"><LoadingSpinner /></div>}
            {!loading && !error && filteredInfluencers.length === 0 && filteredProducts.length === 0 && (
                <div className="text-center py-10 px-4">
                    <Search size={40} className="mx-auto text-neutral-400 mb-3" />
                    <p className="text-neutral-500">No results found {searchTerm && `for "${globalSearchTerm}"`}.</p>
                </div>
            )}

            {filteredInfluencers.length > 0 && (
                <div className="px-0 sm:px-0">
                    <h2 className="text-sm font-semibold text-neutral-500 mb-2 px-3 sm:px-0">Influencers {selectedGenre && `in ${selectedGenre}`}</h2>
                    <div className="grid grid-cols-1 gap-0 bg-white">
                        {filteredInfluencers.map(inf => <InfluencerDiscoverCard key={`inf-${inf.id}`} influencer={inf} navigate={navigate} />)}
                    </div>
                </div>
            )}

            {filteredProducts.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-sm font-semibold text-neutral-500 mb-1 px-3 sm:px-0">Products {selectedGenre && `in ${selectedGenre}`}</h2>
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                        {filteredProducts.map(prod => <ProductGridItem key={`prod-${prod.id}`} product={prod} navigate={navigate} />)}
                    </div>
                </div>
            )}
             <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #ccc #f1f1f1; }
            `}</style>
        </div>
    );
};

// --- UI Component: InfluencerDiscoverCard ---
const InfluencerDiscoverCard = ({ influencer, navigate }) => {
    const placeholderAvatar = `https://placehold.co/48x48/CCFBF1/0D9488?text=${influencer.user?.username?.charAt(0) || 'U'}`;
    return (
        <div className="flex items-center p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer" onClick={() => navigate('profile', { id: influencer.id }, { title: influencer.user?.username, showBackButton: true })}>
            <img src={influencer.profilePictureUrl || placeholderAvatar} alt={influencer.user?.username} className="w-10 h-10 rounded-full mr-3 object-cover" onError={(e) => e.target.src = placeholderAvatar} />
            <div className="flex-grow"><p className="font-semibold text-sm">{influencer.user?.username}</p><p className="text-xs text-neutral-500 truncate">{influencer.genre || influencer.profileBio?.substring(0, 40)}</p></div>
            <Button size="sm" variant="outline" className="text-xs" onClick={(e) => e.stopPropagation()}>Follow</Button>
        </div>
    );
};

// --- Page Component: AddProductPage ---
const AddProductPage = ({ navigate, jwtToken, currentUser, goBack }) => {
    const [productName, setProductName] = useState('');
    const [affiliateLink, setAffiliateLink] = useState('');
    const [productImageFile, setProductImageFile] = useState(null);
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [price, setPrice] = useState('');
    const [genre, setGenre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const { addNotification } = useContext(NotificationContext);
    const productGenres = ["Beauty", "Tech", "Fashion", "Fitness", "Home", "Books", "Gadgets", "Travel Gear", "Food & Drink", "Other"];

    useEffect(() => {
        if (!jwtToken || currentUser?.role !== 'INFLUENCER') {
            addNotification("Access denied.", "warning"); goBack();
        }
    }, [jwtToken, currentUser, addNotification, goBack]);

    const handleGenerateDescription = async () => { /* ... (keep as is) ... */ };
    const handleSubmit = async (e) => { /* ... (keep as is) ... */ };

    if (!currentUser || currentUser.role !== 'INFLUENCER') return <div className="p-4 text-center"><Info size={48} className="mx-auto mb-4 text-teal-500"/><p>For influencers only.</p></div>;

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-xl font-semibold mb-6">List New Product</h1>
            {error && <ErrorDisplay message={error} />}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-medium mb-1">Product Image *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md hover:border-teal-400">
                        <div className="space-y-1 text-center">
                            {productImageFile ? <img src={URL.createObjectURL(productImageFile)} alt="Preview" className="max-h-32 mx-auto rounded"/> : <Camera size={36} className="mx-auto text-neutral-400" />}
                            <div className="flex text-xs"><label htmlFor="file-upload" className="cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500"><input id="file-upload" type="file" className="sr-only" onChange={(e) => setProductImageFile(e.target.files[0])} /><span>{productImageFile ? "Change" : "Upload"}</span></label></div>
                            {productImageFile && <p className="text-xs text-green-600">{productImageFile.name}</p>}
                        </div>
                    </div>
                </div>
                <Input label="Product Name *" name="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                <Input label="Affiliate Link *" name="affiliateLink" type="url" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} required />
                <div>
                    <label htmlFor="genre" className="block text-xs font-medium mb-1">Product Genre *</label>
                    <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} required className="w-full px-3 py-2 text-sm bg-neutral-100 border rounded-md focus:ring-teal-500 focus:border-teal-500">
                        <option value="">Select Genre</option>
                        {productGenres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <Input label="Keywords (for AI)" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                <div className="relative">
                    <Textarea label="Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} variant="outline" size="sm" className="absolute top-0 right-0 mt-0.5 mr-0.5" iconLeft={isGeneratingDesc ? <LoadingSpinner size="sm"/> : <Sparkles size={14}/>}>AI Assist</Button>
                </div>
                <Input label="Price (Optional)" name="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                <div className="flex space-x-2 pt-2"><Button type="button" variant="secondary" onClick={goBack}>Cancel</Button><Button type="submit" variant="primary" disabled={loading}>List Product</Button></div>
            </form>
        </div>
    );
};

// --- Page Component: ShopPage (UPDATED) ---
const ShopPage = ({ navigate, jwtToken, globalSearchTerm }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const { addNotification } = useContext(NotificationContext);
    const genres = ["Beauty", "Tech", "Fashion", "Fitness", "Travel", "Gaming", "Food", "Books", "Home Decor", "Gadgets", "Other"];

    const fetchProducts = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const data = await apiRequest('/home/trending-products', 'GET', null, jwtToken); // Use a proper /products endpoint later
            let fetched = data || [];
            if (selectedGenre) fetched = fetched.filter(p => p.genre === selectedGenre);
            const searchTerm = globalSearchTerm.toLowerCase();
            if (searchTerm) fetched = fetched.filter(p => p.name?.toLowerCase().includes(searchTerm) || p.description?.toLowerCase().includes(searchTerm));
            setProducts(fetched);
        } catch (err) { setError(err.message || 'Failed to fetch.'); }
        finally { setLoading(false); }
    }, [jwtToken, selectedGenre, globalSearchTerm]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    return (
        <div className="space-y-1">
            <div className="p-3 bg-white border-b border-neutral-200">
                <h3 className="text-xs font-semibold text-neutral-500 mb-2">Filter by Genre:</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2 custom-scrollbar">
                    <Button size="sm" variant={selectedGenre === '' ? "primary" : "outline"} onClick={() => setSelectedGenre('')} className="text-xs flex-shrink-0">All</Button>
                    {genres.map(genre => <Button key={genre} size="sm" variant={selectedGenre === genre ? "primary" : "outline"} onClick={() => setSelectedGenre(genre)} className="text-xs flex-shrink-0">{genre}</Button>)}
                </div>
            </div>

            {loading && <div className="mt-10"><LoadingSpinner /></div>}
            {error && <div className="px-4 mt-4"><ErrorDisplay message={error} onRetry={fetchProducts} /></div>}
            {!loading && !error && products.length === 0 && (
                <div className="text-center py-10 px-4">
                    <ShoppingBag size={40} className="mx-auto text-neutral-400 mb-3" />
                    <p className="text-neutral-500">No products found {globalSearchTerm && `for "${globalSearchTerm}"`}.</p>
                </div>
            )}

            {products.length > 0 && (
                <div className="grid grid-cols-2 gap-0.5 sm:gap-1 pt-2">
                    {products.map(product => <ProductGridItem key={product.id} product={product} navigate={navigate} />)}
                </div>
            )}
             <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { height: 4px; } `}</style>
        </div>
    );
};

// --- UI Component: ProductGridItem ---
const ProductGridItem = ({ product, navigate }) => {
    const placeholderImage = `https://placehold.co/300x300/E2E8F0/475569?text=${product.name?.charAt(0) || 'P'}`;
    return (
        <div className="w-full aspect-square bg-neutral-100 cursor-pointer relative group" onClick={() => navigate('product-detail', { id: product.id }, { title: product.name, showBackButton: true })}>
            <img src={product.imageUrl || placeholderImage} alt={product.name} className="w-full h-full object-cover" onError={(e) => e.target.src = placeholderImage} />
            {product.price && <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-md">${parseFloat(product.price).toFixed(2)}</div>}
        </div>
    );
};

// --- UI Component: InfluencerProfilePageStructure ---
const InfluencerProfilePageStructure = ({ profile, isOwnProfile, navigate, currentUser }) => {
    const [activeTab, setActiveTab] = useState('grid');
    const { addNotification } = useContext(NotificationContext);
    if (!profile || !profile.user) return <ErrorDisplay message="Profile data missing." />;
    const placeholderAvatar = `https://placehold.co/80x80/CCFBF1/0D9488?text=${profile.user.username?.charAt(0) || 'U'}`;
    const StatItem = ({ count, label }) => (<div className="text-center"><p className="font-semibold">{count}</p><p className="text-xs">{label}</p></div>);

    return (
        <div className="bg-white">
            <div className="px-4 pt-4 pb-3 border-b">
                <div className="flex items-start mb-3">
                    <img src={profile.profilePictureUrl || placeholderAvatar} alt={profile.user.username} className="w-20 h-20 rounded-full object-cover" />
                    <div className="flex-grow flex justify-around items-center ml-4 mt-2">
                        <StatItem count={profile.products?.length || 0} label="products" />
                        <StatItem count={profile.followerCount || 0} label="followers" />
                        <StatItem count={profile.followingCount || 0} label="following" />
                    </div>
                </div>
                <div>
                    <h1 className="font-semibold">{profile.user.username}</h1>
                    {profile.genre && <p className="text-xs text-neutral-500">{profile.genre}</p>}
                    {profile.profileBio && <p className="text-xs mt-1">{profile.profileBio}</p>}
                    {profile.socialMediaLinks && <a href={profile.socialMediaLinks} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline mt-0.5">Link</a>}
                </div>
                <div className="mt-3 flex space-x-2">
                    {isOwnProfile ? <Button onClick={() => navigate('edit-profile')} variant="secondary" size="sm" fullWidth>Edit Profile</Button> : <Button variant="primary" size="sm" className="flex-1">Follow</Button>}
                </div>
            </div>
            <div className="flex border-b">
                <button onClick={() => setActiveTab('grid')} className={`flex-1 py-2.5 ${activeTab === 'grid' ? 'border-b-2 border-black' : ''}`}><Grid size={20} className="mx-auto"/></button>
                <button onClick={() => setActiveTab('tagged')} className={`flex-1 py-2.5 ${activeTab === 'tagged' ? 'border-b-2 border-black' : ''}`}><Tag size={20} className="mx-auto"/></button>
            </div>
            <div>
                {activeTab === 'grid' && (profile.products?.length > 0 ? <div className="grid grid-cols-3 gap-0.5">{profile.products.map(p => <ProductGridItem key={p.id} product={p} navigate={navigate} />)}</div> : <div className="text-center py-16"><Camera size={40} className="mx-auto"/><p>No Products Yet</p></div>)}
                {activeTab === 'tagged' && <div className="text-center py-16"><Tag size={40} className="mx-auto"/><p>No Tagged Products</p></div>}
            </div>
            {isOwnProfile && currentUser?.role === 'INFLUENCER' && <div className="fixed bottom-20 right-5 z-30 sm:hidden"><Button onClick={() => navigate('add-post')} variant="primary" className="rounded-full p-3"><PlusCircle size={24}/></Button></div>}
        </div>
    );
};

// --- Page Component: InfluencerProfilePage ---
const InfluencerProfilePage = ({ navigate, jwtToken, currentUser, influencerId, isOwnProfile }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        const id = influencerId;
        if (!id) { setError("No ID."); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const endpoint = isOwnProfile ? '/influencers/profile' : `/influencer/${id}`;
            const data = await apiRequest(endpoint, 'GET', null, jwtToken);
            setProfile(data);
        } catch (err) { setError(err.message || 'Failed.'); }
        finally { setLoading(false); }
    }, [influencerId, isOwnProfile, jwtToken]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} onRetry={fetchProfile} />;
    if (!profile) return <p>Not found.</p>;

    return <InfluencerProfilePageStructure profile={profile} isOwnProfile={isOwnProfile} navigate={navigate} currentUser={currentUser} />;
};

// --- Page Component: EditInfluencerProfilePage ---
const EditInfluencerProfilePage = ({ navigate, jwtToken, goBack, currentUser }) => {
    const [profileData, setProfileData] = useState({ profileBio: '', socialMediaLinks: '', genre: '' });
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        apiRequest('/influencers/profile', 'GET', null, jwtToken)
            .then(data => setProfileData({ profileBio: data.profileBio || '', socialMediaLinks: data.socialMediaLinks || '', genre: data.genre || '' }))
            .catch(err => setError(err.message))
            .finally(() => setInitialLoading(false));
    }, [jwtToken]);

    const handleChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setProfilePictureFile(e.target.files[0]);
    const handleSubmit = async (e) => { /* ... (keep as is) ... */ };

    if (initialLoading) return <LoadingSpinner />;

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-xl font-semibold mb-6">Edit Profile</h1>
            {error && <ErrorDisplay message={error} />}
            <form onSubmit={handleSubmit} className="space-y-5">
                <Textarea label="Bio" name="profileBio" value={profileData.profileBio} onChange={handleChange} />
                <Input label="Website/Link" name="socialMediaLinks" type="url" value={profileData.socialMediaLinks} onChange={handleChange} />
                <Input label="Niche/Genre" name="genre" value={profileData.genre} onChange={handleChange} />
                <div><label className="block text-xs mb-1">Profile Picture</label><input type="file" onChange={handleFileChange} /></div>
                <Button type="submit" variant="primary" fullWidth disabled={loading}>Save Changes</Button>
            </form>
        </div>
    );
};

// --- Page Component: ProductDetailPage ---
const ProductDetailPage = ({ navigate, jwtToken, productId, setPageTitle, setShowBackButton }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiRequest(`/products/${productId}`, 'GET', null, jwtToken)
            .then(data => { setProduct(data); setPageTitle("Product"); setShowBackButton(true); })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [productId, jwtToken, setPageTitle, setShowBackButton]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!product) return <p>Product not found.</p>;

    return (
        <div className="bg-white min-h-screen">
            <div className="w-full aspect-square bg-neutral-100"><img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/></div>
            <div className="p-4 space-y-3">
                <h1 className="text-lg font-semibold">{product.name}</h1>
                {product.price && <p className="text-base font-bold text-teal-600">${parseFloat(product.price).toFixed(2)}</p>}
                <p className="text-sm">{product.description}</p>
                <Button onClick={() => window.open(product.affiliateLink)} variant="primary" fullWidth>View on Store <ExternalLink size={16}/></Button>
            </div>
        </div>
    );
};

// --- Page Component: LoginPage ---
const LoginPage = ({ navigate, onLoginSuccess, jwtToken }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useContext(NotificationContext);

    useEffect(() => { if (jwtToken) navigate('profile'); }, [jwtToken, navigate]);
    const handleLogin = async (e) => { /* ... (keep as is) ... */ };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-4">
            <div className="w-full max-w-xs space-y-6 text-center">
                <div className="text-5xl font-bold font-['Lobster',_cursive] text-neutral-800 mb-4">InfluenShop</div>
                {error && <ErrorDisplay message={error} />}
                <form onSubmit={handleLogin} className="space-y-3">
                    <Input name="username" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="Username or email" required />
                    <Input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                    <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? 'Logging In...' : 'Log In'}</Button>
                </form>
                <div className="text-xs"><a href="#" className="hover:underline text-teal-600">Forgot password?</a></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t text-center">
                <p className="text-sm">Don't have an account? <button onClick={() => navigate('register')} className="font-semibold text-teal-600 hover:underline">Sign up</button></p>
            </div>
        </div>
    );
};

// --- Page Component: RegisterPage (UPDATED) ---
const RegisterPage = ({ navigate, onRegisterSuccess, jwtToken }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'USER' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useContext(NotificationContext);

    useEffect(() => { if (jwtToken) navigate('profile'); }, [jwtToken, navigate]);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            const { confirmPassword, ...payload } = formData;
            await apiRequest('/auth/register', 'POST', payload);
            addNotification('Registered! Please log in.', 'success');
            onRegisterSuccess();
        } catch (err) { setError(err.message || 'Registration failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] p-4">
            <div className="w-full max-w-xs space-y-5 text-center">
                <UserPlus size={40} className="mx-auto text-neutral-500 mb-2" />
                <h2 className="text-base font-semibold text-neutral-600">Sign up to discover products.</h2>
                {error && <ErrorDisplay message={error} />}
                <form onSubmit={handleRegister} className="space-y-3">
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    <Input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
                    <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                    <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
                    <p className="text-xs text-neutral-500 px-2">By signing up, you agree to our <a href="#" className="text-teal-700">Terms</a> & <a href="#" className="text-teal-700">Policy</a>.</p>
                    <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</Button>
                </form>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t text-center">
                <p className="text-sm">Have an account? <button onClick={() => navigate('login')} className="font-semibold text-teal-600 hover:underline">Log in</button></p>
            </div>
        </div>
    );
};

// --- Page Component: NotFoundPage ---
const NotFoundPage = ({ navigate }) => (
    <div className="text-center py-16 px-4">
        <AlertCircle size={48} className="mx-auto text-neutral-400 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Page Not Found</h1>
        <p className="text-sm mb-6">The link might be broken or the page removed.</p>
        <Button onClick={() => navigate('home')} variant="primary">Go Home</Button>
    </div>
);

export default App;