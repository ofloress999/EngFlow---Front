import axios from "axios";
export const api = axios.create({
  // Em produção, /api é encaminhado pela Vercel ao Render. Assim o cookie de
  // sessão continua sendo de primeira parte e funciona também em celulares.
  baseURL:
    import.meta.env.VITE_API_URL ??
    (import.meta.env.PROD ? "" : "http://localhost:8080"),
  withCredentials: true,
});
export const getErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return "Erro inesperado.";
  if (error.response?.status === 401)
    return "Sua sessão expirou. Entre novamente para continuar.";
  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  return "Não foi possível concluir a operação.";
};
export const getClientes = () => api.get("/api/clientes");
export const createCliente = (data: {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco?: string;
}) => api.post("/api/clientes", data);
export const updateCliente = (id: string, data: { nome: string; documento: string; email: string; telefone: string; endereco?: string }) => api.put(`/api/clientes/${id}`, data);
export const deleteCliente = (id: string) => api.delete(`/api/clientes/${id}`);
export const getProcessos = () => api.get("/api/processos");
export const getProcessoById = (id: string) => api.get(`/api/processos/${id}`);
export const getTiposProcesso = () => api.get("/api/tipos-processo");
export const createProcesso = (data: {
  nomeObra: string;
  endereco: string;
  clienteId: string;
  tipoProcessoId: string;
  observacoes?: string;
}) => api.post("/api/processos", data);
export const updateProcesso = (
  id: string,
  data: { nomeObra: string; endereco: string; clienteId: string },
) => api.put(`/api/processos/${id}`, data);
export const deleteProcesso = (id: string) => api.delete(`/api/processos/${id}`);
export const alterarStatusProcesso = (
  id: string,
  status: "EM_ANDAMENTO" | "ARQUIVADO",
) =>
  api.patch(`/api/processos/${id}/status`, undefined, { params: { status } });
export const getAcompanhamentoCliente = (token: string) =>
  api.get(`/api/acompanhamento/${token}`);
export const avancarEtapa = (id: string) =>
  api.put(`/api/processos/etapas/${id}/avancar`);
export const retrocederEtapa = (id: string) =>
  api.put(`/api/processos/etapas/${id}/retroceder`);
export const atualizarObservacoesEtapa = (
  id: string,
  data: { numeroProtocolo: string; observacoesTecnicas: string },
) => api.put(`/api/processos/etapas/${id}/observacoes`, data);
export const getAnexosEtapa = (id: string) =>
  api.get(`/api/anexos/etapas/${id}`);
export const uploadAnexoEtapa = (id: string, file: File) => {
  const body = new FormData();
  body.append("file", file);
  return api.post(`/api/anexos/etapas/${id}`, body);
};
export const deleteAnexoEtapa = (id: string) => api.delete(`/api/anexos/${id}`);
export const login = (data: { email: string; senha: string }) =>
  api.post("/api/auth/login", data);
export const register = (data: {
  nome: string;
  email: string;
  senha: string;
  creaCau: string;
  telefone: string;
}) => api.post("/api/auth/register", data);
export const me = () => api.get("/api/auth/me");
export const updatePerfil = (data: { nome: string; telefone: string }) => api.put("/api/auth/me", data);
export const uploadFotoPerfil = (file: File) => { const body = new FormData(); body.append("file", file); return api.post("/api/auth/me/foto", body); };
export const logout = () => api.post("/api/auth/logout");
