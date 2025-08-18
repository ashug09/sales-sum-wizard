import * as XLSX from 'xlsx';
import { Party, Transaction } from '@/types';

export const parseExcelFile = (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

export const validateMasterSheet = (data: any[][]): Party[] => {
  const parties: Party[] = [];
  
  // Skip header row if exists
  const startRow = data[0] && typeof data[0][0] === 'string' && 
                   data[0][0].toLowerCase().includes('party') ? 1 : 0;
  
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (row && row.length >= 2 && row[0] && row[1]) {
      const partyName = String(row[0]).trim();
      const salesman = String(row[1]).trim();
      
      if (partyName && salesman) {
        parties.push({
          id: crypto.randomUUID(),
          name: partyName,
          salesman: salesman
        });
      }
    }
  }
  
  if (parties.length === 0) {
    throw new Error('No valid party-salesman data found. Ensure the file has party names in column 1 and salesman names in column 2.');
  }
  
  return parties;
};

export const validateTransactionSheet = (data: any[][]): Transaction[] => {
  const transactions: Transaction[] = [];
  
  // Skip header row if exists
  const startRow = data[0] && typeof data[0][0] === 'string' && 
                   data[0][0].toLowerCase().includes('party') ? 1 : 0;
  
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (row && row.length >= 2 && row[0] && row[1]) {
      const partyName = String(row[0]).trim();
      const amountValue = row[1];
      
      // Parse amount - handle different number formats
      let amount: number;
      if (typeof amountValue === 'number') {
        amount = amountValue;
      } else if (typeof amountValue === 'string') {
        // Remove commas and parse
        amount = parseFloat(amountValue.replace(/,/g, ''));
      } else {
        continue; // Skip invalid amount
      }
      
      if (partyName && !isNaN(amount) && amount >= 0) {
        transactions.push({
          id: crypto.randomUUID(),
          partyName: partyName,
          amount: amount,
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }
  
  if (transactions.length === 0) {
    throw new Error('No valid transaction data found. Ensure the file has party names in column 1 and amounts in column 2.');
  }
  
  return transactions;
};