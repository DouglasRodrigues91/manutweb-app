import React from 'react';

export default function Dashboard({ apiStatus }) {
  return (
    <main className="main-content">
      <header className="page-header">
        <h2>Dashboard Overview</h2>
        <div className="status-badge">
          <span className={`status-indicator ${apiStatus === 'Online' ? 'online' : 'offline'}`}></span>
          Backend Status: {apiStatus}
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <h3>Total Equipamentos</h3>
          <p className="stat-number">124</p>
          <span className="trend positive">↑ 12% este mês</span>
        </div>
        <div className="stat-card glass-card">
          <h3>OS Pendentes</h3>
          <p className="stat-number highlight-warning">18</p>
          <span className="trend negative">Requer atenção</span>
        </div>
        <div className="stat-card glass-card">
          <h3>Em Manutenção</h3>
          <p className="stat-number highlight-danger">5</p>
          <span className="trend">Parados no momento</span>
        </div>
      </div>

      <section className="recent-activity">
        <h3>Ordens Recentes</h3>
        <div className="activity-list glass-card">
          <div className="activity-item">
            <div className="activity-icon warning">⚠️</div>
            <div className="activity-details">
              <h4>Ar Condicionado Central - Falha no compressor</h4>
              <p>Edifício Sede - Piso 3</p>
            </div>
            <div className="activity-status pending">Pendente</div>
          </div>
          <div className="activity-item">
            <div className="activity-icon success">✓</div>
            <div className="activity-details">
              <h4>Preventiva Elevador Social</h4>
              <p>Torre B</p>
            </div>
            <div className="activity-status completed">Concluída</div>
          </div>
        </div>
      </section>
    </main>
  );
}
