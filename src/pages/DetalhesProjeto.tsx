import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Paperclip,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import {
  alterarStatusProcesso,
  atualizarObservacoesEtapa,
  avancarEtapa,
  deleteAnexoEtapa,
  deleteProcesso,
  getAnexosEtapa,
  getClientes,
  getErrorMessage,
  getProcessoById,
  retrocederEtapa,
  updateProcesso,
  uploadAnexoEtapa,
} from "../services/api";
import type { AnexoEtapa, Cliente, InstanciaEtapa, Processo } from "../types";

export function DetalhesProjeto() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<InstanciaEtapa | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = () =>
    getProcessoById(id)
      .then((r) => setProcesso(r.data))
      .catch((e) => setError(getErrorMessage(e)));
  useEffect(() => {
    void load();
    void getClientes().then((r) => setClientes(r.data));
  }, [id]);
  const action = async (run: () => Promise<unknown>) => {
    try {
      setSaving(true);
      await run();
      setSelected(null);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };
  const removeProject = async () => {
    if (
      !window.confirm(
        `Excluir permanentemente o projeto "${processo?.nomeObra}" e todos os seus arquivos?`,
      )
    )
      return;
    try {
      setSaving(true);
      setError("");
      await deleteProcesso(id);
      navigate("/projetos", { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };
  if (!processo)
    return (
      <div className="py-24 text-center text-slate-500">
        <Loader2 className="inline animate-spin text-blue-600" /> Carregando
        projeto…
      </div>
    );
  const link = `${window.location.origin}/acompanhar/${processo.linkCliente.split("/").pop()}`;
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="surface overflow-hidden">
        <div className="bg-slate-950 p-7 text-white md:p-8">
          <div className="flex flex-wrap justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold tracking-[.16em] text-slate-400">
                {processo.nomeTipoProcesso.toUpperCase()} ·{" "}
                {processo.status.replaceAll("_", " ")}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {processo.nomeObra}
              </h1>
              <p className="mt-3 text-sm text-slate-300">
                {processo.endereco}{" "}
                <span className="mx-2 text-slate-600">•</span>
                {processo.nomeCliente}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing(true)}
                className="button-secondary !border-white/15 !bg-white/10 !text-white hover:!bg-white/20"
              >
                <Pencil size={16} />
                Editar
              </button>
              <button
                disabled={saving}
                onClick={() => void removeProject()}
                className="button-secondary !border-red-400/30 !bg-red-500/10 !text-red-100 hover:!bg-red-500/20"
              >
                <Trash2 size={16} />
                Excluir
              </button>
              {processo.status === "ARQUIVADO" ? (
                <button
                  onClick={() =>
                    action(() =>
                      alterarStatusProcesso(processo.id, "EM_ANDAMENTO"),
                    )
                  }
                  className="button-secondary !border-white/15 !bg-white/10 !text-white hover:!bg-white/20"
                >
                  <RotateCcw size={16} />
                  Retomar
                </button>
              ) : (
                processo.status === "EM_ANDAMENTO" && (
                  <button
                    onClick={() =>
                      action(() =>
                        alterarStatusProcesso(processo.id, "ARQUIVADO"),
                      )
                    }
                    className="button-secondary !border-white/15 !bg-white/10 !text-white hover:!bg-white/20"
                  >
                    <Archive size={16} />
                    Arquivar
                  </button>
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-4 text-sm">
          <span className="min-w-0 flex-1 truncate text-slate-500">
            Link do cliente: <span className="text-slate-700">{link}</span>
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(link)}
            className="button-secondary shrink-0"
          >
            <Copy size={16} />
            Copiar
          </button>
        </div>
      </header>
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}
      {editing && (
        <Edit
          processo={processo}
          clientes={clientes}
          saving={saving}
          cancel={() => setEditing(false)}
          save={(v) =>
            action(async () => {
              await updateProcesso(processo.id, v);
              setEditing(false);
            })
          }
        />
      )}
      <section className="surface p-6 md:p-7">
        <p className="eyebrow">Fluxo de trabalho</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">
          Etapas do projeto
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Abra uma etapa para registrar observações e anexar arquivos.
        </p>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {processo.etapas.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className={`min-w-48 rounded-2xl border p-4 text-left transition ${e.status === "CONCLUIDO" ? "border-emerald-100 bg-emerald-50" : e.status === "EM_ANDAMENTO" ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-200" : "bg-white hover:border-slate-300 hover:shadow-sm"}`}
            >
              <span className="text-[11px] font-bold tracking-wide text-slate-400">
                ETAPA {e.ordem.toString().padStart(2, "0")}
              </span>
              <p className="mt-3 text-sm font-bold">{e.nomeEtapa}</p>
              <p
                className={`mt-1 text-xs ${e.status === "EM_ANDAMENTO" ? "text-slate-300" : "text-slate-500"}`}
              >
                {e.status.replace("_", " ")}
              </p>
            </button>
          ))}
        </div>
      </section>
      {selected && (
        <StagePanel
          etapa={selected}
          saving={saving}
          close={() => setSelected(null)}
          updateProject={load}
          action={action}
        />
      )}
    </main>
  );
}
function StagePanel({
  etapa,
  saving,
  close,
  updateProject,
  action,
}: {
  etapa: InstanciaEtapa;
  saving: boolean;
  close: () => void;
  updateProject: () => Promise<void>;
  action: (run: () => Promise<unknown>) => Promise<void>;
}) {
  const [observacoes, setObservacoes] = useState(
    etapa.observacoesTecnicas || "",
  );
  const [protocolo, setProtocolo] = useState(etapa.numeroProtocolo || "");
  const [anexos, setAnexos] = useState<AnexoEtapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const loadAnexos = async () => {
    try {
      setLoading(true);
      const { data } = await getAnexosEtapa(etapa.id);
      setAnexos(data);
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadAnexos();
  }, [etapa.id]);
  const saveNotes = async () => {
    try {
      setUploading(true);
      setMessage("");
      await atualizarObservacoesEtapa(etapa.id, {
        numeroProtocolo: protocolo,
        observacoesTecnicas: observacoes,
      });
      await updateProject();
      setMessage("Descrição salva.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    try {
      setUploading(true);
      setMessage("");
      await uploadAnexoEtapa(etapa.id, file);
      await loadAnexos();
      setMessage("Arquivo anexado com sucesso.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };
  const remove = async (anexo: AnexoEtapa) => {
    if (!window.confirm(`Excluir o arquivo "${anexo.nomeArquivo}"?`)) return;
    try {
      setUploading(true);
      setMessage("");
      await deleteAnexoEtapa(anexo.id);
      setAnexos((current) => current.filter((item) => item.id !== anexo.id));
      setMessage("Arquivo excluído com sucesso.");
    } catch (e) {
      setMessage(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };
  const formatSize = (size: number) =>
    size < 1024 * 1024
      ? `${Math.ceil(size / 1024)} KB`
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  const isImage = (anexo: AnexoEtapa) =>
    anexo.tipoDocumento?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(anexo.nomeArquivo);
  return (
    <aside className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm">
      <div className="absolute right-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6">
          <button
            className="float-right rounded-lg p-2 hover:bg-slate-100"
            onClick={close}
          >
            <X />
          </button>
          <p className="eyebrow">Etapa {etapa.ordem}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {etapa.nomeEtapa}
          </h2>
          <p className="mt-2 pr-8 text-sm text-slate-500">
            {etapa.descricao || "Sem descrição definida para esta etapa."}
          </p>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <section>
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <h3 className="font-semibold">Descrição e observações</h3>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Número do protocolo
              <input
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                placeholder="Opcional"
                className="field"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Observações da etapa
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Registre informações importantes desta etapa..."
                className="field min-h-28 resize-y"
              />
            </label>
            <button
              type="button"
              disabled={uploading}
              onClick={() => void saveNotes()}
              className="button-secondary mt-3"
            >
              <Save size={16} />
              Salvar descrição
            </button>
          </section>
          <section className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <Paperclip size={18} />
              <h3 className="font-semibold">Arquivos anexados</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Você pode anexar documentos, imagens, planilhas, PDFs, vídeos e
              outros arquivos.
            </p>
            <label className="button-primary mt-4 cursor-pointer">
              <Upload size={16} />
              {uploading ? "Enviando..." : "Anexar arquivo"}
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-slate-500">
                  <Loader2 className="mr-2 inline animate-spin" size={16} />
                  Carregando anexos...
                </p>
              ) : anexos.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Nenhum arquivo anexado nesta etapa.
                </p>
              ) : (
                anexos.map((anexo) => (
                  <div
                    key={anexo.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm"
                  >
                    {isImage(anexo) && (
                      <a
                        href={anexo.linkArquivo}
                        target="_blank"
                        rel="noreferrer"
                        className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200"
                        aria-label={`Visualizar ${anexo.nomeArquivo}`}
                      >
                        <img
                          src={anexo.linkArquivo}
                          alt={anexo.nomeArquivo}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    )}
                    <a
                      href={anexo.linkArquivo}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 flex-1 items-center justify-between transition hover:text-slate-600"
                    >
                      <span className="min-w-0">
                        <b className="block truncate text-slate-800">
                          {anexo.nomeArquivo}
                        </b>
                        <span className="text-xs text-slate-500">
                          {anexo.tipoDocumento} ·{" "}
                          {formatSize(anexo.tamanhoBytes)}
                        </span>
                      </span>
                      <ExternalLink
                        className="ml-3 shrink-0 text-slate-400"
                        size={17}
                      />
                    </a>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => void remove(anexo)}
                      aria-label={`Excluir ${anexo.nomeArquivo}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
          {message && (
            <p
              className={`rounded-xl p-3 text-sm ${message.includes("sucesso") || message.includes("salva") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
            >
              {message}
            </p>
          )}
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-6">
          <button
            disabled={saving || etapa.ordem === 1}
            onClick={() => void action(() => retrocederEtapa(etapa.id))}
            className="button-secondary flex-1"
          >
            Voltar
          </button>
          <button
            disabled={saving || etapa.status !== "EM_ANDAMENTO"}
            onClick={() => void action(() => avancarEtapa(etapa.id))}
            className="button-primary flex-1"
          >
            Concluir etapa
          </button>
        </div>
      </div>
    </aside>
  );
}
function Edit({
  processo,
  clientes,
  saving,
  cancel,
  save,
}: {
  processo: Processo;
  clientes: Cliente[];
  saving: boolean;
  cancel: () => void;
  save: (v: { nomeObra: string; endereco: string; clienteId: string }) => void;
}) {
  const [form, setForm] = useState({
    nomeObra: processo.nomeObra,
    endereco: processo.endereco,
    clienteId: processo.clienteId,
  });
  const [busca, setBusca] = useState("");
  const list = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const numeros = busca.replace(/\D/g, "");
    return clientes.filter(
      (c) =>
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        (!!numeros && c.documento.replace(/\D/g, "").includes(numeros)),
    );
  }, [busca, clientes]);
  const selectedClient = clientes.find((c) => c.id === form.clienteId);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(form);
      }}
      className="surface p-6 md:p-7"
    >
      <p className="eyebrow">Informações do projeto</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight">Editar projeto</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Nome da obra
          <input
            required
            value={form.nomeObra}
            onChange={(e) => setForm({ ...form, nomeObra: e.target.value })}
            className="field"
          />
        </label>
        <label className="text-sm font-medium">
          Rua / endereço
          <input
            required
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            className="field"
          />
        </label>
      </div>
      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label className="text-sm font-semibold">Cliente vinculado</label>
          <span className="text-xs text-slate-500">
            {clientes.length} cliente{clientes.length === 1 ? "" : "s"}{" "}
            disponível{clientes.length === 1 ? "" : "is"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Escolha outro cliente na lista ou filtre por nome, CPF ou CNPJ.
        </p>
        <div className="relative mt-3">
          <Search size={17} className="absolute left-3 top-4 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente por nome ou CPF/CNPJ"
            className="field mt-0 pl-10"
          />
        </div>
        <div className="mt-2 max-h-60 overflow-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-1.5">
          {list.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setForm({ ...form, clienteId: c.id })}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm transition hover:bg-white ${form.clienteId === c.id ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200" : "text-slate-600"}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${form.clienteId === c.id ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-600"}`}
                >
                  <UserRound size={15} />
                </span>
                <b className="truncate">{c.nome}</b>
              </span>
              <span className="ml-3 shrink-0 text-xs text-slate-500">
                {c.documento}
              </span>
              {form.clienteId === c.id && (
                <Check className="ml-2 shrink-0 text-emerald-600" size={17} />
              )}
            </button>
          ))}
          {list.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              Nenhum cliente encontrado.
            </p>
          )}
        </div>
        {selectedClient && (
          <p className="mt-2 text-xs text-slate-500">
            Selecionado:{" "}
            <strong className="text-slate-700">{selectedClient.nome}</strong>
          </p>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button disabled={saving || !form.clienteId} className="button-primary">
          Salvar alterações
        </button>
        <button type="button" onClick={cancel} className="button-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
