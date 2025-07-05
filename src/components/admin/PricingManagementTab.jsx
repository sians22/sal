
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useOrders } from '@/contexts/OrderContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Trash2, Plus } from 'lucide-react';
    
    const PricingManagementTab = () => {
      const { pricingRules, updatePricingRules } = useOrders();
      const [rules, setRules] = useState(pricingRules);
    
      const handleRuleChange = (index, field, value) => {
        const newRules = [...rules];
        newRules[index][field] = Number(value);
        setRules(newRules);
      };
    
      const addRule = () => {
        const lastRule = rules[rules.length - 1];
        const newMin = lastRule ? lastRule.maxDistance : 0;
        setRules([...rules, { minDistance: newMin, maxDistance: newMin + 5, price: 0 }]);
      };
    
      const removeRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
      };
    
      const handleSave = () => {
        updatePricingRules(rules);
      };
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-white">Fiyatlandırma Yönetimi</h2>
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Mesafe Bazlı Fiyat Kuralları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-semibold text-gray-300 px-4">
                <span>Min Mesafe (km)</span>
                <span>Max Mesafe (km)</span>
                <span>Fiyat (TL)</span>
                <span></span>
              </div>
              {rules.map((rule, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center p-4 bg-white/5 rounded-lg">
                  <Input
                    type="number"
                    value={rule.minDistance}
                    onChange={(e) => handleRuleChange(index, 'minDistance', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    type="number"
                    value={rule.maxDistance}
                    onChange={(e) => handleRuleChange(index, 'maxDistance', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    type="number"
                    value={rule.price}
                    onChange={(e) => handleRuleChange(index, 'price', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Button variant="destructive" size="icon" onClick={() => removeRule(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <Button onClick={addRule} variant="outline" className="bg-white/10 border-white/20">
                  <Plus className="mr-2 h-4 w-4" /> Kural Ekle
                </Button>
                <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default PricingManagementTab;
  