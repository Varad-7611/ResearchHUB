import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import History from './pages/History';
import Landing from './pages/Landing';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return (
    <div className="flex bg-background min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#161b22',
          color: '#fff',
          border: '1px solid #30363d',
        }
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
