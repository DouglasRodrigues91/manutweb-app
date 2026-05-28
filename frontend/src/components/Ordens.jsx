import React, { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';

export default function Ordens() {
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [activeOrdem, setActiveOrdem] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const [formData, setFormData] = useState({ titulo: '', cliente_id: '', equipamento_id: '', data: '', tecnico: '', observacoes_gerais: '' });
  const [filtroStatus, setFiltroStatus] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchEmpresa();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resO, resCl, resEq, resTi] = await Promise.all([
        fetch(`${API_URL}/api/ordens/`),
        fetch(`${API_URL}/api/clientes/`),
        fetch(`${API_URL}/api/equipamentos/`),
        fetch(`${API_URL}/api/tipos/`)
      ]);
      if(resO.ok) setOrdens(await resO.json());
      if(resCl.ok) setClientes(await resCl.json());
      if(resEq.ok) setEquipamentos(await resEq.json());
      if(resTi.ok) setTipos(await resTi.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresa = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresa/`);
      if (res.ok) setEmpresa(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = () => {
    setFormData({ titulo: 'Relatório de Manutenção Preventiva', cliente_id: '', equipamento_id: '', data: new Date().toISOString().split('T')[0], tecnico: '', observacoes_gerais: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const eq = equipamentos.find(e => e.id === formData.equipamento_id);
    let checklist = [];
    if (eq) {
      const tipo = tipos.find(t => t.nome === eq.tipo_nome);
      if (tipo && tipo.tarefas) {
        checklist = tipo.tarefas.map(t => ({ tarefa: t, concluida: true, comentario: '', foto_antes: '', foto_depois: '' }));
      }
    }

    const body = { ...formData, checklist, status: 'Concluída' };

    try {
      const res = await fetch(`${API_URL}/api/ordens/`, {
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
      await fetch(`${API_URL}/api/ordens/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`${API_URL}/api/ordens/${id}/status?status=${newStatus}`, { method: 'PUT' });
    fetchData();
  };

  const openChecklist = (ordem) => {
    setActiveOrdem(ordem);
    setShowChecklistModal(true);
  };

  const handleOpenPrint = (ordem) => {
    setActiveOrdem(ordem);
    setShowPrintModal(true);
  };

  const handlePrintAction = () => {
    window.print();
  };

  const filteredOrdens = ordens.filter(o => filtroStatus === 'Todas' || o.status === filtroStatus);

  return (
    <main className="main-content">
      {/* Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            font-family: 'Inter', sans-serif;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h2>Histórico Geral de Relatórios</h2>
        <button onClick={handleOpenModal} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Novo Relatório
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
          <option>Em andamento</option>
          <option>Concluída</option>
        </select>
      </div>

      <div className="activity-list glass-card">
        {loading ? <div style={{padding:'2rem', textAlign:'center'}}>Carregando...</div> : 
         filteredOrdens.length === 0 ? <div style={{padding:'2rem', textAlign:'center', color:'var(--text-secondary)'}}>Nenhum relatório encontrado.</div> :
         filteredOrdens.map(os => (
          <div key={os.id} className="activity-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="activity-icon" style={{ background: os.status === 'Concluída' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>📋</div>
              <div className="activity-details">
                <h4>{os.titulo}</h4>
                <p>Cliente: <b>{os.cliente_nome}</b> • Equipamento: {os.equipamento_nome}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  Técnico: {os.tecnico || 'Não atribuído'} | Data: {os.data}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span className={`status-badge ${os.status === 'Concluída' ? 'completed' : 'pending'}`} style={{
                background: os.status === 'Concluída' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: os.status === 'Concluída' ? 'var(--success)' : 'var(--warning)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem'
              }}>
                {os.status}
              </span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleOpenPrint(os)} style={{ background: 'rgba(59, 130, 246, 0.2)', border: 'none', color: 'var(--accent)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Imprimir / PDF</button>
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
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Criar Relatório Direto</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Título da Manutenção</label>
                <input type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} required placeholder="Ex: Preventiva Mensal" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cliente</label>
                  <select value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    <option value="" disabled>Selecione um cliente...</option>
                    {clientes.map(cl => <option key={cl.id} value={cl.id}>{cl.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Equipamento Alvo</label>
                  <select value={formData.equipamento_id} onChange={e => setFormData({...formData, equipamento_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    <option value="" disabled>Selecione o equipamento...</option>
                    {equipamentos.filter(eq => eq.cliente_id === formData.cliente_id).map(eq => <option key={eq.id} value={eq.id}>{eq.nome} ({eq.tipo_nome})</option>)}
                  </select>
                </div>
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
                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Salvar Relatório</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPRESSÃO PROFISSIONAL */}
      {showPrintModal && activeOrdem && (
        <div className="modal-overlay no-print" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', background: '#f8fafc', color: '#1e293b' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0f172a', fontWeight: 'bold' }}>Pré-visualização do Relatório Técnico</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrintAction} style={{ padding: '0.5rem 1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🖨️ Imprimir / Guardar PDF
                </button>
                <button onClick={() => setShowPrintModal(false)} style={{ padding: '0.5rem 1rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Fechar
                </button>
              </div>
            </div>

            <div id="print-area" style={{ background: 'white', padding: '40px', borderRadius: '8px', color: '#1e293b' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3b82f6', paddingBottom: '20px', marginBottom: '20px' }}>
                <div>
                  {empresa?.logo_url ? (
                    <img src={empresa.logo_url} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '-0.05em', marginBottom: '5px' }}>
                      🔧 {empresa?.nome || 'MANUTENÇÃO PROFISSIONAL'}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                    {empresa?.morada && <div>{empresa.morada}</div>}
                    {empresa?.nif && <span><b>NIF:</b> {empresa.nif} • </span>}
                    {empresa?.email && <span><b>Email:</b> {empresa.email}</span>} <br />
                    {empresa?.telefone && <span><b>Tel:</b> {empresa.telefone} • </span>}
                    {empresa?.iban && <span><b>IBAN:</b> {empresa.iban}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>RELATÓRIO TÉCNICO</h1>
                  <div style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 'bold', marginTop: '5px' }}>
                    {activeOrdem.titulo}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>
                    <b>Data:</b> {activeOrdem.data} <br />
                    <b>Nº Relatório:</b> {activeOrdem.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '8px' }}>CLIENTE</h3>
                  {(() => {
                    const cl = clientes.find(c => c.id === activeOrdem.cliente_id);
                    return (
                      <>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{activeOrdem.cliente_nome}</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
                          {cl?.morada && <div>Morada: {cl.morada}</div>}
                          {cl?.nif && <span>NIF: {cl.nif} • </span>}
                          {cl?.periodicidade && <span>Periodicidade: {cl.periodicidade}</span>}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '8px' }}>EQUIPAMENTO E INTERVENÇÃO</h3>
                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                    {(() => {
                      const eq = equipamentos.find(e => e.id === activeOrdem.equipamento_id);
                      if (!eq) return <span>Equipamento não identificado</span>;
                      return (
                        <>
                          <div><b>Nome:</b> {eq.nome} ({eq.tipo_nome})</div>
                          {eq.marca && <span><b>Marca:</b> {eq.marca} • <b>Modelo:</b> {eq.modelo} <br /></span>}
                          {eq.num_serie && <span><b>S/N:</b> {eq.num_serie} • </span>}
                          {eq.localizacao && <span><b>Localização:</b> {eq.localizacao}</span>}
                        </>
                      );
                    })()}
                    <div style={{ marginTop: '5px' }}>
                      <b>Técnico Executante:</b> {activeOrdem.tecnico || 'N/A'} <br />
                      <b>Estado Final:</b> <span style={{ color: activeOrdem.status === 'Concluída' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{activeOrdem.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
                  CHECKLIST DE ATIVIDADES REALIZADAS
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '8px', width: '40px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px' }}>Atividade / Procedimento</th>
                      <th style={{ padding: '8px' }}>Observações / Comentários</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrdem.checklist.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: item.concluida ? '#10b981' : '#ef4444' }}>
                            {item.concluida ? '✓' : '✗'}
                          </td>
                          <td style={{ padding: '8px', fontWeight: 500 }}>{item.tarefa}</td>
                          <td style={{ padding: '8px', color: '#475569' }}>{item.comentario || 'Conforme'}</td>
                        </tr>
                        {(item.foto_antes || item.foto_depois) && (
                          <tr>
                            <td colSpan="3" style={{ padding: '8px', background: '#f8fafc' }}>
                              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                {item.foto_antes && (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Antes:</span>
                                    <img src={item.foto_antes} alt="Antes" style={{ height: '70px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                  </div>
                                )}
                                {item.foto_depois && (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Depois:</span>
                                    <img src={item.foto_depois} alt="Depois" style={{ height: '70px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeOrdem.observacoes_gerais && (
                <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 5px 0' }}>Observações Gerais</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, whiteSpace: 'pre-line' }}>
                    {activeOrdem.observacoes_gerais}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '50px' }}></div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '200px', margin: '0 auto' }}></div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assinatura do Técnico</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '50px' }}></div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '200px', margin: '0 auto' }}></div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assinatura do Cliente</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
