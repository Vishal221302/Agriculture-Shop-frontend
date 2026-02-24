import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('agri_lang') || 'hi');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const selectLang = (newLang) => {
        localStorage.setItem('agri_lang', newLang);
        setLang(newLang);
        setShowDropdown(false);
    };

    const t = (hiText, enText) => lang === 'hi' ? hiText : enText;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { document.documentElement.lang = lang; }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, selectLang, showDropdown, setShowDropdown, dropdownRef, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
    return ctx;
};
