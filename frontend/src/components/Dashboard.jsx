import React, { useState, useEffect } from 'react';

export default function Dashboard({ apiStatus }) {
  const [stats, setStats] = useState({
    equipamentos: 0,
    osPendentes: 0,
    osConcluidas: 0
  });
  const [ordensRecentes, setOrdensRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Usar os links absolutos que foram alterados pelo script
      const resEquip = await fetch('https://manutweb-app.onrender.com/api/equipamentos/');
      const equip = await resEquip.json();
      
      const resOrdens = await fetch('https://manutweb-app.onrender.com/api/ordens/');
      const ordens = await resOrdens.json();

      const pendentes = ordens.filter(o => o.status !== 'Concluída').length;
      const concluidas = ordens.filter(o => o.status === 'Concluída').length;

      setStats({
        equipamentos: equip.length,
        osPendentes: pendentes,
        osConcluidas: concluidas
      });

      // Pegar as últimas 5 ordens
      setOrdensRecentes(ordens.reverse().slice(0, 5));

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">A carregar estatísticas...</div>;

  return (
    <main className="main-content">
      <header className="page-header">
        <h2>Visão Geral</h2>
        <div className="status-badge">
          <span className={`status-indicator ${apiStatus === 'Online' ? 'online' : 'offline'}`}></span>
          Estado do Servidor: {apiStatus}
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <h3>Total de Equipamentos</h3>
          <p className="stat-number">{stats.equipamentos}</p>
          <span className="trend">Ativos no sistema</span>
        </div>
        <div className="stat-card glass-card">
          <h3>Ordens Pendentes</h3>
          <p className={`stat-number ${stats.osPendentes > 0 ? 'highlight-warning' : ''}`}>{stats.osPendentes}</p>
          <span className={stats.osPendentes > 0 ? 'trend negative' : 'trend positive'}>A aguardar intervenção</span>
        </div>
        <div className="stat-card glass-card">
          <h3>Ordens Concluídas</h3>
          <p className="stat-number highlight-success">{stats.osConcluidas}</p>
          <span className="trend positive">Trabalho finalizado</span>
        </div>
      </div>

      <section className="recent-activity">
        <h3>Últimas Intervenções</h3>
        <div className="activity-list glass-card">
          {ordensRecentes.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Ainda não existem ordens de serviço no sistema. Comece por registar os edifícios e equipamentos.
            </p>
          ) : (
            ordensRecentes.map((ordem, index) => (
              <div className="activity-item" key={index}>
                <div className={`activity-icon ${ordem.status === 'Concluída' ? 'success' : 'warning'}`}>
                  {ordem.status === 'Concluída' ? '✓' : '⚠️'}
                </div>
                <div className="activity-details">
                  <h4>{ordem.titulo}</h4>
                  <p>{ordem.edificio_nome} - {ordem.equipamento_nome}</p>
                </div>
                <div className={`activity-status ${ordem.status === 'Concluída' ? 'completed' : 'pending'}`}>
                  {ordem.status}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
