import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  BadgeCheck,
  ChevronDown,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { getAcompanhamentoCliente, getErrorMessage } from "../services/api";
import type {
  AcompanhamentoCliente as Acompanhamento,
  AnexoEtapa,
  InstanciaEtapa,
} from "../types";
const phone = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
const image = (file: AnexoEtapa) =>
  file.tipoDocumento?.startsWith("image/") ||
  /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.nomeArquivo);
function Arquivos({ anexos = [] }: { anexos?: AnexoEtapa[] }) {
  if (!anexos.length)
    return (
      <p className="mt-4 text-sm text-slate-500">
        Nenhum arquivo anexado nesta etapa.
      </p>
    );
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {anexos.map((file) =>
        image(file) ? (
          <a
            key={file.id}
            href={file.linkArquivo}
            target="_blank"
            rel="noreferrer"
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            <img
              src={file.linkArquivo}
              alt={file.nomeArquivo}
              className="h-36 w-full object-cover"
            />
            <span className="block truncate p-2 text-xs font-medium text-slate-700">
              {file.nomeArquivo}
            </span>
          </a>
        ) : (
          <a
            key={file.id}
            href={file.linkArquivo}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FileText size={18} />
            <span className="truncate">{file.nomeArquivo}</span>
          </a>
        ),
      )}
    </div>
  );
}
function EtapaPublica({
  etapa,
  atual,
}: {
  etapa: InstanciaEtapa;
  atual: boolean;
}) {
  const [open, setOpen] = useState(atual);
  return (
    <article
      className={`rounded-2xl border ${atual ? "border-blue-400 bg-blue-50" : "border-emerald-200 bg-white"}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-5 text-left"
      >
        {etapa.status === "CONCLUIDO" ? (
          <CheckCircle2 className="text-emerald-600" />
        ) : (
          <Clock3 className="text-blue-600" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{etapa.nomeEtapa}</p>
          <p className="text-sm text-slate-600">
            {atual ? "Etapa atual" : "Etapa anterior concluída"}
          </p>
        </div>
        <ChevronDown
          className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-200 px-5 pb-5 pt-4">
          <p className="text-sm text-slate-600">{etapa.descricao}</p>
          {etapa.numeroProtocolo && (
            <p className="mt-3 text-sm">
              <span className="font-semibold">Protocolo:</span>{" "}
              {etapa.numeroProtocolo}
            </p>
          )}
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-800">
              Observação do engenheiro
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
              {etapa.observacoesTecnicas || "Nenhuma observação registrada."}
            </p>
          </div>
          <div className="mt-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ImageIcon size={16} />
              Arquivos da etapa
            </p>
            <Arquivos anexos={etapa.anexos} />
          </div>
        </div>
      )}
    </article>
  );
}
export function AcompanhamentoCliente() {
  const { token = "" } = useParams();
  const [dados, setDados] = useState<Acompanhamento | null>(null),
    [erro, setErro] = useState("");
  useEffect(() => {
    getAcompanhamentoCliente(token)
      .then((r) => setDados(r.data))
      .catch((e) => setErro(getErrorMessage(e)));
  }, [token]);
  if (erro)
    return (
      <main className="mx-auto mt-24 max-w-lg rounded-2xl bg-red-50 p-8 text-center text-red-700">
        {erro}
      </main>
    );
  if (!dados)
    return (
      <main className="py-24 text-center">
        <Loader2 className="inline animate-spin" /> Carregando acompanhamento...
      </main>
    );
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-2xl">
        <header className="rounded-2xl bg-slate-900 p-7 text-white">
          <p className="text-sm text-slate-300">Acompanhamento da obra</p>
          <h1 className="mt-1 text-2xl font-bold">{dados.nomeObra}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {dados.endereco} · {dados.nomeCliente}
          </p>
        </header>
        <section className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 font-bold text-white">
            {dados.fotoEngenheiroUrl ? (
              <img
                src={dados.fotoEngenheiroUrl}
                alt={`Foto de ${dados.nomeEngenheiro}`}
                className="h-full w-full object-cover"
              />
            ) : (
              dados.nomeEngenheiro?.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900">{dados.nomeEngenheiro}</p>
            <p className="flex items-center gap-1 text-sm text-slate-600">
              <BadgeCheck size={15} />
              CREA/CAU: {dados.creaCauEngenheiro}
            </p>
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {phone(dados.telefoneEngenheiro || "")}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={14} />
                {dados.emailEngenheiro}
              </span>
            </p>
          </div>
        </section>
        <h2 className="mt-8 text-lg font-bold text-slate-800">
          Andamento atual
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Clique em uma etapa para ver observações e arquivos.
        </p>
        <div className="mt-4 space-y-3">
          {dados.etapasVisiveis.map((etapa, index) => (
            <EtapaPublica
              key={etapa.id}
              etapa={etapa}
              atual={index === dados.etapasVisiveis.length - 1}
            />
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Este painel é somente para visualização e mostra apenas as etapas já
          alcançadas.
        </p>
      </section>
    </main>
  );
}
