import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, FileText, Loader2 } from 'lucide-react';
import { getClientes, createCliente, getErrorMessage } from '../services/api';
import type { Cliente } from '../types';

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'VER' | 'CADASTRAR'>('VER');

  // Form States
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState('');

  const formatarDocumento = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 14);
    if (digitos.length <= 11) return digitos.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return digitos.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  };

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const res = await getClientes();
      setClientes(res.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

 const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createCliente({ 
        nome, 
        documento: cpfCnpj.replace(/\D/g, ''), 
        email, 
        telefone 
      });
      alert('Cliente cadastrado com sucesso!');
      setNome('');
      setCpfCnpj('');
      setEmail('');
      setTelefone('');
      setAbaAtiva('VER');
      carregarClientes();
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.documento.includes(busca)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Clientes</h1>
          <p className="text-sm text-slate-500">Cadastre e gerencie os proprietários das obras</p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setAbaAtiva('VER')}
            className={`px-4 py-2 rounded-lg transition-all ${
              abaAtiva === 'VER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Ver Clientes
          </button>
          <button
            onClick={() => setAbaAtiva('CADASTRAR')}
            className={`px-4 py-2 rounded-lg transition-all ${
              abaAtiva === 'CADASTRAR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Novo Cliente
          </button>
        </div>
      </div>

      {abaAtiva === 'VER' ? (
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou CPF/CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Carregando clientes...</span>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
              Nenhum cliente cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.nome}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {c.documento}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.telefone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSalvarCliente} className="bg-white p-6 rounded-2xl border border-slate-200 max-w-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cadastrar Novo Cliente</h2>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
              placeholder="Ex: Carlos Eduardo Silva"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">CPF ou CNPJ</label>
            <input
              type="text"
              required
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatarDocumento(e.target.value))}
              pattern="[0-9.\-/]{14,18}"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
              placeholder="000.000.000-00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
              <input required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
              <input required
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                placeholder="(35) 99999-9999"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
        </form>
      )}
    </div>
  );
};
