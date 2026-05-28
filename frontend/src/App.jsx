import React, { useState, useEffect } from 'react';
import './index.css';

// Componentes da Navegação
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Edificios from './components/Edificios';
import Equipamentos from './components/Equipamentos';
import Tipos from './components/Tipos';
import Ordens from './components/Ordens';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status === 'ok' ? 'Online' : 'Offline'))
      .catch(() => setApiStatus('Offline (API not running)'));
      
    // Check if user is already logged in
    const token = localStorage.getItem('manutweb_token');
    const user = localStorage.getItem('manutweb_user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user, token) => {
    localStorage.setItem('manutweb_token', token);
    localStorage.setItem('manutweb_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('manutweb_token');
    localStorage.removeItem('manutweb_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch(currentRoute) {
      case 'dashboard': return <Dashboard apiStatus={apiStatus} />;
      case 'edificios': return <Edificios />;
      case 'equipamentos': return <Equipamentos />;
      case 'tipos': return <Tipos />;
      case 'ordens': return <Ordens />;
      default: return <Dashboard apiStatus={apiStatus} />;
    }
  };

  return (
    <div className="app-container">
      <nav className="glass-nav">
        <div className="logo">
          <span className="icon">🔧</span>
          <h1>ManutWeb</h1>
        </div>
        <ul className="nav-links">
          <li>
            <a href="#dashboard" className={currentRoute === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentRoute('dashboard'); }}>Dashboard</a>
          </li>
          <li>
            <a href="#edificios" className={currentRoute === 'edificios' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentRoute('edificios'); }}>Edifícios</a>
          </li>
          <li>
            <a href="#equipamentos" className={currentRoute === 'equipamentos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentRoute('equipamentos'); }}>Equipamentos</a>
          </li>
          <li>
            <a href="#tipos" className={currentRoute === 'tipos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentRoute('tipos'); }}>Tipos & Tarefas</a>
          </li>
          <li>
            <a href="#ordens" className={currentRoute === 'ordens' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentRoute('ordens'); }}>Ordens Planejadas</a>
          </li>
        </ul>
        <div className="user-profile" onClick={handleLogout}>
          <div className="avatar" title={currentUser?.role}>{currentUser?.nome ? currentUser.nome[0].toUpperCase() : 'U'}</div>
          <span>Sair ({currentUser?.role})</span>
        </div>
      </nav>

      {renderContent()}
    </div>
  );
}

export default App;
