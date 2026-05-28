import React, { useState, useEffect } from 'react';

export default function Edificios() {
  const [edificios, setEdificios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '', nif: '', morada: '', email: '', contato: '', status: 'Ativo' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEdificios();
  }, []);

  const fetchEdificios = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://manutweb-app.onrender.com/api/edificios/');
      if (res.ok) {
        const data = await res.json();
        setEdificios(data);
      }
    } catch (err) {
      console.error('Erro ao buscar edificios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (edificio = null) => {
    if (edificio) {
      setEditMode(true);
      setFormData(edificio);
    } else {
      setEditMode(false);
      setFormData({ id: '', nome: '', nif: '', morada: '', email: '', contato: '', status: 'Ativo' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editMode 
        ? `https://manutweb-app.onrender.com/api/edificios/${formData.id}` 
        : 'https://manutweb-app.onrender.com/api/edificios/';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchEdificios();
      } else {
        alert('Erro ao salvar no banco de dados.');
      }
    } catch (err) {
      alert('Falha na conexão com o servidor.');
    }
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja apagar permanentemente o edifício "${nome}"?`)) {
      try {
        const res = await fetch(`https://manutweb-app.onrender.com/api/edificios/${id}`, { method: 'DELETE' });
        if (res.ok) fetchEdificios();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <main className="main-content">
      <header className="page-header">
        <h2>Gestão de Edifícios</h2>
        <button onClick={() => handleOpenModal()} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Novo Edifício
        </button>
      </header>

      <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Edifício / Cliente</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>NIF</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Contato / Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Equipamentos</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : edificios.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum edifício cadastrado.</td></tr>
            ) : (
              edificios.map(ed => (
                <tr key={ed.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>#{ed.numero}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{ed.nome}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ed.morada}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{ed.nif || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>{ed.contato || '-'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ed.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="status-badge" style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }}>
                      {ed.equipamentos} Equipamentos
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: ed.status === 'Ativo' ? 'var(--success)' : 'var(--text-secondary)' }}>{ed.status}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(ed)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>Editar</button>
                    <button onClick={() => handleDelete(ed.id, ed.nome)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Apagar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editMode ? 'Editar Edifício' : 'Novo Edifício'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Edifício / Cliente *</label>
                <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>NIF</label>
                  <input type="text" value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Morada Completa</label>
                <input type="text" value={formData.morada} onChange={e => setFormData({...formData, morada: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>E-mail</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Contato (Telefone)</label>
                  <input type="text" value={formData.contato} onChange={e => setFormData({...formData, contato: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
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
