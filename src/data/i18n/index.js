import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import fr from './locales/fr';

const resources = {
    en: {
        translation: en,
    },
    fr: {
        translation: fr,
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'fr',
    compatibilityJSON: 'v3',
    interpolation: {
        escapeValue: false
    }
})