import React, { useState, useEffect } from 'react';

export default function Tipos() {
  const [tipos, setTipos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '', tarefas: [] });
  const [novaTarefa, setNovaTarefa] = useState('');

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    const res = await fetch('https://manutweb-app.onrender.com/api/tipos/');
    if(res.ok) setTipos(await res.json());
  };

  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setEditMode(true);
      setFormData(tipo);
    } else {
      setEditMode(false);
      setFormData({ id: '', nome: '', tarefas: [] });
    }
    setNovaTarefa('');
    setShowModal(true);
  };

  const handleAddTarefa = () => {
    if(novaTarefa.trim() === '') return;
    setFormData({...formData, tarefas: [...formData.tarefas, novaTarefa]});
    setNovaTarefa('');
  };

  const handleRemoveTarefa = (index) => {
    const novasTarefas = [...formData.tarefas];
    novasTarefas.splice(index, 1);
    setFormData({...formData, tarefas: novasTarefas});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editMode ? `https://manutweb-app.onrender.com/api/tipos/${formData.id}` : 'https://manutweb-app.onrender.com/api/tipos/';
    const method = editMode ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setShowModal(false);
    fetchTipos();
  };

  const handleDelete = async (id, nome) => {
    if(window.confirm(`Apagar o tipo "${nome}" e suas tarefas?`)) {
      await fetch(`https://manutweb-app.onrender.com/api/tipos/${id}`, { method: 'DELETE' });
      fetchTipos();
    }
  };

  // Pre-populate if empty
  const populateDefaults = async () => {
    await fetch('https://manutweb-app.onrender.com/api/tipos/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ nome: 'AVAC - UE', tarefas: ['Limpeza Serpentina', 'Verificação de pressão', 'Lavagem Exterior'] }) });
    await fetch('https://manutweb-app.onrender.com/api/tipos/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ nome: 'AVAC - UI', tarefas: ['Limpeza de filtros', 'Verificação de ruídos'] }) });
    await fetch('https://manutweb-app.onrender.com/api/tipos/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ nome: 'Ventilador', tarefas: ['Verificar motor', 'Verificar filtro (se aplicável)', 'Medir tensão e consumo'] }) });
    fetchTipos();
  };

  return (
    <main className="main-content">
      <header className="page-header">
        <h2>Tipos de Equipamento e Tarefas</h2>
        <div style={{display:'flex', gap:'1rem'}}>
          {tipos.length === 0 && <button onClick={populateDefaults} style={{ padding: '0.5rem 1rem', background: 'var(--warning)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Carregar Padrões</button>}
          <button onClick={() => handleOpenModal()} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Novo Tipo</button>
        </div>
      </header>

      <div className="stats-grid">
        {tipos.map(tipo => (
          <div key={tipo.id} className="stat-card glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'white' }}>{tipo.nome}</h3>
              <div>
                <button onClick={() => handleOpenModal(tipo)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '0.5rem' }}>✏️</button>
                <button onClick={() => handleDelete(tipo.id, tipo.nome)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Checklist Padrão ({tipo.tarefas.length} tarefas):</p>
            <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {tipo.tarefas.map((t, i) => <li key={i} style={{ marginBottom: '0.2rem' }}>{t}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editMode ? 'Editar Tipo' : 'Novo Tipo de Equipamento'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome (Ex: AVAC - UE)</label>
                <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tarefas (Checklist)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input type="text" value={novaTarefa} onChange={e => setNovaTarefa(e.target.value)} onKeyPress={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTarefa(); } }} placeholder="Nova tarefa..." style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                  <button type="button" onClick={handleAddTarefa} style={{ background: 'var(--success)', border: 'none', borderRadius: '8px', color: 'white', padding: '0 1rem', cursor: 'pointer' }}>Adicionar</button>
                </div>
                
                <ul style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', minHeight: '100px' }}>
                  {formData.tarefas.map((t, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      <span>{t}</span>
                      <button type="button" onClick={() => handleRemoveTarefa(i)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>X</button>
                    </li>
                  ))}
                  {formData.tarefas.length === 0 && <li style={{ color: 'var(--text-secondary)', listStyle: 'none' }}>Nenhuma tarefa adicionada.</li>}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancelar</button>
                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
