import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={i18n.language === 'tr' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('tr')}
        className="bg-white/20 border-white/30 text-white"
      >
        TR
      </Button>
      <Button
        variant={i18n.language === 'ru' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => changeLanguage('ru')}
        className="bg-white/20 border-white/30 text-white"
      >
        RU
      </Button>
    </div>
  );
};

export default LanguageSwitcher;