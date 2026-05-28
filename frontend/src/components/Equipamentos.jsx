import React, { useState, useEffect } from 'react';

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [tipos, setTipos] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nome: '', edificio_id: '', tipo_id: '', tipo_nome: '', prox_manut: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEq, resEd, resTi] = await Promise.all([
        fetch('https://manutweb-app.onrender.com/api/equipamentos/'),
        fetch('https://manutweb-app.onrender.com/api/edificios/'),
        fetch('https://manutweb-app.onrender.com/api/tipos/')
      ]);
      if(resEq.ok) setEquipamentos(await resEq.json());
      if(resEd.ok) setEdificios(await resEd.json());
      if(resTi.ok) setTipos(await resTi.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ nome: '', edificio_id: edificios.length > 0 ? edificios[0].id : '', tipo_id: tipos.length > 0 ? tipos[0].id : '', tipo_nome: '', prox_manut: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const tipoSelecionado = tipos.find(t => t.id === formData.tipo_id);
    const body = {
      ...formData,
      tipo_nome: tipoSelecionado ? tipoSelecionado.nome : ''
    };

    try {
      const res = await fetch('https://manutweb-app.onrender.com/api/equipamentos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData(); // reload
      } else {
        alert('Erro ao criar equipamento.');
      }
    } catch(err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  const handleDelete = async (id, nome) => {
    if(window.confirm(`Apagar equipamento "${nome}"?`)) {
      await fetch(`https://manutweb-app.onrender.com/api/equipamentos/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <main className="main-content">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h2>Equipamentos</h2>
        <button onClick={handleOpenModal} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Novo Equipamento
        </button>
      </header>

      {tipos.length === 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          ⚠️ Você ainda não cadastrou nenhum <b>Tipo de Equipamento</b> (ex: AVAC). Vá na aba "Tipos & Tarefas" para configurar os tipos antes de cadastrar um equipamento.
        </div>
      )}

      {edificios.length === 0 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          ⚠️ Você ainda não cadastrou nenhum <b>Edifício/Cliente</b>. Vá na aba "Edifícios" para criar um local antes de cadastrar um equipamento.
        </div>
      )}

      <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nome do Equipamento</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Edifício / Cliente</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Tipo (Categoria)</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Próx. Manutenção</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</td></tr> : 
             equipamentos.length === 0 ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum equipamento cadastrado.</td></tr> :
             equipamentos.map(eq => (
              <tr key={eq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{eq.nome}</td>
                <td style={{ padding: '1rem' }}>{eq.edificio_nome}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {eq.tipo_nome}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{eq.prox_manut || '-'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(eq.id, eq.nome)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Apagar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Novo Equipamento</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Equipamento (Identificação)</label>
                <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required placeholder="Ex: Chiller CH-01" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Edifício / Cliente Vinculado</label>
                <select value={formData.edificio_id} onChange={e => setFormData({...formData, edificio_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                  <option value="" disabled>Selecione um edifício...</option>
                  {edificios.map(ed => <option key={ed.id} value={ed.id}>{ed.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tipo de Equipamento (Carrega as Tarefas)</label>
                <select value={formData.tipo_id} onChange={e => setFormData({...formData, tipo_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                  <option value="" disabled>Selecione um tipo...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Data Próxima Manutenção</label>
                <input type="date" value={formData.prox_manut} onChange={e => setFormData({...formData, prox_manut: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
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
