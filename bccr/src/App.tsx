import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import NgoDashboard from './pages/NgoDashboard';
import ApplyPage from './pages/ApplyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/ngo" element={<NgoDashboard />} />
    </Routes>
  );
}

export default App;