import React, { useState, useEffect } from 'react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: '', nome: '', status: 'Ativo' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://manutweb-app.onrender.com/api/clientes/');
      if (res.ok) {
        const data = await res.json();
        setClientes(data);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditMode(true);
      setFormData({ id: cliente.id, nome: cliente.nome, status: cliente.status });
    } else {
      setEditMode(false);
      setFormData({ id: '', nome: '', status: 'Ativo' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editMode 
        ? `https://manutweb-app.onrender.com/api/clientes/${formData.id}` 
        : 'https://manutweb-app.onrender.com/api/clientes/';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: formData.nome, status: formData.status })
      });

      if (res.ok) {
        setShowModal(false);
        fetchClientes();
      } else {
        alert('Erro ao salvar. O MongoDB está configurado no backend?');
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja apagar permanentemente o cliente "${nome}"?`)) {
      try {
        const res = await fetch(`https://manutweb-app.onrender.com/api/clientes/${id}`, { method: 'DELETE' });
        if (res.ok) fetchClientes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <main className="main-content">
      <header className="page-header">
        <h2>Gestão de Clientes</h2>
        <button 
          onClick={() => handleOpenModal()} 
          style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Novo Cliente
        </button>
      </header>

      <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cliente</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Equipamentos Vinculados</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados do servidor...</td></tr>
            ) : clientes.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum cliente cadastrado no banco de dados. Clique em "+ Novo Cliente" para criar.</td></tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{cliente.nome}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="status-badge" style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }}>
                      {cliente.equipamentos} Equipamentos
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: cliente.status === 'Ativo' ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {cliente.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(cliente)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>Editar</button>
                    <button onClick={() => handleDelete(cliente.id, cliente.nome)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Apagar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editMode ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Cliente</label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  required
                  placeholder="Ex: Condomínio Central" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
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
