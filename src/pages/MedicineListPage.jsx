import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_NAMES = {
    1: { hi: 'गेहूं', en: 'Wheat', icon: '🌾' },
    2: { hi: 'चावल', en: 'Rice', icon: '🍚' },
    3: { hi: 'सब्जियां', en: 'Vegetables', icon: '🥦' },
};

export default function MedicineListPage() {
    const { id } = useParams();
    const { lang, toggleLang, t } = useLanguage();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cat = CATEGORY_NAMES[id] || { hi: 'फसल', en: 'Crop', icon: '🌿' };

    useEffect(() => {
        setLoading(true);
        fetch(`/api/products?category_id=${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) setProducts(data.data);
                else setError(data.message);
            })
            .catch(() => setError('Server error. Please try again.'))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <span className="header-logo">🌾</span>
                    <div>
                        <div className="header-title">किसान कृषि केंद्र</div>
                        <div className="header-subtitle">Kisan Krishi Kendra</div>
                    </div>
                </div>
                <div className="lang-toggle">
                    <button className={lang === 'hi' ? 'active' : ''} onClick={() => lang !== 'hi' && toggleLang()}>हिंदी</button>
                    <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>English</button>
                </div>
            </header>

            <div className="page-container">
                {/* Back button */}
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← {t('वापस जाएं', 'Go Back')}
                </button>

                {/* Category Title */}
                <div style={{ padding: '8px 16px 4px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--green-pale), #f1f8e9)',
                        border: '2px solid var(--green-light)',
                        borderRadius: 'var(--radius)',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ fontSize: '2.2rem' }}>{cat.icon}</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--green-dark)' }}>
                                {t(cat.hi, cat.en)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                                {t('के लिए दवाइयां', 'Medicines for')} {t(cat.en, cat.hi)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="loading-wrapper">
                        <div className="spinner" />
                        <span>{t('लोड हो रहा है...', 'Loading...')}</span>
                    </div>
                ) : error ? (
                    <div className="error-banner">⚠️ {error}</div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon">🔍</span>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                            {t('कोई दवाई उपलब्ध नहीं है', 'No medicines available')}
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                            {t('जल्द ही जोड़ी जाएंगी', 'Coming soon')}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="section-title">
                            <span>💊</span>
                            {t(`${products.length} दवाइयां मिलीं`, `${products.length} Medicines Found`)}
                        </div>
                        <div className="medicine-list">
                            {products.map(product => (
                                <div className="medicine-card" key={product.id}>
                                    {product.product_image ? (
                                        <img
                                            className="medicine-card-img"
                                            src={`/uploads/${product.product_image}`}
                                            alt={t(product.medicine_name_hi, product.medicine_name_en)}
                                        />
                                    ) : (
                                        <div className="medicine-card-img-placeholder">💊</div>
                                    )}
                                    <div className="medicine-card-body">
                                        <div>
                                            <div className="medicine-card-name">
                                                {t(product.medicine_name_hi, product.medicine_name_en)}
                                            </div>
                                            <div className="medicine-card-name-en">
                                                {t(product.medicine_name_en, product.medicine_name_hi)}
                                            </div>
                                            <div className="medicine-badge">
                                                🦠 {t(product.disease_name_hi, product.disease_name_en)}
                                            </div>
                                            <div className="medicine-dosage">
                                                📏 {product.dosage_per_bigha} / {t('बीघा', 'Bigha')}
                                            </div>
                                        </div>
                                        <Link to={`/medicine/${product.id}`} className="view-btn">
                                            👁️ {t('देखें', 'View')}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <footer className="footer">
                    <div>🌾 किसान कृषि केंद्र | Kisan Krishi Kendra</div>
                </footer>
            </div>
        </div>
    );
}
