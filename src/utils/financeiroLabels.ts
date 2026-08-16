import { OrigemEntrada, TipoEntrada } from "@/types";

export const tipoEntradaLabels: Record<TipoEntrada, string> = {
  nenhum: "DEPÓSITO",
  cartao: "CARTÃO",
  dinheiro: "DINHEIRO",
  pix: "PIX",
};

export const tipoEntradaOrdem: TipoEntrada[] = ["nenhum", "cartao", "dinheiro", "pix"];

export const origemLabels: Record<OrigemEntrada, string> = {
  nenhum: "Nenhum",
  proprio: "Próprio",
  paulistao: "Paulistão",
  outros: "Outros",
};

export const origemOrdem: OrigemEntrada[] = ["nenhum", "proprio", "paulistao", "outros"];
