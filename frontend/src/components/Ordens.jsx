import React, { useState, useEffect } from 'react';

export default function Ordens() {
  const [ordens, setOrdens] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [tipos, setTipos] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [activeOrdem, setActiveOrdem] = useState(null);
  
  const [formData, setFormData] = useState({ titulo: '', edificio_id: '', equipamento_id: '', data: '', tecnico: '' });
  const [filtroStatus, setFiltroStatus] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resO, resEd, resEq, resTi] = await Promise.all([
        fetch('https://manutweb-app.onrender.com/api/ordens/'),
        fetch('https://manutweb-app.onrender.com/api/edificios/'),
        fetch('https://manutweb-app.onrender.com/api/equipamentos/'),
        fetch('https://manutweb-app.onrender.com/api/tipos/')
      ]);
      if(resO.ok) setOrdens(await resO.json());
      if(resEd.ok) setEdificios(await resEd.json());
      if(resEq.ok) setEquipamentos(await resEq.json());
      if(resTi.ok) setTipos(await resTi.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ titulo: '', edificio_id: '', equipamento_id: '', data: new Date().toISOString().split('T')[0], tecnico: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Auto-generate checklist based on equipment type
    const eq = equipamentos.find(e => e.id === formData.equipamento_id);
    let checklist = [];
    if (eq) {
      const tipo = tipos.find(t => t.id === eq.tipo_id);
      if (tipo && tipo.tarefas) {
        checklist = tipo.tarefas.map(t => ({ tarefa: t, concluida: false }));
      }
    }

    const body = { ...formData, checklist };

    try {
      const res = await fetch('https://manutweb-app.onrender.com/api/ordens/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert('Erro ao criar ordem de serviço.');
      }
    } catch(err) {
      alert('Falha na comunicação.');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Apagar esta ordem de serviço?')) {
      await fetch(`https://manutweb-app.onrender.com/api/ordens/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`https://manutweb-app.onrender.com/api/ordens/${id}/status?status=${newStatus}`, { method: 'PUT' });
    fetchData();
  };

  const openChecklist = (ordem) => {
    setActiveOrdem(ordem);
    setShowChecklistModal(true);
  };

  const toggleChecklistItem = async (index, concluida) => {
    // Optimistic update
    const updated = {...activeOrdem};
    updated.checklist[index].concluida = concluida;
    setActiveOrdem(updated);
    
    // Save to DB
    await fetch(`https://manutweb-app.onrender.com/api/ordens/${activeOrdem.id}/checklist/${index}?concluida=${concluida}`, { method: 'PUT' });
    
    // If all checked, maybe auto complete? (Optional feature)
    if (updated.checklist.every(item => item.concluida) && updated.status !== 'Concluída') {
        updateStatus(activeOrdem.id, 'Concluída');
    }
  };

  const filteredOrdens = ordens.filter(o => filtroStatus === 'Todas' || o.status === filtroStatus);

  return (
    <main className="main-content">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h2>Ordens de Serviço</h2>
        <button onClick={handleOpenModal} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Nova OS
        </button>
      </header>

      {/* Barra de Filtros */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
        <select 
          style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option>Todas</option>
          <option>Planejada</option>
          <option>Em Andamento</option>
          <option>Concluída</option>
        </select>
      </div>

      <div className="activity-list glass-card">
        {loading ? <div style={{padding:'2rem', textAlign:'center'}}>Carregando...</div> : 
         filteredOrdens.length === 0 ? <div style={{padding:'2rem', textAlign:'center', color:'var(--text-secondary)'}}>Nenhuma ordem encontrada.</div> :
         filteredOrdens.map(os => (
          <div key={os.id} className="activity-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="activity-icon" style={{ background: os.status === 'Concluída' ? 'rgba(16, 185, 129, 0.1)' : os.status === 'Em Andamento' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>📋</div>
              <div className="activity-details">
                <h4>{os.titulo}</h4>
                <p>{os.edificio_nome} • {os.equipamento_nome}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Técnico: {os.tecnico || 'Não atribuído'} | Data: {os.data}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <select 
                value={os.status} 
                onChange={(e) => updateStatus(os.id, e.target.value)}
                className={`activity-status ${os.status === 'Planejada' ? '' : 'pending'}`} 
                style={{ border: '1px solid var(--glass-border)', background: 'transparent', outline: 'none', appearance: 'none', paddingRight: '1.5rem' }}
              >
                <option style={{background:'var(--bg-secondary)'}} value="Planejada">Planejada</option>
                <option style={{background:'var(--bg-secondary)'}} value="Em Andamento">Em Andamento</option>
                <option style={{background:'var(--bg-secondary)'}} value="Concluída">Concluída</option>
              </select>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openChecklist(os)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Ver Checklist ({os.checklist.filter(c=>c.concluida).length}/{os.checklist.length})</button>
                <button onClick={() => handleDelete(os.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>Apagar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova OS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Nova Ordem de Serviço</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Título da Manutenção</label>
                <input type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ex: Preventiva Anual" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Edifício / Cliente</label>
                <select value={formData.edificio_id} onChange={e => setFormData({...formData, edificio_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                  <option value="" disabled>Selecione um edifício...</option>
                  {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Equipamento Alvo</label>
                <select value={formData.equipamento_id} onChange={e => setFormData({...formData, equipamento_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                  <option value="" disabled>Selecione o equipamento...</option>
                  {equipamentos.filter(eq => eq.edificio_id === formData.edificio_id).map(eq => <option key={eq.id} value={eq.id}>{eq.nome} ({eq.tipo_nome})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Técnico Responsável</label>
                  <input type="text" value={formData.tecnico} onChange={e => setFormData({...formData, tecnico: e.target.value})} placeholder="Nome do Técnico" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Data Agendada</label>
                  <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancelar</button>
                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Salvar OS</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Checklist */}
      {showChecklistModal && activeOrdem && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Checklist: {activeOrdem.titulo}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Equipamento: {activeOrdem.equipamento_nome}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {activeOrdem.checklist.length === 0 ? <div style={{color:'var(--text-secondary)'}}>Sem tarefas cadastradas para este tipo de equipamento.</div> :
               activeOrdem.checklist.map((item, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: item.concluida ? '1px solid var(--success)' : '1px solid transparent' }}>
                  <input 
                    type="checkbox" 
                    checked={item.concluida} 
                    onChange={(e) => toggleChecklistItem(idx, e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--success)' }}
                  />
                  <span style={{ textDecoration: item.concluida ? 'line-through' : 'none', color: item.concluida ? 'var(--text-secondary)' : 'white' }}>
                    {item.tarefa}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => {setShowChecklistModal(false); fetchData();}} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
