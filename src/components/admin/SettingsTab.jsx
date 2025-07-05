
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { toast } from '@/components/ui/use-toast';
    
    const SettingsTab = () => {
    
      const showToast = () => {
        toast({
          title: "🚧 Bu özellik henüz uygulanmadı!",
          description: "Ama endişelenmeyin! Bir sonraki isteğinizde bunu talep edebilirsiniz! 🚀",
        });
      };
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-white">Genel Ayarlar</h2>
          
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Site Bilgileri</CardTitle>
              <CardDescription className="text-gray-300">
                Sitenizin temel bilgilerini buradan güncelleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-white">Site Adı</Label>
                <Input id="siteName" placeholder="Kurye Şirketim" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-white">Logo Yükle</Label>
                <Input id="logo" type="file" className="bg-white/10 border-white/20 text-white file:text-white" />
              </div>
    
              <div className="space-y-2">
                  <Label className="text-white">Tema Rengi</Label>
                  <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 cursor-pointer border-2 border-white"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 cursor-pointer border-2 border-transparent"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 cursor-pointer border-2 border-transparent"></div>
                  </div>
              </div>
    
              <Button onClick={showToast} className="bg-gradient-to-r from-blue-500 to-purple-600">
                Ayarları Kaydet
              </Button>
            </CardContent>
          </Card>
    
           <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Promosyon Kodları</CardTitle>
              <CardDescription className="text-gray-300">
                Müşterileriniz için promosyon kodları oluşturun.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input placeholder="PROMO2025" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
                <Button onClick={showToast} className="bg-gradient-to-r from-green-500 to-blue-500">
                  Kod Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default SettingsTab;
  