export interface KmRecord {
  id: string;
  placa: string;
  proprietario: string;
  chapa: string;
  data: string;
  kmInicial: number;
  kmFinal: number;
  kmPercorrido: number;
}

export interface PedagioRecord {
  id: string;
  data: string;
  valor: number;
}

export interface RefeicaoRecord {
  id: string;
  data: string;
  valor: number;
}
