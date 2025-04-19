
import React, { useState } from 'react';
import { Search, List, Grid, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ToolbarProps {
  onSearchChange: (term: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  sortType: 'newest' | 'oldest';
  onSortTypeChange: (type: 'newest' | 'oldest') => void;
  searchPlaceholder?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortType,
  onSortTypeChange,
  searchPlaceholder = 'Поиск...'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleSortChange = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    onSortTypeChange(sortType === 'newest' ? 'oldest' : 'newest');
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setIsExpanded(!isExpanded);
  };

  const toggleSearch = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Focus on the search input when it becomes visible
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else {
      // Clear search when hiding
      setSearchTerm('');
      onSearchChange('');
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleExpand}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
        
        {isExpanded && (
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSearch}
              className={isSearchVisible ? 'bg-accent' : ''}
            >
              <Search size={16} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onViewModeChange(viewMode === 'list' ? 'grid' : 'list');
              }}
            >
              {viewMode === 'list' ? <Grid size={16} /> : <List size={16} />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSortChange}
            >
              {sortType === 'newest' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
            </Button>
          </div>
        )}
      </div>
      
      {isExpanded && isSearchVisible && (
        <div className="mt-2">
          <Input
            id="search-input"
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default Toolbar;
