
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowUp } from 'lucide-react';
import { useApp, Order, OrderStatus } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import Toolbar from '@/components/Toolbar';
import CurrencyConverter from '@/components/CurrencyConverter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageHandler from '@/components/ImageHandler';

const Orders: React.FC = () => {
  const { 
    orders, 
    addOrder, 
    updateOrder, 
    deleteOrder,
    updateOrderStatus,
    viewMode,
    setViewMode,
    sortType,
    setSortType,
    showConverter
  } = useApp();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showConverterDialog, setShowConverterDialog] = useState(false);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('в пути');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
  // Initialize order date to today when opening the add dialog
  useEffect(() => {
    if (showAddDialog) {
      const today = new Date().toISOString().split('T')[0];
      setOrderDate(today);
    }
  }, [showAddDialog]);
  
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
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!showAddDialog && !showEditDialog) {
      resetForm();
    }
  }, [showAddDialog, showEditDialog]);
  
  // Update form when editing an order
  useEffect(() => {
    if (currentOrder && showEditDialog) {
      setProductName(currentOrder.productName);
      setPrice(currentOrder.price.toString());
      setQuantity(currentOrder.quantity.toString());
      setCustomerName(currentOrder.customerName);
      setPhoneNumber(currentOrder.phoneNumber);
      setOrderDate(currentOrder.orderDate);
      setStatus(currentOrder.status);
      setDescription(currentOrder.description || '');
      setImageUrl(currentOrder.imageUrl);
    }
  }, [currentOrder, showEditDialog]);
  
  const resetForm = () => {
    setProductName('');
    setPrice('');
    setQuantity('');
    setCustomerName('');
    setPhoneNumber('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setStatus('в пути');
    setDescription('');
    setImageUrl(undefined);
    setCurrentOrder(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      productName,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      customerName,
      phoneNumber,
      orderDate,
      status,
      description,
      imageUrl
    };
    
    if (showEditDialog && currentOrder) {
      updateOrder({
        ...currentOrder,
        ...orderData
      });
      setShowEditDialog(false);
    } else {
      addOrder(orderData);
      setShowAddDialog(false);
    }
  };
  
  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order);
    setShowViewDialog(true);
  };
  
  const handleEditOrder = (order: Order) => {
    setCurrentOrder(order);
    setShowEditDialog(true);
  };
  
  const handleDeleteOrder = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
      deleteOrder(id);
    }
  };
  
  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const searchLower = searchTerm.toLowerCase();
      return order.productName.toLowerCase().includes(searchLower) || 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.id.includes(searchTerm) ||
        order.phoneNumber.includes(searchTerm) ||
        order.price.toString().includes(searchTerm);
    })
    .sort((a, b) => {
      if (sortType === 'newest') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });
  
  // Get status button color based on status
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'в пути': return 'bg-amber-500 text-white hover:bg-amber-600';
      case 'на складе': return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'отдано': return 'bg-green-600 text-white hover:bg-green-700';
      default: return 'bg-secondary';
    }
  };
  
  const renderListView = () => {
    return (
      <div className="space-y-1">
        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            className="list-view-item hover:bg-accent/50 cursor-pointer"
            onClick={() => handleViewOrder(order)}
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="font-medium truncate max-w-[60%] flex items-center">
                {order.productName}
                <span className="ml-2 text-xs text-muted-foreground">#{order.id.slice(0, 5)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm">{order.customerName}</div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 text-xs rounded ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'в пути');
                    }}
                  >
                    в пути
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'на складе');
                    }}
                  >
                    на складе
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'отдано');
                    }}
                  >
                    отдано
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            className="grid-view-item hover:bg-accent/50 cursor-pointer relative"
            onClick={() => handleViewOrder(order)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium truncate max-w-[80%] flex items-center">
                {order.productName}
                <span className="ml-2 text-xs text-muted-foreground">#{order.id.slice(0, 5)}</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-1">{order.orderDate}</div>
            <div className="font-medium mb-2">{order.customerName}</div>
            
            {order.imageUrl && (
              <div className="mb-2">
                <img 
                  src={order.imageUrl} 
                  alt={order.productName}
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            
            <div className="flex justify-between mt-auto">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditOrder(order);
                  }}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(order.id);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 text-xs rounded ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'в пути');
                    }}
                  >
                    в пути
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'на складе');
                    }}
                  >
                    на складе
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, 'отдано');
                    }}
                  >
                    отдано
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto pb-16">
      <div className="fixed-header py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700"
          size="icon"
        >
          <Plus />
        </Button>
      </div>
      
      <Toolbar
        onSearchChange={setSearchTerm}
        viewMode={viewMode.orders}
        onViewModeChange={(mode) => setViewMode('orders', mode)}
        sortType={sortType}
        onSortTypeChange={setSortType}
        searchPlaceholder="Поиск по названию, заказчику, номеру телефона или ID..."
      />
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm 
            ? 'Заказов по вашему запросу не найдено' 
            : 'Нет добавленных заказов'}
        </div>
      ) : (
        viewMode.orders === 'list' ? renderListView() : renderGridView()
      )}
      
      {/* Add Order Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить заказ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="product-name">Название товара</Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена (тг)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer-name">Имя заказчика</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone-number">Номер телефона</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-date">Дата заказа</Label>
                  <Input
                    id="order-date"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Статус заказа</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="в пути">в пути</option>
                    <option value="на складе">на складе</option>
                    <option value="отдано">отдано</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <ImageHandler
                imageUrl={imageUrl}
                onImageChange={setImageUrl}
                maxSize={1000} // 1000 KB = 1 MB
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        {currentOrder && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {currentOrder.productName}
                <span className="ml-2 text-xs text-muted-foreground">#{currentOrder.id.slice(0, 5)}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {currentOrder.imageUrl && (
                <img
                  src={currentOrder.imageUrl}
                  alt={currentOrder.productName}
                  className="w-full h-auto object-contain rounded-md"
                />
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Заказчик:</span>
                  <p className="font-medium">{currentOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Телефон:</span>
                  <p className="font-medium">{currentOrder.phoneNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Цена:</span>
                  <p className="font-medium">{currentOrder.price.toLocaleString()} тг</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Количество:</span>
                  <p className="font-medium">{currentOrder.quantity}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Дата:</span>
                  <p className="font-medium">{currentOrder.orderDate}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Статус:</span>
                  <div className="mt-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`px-2 py-1 text-xs rounded ${getStatusColor(currentOrder.status)}`}
                        >
                          {currentOrder.status}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(currentOrder.id, 'в пути')}
                        >
                          в пути
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(currentOrder.id, 'на складе')}
                        >
                          на складе
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(currentOrder.id, 'отдано')}
                        >
                          отдано
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {currentOrder.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Описание:</span>
                  <p>{currentOrder.description}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditOrder(currentOrder);
                  }}
                >
                  <Pencil size={16} className="mr-2" />
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleDeleteOrder(currentOrder.id);
                  }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Edit Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить заказ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-product-name">Название товара</Label>
                <Input
                  id="edit-product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Цена (тг)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Количество</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-customer-name">Имя заказчика</Label>
                <Input
                  id="edit-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone-number">Номер телефона</Label>
                <Input
                  id="edit-phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-order-date">Дата заказа</Label>
                  <Input
                    id="edit-order-date"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Статус заказа</Label>
                  <select
                    id="edit-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="в пути">в пути</option>
                    <option value="на складе">на складе</option>
                    <option value="отдано">отдано</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <ImageHandler
                imageUrl={imageUrl}
                onImageChange={setImageUrl}
                maxSize={1000} // 1000 KB = 1 MB
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Currency Converter */}
      <CurrencyConverter 
        open={showConverterDialog} 
        onOpenChange={setShowConverterDialog} 
      />
      
      {/* Back to top button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp size={18} />
        </Button>
      )}
      
      {/* Converter floating button */}
      {showConverter && (
        <Button
          className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowConverterDialog(true)}
        >
          CNY → KZT
        </Button>
      )}
    </div>
  );
};

export default Orders;
