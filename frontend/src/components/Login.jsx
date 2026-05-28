import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', nome: '', role: 'Técnico' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(`https://manutweb-app.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          onLogin(data.user, data.access_token);
        } else {
          // If registered, auto login or switch to login
          setIsLogin(true);
          setError('Registro concluído. Faça o login agora.');
        }
      } else {
        setError(data.detail || 'Erro ao processar solicitação.');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor. O backend está rodando?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="glass-card login-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <span className="icon">🔧</span>
          <h1 style={{ fontSize: '1.8rem' }}>ManutWeb</h1>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 500 }}>
          {isLogin ? 'Acesso ao Sistema' : 'Criar Nova Conta'}
        </h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  placeholder="Seu nome" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Perfil</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                >
                  <option value="Técnico">Técnico</option>
                  <option value="Gestor">Gestor</option>
                  <option value="Admin">Administrador</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>E-mail</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="exemplo@manutweb.com" 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
            />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Senha</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••" 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s' }}
            onMouseOver={(e) => { if(!loading) e.target.style.background = 'var(--accent-hover)' }}
            onMouseOut={(e) => { if(!loading) e.target.style.background = 'var(--accent)' }}
          >
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <p>Não tem conta? <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setIsLogin(false)}>Registre-se</span></p>
          ) : (
            <p>Já tem conta? <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setIsLogin(true)}>Faça Login</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
