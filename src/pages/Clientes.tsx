import React, { useEffect, useState } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  createCliente,
  deleteCliente,
  getClientes,
  getErrorMessage,
  updateCliente,
} from "../services/api";
import type { Cliente } from "../types";

const digits = (value: string) => value.replace(/\D/g, "");
const phone = (value: string) =>
  digits(value)
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
const doc = (value: string) => {
  const d = digits(value).slice(0, 14);
  return d.length <= 11
    ? d
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    : d
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
};
type Form = Omit<Cliente, "id">;
const blank: Form = {
  nome: "",
  documento: "",
  email: "",
  telefone: "",
  endereco: "",
};

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [busca, setBusca] = useState(""),
    [tab, setTab] = useState<"VER" | "CADASTRAR">("VER"),
    [form, setForm] = useState<Form>(blank),
    [selected, setSelected] = useState<Cliente | null>(null),
    [action, setAction] = useState<"edit" | "delete" | null>(null),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState("");
  const load = async () => {
    try {
      setLoading(true);
      setClientes((await getClientes()).data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const field = (key: keyof Form, value: string) =>
    setForm((f) => ({
      ...f,
      [key]:
        key === "telefone"
          ? phone(value)
          : key === "documento"
            ? doc(value)
            : value,
    }));
  const save = async () => {
    try {
      setSaving(true);
      const data = {
        ...form,
        documento: digits(form.documento),
        telefone: digits(form.telefone),
      };
      selected
        ? await updateCliente(selected.id, data)
        : await createCliente(data);
      setForm(blank);
      setSelected(null);
      setTab("VER");
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
      setAction(null);
      setConfirmed(false);
    }
  };
  const remove = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await deleteCliente(selected.id);
      setSelected(null);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
      setAction(null);
      setConfirmed(false);
    }
  };
  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.documento.includes(digits(busca)),
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestão de Clientes
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre e gerencie os proprietários das obras
          </p>
        </div>
        <div className="segmented-control">
          <button onClick={() => setTab("VER")} data-active={tab === "VER"}>
            Ver clientes
          </button>
          <button
            onClick={() => {
              setSelected(null);
              setForm(blank);
              setTab("CADASTRAR");
            }}
            data-active={tab === "CADASTRAR"}
          >
            Novo cliente
          </button>
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {tab === "VER" ? (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome ou CPF/CNPJ..."
              className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm shadow-sm"
            />
          </div>
          {loading ? (
            <div className="flex justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="animate-spin" />
              Carregando clientes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center text-slate-500">
              Nenhum cliente cadastrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {c.nome}
                        </h3>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <FileText className="h-3 w-3" />
                          {doc(c.documento)}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <button
                        aria-label="Editar cliente"
                        onClick={() => {
                          setSelected(c);
                          setForm({
                            ...c,
                            documento: doc(c.documento),
                            telefone: phone(c.telefone),
                          });
                          setTab("CADASTRAR");
                        }}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label="Remover cliente"
                        onClick={() => {
                          setSelected(c);
                          setAction("delete");
                        }}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-slate-600">
                    <p className="flex gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </p>
                    <p className="flex gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {phone(c.telefone)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (digits(form.telefone).length < 10)
              setError("Informe um telefone válido com DDD.");
            else selected ? setAction("edit") : void save();
          }}
          className="max-w-xl space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-bold">
            {selected ? "Editar cliente" : "Cadastrar novo cliente"}
          </h2>
          <label className="block text-xs font-semibold">
            Nome completo
            <input
              required
              value={form.nome}
              onChange={(e) => field("nome", e.target.value)}
              className="field"
            />
          </label>
          <label className="block text-xs font-semibold">
            CPF ou CNPJ
            <input
              required
              value={form.documento}
              onChange={(e) => field("documento", e.target.value)}
              className="field"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold">
              E-mail
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                className="field"
              />
            </label>
            <label className="block text-xs font-semibold">
              Telefone / WhatsApp
              <input
                required
                value={form.telefone}
                onChange={(e) => field("telefone", e.target.value)}
                className="field"
                placeholder="(99) 99999-9999"
              />
            </label>
          </div>
          <button disabled={saving} className="button-primary w-full">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {selected ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </form>
      )}
      {action && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <AlertTriangle className="mb-3 text-amber-500" />
            <h2 className="text-lg font-bold">
              {action === "delete"
                ? "Remover cliente?"
                : "Confirmar alterações?"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {action === "delete"
                ? "Ao remover este cliente, todos os projetos vinculados a ele e seus arquivos serão perdidos permanentemente."
                : "Você está prestes a alterar os dados cadastrais deste cliente."}
            </p>
            {confirmed && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Segunda confirmação:{" "}
                {action === "delete"
                  ? "a exclusão não poderá ser desfeita."
                  : "as alterações serão aplicadas agora."}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="button-secondary"
                onClick={() => {
                  setAction(null);
                  setConfirmed(false);
                }}
              >
                Cancelar
              </button>
              <button
                className={
                  action === "delete"
                    ? "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
                    : "button-primary"
                }
                onClick={() =>
                  confirmed
                    ? void (action === "delete" ? remove() : save())
                    : setConfirmed(true)
                }
              >
                {confirmed
                  ? action === "delete"
                    ? "Remover definitivamente"
                    : "Salvar agora"
                  : "Continuar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
