
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowUp } from 'lucide-react';
import { useApp, Product } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import Toolbar from '@/components/Toolbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageHandler from '@/components/ImageHandler';

const Products: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateProductQuantity,
    viewMode,
    setViewMode,
    sortType,
    setSortType
  } = useApp();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
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
  
  // Update form when editing a product
  useEffect(() => {
    if (currentProduct && showEditDialog) {
      setName(currentProduct.name);
      setPrice(currentProduct.price.toString());
      setQuantity(currentProduct.quantity.toString());
      setDescription(currentProduct.description);
      setImageUrl(currentProduct.imageUrl);
    }
  }, [currentProduct, showEditDialog]);
  
  const resetForm = () => {
    setName('');
    setPrice('');
    setQuantity('');
    setDescription('');
    setImageUrl(undefined);
    setCurrentProduct(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      description,
      imageUrl
    };
    
    if (showEditDialog && currentProduct) {
      updateProduct({
        ...currentProduct,
        ...productData
      });
      setShowEditDialog(false);
    } else {
      addProduct(productData);
      setShowAddDialog(false);
    }
  };
  
  const handleViewProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowViewDialog(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowEditDialog(true);
  };
  
  const handleDeleteProduct = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProduct(id);
    }
  };
  
  const handleQuantityChange = (id: string, newQty: number) => {
    updateProductQuantity(id, newQty);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const searchLower = searchTerm.toLowerCase();
      return product.name.toLowerCase().includes(searchLower) || 
        product.price.toString().includes(searchTerm) ||
        product.quantity.toString().includes(searchTerm);
    })
    .sort((a, b) => {
      if (sortType === 'newest') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });
  
  const renderListView = () => {
    return (
      <div className="space-y-1">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="list-view-item hover:bg-accent/50 cursor-pointer"
            onClick={() => handleViewProduct(product)}
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="font-medium truncate max-w-[60%]">{product.name}</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">{product.price.toLocaleString()} тг</div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(product.id, Math.max(0, product.quantity - 1));
                  }}
                >
                  -
                </Button>
                <span className="w-8 text-center">{product.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(product.id, product.quantity + 1);
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="grid-view-item hover:bg-accent/50 cursor-pointer"
            onClick={() => handleViewProduct(product)}
          >
            {product.imageUrl && (
              <div className="mb-2">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            
            <div className="font-medium truncate mb-1">{product.name}</div>
            <div className="flex justify-between items-center mb-1">
              <div>{product.price.toLocaleString()} тг</div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(product.id, Math.max(0, product.quantity - 1));
                  }}
                >
                  -
                </Button>
                <span className="w-6 text-center">{product.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(product.id, product.quantity + 1);
                  }}
                >
                  +
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProduct(product);
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
                  handleDeleteProduct(product.id);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto pb-16">
      <div className="fixed-header py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Товары</h1>
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
        viewMode={viewMode.products}
        onViewModeChange={(mode) => setViewMode('products', mode)}
        sortType={sortType}
        onSortTypeChange={setSortType}
        searchPlaceholder="Поиск по названию, цене или количеству..."
      />
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm 
            ? 'Товаров по вашему запросу не найдено' 
            : 'Нет добавленных товаров'}
        </div>
      ) : (
        viewMode.products === 'list' ? renderListView() : renderGridView()
      )}
      
      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить товар</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
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
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Product Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        {currentProduct && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {currentProduct.imageUrl && (
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="w-full h-auto object-contain rounded-md"
                />
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">Цена:</span>
                  <p className="font-medium">{currentProduct.price.toLocaleString()} тг</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Количество:</span>
                  <p className="font-medium">{currentProduct.quantity}</p>
                </div>
              </div>
              
              {currentProduct.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Описание:</span>
                  <p>{currentProduct.description}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditProduct(currentProduct);
                  }}
                >
                  <Pencil size={16} className="mr-2" />
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowViewDialog(false);
                    handleDeleteProduct(currentProduct.id);
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
      
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить товар</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
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
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
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

export default Products;
