
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode, showConverter, toggleConverter } = useApp();
  
  return (
    <div className="container mx-auto pb-16">
      <div className="fixed-header py-4">
        <h1 className="text-2xl font-bold">Настройки</h1>
      </div>
      
      <div className="mt-8 space-y-8">
        {/* Theme Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Внешний вид</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode">Тёмная тема</Label>
              <Switch
                id="theme-mode"
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </div>
        
        {/* Feature Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Функции</h2>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-converter">Показывать конвертер валют</Label>
            <Switch
              id="show-converter"
              checked={showConverter}
              onCheckedChange={toggleConverter}
            />
          </div>
        </div>
        
        {/* About */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">О приложении</h2>
          <p className="text-muted-foreground">
            Версия: 1.0.0
          </p>
          <p className="text-muted-foreground">
            Приложение для учёта товаров и заказов
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
