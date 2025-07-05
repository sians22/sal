
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { toast } from '@/components/ui/use-toast';
    import { UserPlus, Edit, Trash2, User, Truck, Shield } from 'lucide-react';
    
    const UserManagementTab = () => {
      const [users, setUsers] = useState([]);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [currentUser, setCurrentUser] = useState(null);
      const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'customer' });
    
      useEffect(() => {
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(savedUsers);
      }, []);
    
      const saveUsers = (updatedUsers) => {
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      };
    
      const handleOpenDialog = (user = null) => {
        setCurrentUser(user);
        if (user) {
          setFormData({ name: user.name, username: user.username, password: user.password, role: user.role });
        } else {
          setFormData({ name: '', username: '', password: '', role: 'customer' });
        }
        setIsDialogOpen(true);
      };
    
      const handleSaveUser = () => {
        if (currentUser) {
          // Edit
          const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...formData } : u);
          saveUsers(updatedUsers);
          toast({ title: "Kullanıcı Güncellendi", description: `${formData.name} başarıyla güncellendi.` });
        } else {
          // Add
          const newUser = { id: Date.now().toString(), ...formData };
          saveUsers([...users, newUser]);
          toast({ title: "Kullanıcı Eklendi", description: `${formData.name} başarıyla eklendi.` });
        }
        setIsDialogOpen(false);
      };
    
      const handleDeleteUser = (userId) => {
        const updatedUsers = users.filter(u => u.id !== userId);
        saveUsers(updatedUsers);
        toast({ title: "Kullanıcı Silindi", description: "Kullanıcı başarıyla silindi.", variant: "destructive" });
      };
    
      const RoleIcon = ({ role }) => {
        if (role === 'admin') return <Shield className="w-4 h-4 text-red-500" />;
        if (role === 'courier') return <Truck className="w-4 h-4 text-green-500" />;
        return <User className="w-4 h-4 text-blue-500" />;
      };
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Kullanıcı Yönetimi</h2>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <UserPlus className="mr-2 h-4 w-4" /> Yeni Kullanıcı Ekle
            </Button>
          </div>
    
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Tüm Kullanıcılar</CardTitle>
              <CardDescription className="text-gray-300">Mevcut tüm kullanıcıları yönetin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <RoleIcon role={user.role} />
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">@{user.username} - <span className="capitalize">{user.role}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
    
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="glass-effect border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">{currentUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Ad Soyad</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Kullanıcı Adı</Label>
                  <Input id="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Şifre</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Müşteri</SelectItem>
                      <SelectItem value="courier">Kurye</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                <Button onClick={handleSaveUser} className="bg-gradient-to-r from-blue-500 to-purple-600">Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };
    
    export default UserManagementTab;
  