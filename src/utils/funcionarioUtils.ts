import { Funcionario } from "@/types";

/** Busca a função do funcionário cadastrado a partir do id (armazenamento local). */
export function getFuncionarioFuncao(funcionarioId?: string): string {
  if (!funcionarioId) return "";
  try {
    const raw = window.localStorage.getItem("funcionarios");
    if (!raw) return "";
    const funcionarios = JSON.parse(raw) as Funcionario[];
    return funcionarios.find((f) => f.id === funcionarioId)?.funcao || "";
  } catch {
    return "";
  }
}
