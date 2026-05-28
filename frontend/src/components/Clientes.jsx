import React, { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteEquipamentos, setClienteEquipamentos] = useState([]);
  const [clienteOrdens, setClienteOrdens] = useState([]);
  
  // Modals
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('equipamentos'); // 'equipamentos' | 'relatorios'
  
  // Forms state
  const [clienteForm, setClienteForm] = useState({
    id: '', nome: '', nif: '', morada: '', email: '', contato: '', periodicidade: 'Mensal', status: 'Ativo'
  });
  
  const [eqForm, setEqForm] = useState({
    nome: '', tipo_id: '', marca: '', modelo: '', num_serie: '', localizacao: '', prox_manut: ''
  });
  
  const [reportForm, setReportForm] = useState({
    titulo: 'Manutenção Preventiva',
    equipamento_id: '',
    data: new Date().toISOString().split('T')[0],
    status: 'Concluída',
    tecnico: '',
    checklist: [],
    observacoes_gerais: ''
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    fetchClientes();
    fetchTipos();
    fetchEmpresa();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchClienteDetails(selectedCliente.id);
    }
  }, [selectedCliente]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes/`);
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

  const fetchTipos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tipos/`);
      if (res.ok) setTipos(await res.json());
    } catch (err) {
      console.error(err);
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

  const fetchClienteDetails = async (clienteId) => {
    try {
      const [resEq, resOrd] = await Promise.all([
        fetch(`${API_URL}/api/equipamentos/`),
        fetch(`${API_URL}/api/ordens/`)
      ]);
      if (resEq.ok) {
        const allEq = await resEq.json();
        setClienteEquipamentos(allEq.filter(eq => eq.cliente_id === clienteId));
      }
      if (resOrd.ok) {
        const allOrd = await resOrd.json();
        setClienteOrdens(allOrd.filter(ord => ord.cliente_id === clienteId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenClienteModal = (cliente = null) => {
    if (cliente) {
      setEditMode(true);
      setClienteForm({
        id: cliente.id,
        nome: cliente.nome,
        nif: cliente.nif || '',
        morada: cliente.morada || '',
        email: cliente.email || '',
        contato: cliente.contato || '',
        periodicidade: cliente.periodicidade || 'Mensal',
        status: cliente.status || 'Ativo'
      });
    } else {
      setEditMode(false);
      setClienteForm({
        id: '', nome: '', nif: '', morada: '', email: '', contato: '', periodicidade: 'Mensal', status: 'Ativo'
      });
    }
    setShowClienteModal(true);
  };

  const handleSaveCliente = async (e) => {
    e.preventDefault();
    try {
      const url = editMode 
        ? `${API_URL}/api/clientes/${clienteForm.id}` 
        : `${API_URL}/api/clientes/`;
      const method = editMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteForm)
      });

      if (res.ok) {
        setShowClienteModal(false);
        fetchClientes();
        if (selectedCliente && selectedCliente.id === clienteForm.id) {
          const updated = await res.json();
          setSelectedCliente(updated);
        }
      } else {
        alert('Erro ao salvar cliente.');
      }
    } catch (err) {
      alert('Falha na comunicação com o servidor.');
    }
  };

  const handleDeleteCliente = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja apagar permanentemente o cliente "${nome}"?`)) {
      try {
        const res = await fetch(`${API_URL}/api/clientes/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSelectedCliente(null);
          fetchClientes();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- Equipamentos Internos ---
  const handleOpenEqModal = () => {
    setEqForm({
      nome: '', tipo_id: tipos.length > 0 ? tipos[0].id : '', marca: '', modelo: '', num_serie: '', localizacao: '', prox_manut: ''
    });
    setShowEqModal(true);
  };

  const handleSaveEq = async (e) => {
    e.preventDefault();
    const tipo = tipos.find(t => t.id === eqForm.tipo_id);
    const body = {
      ...eqForm,
      cliente_id: selectedCliente.id,
      tipo_nome: tipo ? tipo.nome : ''
    };

    try {
      const res = await fetch(`${API_URL}/api/equipamentos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowEqModal(false);
        fetchClienteDetails(selectedCliente.id);
        fetchClientes(); // refresh count
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEq = async (id, nome) => {
    if (window.confirm(`Deseja apagar o equipamento "${nome}"?`)) {
      await fetch(`${API_URL}/api/equipamentos/${id}`, { method: 'DELETE' });
      fetchClienteDetails(selectedCliente.id);
      fetchClientes(); // refresh count
    }
  };

  // --- Relatórios (Ordens de Serviço) ---
  const handleOpenReportModal = () => {
    if (clienteEquipamentos.length === 0) {
      alert('Por favor, adicione pelo menos um equipamento a este cliente primeiro.');
      return;
    }
    
    const firstEq = clienteEquipamentos[0];
    const tipo = tipos.find(t => t.nome === firstEq.tipo_nome);
    const checklist = tipo ? tipo.tarefas.map(t => ({ tarefa: t, concluida: true, comentario: '', foto_antes: '', foto_depois: '' })) : [];

    setReportForm({
      titulo: 'Relatório de Manutenção Preventiva',
      equipamento_id: firstEq.id,
      data: new Date().toISOString().split('T')[0],
      status: 'Concluída',
      tecnico: '',
      checklist,
      observacoes_gerais: ''
    });
    setShowReportModal(true);
  };

  const handleEqChangeInReport = (eqId) => {
    const eq = clienteEquipamentos.find(e => e.id === eqId);
    const tipo = tipos.find(t => t.nome === eq.tipo_nome);
    const checklist = tipo ? tipo.tarefas.map(t => ({ tarefa: t, concluida: true, comentario: '', foto_antes: '', foto_depois: '' })) : [];

    setReportForm(prev => ({
      ...prev,
      equipamento_id: eqId,
      checklist
    }));
  };

  const handleChecklistChange = (index, field, value) => {
    const list = [...reportForm.checklist];
    list[index][field] = value;
    setReportForm(prev => ({ ...prev, checklist: list }));
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    const body = {
      ...reportForm,
      cliente_id: selectedCliente.id
    };

    try {
      const res = await fetch(`${API_URL}/api/ordens/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowReportModal(false);
        fetchClienteDetails(selectedCliente.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Excluir este relatório permanentemente?')) {
      await fetch(`${API_URL}/api/ordens/${id}`, { method: 'DELETE' });
      fetchClienteDetails(selectedCliente.id);
    }
  };

  const handleOpenPrint = (report) => {
    setSelectedReport(report);
    setShowPrintModal(true);
  };

  const handlePrintAction = () => {
    window.print();
  };

  return (
    <main className="main-content">
      {/* Imprimir CSS inline exclusivo para o modo print */}
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
          .glass-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: black !important;
          }
        }
      `}</style>

      <header className="page-header">
        <h2>Gestão de Clientes</h2>
        <button onClick={() => handleOpenClienteModal()} className="btn-save" style={{ background: 'var(--accent)', color: 'white' }}>
          + Novo Cliente
        </button>
      </header>

      <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: selectedCliente ? '1fr 2fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Lista de Clientes */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Nossos Clientes</h3>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>A carregar clientes...</div>
          ) : clientes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum cliente registado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {clientes.map(cl => (
                <div 
                  key={cl.id} 
                  onClick={() => setSelectedCliente(cl)}
                  style={{ 
                    padding: '0.8rem 1rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    background: selectedCliente?.id === cl.id ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)', 
                    border: '1px solid',
                    borderColor: selectedCliente?.id === cl.id ? 'var(--accent)' : 'var(--glass-border)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{cl.nome}</span>
                    <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                      {cl.periodicidade}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {cl.equipamentos} Equipamentos • NIF: {cl.nif || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes do Cliente Selecionado */}
        {selectedCliente && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{selectedCliente.nome}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  📍 {selectedCliente.morada || 'Morada não registada'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <span><b>NIF:</b> {selectedCliente.nif || '-'}</span>
                  <span><b>E-mail:</b> {selectedCliente.email || '-'}</span>
                  <span><b>Contacto:</b> {selectedCliente.contato || '-'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleOpenClienteModal(selectedCliente)} className="btn-edit" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDeleteCliente(selectedCliente.id, selectedCliente.nome)} className="btn-delete" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '6px', color: 'var(--danger)', cursor: 'pointer' }}>Apagar</button>
              </div>
            </div>

            {/* Abas */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => setActiveTab('equipamentos')} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: 'transparent', 
                  border: 'none', 
                  borderBottom: activeTab === 'equipamentos' ? '2px solid var(--accent)' : 'none', 
                  color: activeTab === 'equipamentos' ? 'white' : 'var(--text-secondary)', 
                  fontWeight: activeTab === 'equipamentos' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                Equipamentos ({clienteEquipamentos.length})
              </button>
              <button 
                onClick={() => setActiveTab('relatorios')} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: 'transparent', 
                  border: 'none', 
                  borderBottom: activeTab === 'relatorios' ? '2px solid var(--accent)' : 'none', 
                  color: activeTab === 'relatorios' ? 'white' : 'var(--text-secondary)', 
                  fontWeight: activeTab === 'relatorios' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                Relatórios de Intervenção ({clienteOrdens.length})
              </button>
            </div>

            {/* Aba: Equipamentos */}
            {activeTab === 'equipamentos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem' }}>Equipamentos Instalados</h4>
                  <button onClick={handleOpenEqModal} style={{ padding: '0.4rem 0.8rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    + Adicionar Equipamento
                  </button>
                </div>

                {clienteEquipamentos.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum equipamento cadastrado neste cliente.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {clienteEquipamentos.map(eq => (
                      <div key={eq.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                        <div style={{ fontWeight: 'bold' }}>{eq.nome}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          <b>Tipo:</b> {eq.tipo_nome} <br />
                          <b>Marca:</b> {eq.marca || '-'} • <b>Modelo:</b> {eq.modelo || '-'} <br />
                          <b>S/N:</b> {eq.num_serie || '-'} • <b>Local:</b> {eq.localizacao || '-'}
                        </div>
                        <button 
                          onClick={() => handleDeleteEq(eq.id, eq.nome)}
                          style={{ 
                            position: 'absolute', top: '10px', right: '10px', 
                            background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' 
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba: Relatórios */}
            {activeTab === 'relatorios' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem' }}>Histórico de Relatórios</h4>
                  <button onClick={handleOpenReportModal} style={{ padding: '0.4rem 0.8rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    + Novo Relatório de Manutenção
                  </button>
                </div>

                {clienteOrdens.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum relatório criado para este cliente.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {clienteOrdens.map(ord => (
                      <div 
                        key={ord.id} 
                        style={{ 
                          padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{ord.titulo}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            Equipamento: <b>{ord.equipamento_nome}</b> • Data: {ord.data} • Técnico: {ord.tecnico || '-'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenPrint(ord)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', border: 'none', color: 'var(--accent)', borderRadius: '4px', cursor: 'pointer' }}>Imprimir / PDF</button>
                          <button onClick={() => handleDeleteReport(ord.id)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL CLIENTE --- */}
      {showClienteModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editMode ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSaveCliente} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Cliente</label>
                  <input type="text" value={clienteForm.nome} onChange={e => setClienteForm({...clienteForm, nome: e.target.value})} required placeholder="Ex: Condomínio Prestige" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>NIF</label>
                  <input type="text" value={clienteForm.nif} onChange={e => setClienteForm({...clienteForm, nif: e.target.value})} placeholder="Ex: 509876543" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Morada Completa</label>
                <input type="text" value={clienteForm.morada} onChange={e => setClienteForm({...clienteForm, morada: e.target.value})} placeholder="Rua do Ouro, 12, Lisboa" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>E-mail de Contacto</label>
                  <input type="email" value={clienteForm.email} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} placeholder="geral@cliente.pt" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Telefone / Telemóvel</label>
                  <input type="text" value={clienteForm.contato} onChange={e => setClienteForm({...clienteForm, contato: e.target.value})} placeholder="+351 912 345 678" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Periodicidade de Manutenção</label>
                  <select value={clienteForm.periodicidade} onChange={e => setClienteForm({...clienteForm, periodicidade: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    <option value="Semanal">Semanal</option>
                    <option value="Quinzenal">Quinzenal</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Estado</label>
                  <select value={clienteForm.status} onChange={e => setClienteForm({...clienteForm, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowClienteModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancelar</button>
                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL ADICIONAR EQUIPAMENTO INTERNO --- */}
      {showEqModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Adicionar Equipamento a {selectedCliente?.nome}</h3>
            <form onSubmit={handleSaveEq} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome (Identificação)</label>
                  <input type="text" value={eqForm.nome} onChange={e => setEqForm({...eqForm, nome: e.target.value})} required placeholder="Ex: AC Unidade Exterior 01" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tipo de Equipamento</label>
                  <select value={eqForm.tipo_id} onChange={e => setEqForm({...eqForm, tipo_id: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Marca</label>
                  <input type="text" value={eqForm.marca} onChange={e => setEqForm({...eqForm, marca: e.target.value})} placeholder="Ex: Mitsubishi" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Modelo</label>
                  <input type="text" value={eqForm.modelo} onChange={e => setEqForm({...eqForm, modelo: e.target.value})} placeholder="Ex: MSZ-AP" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Número de Série</label>
                  <input type="text" value={eqForm.num_serie} onChange={e => setEqForm({...eqForm, num_serie: e.target.value})} placeholder="Ex: SN-8263152" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Localização Interna</label>
                  <input type="text" value={eqForm.localizacao} onChange={e => setEqForm({...eqForm, localizacao: e.target.value})} placeholder="Ex: Telhado / Sala Técnica" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Data Próxima Manutenção</label>
                <input type="date" value={eqForm.prox_manut} onChange={e => setEqForm({...eqForm, prox_manut: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEqModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancelar</button>
                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Registar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CRIAR RELATÓRIO DE MANUTENÇÃO (CHECKLIST) --- */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Registar Relatório de Manutenção</h3>
            <form onSubmit={handleSaveReport} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Título do Relatório</label>
                  <input type="text" value={reportForm.titulo} onChange={e => setReportForm({...reportForm, titulo: e.target.value})} required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Data</label>
                  <input type="date" value={reportForm.data} onChange={e => setReportForm({...reportForm, data: e.target.value})} required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Equipamento Atendido</label>
                  <select value={reportForm.equipamento_id} onChange={e => handleEqChangeInReport(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    {clienteEquipamentos.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Técnico Executante</label>
                  <input type="text" value={reportForm.tecnico} onChange={e => setReportForm({...reportForm, tecnico: e.target.value})} placeholder="Nome do técnico" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Estado Pós Intervenção</label>
                  <select value={reportForm.status} onChange={e => setReportForm({...reportForm, status: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                    <option value="Concluída">Concluída (Funcionando 100%)</option>
                    <option value="Em andamento">Pendente (Aguardando peças/reparos)</option>
                  </select>
                </div>
              </div>

              {/* Checklist Dinâmico */}
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.8rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.4rem' }}>
                  Atividades & Checklist Operacional
                </h4>
                {reportForm.checklist.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma tarefa associada a este tipo de equipamento.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reportForm.checklist.map((item, index) => (
                      <div key={index} style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.tarefa}</span>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={item.concluida} 
                              onChange={e => handleChecklistChange(index, 'concluida', e.target.checked)} 
                            />
                            <span style={{ fontSize: '0.85rem', color: item.concluida ? 'var(--success)' : 'var(--text-muted)' }}>
                              {item.concluida ? 'Realizada' : 'Não Realizada'}
                            </span>
                          </label>
                        </div>
                        
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input 
                            type="text" 
                            placeholder="Comentário sobre esta tarefa (ex: Filtro limpo)" 
                            value={item.comentario}
                            onChange={e => handleChecklistChange(index, 'comentario', e.target.value)}
                            style={{ padding: '0.4rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                          />
                          <input 
                            type="text" 
                            placeholder="URL Foto Antes (opcional)" 
                            value={item.foto_antes}
                            onChange={e => handleChecklistChange(index, 'foto_antes', e.target.value)}
                            style={{ padding: '0.4rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                          />
                          <input 
                            type="text" 
                            placeholder="URL Foto Depois (opcional)" 
                            value={item.foto_depois}
                            onChange={e => handleChecklistChange(index, 'foto_depois', e.target.value)}
                            style={{ padding: '0.4rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Observações Gerais</label>
                <textarea 
                  rows="3" 
                  value={reportForm.observacoes_gerais} 
                  onChange={e => setReportForm({...reportForm, observacoes_gerais: e.target.value})}
                  placeholder="Descreva observações gerais e anomalias encontradas..." 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowReportModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancelar</button>
                <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.5rem 1.5rem', fontWeight: 'bold' }}>Salvar Relatório</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VISUALIZADOR E MODAL DE IMPRESSÃO PROFISSIONAL --- */}
      {showPrintModal && selectedReport && (
        <div className="modal-overlay no-print" style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="glass-card modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', background: '#f8fafc', color: '#1e293b' }}>
            
            {/* Botões Superiores no Visualizador */}
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

            {/* ÁREA DE IMPRESSÃO (Folha A4 formatada) */}
            <div id="print-area" style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#1e293b' }}>
              
              {/* Header: Dados da Minha Empresa & Logo */}
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
                    {selectedReport.titulo}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>
                    <b>Data:</b> {selectedReport.data} <br />
                    <b>Nº Relatório:</b> {selectedReport.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Informações de Faturação e Intervenção */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '8px' }}>CLIENTE</h3>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedCliente?.nome}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
                    {selectedCliente?.morada && <div>Morada: {selectedCliente.morada}</div>}
                    {selectedCliente?.nif && <span>NIF: {selectedCliente.nif} • </span>}
                    {selectedCliente?.periodicidade && <span>Periodicidade: {selectedCliente.periodicidade}</span>}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '8px' }}>EQUIPAMENTO E INTERVENÇÃO</h3>
                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                    {(() => {
                      const eq = clienteEquipamentos.find(e => e.id === selectedReport.equipamento_id);
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
                      <b>Técnico Executante:</b> {selectedReport.tecnico || 'N/A'} <br />
                      <b>Estado Final:</b> <span style={{ color: selectedReport.status === 'Concluída' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{selectedReport.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist Operacional das Atividades */}
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
                    {selectedReport.checklist.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: item.concluida ? '#10b981' : '#ef4444' }}>
                            {item.concluida ? '✓' : '✗'}
                          </td>
                          <td style={{ padding: '8px', fontWeight: 500 }}>{item.tarefa}</td>
                          <td style={{ padding: '8px', color: '#475569' }}>{item.comentario || 'Conforme'}</td>
                        </tr>
                        {/* Se tiver fotos anexadas nesta tarefa, mostre em miniatura */}
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

              {/* Observações Gerais */}
              {selectedReport.observacoes_gerais && (
                <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 5px 0' }}>Observações Gerais</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, whiteSpace: 'pre-line' }}>
                    {selectedReport.observacoes_gerais}
                  </p>
                </div>
              )}

              {/* Assinaturas */}
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
