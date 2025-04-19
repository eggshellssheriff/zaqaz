
import React, { useState, useEffect } from 'react';
import { Trash2, ArrowUp } from 'lucide-react';
import { useApp, Customer, Order } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import Toolbar from '@/components/Toolbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Database: React.FC = () => {
  const { 
    customers, 
    deleteCustomer,
    deleteCustomerOrder,
    sortType,
    setSortType
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  
  // Listen for scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCustomerClick = (customer: Customer) => {
    setCurrentCustomer(customer);
    setShowCustomerDialog(true);
  };
  
  const handleDeleteCustomer = (phoneNumber: string) => {
    if (confirm('Вы уверены, что хотите удалить клиента и все его заказы из базы данных?')) {
      deleteCustomer(phoneNumber);
    }
  };
  
  const handleDeleteCustomerOrder = (phoneNumber: string, orderId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот заказ из базы данных?')) {
      deleteCustomerOrder(phoneNumber, orderId);
      
      // If this was the last order for this customer, close the dialog
      if (currentCustomer && currentCustomer.phoneNumber === phoneNumber && currentCustomer.orders.length === 1) {
        setShowCustomerDialog(false);
      }
    }
  };
  
  // Filter customers based on search term (partial match on phone number)
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    return customer.phoneNumber.includes(searchTerm);
  });
  
  // Sort customer orders by date
  const getSortedOrders = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      if (sortType === 'newest') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });
  };
  
  // Calculate total order amount for a customer
  const calculateTotalAmount = (orders: Order[]) => {
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
  };
  
  return (
    <div className="container mx-auto pb-16 max-w-md">
      <div className="fixed-header py-4">
        <h1 className="text-2xl font-bold">База данных</h1>
      </div>
      
      <Toolbar
        onSearchChange={setSearchTerm}
        viewMode="list"
        onViewModeChange={() => {}}
        sortType={sortType}
        onSortTypeChange={setSortType}
        searchPlaceholder="Поиск по номеру телефона..."
      />
      
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm 
            ? 'Клиентов по вашему запросу не найдено' 
            : 'Нет клиентов в базе данных'}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.phoneNumber} 
              className="list-view-item hover:bg-accent/50 cursor-pointer"
              onClick={() => handleCustomerClick(customer)}
            >
              <div className="font-medium truncate max-w-[calc(100%-40px)]">{customer.phoneNumber}</div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomer(customer.phoneNumber);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Customer Orders Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        {currentCustomer && (
          <DialogContent className="max-w-md mobile-keyboard-scroll">
            <DialogHeader>
              <DialogTitle>Клиент: {currentCustomer.phoneNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm">
                Всего заказов: <span className="font-bold">{currentCustomer.orders.length}</span>
              </div>
              
              <div className="text-sm">
                Общая сумма: <span className="font-bold">{calculateTotalAmount(currentCustomer.orders).toLocaleString()} тг</span>
              </div>
              
              <div className="border rounded-md">
                <div className="bg-muted p-2 font-semibold grid grid-cols-[minmax(0,1fr)_auto_auto]">
                  <div className="truncate">Товар</div>
                  <div>Дата</div>
                  <div className="text-right pr-2">Сумма</div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {getSortedOrders(currentCustomer.orders).map(order => (
                    <div key={order.id} className="border-t p-2 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 relative">
                      <div className="font-medium truncate">{order.productName}</div>
                      <div className="text-sm whitespace-nowrap">{order.orderDate}</div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-right whitespace-nowrap mr-2">
                          {(order.price * order.quantity).toLocaleString()} тг
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive shrink-0"
                          onClick={() => handleDeleteCustomerOrder(currentCustomer.phoneNumber, order.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Back to top button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp size={18} />
        </Button>
      )}
    </div>
  );
};

export default Database;
