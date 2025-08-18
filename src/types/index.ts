export interface Party {
  id: string;
  name: string;
  salesman: string;
}

export interface Transaction {
  id: string;
  partyName: string;
  amount: number;
  date: string;
}

export interface SalesmanTotal {
  salesman: string;
  totalAmount: number;
  partyCount: number;
}

export interface PartyTotal {
  partyName: string;
  totalAmount: number;
  transactionCount: number;
}

export interface FileUploadStatus {
  master: boolean;
  transaction: boolean;
}