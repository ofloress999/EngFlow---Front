import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Clock3 } from 'lucide-react';
import { getAcompanhamentoCliente, getErrorMessage } from '../services/api';
import type { AcompanhamentoCliente as Acompanhamento } from '../types';

/** Página pública: mostra no máximo o estado anterior e o estado atual. */
export function AcompanhamentoCliente() {
  const { token = '' } = useParams(); const [dados, setDados] = useState<Acompanhamento | null>(null); const [erro, setErro] = useState('');
  useEffect(() => { getAcompanhamentoCliente(token).then(r => setDados(r.data)).catch(e => setErro(getErrorMessage(e))); }, [token]);
  if (erro) return <main className="mx-auto mt-24 max-w-lg rounded-2xl bg-red-50 p-8 text-center text-red-700">{erro}</main>;
  if (!dados) return <main className="py-24 text-center"><Loader2 className="inline animate-spin" /> Carregando acompanhamento...</main>;
  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-2xl"><header className="rounded-2xl bg-slate-900 p-7 text-white shadow"><p className="text-sm text-slate-300">Acompanhamento da obra</p><h1 className="mt-1 text-2xl font-bold">{dados.nomeObra}</h1><p className="mt-2 text-sm text-slate-300">{dados.endereco} · {dados.nomeCliente}</p></header><h2 className="mt-8 text-lg font-bold text-slate-800">Andamento atual</h2><div className="mt-4 space-y-3">{dados.etapasVisiveis.map((etapa, index) => { const atual = index === dados.etapasVisiveis.length - 1; return <article key={etapa.id} className={`rounded-2xl border p-5 ${atual ? 'border-blue-400 bg-blue-50' : 'border-emerald-200 bg-white'}`}><div className="flex items-center gap-3">{etapa.status === 'CONCLUIDO' ? <CheckCircle2 className="text-emerald-600" /> : <Clock3 className="text-blue-600" />}<div><p className="font-semibold text-slate-800">{etapa.nomeEtapa}</p><p className="text-sm text-slate-600">{atual ? 'Etapa atual' : 'Etapa anterior concluída'}</p></div></div></article>; })}</div><p className="mt-6 text-center text-xs text-slate-500">Este painel mostra somente as etapas já alcançadas.</p></section></main>;
}
