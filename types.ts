
export enum AccountType {
  Cash = 'Tunai',
  Bank = 'Bank',
  EWallet = 'E-Wallet',
  Investment = 'Investasi'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface Platform {
  id: string;
  name: string;
}

export interface Investment {
  id: string;
  date: string;
  name: string;
  platformId: string;
  accountId: string; // Source of funds
  initialValue: number;
  currentValue: number;
}

export enum AssetType {
    Property = 'Properti',
    Vehicle = 'Kendaraan',
    Electronics = 'Elektronik',
    Other = 'Lainnya'
}

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    purchaseDate: string;
    accountId?: string; // Source of funds is optional now
    purchaseValue: number;
    currentValue: number;
}

export enum TransactionType {
  Income = 'Uang Masuk',
  Expense = 'Uang Keluar',
  Transfer = 'Transfer'
}

export enum TransactionSource {
  Manual = 'manual',
  Investment = 'investment',
  Receivable = 'receivable',
  Asset = 'asset'
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
  amount: number;
  category: string;
  description: string;
  source: TransactionSource;
  linkedInvestmentId?: string;
  linkedReceivableId?: string;
  linkedAssetId?: string;
}

export enum ReceivableStatus {
  Unpaid = 'Belum Lunas',
  Paid = 'Lunas'
}

export interface Receivable {
  id: string;
  debtorName: string;
  amount: number;
  dueDate: string;
  status: ReceivableStatus;
  accountId: string;
}