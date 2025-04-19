
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CurrencyConverterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ open, onOpenChange }) => {
  const { isDarkMode } = useApp();
  const [yuanAmount, setYuanAmount] = useState<string>('');
  const [tengeAmount, setTengeAmount] = useState<string>('');
  const [rate, setRate] = useState<number>(65); // Default rate if API fails
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Attempt to fetch exchange rate
    const fetchExchangeRate = async () => {
      setIsLoading(true);
      try {
        // This is a mock API call - in a real app, you'd use an actual currency API
        // For now, we'll simulate a successful API call with a fixed rate
        setTimeout(() => {
          setRate(65); // Example rate: 1 CNY = 65 KZT
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setRate(65); // Fallback to default rate
        setIsLoading(false);
      }
    };

    if (open) {
      fetchExchangeRate();
    }
  }, [open]);

  const handleYuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setYuanAmount(value);
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setTengeAmount((parsedValue * rate).toFixed(2));
      } else {
        setTengeAmount('');
      }
    }
  };

  const handleTengeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTengeAmount(value);
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setYuanAmount((parsedValue / rate).toFixed(2));
      } else {
        setYuanAmount('');
      }
    }
  };

  // Don't render anything if not open
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${isDarkMode ? 'bg-slate-200 text-black' : 'bg-slate-800 text-white'}`}
      >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Конвертер валют</span>
            <DialogClose className="h-6 w-6 rounded-sm opacity-70 transition-opacity hover:opacity-100">
              <X size={16} />
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
        ) : (
          <div className="space-y-4 p-2">
            <div className="space-y-2">
              <label htmlFor="yuan" className="block text-sm font-medium">Юань (CNY)</label>
              <Input
                id="yuan"
                type="text"
                value={yuanAmount}
                onChange={handleYuanChange}
                placeholder="0.00"
                className="bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            
            <div className="flex justify-center">
              <div className="px-4 py-1 rounded-full bg-gray-300 dark:bg-gray-600 text-sm">
                1 CNY = {rate} KZT
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tenge" className="block text-sm font-medium">Тенге (KZT)</label>
              <Input
                id="tenge"
                type="text"
                value={tengeAmount}
                onChange={handleTengeChange}
                placeholder="0.00"
                className="bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyConverter;
