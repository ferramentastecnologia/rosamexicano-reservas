// Tipos compartilhados da aplicação

export type TableArea = 'interno' | 'semi-externo' | 'externo';

export interface TableConfig {
  number: number;
  capacity: number;
  area: TableArea;
}

export interface Reservation {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  numeroPessoas: number;
  valor: number;
  status: 'pending' | 'confirmed' | 'approved' | 'rejected' | 'cancelled';
  mesasSelecionadas: string;
  paymentId?: string;
  createdAt?: string;
}

export interface Voucher {
  id: string;
  codigo: string;
  valor: number;
  utilizado: boolean;
  dataValidade: string;
  dataUtilizacao?: string;
  qrCodeData: string;
  pdfUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  permissions: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface PaymentResponse {
  success: boolean;
  reservation_id: string;
  payment_id: string;
  external_ref: string;
  pix_qr_code: string;
  pix_copy_paste: string;
  expiration_date: string;
  amount: number;
}

export interface PaymentStatus {
  success: boolean;
  payment_id: string;
  status: string;
  is_confirmed: boolean;
  amount: number;
  confirmed_at?: string;
}
