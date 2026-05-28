import React, { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';

export default function Empresa() {
  const [empresa, setEmpresa] = useState({
    nome: '',
    nif: '',
    morada: '',
    email: '',
    telefone: '',
    iban: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    carregarEmpresa();
  }, []);

  const carregarEmpresa = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresa/`);
      if (res.ok) {
        const data = await res.json();
        setEmpresa(data);
      }
    } catch (error) {
      console.error('Erro ao carregar os dados da empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensagem(null);
    try {
      const res = await fetch(`${API_URL}/api/empresa/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa)
      });
      if (res.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Dados da empresa atualizados com sucesso!' });
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar dados.' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Falha na comunicação com o servidor.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">A carregar definições...</div>;

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h2>Definições da Empresa</h2>
        <p>Configure os dados oficiais da sua empresa para relatórios e faturas.</p>
      </div>

      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'success' : 'danger'}`}>
          {mensagem.texto}
        </div>
      )}

      <div className="glass-card company-form-card">
        <form onSubmit={handleSubmit} className="company-form">
          {empresa.logo_url && (
            <div className="company-logo-preview">
              <img src={empresa.logo_url} alt="Logótipo da Empresa" />
            </div>
          )}
          
          <div className="form-group">
            <label>Logótipo (URL da Imagem)</label>
            <input 
              type="text" 
              name="logo_url" 
              value={empresa.logo_url} 
              onChange={handleChange} 
              placeholder="https://exemplo.com/sua-logo.png"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Nome da Empresa</label>
              <input type="text" name="nome" value={empresa.nome} onChange={handleChange} required placeholder="Sua Empresa Lda." />
            </div>
            
            <div className="form-group">
              <label>NIF (Número de Identificação Fiscal)</label>
              <input type="text" name="nif" value={empresa.nif} onChange={handleChange} required placeholder="Ex: 500 000 000" />
            </div>
            
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" name="email" value={empresa.email} onChange={handleChange} required placeholder="contacto@suaempresa.pt" />
            </div>
            
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" name="telefone" value={empresa.telefone} onChange={handleChange} required placeholder="+351 912 345 678" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Morada Completa</label>
            <input type="text" name="morada" value={empresa.morada} onChange={handleChange} required placeholder="Rua de Exemplo, 123, 1000-000 Lisboa, Portugal" />
          </div>
          
          <div className="form-group">
            <label>IBAN</label>
            <input type="text" name="iban" value={empresa.iban} onChange={handleChange} placeholder="PT50 0000 0000 0000 0000 0000 0" />
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'A Guardar...' : 'Guardar Definições'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
