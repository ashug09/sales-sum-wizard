import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Receipt } from 'lucide-react';
import { Party, Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ManualEntryProps {
  parties: Party[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddParty: (party: Omit<Party, 'id'>) => void;
}

const ManualEntry: React.FC<ManualEntryProps> = ({ parties, onAddTransaction, onAddParty }) => {
  const [activeTab, setActiveTab] = useState<'transaction' | 'party'>('transaction');
  const [transactionForm, setTransactionForm] = useState({
    partyName: '',
    amount: ''
  });
  const [partyForm, setPartyForm] = useState({
    name: '',
    salesman: ''
  });
  const { toast } = useToast();

  const handleAddTransaction = () => {
    if (!transactionForm.partyName || !transactionForm.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all transaction fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    onAddTransaction({
      partyName: transactionForm.partyName,
      amount: amount,
      date: new Date().toISOString().split('T')[0]
    });

    setTransactionForm({ partyName: '', amount: '' });
    toast({
      title: "Success",
      description: "Transaction added successfully",
    });
  };

  const handleAddParty = () => {
    if (!partyForm.name || !partyForm.salesman) {
      toast({
        title: "Validation Error",
        description: "Please fill in all party fields",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate party names
    if (parties.some(p => p.name.toLowerCase() === partyForm.name.toLowerCase())) {
      toast({
        title: "Validation Error",
        description: "Party already exists",
        variant: "destructive"
      });
      return;
    }

    onAddParty({
      name: partyForm.name,
      salesman: partyForm.salesman
    });

    setPartyForm({ name: '', salesman: '' });
    toast({
      title: "Success",
      description: "Party added successfully",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Manual Entry
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'transaction' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('transaction')}
            className="gap-2"
          >
            <Receipt className="w-4 h-4" />
            Add Transaction
          </Button>
          <Button
            variant={activeTab === 'party' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('party')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Add Party
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTab === 'transaction' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="party-select">Party Name</Label>
              <Select 
                value={transactionForm.partyName} 
                onValueChange={(value) => setTransactionForm(prev => ({ ...prev, partyName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a party" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.name}>
                      {party.name} (Salesman: {party.salesman})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (INR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                min="0"
                step="0.01"
              />
            </div>
            <Button onClick={handleAddTransaction} className="w-full bg-gradient-success">
              Add Transaction
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="party-name">Party Name</Label>
              <Input
                id="party-name"
                placeholder="Enter party name"
                value={partyForm.name}
                onChange={(e) => setPartyForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesman">Salesman</Label>
              <Input
                id="salesman"
                placeholder="Enter salesman name"
                value={partyForm.salesman}
                onChange={(e) => setPartyForm(prev => ({ ...prev, salesman: e.target.value }))}
              />
            </div>
            <Button onClick={handleAddParty} className="w-full bg-gradient-primary">
              Add Party
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualEntry;