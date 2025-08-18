import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Save, X, TrendingUp, Users, Receipt } from 'lucide-react';
import { Transaction, SalesmanTotal, PartyTotal } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DataTablesProps {
  transactions: Transaction[];
  salesmanTotals: SalesmanTotal[];
  partyTotals: PartyTotal[];
  grandTotal: number;
  onUpdateTransaction: (id: string, updatedTransaction: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const DataTables: React.FC<DataTablesProps> = ({
  transactions,
  salesmanTotals,
  partyTotals,
  grandTotal,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<Transaction>>({});
  const { toast } = useToast();

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditingValues({
      partyName: transaction.partyName,
      amount: transaction.amount
    });
  };

  const handleSave = () => {
    if (!editingId) return;

    if (!editingValues.partyName || !editingValues.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (editingValues.amount && editingValues.amount < 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be positive",
        variant: "destructive"
      });
      return;
    }

    onUpdateTransaction(editingId, editingValues);
    setEditingId(null);
    setEditingValues({});
    toast({
      title: "Success",
      description: "Transaction updated successfully"
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValues({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      onDeleteTransaction(id);
      toast({
        title: "Success",
        description: "Transaction deleted successfully"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-success text-success-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-foreground/80 text-sm">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success-foreground/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Active Salesmen</p>
                <p className="text-2xl font-bold">{salesmanTotals.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary-foreground/80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salesman Totals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Sales by Salesman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-table-header">
                <TableRow>
                  <TableHead className="font-semibold">Salesman</TableHead>
                  <TableHead className="font-semibold">Total Amount</TableHead>
                  <TableHead className="font-semibold">Parties</TableHead>
                  <TableHead className="font-semibold">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesmanTotals.map((salesman, index) => (
                  <TableRow key={index} className="hover:bg-table-row-hover transition-colors">
                    <TableCell className="font-medium">{salesman.salesman}</TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(salesman.totalAmount)}
                    </TableCell>
                    <TableCell>{salesman.partyCount}</TableCell>
                    <TableCell>
                      {grandTotal > 0 ? ((salesman.totalAmount / grandTotal) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Party Totals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-success" />
            Sales by Party
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-table-header">
                <TableRow>
                  <TableHead className="font-semibold">Party Name</TableHead>
                  <TableHead className="font-semibold">Total Amount</TableHead>
                  <TableHead className="font-semibold">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partyTotals.map((party, index) => (
                  <TableRow key={index} className="hover:bg-table-row-hover transition-colors">
                    <TableCell className="font-medium">{party.partyName}</TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(party.totalAmount)}
                    </TableCell>
                    <TableCell>{party.transactionCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-table-header">
                <TableRow>
                  <TableHead className="font-semibold">Party Name</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-table-row-hover transition-colors">
                    <TableCell>
                      {editingId === transaction.id ? (
                        <Input
                          value={editingValues.partyName || ''}
                          onChange={(e) => setEditingValues(prev => ({ ...prev, partyName: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        <span className="font-medium">{transaction.partyName}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === transaction.id ? (
                        <Input
                          type="number"
                          value={editingValues.amount || ''}
                          onChange={(e) => setEditingValues(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                          className="h-8"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <span className="font-semibold text-success">{formatCurrency(transaction.amount)}</span>
                      )}
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === transaction.id ? (
                          <>
                            <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(transaction)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(transaction.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataTables;