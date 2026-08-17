import { OrigemEntrada, TipoEntrada } from "@/types";

export const tipoEntradaLabels: Record<TipoEntrada, string> = {
  nenhum: "DEPÓSITO",
  cartao: "CARTÃO",
  dinheiro: "DINHEIRO",
  pix: "PIX",
  outros: "OUTROS",
};

export const tipoEntradaOrdem: TipoEntrada[] = ["nenhum", "cartao", "dinheiro", "pix", "outros"];

export const origemLabels: Record<OrigemEntrada, string> = {
  nenhum: "Nenhum",
  proprio: "Valor Próprio",
  paulistao: "Paulistão",
  outros: "Outros",
};

export const origemOrdem: OrigemEntrada[] = ["nenhum", "proprio", "paulistao", "outros"];

