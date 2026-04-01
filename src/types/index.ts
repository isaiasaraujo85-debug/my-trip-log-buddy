export interface Funcionario {
  id: string;
  nome: string;
  matricula: string;
  funcao: string;
}

export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
}

export interface EmpresaConfig {
  nome: string;
  logoBase64?: string;
}

export interface AttachedImage {
  id: string;
  base64: string;
  timestamp: string;
}

export interface KmRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  veiculoId: string;
  veiculo: string;
  placa: string;
  data: string;
  kmInicial: number | null;
  kmFinal: number | null;
  kmPercorrido: number;
  valorKm?: number;
  valorTotal?: number;
  status: 'parcial' | 'completo';
  imagensKmInicial?: AttachedImage[];
  imagensKmFinal?: AttachedImage[];
}

export interface PedagioRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  veiculoId: string;
  veiculo: string;
  placa: string;
  data: string;
  valor: number;
  direcao: 'ida' | 'volta';
  imagensComprovante?: AttachedImage[];
}

export type TipoRefeicao = 'cafe' | 'almoco' | 'jantar' | 'outros';

export interface RefeicaoRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  data: string;
  tipo: TipoRefeicao;
  valor: number;
  imagens?: AttachedImage[];
}
