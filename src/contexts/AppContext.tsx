
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  imageUrl?: string;
  createdAt: number;
}

export type OrderStatus = 'в пути' | 'на складе' | 'отдано';

export interface Order {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  customerName: string;
  phoneNumber: string;
  orderDate: string;
  status: OrderStatus;
  description?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface Customer {
  phoneNumber: string;
  orders: Order[];
}

interface AppContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteCustomer: (phoneNumber: string) => void;
  deleteCustomerOrder: (phoneNumber: string, orderId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showToast: (message: string) => void;
  viewMode: {
    products: 'list' | 'grid',
    orders: 'list' | 'grid'
  };
  setViewMode: (section: 'products' | 'orders', mode: 'list' | 'grid') => void;
  sortType: 'newest' | 'oldest';
  setSortType: (type: 'newest' | 'oldest') => void;
  showConverter: boolean;
  toggleConverter: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'inventory-products',
  ORDERS: 'inventory-orders',
  CUSTOMERS: 'inventory-customers',
  DARK_MODE: 'inventory-dark-mode',
  VIEW_MODE: 'inventory-view-mode',
  SHOW_CONVERTER: 'inventory-show-converter'
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const savedCustomers = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
    return savedCustomers ? JSON.parse(savedCustomers) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [viewMode, setViewModeState] = useState<{
    products: 'list' | 'grid',
    orders: 'list' | 'grid'
  }>(() => {
    const savedViewMode = localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW_MODE);
    return savedViewMode 
      ? JSON.parse(savedViewMode) 
      : { products: 'list', orders: 'grid' };
  });

  const [sortType, setSortType] = useState<'newest' | 'oldest'>('newest');
  
  const [toast, setToast] = useState<string | null>(null);
  
  const [showConverter, setShowConverter] = useState(() => {
    const savedConverterSetting = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_CONVERTER);
    return savedConverterSetting ? JSON.parse(savedConverterSetting) : true;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, JSON.stringify(viewMode));
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_CONVERTER, JSON.stringify(showConverter));
  }, [showConverter]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    };
    setProducts((prev) => [...prev, newProduct]);
    showToast("Успех");
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => 
      prev.map((product) => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    showToast("Успех");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    showToast("Успех");
  };

  const updateProductQuantity = (id: string, quantity: number) => {
    setProducts((prev) => 
      prev.map((product) => 
        product.id === id ? { ...product, quantity } : product
      )
    );
    showToast("Успех");
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    };
    setOrders((prev) => [...prev, newOrder]);
    
    // Add to customer database
    setCustomers((prev) => {
      const existingCustomer = prev.find(c => c.phoneNumber === order.phoneNumber);
      if (existingCustomer) {
        return prev.map(c => 
          c.phoneNumber === order.phoneNumber 
            ? { ...c, orders: [...c.orders, newOrder] } 
            : c
        );
      } else {
        return [...prev, { phoneNumber: order.phoneNumber, orders: [newOrder] }];
      }
    });
    
    showToast("Успех");
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders((prev) => 
      prev.map((order) => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    
    // Update in customer database
    setCustomers((prev) => {
      return prev.map(customer => {
        const orderIndex = customer.orders.findIndex(o => o.id === updatedOrder.id);
        if (orderIndex >= 0) {
          const updatedOrders = [...customer.orders];
          updatedOrders[orderIndex] = updatedOrder;
          return { ...customer, orders: updatedOrders };
        }
        return customer;
      });
    });
    
    showToast("Успех");
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    showToast("Успех");
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => 
      prev.map((order) => 
        order.id === id ? { ...order, status } : order
      )
    );
    
    // Update in customer database
    setCustomers((prev) => {
      return prev.map(customer => {
        const orderIndex = customer.orders.findIndex(o => o.id === id);
        if (orderIndex >= 0) {
          const updatedOrders = [...customer.orders];
          updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], status };
          return { ...customer, orders: updatedOrders };
        }
        return customer;
      });
    });
    
    showToast("Успех");
  };

  const deleteCustomer = (phoneNumber: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.phoneNumber !== phoneNumber));
    showToast("Успех");
  };

  const deleteCustomerOrder = (phoneNumber: string, orderId: string) => {
    setCustomers((prev) => 
      prev.map((customer) => 
        customer.phoneNumber === phoneNumber 
          ? { ...customer, orders: customer.orders.filter(o => o.id !== orderId) } 
          : customer
      ).filter(customer => customer.orders.length > 0) // Remove customers with no orders
    );
    showToast("Успех");
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const showToast = (message: string) => {
    setToast(message);
  };

  const setViewMode = (section: 'products' | 'orders', mode: 'list' | 'grid') => {
    setViewModeState(prev => ({
      ...prev,
      [section]: mode
    }));
  };

  const toggleConverter = () => {
    setShowConverter(prev => !prev);
  };

  const value: AppContextType = {
    products,
    orders,
    customers,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductQuantity,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    deleteCustomer,
    deleteCustomerOrder,
    isDarkMode,
    toggleDarkMode,
    showToast,
    viewMode,
    setViewMode,
    sortType,
    setSortType,
    showConverter,
    toggleConverter
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && <div className="success-toast">{toast}</div>}
    </AppContext.Provider>
  );
};
