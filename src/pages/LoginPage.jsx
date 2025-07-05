import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Truck, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const defaultUsers = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Kullanıcı' },
      { id: '2', username: 'musteri1', password: 'musteri123', role: 'customer', name: 'Ahmet Yılmaz' },
      { id: '3', username: 'kurye1', password: 'kurye123', role: 'courier', name: 'Mehmet Demir' },
      { id: '4', username: 'kurye2', password: 'kurye123', role: 'courier', name: 'Ali Kaya' },
    ];

    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = login(username, password);
    if (user) {
      navigate(`/${user.role}`);
    }
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin123', roleKey: 'login.demo.admin', icon: Shield, color: 'text-red-500' },
    { username: 'musteri1', password: 'musteri123', roleKey: 'login.demo.customer', icon: User, color: 'text-blue-500' },
    { username: 'kurye1', password: 'kurye123', roleKey: 'login.demo.courier', icon: Truck, color: 'text-green-500' },
  ];

  return (
    <>
      <Helmet>
        <title>{t('login.title')}</title>
        <meta name="description" content={t('login.description')} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
              >
                <Truck className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">{t('login.header')}</CardTitle>
              <CardDescription className="text-gray-300">
                {t('login.subheader')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">{t('login.username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder={t('login.username.placeholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">{t('login.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder={t('login.password.placeholder')}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {t('login.button')}
                </Button>
              </form>

              <div className="space-y-3">
                <p className="text-sm text-gray-300 text-center">{t('login.demo.header')}</p>
                <div className="grid gap-2">
                  {demoAccounts.map((account, index) => (
                    <motion.div
                      key={account.username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <account.icon className={`w-4 h-4 ${account.color}`} />
                        <span className="text-sm text-white">{t(account.roleKey)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {account.username} / {account.password}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;