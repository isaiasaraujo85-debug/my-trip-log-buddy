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
  observacao?: string;
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
  observacao?: string;
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
  observacao?: string;
}

export type TipoTransporte = 'nenhum' | '99' | 'uber' | 'taxi' | 'onibus' | 'outros';

export interface TransporteRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  transporte: TipoTransporte;
  data: string;
  valor: number;
  direcao: 'ida' | 'volta';
  imagensComprovante?: AttachedImage[];
  observacao?: string;
}

export type TipoHospedagem = 'nenhum' | 'airbnb' | 'hotel' | 'pousada' | 'outros';

export interface HospedagemRecord {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  funcionarioMatricula: string;
  data: string;
  tipo: TipoHospedagem;
  valor: number;
  imagens?: AttachedImage[];
  observacao?: string;
}

export interface DepositoRecord {
  id: string;
  data: string;
  valor: number;
  observacao?: string;
}

export interface Movimento {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
}
