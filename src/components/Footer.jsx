import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer-inner">

                {/* Brand */}
                <div className="footer-brand">
                    <span className="footer-logo">🌾</span>
                    <div>
                        <div className="footer-name">{t('किसान कृषि केंद्र', 'Kisan Krishi Kendra')}</div>
                        <div className="footer-tagline">{t('कृषि दवाई की दुकान', 'Agriculture Medicine Shop')}</div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-divider" />

                {/* Three columns */}
                <div className="footer-cols">

                    {/* Quick Links */}
                    <div className="footer-col">
                        <div className="footer-col-title">{t('त्वरित लिंक', 'Quick Links')}</div>
                        <ul className="footer-links">
                            <li><Link to="/">🏠 {t('होम', 'Home')}</Link></li>
                            <li><Link to="/">🌱 {t('सभी उत्पाद', 'All Products')}</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="footer-col">
                        <div className="footer-col-title">{t('हमारी सेवाएं', 'Our Services')}</div>
                        <ul className="footer-links">
                            <li>🌾 {t('कीटनाशक दवाइयां', 'Pesticides')}</li>
                            <li>🌿 {t('खाद और उर्वरक', 'Fertilisers')}</li>
                            <li>💊 {t('फसल सुरक्षा', 'Crop Protection')}</li>
                            <li>📦 {t('होम डिलीवरी', 'Home Delivery')}</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-col">
                        <div className="footer-col-title">{t('संपर्क करें', 'Contact Us')}</div>
                        <ul className="footer-links">
                            <li>📞 {t('कॉल करें', 'Call Us')}</li>
                            <li>📍 {t('अपना गांव / पता बताएं', 'Share your address')}</li>
                            <li>🕐 {t('सोम–शनि: सुबह 9 बजे – शाम 7 बजे', 'Mon–Sat: 9 AM – 7 PM')}</li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="footer-bottom">
                    <span>© {year} {t('किसान कृषि केंद्र। सर्वाधिकार सुरक्षित।', 'Kisan Krishi Kendra. All rights reserved.')}</span>
                    <span className="footer-bottom-badge">🇮🇳 {t('भारत में निर्मित', 'Made in India')}</span>
                </div>

            </div>
        </footer>
    );
}
