
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useNotifications } from '@/contexts/NotificationContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { toast } from '@/components/ui/use-toast';
    
    const NotificationTab = () => {
      const { sendNotification } = useNotifications();
      const [title, setTitle] = useState('');
      const [message, setMessage] = useState('');
      const [targetRole, setTargetRole] = useState('all');
    
      const handleSubmit = (e) => {
        e.preventDefault();
        
        sendNotification(targetRole, title, message);
    
        toast({
          title: "Bildirim Gönderildi",
          description: `"'${title}' başlıklı bildirim ${targetRole} rolüne gönderildi."`,
        });
        
        setTitle('');
        setMessage('');
        setTargetRole('all');
      };
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-white">Bildirim Gönder</h2>
          
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Yeni Bildirim Oluştur</CardTitle>
              <CardDescription className="text-gray-300">
                Tüm kullanıcılara, müşterilere veya kuryelere özel bildirimler gönderin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Başlık</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Promosyon Kodu!"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">Mesaj</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detaylı bildirim mesajını buraya yazın..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
    
                <div className="space-y-2">
                    <Label className="text-white">Hedef Kitle</Label>
                    <Select onValueChange={setTargetRole} defaultValue={targetRole}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Bir rol seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                            <SelectItem value="customer">Müşteriler</SelectItem>
                            <SelectItem value="courier">Kuryeler</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                  Bildirimi Gönder
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default NotificationTab;
  