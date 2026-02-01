export interface Funcionario {
  id: string;
  nome: string;
  chapa: string;
  carro: string;
  placa: string;
}

export interface EmpresaConfig {
  nome: string;
  logoBase64?: string;
}

export interface KmRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioChapa: string;
  carro: string;
  placa: string;
  data: string;
  kmInicial: number | null;
  kmFinal: number | null;
  kmPercorrido: number;
  status: 'parcial' | 'completo';
}

export interface PedagioRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioChapa: string;
  carro: string;
  placa: string;
  data: string;
  valor: number;
}

export interface RefeicaoRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioChapa: string;
  data: string;
  valor: number;
}
