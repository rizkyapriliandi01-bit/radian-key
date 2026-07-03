import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import KasirPage from './pages/KasirPage';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import PrintQRPage from './pages/PrintQRPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function Navigation() {
  const location = useLocation();
  const isCustomerPage = location.pathname === '/customer';

  if (isCustomerPage) {
    return null; // Customer tak lihat nav.
  }

  return (
    <nav className="app-nav">
      <Link to="/kasir" className="nav-btn">
        <span className="icon">👨‍💼</span>
        <span className="label">Kasir</span>
      </Link>
      <Link to="/admin" className="nav-btn">
        <span className="icon">📊</span>
        <span className="label">Admin</span>
      </Link>
      <Link to="/print" className="nav-btn">
        <span className="icon">🖨️</span>
        <span className="label">Print</span>
      </Link>
      <Link to="/reports" className="nav-btn">
        <span className="icon">📈</span>
        <span className="label">Reports</span>
      </Link>
      <Link to="/settings" className="nav-btn">
        <span className="icon">⚙️</span>
        <span className="label">Settings</span>
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>🔑 Radian Key</h1>
          <p>Loyalty Stamp System</p>
        </header>

        <Navigation />

        <Routes>
          <Route path="/" element={
            <div className="home">
              <h2>Selamat Datang di Radian Key</h2>
              <p>Pilih menu di atas untuk mulai</p>
            </div>
          } />
          <Route path="/kasir" element={<KasirPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/print" element={<PrintQRPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
