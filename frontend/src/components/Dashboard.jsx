import React, { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';

export default function Dashboard({ apiStatus }) {
  const [stats, setStats] = useState({
    concluidas: 0,
    pendentes: 0,
    atrasadas: 0
  });
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filtroSemana, setFiltroSemana] = useState('todas'); // 'todas' | 'esta' | 'proxima'
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos'); // 'todos' | 'este-mes' | 'proximo-mes'

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ordens/`);
      if (res.ok) {
        const data = await res.json();
        setOrdens(data);
        calcularMetricas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = (listaOrdens) => {
    const hojeStr = new Date().toISOString().split('T')[0];
    let concluidas = 0;
    let pendentes = 0;
    let atrasadas = 0;

    listaOrdens.forEach(o => {
      if (o.status === 'Concluída') {
        concluidas++;
      } else {
        pendentes++;
        if (o.data < hojeStr) {
          atrasadas++;
        }
      }
    });

    setStats({ concluidas, pendentes, atrasadas });
  };

  // Funções de data auxiliares para os filtros
  const obterDatasFiltro = () => {
    const hoje = new Date();
    
    // Esta semana (Segunda a Domingo)
    const diaSemanaHoje = hoje.getDay();
    const difSegunda = hoje.getDate() - (diaSemanaHoje === 0 ? 6 : diaSemanaHoje - 1);
    const segundaEstaSemana = new Date(hoje.setDate(difSegunda));
    segundaEstaSemana.setHours(0, 0, 0, 0);
    
    const domingoEstaSemana = new Date(segundaEstaSemana);
    domingoEstaSemana.setDate(segundaEstaSemana.getDate() + 6);
    domingoEstaSemana.setHours(23, 59, 59, 999);

    // Próxima semana
    const segundaProxSemana = new Date(segundaEstaSemana);
    segundaProxSemana.setDate(segundaEstaSemana.getDate() + 7);
    
    const domingoProxSemana = new Date(segundaProxSemana);
    domingoProxSemana.setDate(segundaProxSemana.getDate() + 6);
    domingoProxSemana.setHours(23, 59, 59, 999);

    // Este Mês
    const inicioEsteMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimEsteMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    // Próximo Mês
    const inicioProxMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    const fimProxMes = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0, 23, 59, 59, 999);

    return {
      segundaEstaSemana, domingoEstaSemana,
      segundaProxSemana, domingoProxSemana,
      inicioEsteMes, fimEsteMes,
      inicioProxMes, fimProxMes
    };
  };

  const filtrarOrdens = () => {
    const datas = obterDatasFiltro();
    return ordens.filter(o => {
      const dataOrdem = new Date(o.data);
      
      // Filtro de Semana
      if (filtroSemana === 'esta') {
        if (dataOrdem < datas.segundaEstaSemana || dataOrdem > datas.domingoEstaSemana) return false;
      } else if (filtroSemana === 'proxima') {
        if (dataOrdem < datas.segundaProxSemana || dataOrdem > datas.domingoProxSemana) return false;
      }

      // Filtro de Período (Mês)
      if (filtroPeriodo === 'este-mes') {
        if (dataOrdem < datas.inicioEsteMes || dataOrdem > datas.fimEsteMes) return false;
      } else if (filtroPeriodo === 'proximo-mes') {
        if (dataOrdem < datas.inicioProxMes || dataOrdem > datas.fimProxMes) return false;
      }

      return true;
    });
  };

  const ordensFiltradas = filtrarOrdens();

  if (loading) return <div className="loading">A carregar estatísticas do planeamento...</div>;

  return (
    <main className="main-content">
      <header className="page-header">
        <h2>Painel de Planeamento</h2>
        <div className="status-badge">
          <span className={`status-indicator ${apiStatus === 'Online' ? 'online' : 'offline'}`}></span>
          Estado da API: {apiStatus}
        </div>
      </header>

      {/* Cards de Métricas */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <h3>Manutenções Concluídas</h3>
          <p className="stat-number highlight-success" style={{ color: 'var(--success)', fontSize: '2.2rem', fontWeight: 'bold' }}>{stats.concluidas}</p>
          <span className="trend">Intervenções realizadas</span>
        </div>
        
        <div className="stat-card glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3>Manutenções Pendentes</h3>
          <p className="stat-number highlight-warning" style={{ color: 'var(--warning)', fontSize: '2.2rem', fontWeight: 'bold' }}>{stats.pendentes}</p>
          <span className="trend">Agendadas e ativas</span>
        </div>

        <div className="stat-card glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3>Manutenções Atrasadas</h3>
          <p className="stat-number highlight-danger" style={{ color: 'var(--danger)', fontSize: '2.2rem', fontWeight: 'bold' }}>{stats.atrasadas}</p>
          <span className="trend">Requerem atenção imediata</span>
        </div>
      </div>

      {/* Filtros de Planeamento */}
      <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Filtros de Agenda:</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Por Semana:</label>
          <select 
            value={filtroSemana} 
            onChange={e => { setFiltroSemana(e.target.value); setFiltroPeriodo('todos'); }}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.85rem' }}
          >
            <option value="todas">Todas as Semanas</option>
            <option value="esta">Esta Semana</option>
            <option value="proxima">Próxima Semana</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Por Período:</label>
          <select 
            value={filtroPeriodo} 
            onChange={e => { setFiltroPeriodo(e.target.value); setFiltroSemana('todas'); }}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.85rem' }}
          >
            <option value="todos">Todo o Período</option>
            <option value="este-mes">Este Mês</option>
            <option value="proximo-mes">Próximo Mês</option>
          </select>
        </div>
      </div>

      {/* Lista Dinâmica de Agenda */}
      <section className="recent-activity">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Lista de Clientes & Planeamento Técnico ({ordensFiltradas.length})</h3>
        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cliente</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Equipamento</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Data Agendada</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estado</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Técnico</th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhuma manutenção agendada para o período selecionado.
                  </td>
                </tr>
              ) : (
                ordensFiltradas.map((ordem, index) => {
                  const hojeStr = new Date().toISOString().split('T')[0];
                  const estaAtrasada = ordem.status !== 'Concluída' && ordem.data < hojeStr;
                  
                  return (
                    <tr key={ordem.id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{ordem.cliente_nome}</td>
                      <td style={{ padding: '1rem' }}>{ordem.equipamento_nome}</td>
                      <td style={{ padding: '1rem', color: estaAtrasada ? 'var(--danger)' : 'white' }}>
                        {ordem.data} {estaAtrasada && <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', marginLeft: '0.4rem', fontWeight: 'bold' }}>ATRASADA</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status-badge ${ordem.status === 'Concluída' ? 'completed' : 'pending'}`} style={{
                          background: ordem.status === 'Concluída' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ordem.status === 'Concluída' ? 'var(--success)' : 'var(--warning)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}>
                          {ordem.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{ordem.tecnico || 'Não atribuído'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
