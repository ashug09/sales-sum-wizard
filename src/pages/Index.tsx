import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, RotateCcw, AlertCircle, BarChart3 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ManualEntry from '@/components/ManualEntry';
import DataTables from '@/components/DataTables';
import { Party, Transaction, SalesmanTotal, PartyTotal, FileUploadStatus } from '@/types';
import { parseExcelFile, validateMasterSheet, validateTransactionSheet } from '@/utils/excelParser';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fileStatus, setFileStatus] = useState<FileUploadStatus>({ master: false, transaction: false });
  const [uploadedFiles, setUploadedFiles] = useState<{ master?: string; transaction?: string }>({});
  const [salesmanTotals, setSalesmanTotals] = useState<SalesmanTotal[]>([]);
  const [partyTotals, setPartyTotals] = useState<PartyTotal[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const { toast } = useToast();

  const handleMasterFileUpload = useCallback(async (file: File) => {
    try {
      setError('');
      const data = await parseExcelFile(file);
      const validatedParties = validateMasterSheet(data);
      
      setParties(validatedParties);
      setFileStatus(prev => ({ ...prev, master: true }));
      setUploadedFiles(prev => ({ ...prev, master: file.name }));
      
      toast({
        title: "Success",
        description: `Master sheet uploaded successfully. ${validatedParties.length} parties loaded.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse master sheet';
      setError(`Master Sheet Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleTransactionFileUpload = useCallback(async (file: File) => {
    try {
      setError('');
      const data = await parseExcelFile(file);
      const validatedTransactions = validateTransactionSheet(data);
      
      setTransactions(validatedTransactions);
      setFileStatus(prev => ({ ...prev, transaction: true }));
      setUploadedFiles(prev => ({ ...prev, transaction: file.name }));
      setIsCalculated(false);
      
      toast({
        title: "Success",
        description: `Transaction sheet uploaded successfully. ${validatedTransactions.length} transactions loaded.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse transaction sheet';
      setError(`Transaction Sheet Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const addParty = useCallback((newParty: Omit<Party, 'id'>) => {
    const party: Party = {
      ...newParty,
      id: crypto.randomUUID()
    };
    setParties(prev => [...prev, party]);
  }, []);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [...prev, transaction]);
    setIsCalculated(false);
  }, []);

  const updateTransaction = useCallback((id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );
    setIsCalculated(false);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setIsCalculated(false);
  }, []);

  const calculateTotals = useCallback(() => {
    if (transactions.length === 0) {
      toast({
        title: "Warning",
        description: "No transactions to calculate",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create party-salesman mapping
      const partyMap = new Map<string, string>();
      parties.forEach(party => {
        partyMap.set(party.name.toLowerCase(), party.salesman);
      });

      // Calculate salesman totals
      const salesmanMap = new Map<string, { totalAmount: number; partyCount: number }>();
      const partyTotalMap = new Map<string, { totalAmount: number; transactionCount: number }>();
      let total = 0;

      transactions.forEach(transaction => {
        const salesman = partyMap.get(transaction.partyName.toLowerCase()) || 'Unknown Salesman';
        
        // Update salesman totals
        const current = salesmanMap.get(salesman) || { totalAmount: 0, partyCount: 0 };
        salesmanMap.set(salesman, {
          totalAmount: current.totalAmount + transaction.amount,
          partyCount: current.partyCount
        });

        // Update party totals
        const partyCurrent = partyTotalMap.get(transaction.partyName) || { totalAmount: 0, transactionCount: 0 };
        partyTotalMap.set(transaction.partyName, {
          totalAmount: partyCurrent.totalAmount + transaction.amount,
          transactionCount: partyCurrent.transactionCount + 1
        });

        total += transaction.amount;
      });

      // Count unique parties per salesman
      const salesmanParties = new Map<string, Set<string>>();
      transactions.forEach(transaction => {
        const salesman = partyMap.get(transaction.partyName.toLowerCase()) || 'Unknown Salesman';
        if (!salesmanParties.has(salesman)) {
          salesmanParties.set(salesman, new Set());
        }
        salesmanParties.get(salesman)?.add(transaction.partyName);
      });

      // Convert to arrays and sort
      const salesmanTotalsArray: SalesmanTotal[] = Array.from(salesmanMap.entries())
        .map(([salesman, data]) => ({
          salesman,
          totalAmount: data.totalAmount,
          partyCount: salesmanParties.get(salesman)?.size || 0
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      const partyTotalsArray: PartyTotal[] = Array.from(partyTotalMap.entries())
        .map(([partyName, data]) => ({
          partyName,
          totalAmount: data.totalAmount,
          transactionCount: data.transactionCount
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      setSalesmanTotals(salesmanTotalsArray);
      setPartyTotals(partyTotalsArray);
      setGrandTotal(total);
      setIsCalculated(true);
      setError('');

      toast({
        title: "Success",
        description: `Calculations completed successfully. Total: ₹${total.toLocaleString('en-IN')}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setError(`Calculation Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [transactions, parties, toast]);

  const resetTransactionData = useCallback(() => {
    if (confirm('Are you sure you want to reset all transaction data? This action cannot be undone.')) {
      setTransactions([]);
      setFileStatus(prev => ({ ...prev, transaction: false }));
      setUploadedFiles(prev => ({ ...prev, transaction: undefined }));
      setSalesmanTotals([]);
      setPartyTotals([]);
      setGrandTotal(0);
      setIsCalculated(false);
      setError('');
      
      toast({
        title: "Success",
        description: "Transaction data has been reset successfully",
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-dashboard-sidebar to-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-header">
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Sales Tracking Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Calculate total receipts and sales by salesman
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileUpload
            title="Master Sheet"
            description="Upload party-salesman associations (Party Name | Salesman)"
            onFileSelect={handleMasterFileUpload}
            isUploaded={fileStatus.master}
            uploadedFileName={uploadedFiles.master}
            variant="master"
          />
          <FileUpload
            title="Transaction Sheet"
            description="Upload transaction data (Party Name | Amount)"
            onFileSelect={handleTransactionFileUpload}
            isUploaded={fileStatus.transaction}
            uploadedFileName={uploadedFiles.transaction}
            variant="transaction"
          />
        </div>

        {/* Manual Entry */}
        <ManualEntry
          parties={parties}
          onAddTransaction={addTransaction}
          onAddParty={addParty}
        />

        {/* Action Buttons */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={calculateTotals}
                disabled={transactions.length === 0}
                className="gap-2 bg-gradient-success hover:opacity-90 text-lg px-8 py-3"
                size="lg"
              >
                <Calculator className="w-5 h-5" />
                Calculate Totals
              </Button>
              <Button
                onClick={resetTransactionData}
                variant="outline"
                className="gap-2 text-lg px-8 py-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                size="lg"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Transaction Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Tables */}
        {isCalculated && (
          <DataTables
            transactions={transactions}
            salesmanTotals={salesmanTotals}
            partyTotals={partyTotals}
            grandTotal={grandTotal}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}

        {/* Status Info */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-center">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Parties</p>
                <p className="text-2xl font-bold text-primary">{parties.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-success">{transactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Master Sheet</p>
                <p className="text-sm font-medium">
                  {fileStatus.master ? '✅ Loaded' : '⏳ Pending'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction Sheet</p>
                <p className="text-sm font-medium">
                  {fileStatus.transaction ? '✅ Loaded' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;