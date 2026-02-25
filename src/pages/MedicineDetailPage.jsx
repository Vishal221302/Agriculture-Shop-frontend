import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import OrderModal from '../components/OrderModal';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../config';

// YouTube watch → embed URL
function toEmbedUrl(url) {
    if (!url) return null;
    if (url.includes('/embed/')) return url;
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function MedicineDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { lang, toggle, t } = useLanguage();
    const { addToCart, cartCount } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOrder, setShowOrder] = useState(false);
    const [certModal, setCertModal] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetch(API_BASE_URL + '/api/products/' + id)
            .then(r => r.json())
            .then(data => {
                if (data.success) setProduct(data.data);
                else setError(t('उत्पाद नहीं मिला', 'Product not found'));
            })
            .catch(() => setError(t('सर्वर से जुड़ नहीं सका', 'Cannot connect to server')))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <PageShell lang={lang} toggle={toggle} t={t} onBack={() => navigate(-1)}>
            <div className="loading-wrap"><div className="spinner" /><span>{t('लोड हो रहा है...', 'Loading...')}</span></div>
        </PageShell>
    );

    if (error || !product) return (
        <PageShell lang={lang} toggle={toggle} t={t} onBack={() => navigate(-1)}>
            <div className="empty-msg"><span className="empty-icon">⚠️</span>{error}</div>
        </PageShell>
    );

    // Derived values
    const medicineName = lang === 'hi' ? product.medicine_name_hi : product.medicine_name_en;
    const medicineAlt = lang === 'hi' ? product.medicine_name_en : product.medicine_name_hi;
    const diseaseName = lang === 'hi' ? product.disease_name_hi : product.disease_name_en;
    const categoryName = lang === 'hi' ? product.category_name_hi : product.category_name_en;
    const usageText = lang === 'hi' ? product.usage_hi : product.usage_en;
    const usageSteps = (usageText || '').split('\n').filter(s => s.trim());

    const certImages = (() => {
        if (Array.isArray(product.certification_images)) return product.certification_images;
        if (typeof product.certification_images === 'string' && product.certification_images) {
            try { return JSON.parse(product.certification_images); } catch { return []; }
        }
        return [];
    })();

    const showPrice = product.show_price == 1 && product.price;
    const showQty = product.show_quantity == 1;
    const totalPrice = showPrice && showQty && quantity > 1
        ? (Number(product.price) * quantity).toLocaleString('en-IN')
        : null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        const msg = lang === 'hi'
            ? `✅ "${product.medicine_name_hi}" कार्ट में जोड़ा!`
            : `✅ Added "${product.medicine_name_en}" to cart!`;
        setToast(msg);
        setTimeout(() => setToast(null), 2200);
    };

    return (
        <PageShell lang={lang} toggle={toggle} t={t} onBack={() => navigate(-1)} cartCount={cartCount} onCartOpen={() => setCartOpen(true)}>

            {/* Cart Drawer */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            {/* Toast */}
            {toast && (
                <div className="cart-toast">{toast}</div>
            )}

            {/* Breadcrumb */}
            <nav className="detail-breadcrumb">
                <Link to="/">{t('होम', 'Home')}</Link>
                <span> › </span>
                <span>{categoryName}</span>
                <span> › </span>
                <span className="detail-breadcrumb-current">{medicineName}</span>
            </nav>

            {/* ── Two-column layout ── */}
            <div className="detail-layout">

                {/* ─────── LEFT: Image + Video + Certs ─────── */}
                <div className="detail-left">

                    {/* Product Image */}
                    <div className="detail-img-card">
                        {product.product_image ? (
                            <img
                                className="detail-img"
                                src={API_BASE_URL + '/uploads/' + product.product_image}
                                alt={product.medicine_name_en}
                            />
                        ) : (
                            <div className="detail-img-placeholder">💊</div>
                        )}
                    </div>

                    {/* Action buttons under image */}
                    <div className="detail-img-actions">
                        {certImages.length > 0 && (
                            <button
                                className="detail-action-btn cert-btn"
                                onClick={() => setCertModal(API_BASE_URL + '/uploads/' + certImages[0])}
                            >
                                📜 {t('सर्टिफिकेट', 'Certificate')}
                            </button>
                        )}
                        {product.video_url && (
                            <button
                                className="detail-action-btn video-btn"
                                onClick={() => document.getElementById('detail-video-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                ▶️ {t('वीडियो', 'Video')}
                            </button>
                        )}
                        <button
                            className="detail-action-btn cart-add-btn"
                            onClick={handleAddToCart}
                        >
                            🛒 {t('कार्ट में जोड़ें', 'Add to Cart')}
                        </button>
                        <button
                            className="detail-action-btn order-now-btn"
                            onClick={() => setShowOrder(true)}
                        >
                            📞 {t('ऑर्डर करें', 'Order Now')}
                        </button>
                    </div>

                    {/* Video */}
                    {product.video_url && (
                        <div id="detail-video-section" className="detail-section-card" style={{ marginTop: 16 }}>
                            <div className="detail-section-title">📹 {t('वीडियो देखें', 'Watch Video')}</div>
                            <div className="video-wrap">
                                {product.video_type === 'upload' ? (
                                    <video
                                        className="video-player"
                                        controls
                                        src={API_BASE_URL + '/uploads/' + product.video_url}
                                        poster={product.product_image ? API_BASE_URL + '/uploads/' + product.product_image : undefined}
                                    />
                                ) : (
                                    <iframe
                                        src={toEmbedUrl(product.video_url)}
                                        title="Product video"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {certImages.length > 0 && (
                        <div className="detail-section-card" style={{ marginTop: 16 }}>
                            <div className="detail-section-title">🏅 {t('प्रमाण पत्र', 'Certifications')}</div>
                            <div className="cert-grid">
                                {certImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className="cert-img-wrap cert-clickable"
                                        onClick={() => setCertModal(API_BASE_URL + '/uploads/' + img)}
                                        title={t('बड़ा देखें', 'Click to enlarge')}
                                    >
                                        <img className="cert-img" src={API_BASE_URL + '/uploads/' + img} alt={`Certificate ${i + 1}`} loading="lazy" />
                                        <div className="cert-zoom-hint">🔍</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─────── RIGHT: Info Card ─────── */}
                <div className="detail-right">
                    <div className="detail-info-card">

                        {/* Category tag */}
                        <span className="detail-category-tag">🌾 {categoryName}</span>

                        {/* Medicine names */}
                        <div className="detail-name-block">
                            <h1 className="detail-medicine-main">{medicineName}</h1>
                            <div className="detail-medicine-alt">{medicineAlt}</div>
                        </div>

                        {/* Company Name */}
                        {product.company_name && (
                            <div className="detail-company-badge">
                                🏭 {t('कंपनी', 'Company')}: <strong>{product.company_name}</strong>
                            </div>
                        )}

                        {/* Package Size */}
                        {product.package_qty && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#eff6ff', color: '#1d4ed8',
                                fontWeight: 700, fontSize: '0.85rem',
                                padding: '5px 12px', borderRadius: 8,
                                border: '1.5px solid #bfdbfe', marginBottom: 10,
                            }}>
                                📦 {t('पैकेज साइज', 'Package Size')}: <strong>{product.package_qty} {product.package_unit}</strong>
                            </div>
                        )}

                        {/* Disease */}
                        {diseaseName && (
                            <div className="detail-disease-card">
                                <span className="detail-field-label">🦟 {t('रोग / समस्या', 'Disease / Problem')}</span>
                                <span className="detail-field-value">{diseaseName}</span>
                            </div>
                        )}

                        {/* Dosage */}
                        {product.dosage_per_bigha && (
                            <div className="detail-dosage-card">
                                <span className="detail-field-label">🌿 {t('प्रति बीघा खुराक', 'Dosage Per Bigha')}</span>
                                <span className="detail-dosage-value">{product.dosage_per_bigha}</span>
                            </div>
                        )}

                        {/* Price + Quantity Row */}
                        {(showPrice || showQty) && (
                            <div className="detail-price-qty-card">
                                {showPrice && (
                                    <div className="detail-price-block">
                                        <span className="detail-price-label">{t('मूल्य', 'Price')}</span>
                                        <span className="detail-price-value">
                                            ₹{Number(product.price).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}
                                {showQty && (
                                    <div className="detail-qty-block">
                                        <span className="detail-price-label">{t('मात्रा', 'Quantity')}</span>
                                        <div className="qty-selector">
                                            <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                            <span className="qty-value">{quantity}</span>
                                            <button className="qty-btn" onClick={() => setQuantity(q => Math.min(99, q + 1))}>+</button>
                                        </div>
                                    </div>
                                )}
                                {totalPrice && (
                                    <div className="detail-total-row">
                                        = <strong>₹{totalPrice}</strong> {t('कुल', 'total')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Usage Instructions */}
                        {usageSteps.length > 0 && (
                            <div className="usage-card">
                                <div className="usage-card-title">📋 {t('उपयोग विधि', 'Usage Instructions')}</div>
                                {usageSteps.map((step, i) => (
                                    <div key={i} className="usage-step">
                                        <span className="usage-step-num">{i + 1}</span>
                                        <span>{step.replace(/^\d+\.\s*/, '')}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Safety warning */}
                        <div className="detail-safety-card">
                            ⚠️ {t(
                                'दवाई उपयोग करते समय दस्ताने व मास्क पहनें। बच्चों से दूर रखें।',
                                'Wear gloves and mask while using. Keep away from children.'
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="detail-cta-group">
                            <button className="detail-cart-btn" onClick={handleAddToCart}>
                                🛒 {t('कार्ट में जोड़ें', 'Add to Cart')}
                            </button>
                            <button className="detail-order-btn" onClick={() => setShowOrder(true)}>
                                📞 {t('अभी ऑर्डर करें', 'Order Now')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Certificate Modal ── */}
            {certModal && (
                <div className="cert-modal-overlay" onClick={() => setCertModal(null)}>
                    <div className="cert-modal-box" onClick={e => e.stopPropagation()}>
                        <button className="cert-modal-close" onClick={() => setCertModal(null)}>✕</button>
                        <img className="cert-modal-img" src={certModal} alt="Certificate" />
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {showOrder && product && (
                <OrderModal
                    product={{ ...product, quantity }}
                    lang={lang}
                    t={t}
                    onClose={() => setShowOrder(false)}
                />
            )}
        </PageShell>
    );
}

function PageShell({ children, lang, toggle, t, onBack, cartCount = 0, onCartOpen }) {
    return (
        <div>
            <header className="header">
                <div className="header-inner">
                    <div className="header-brand">
                        <button onClick={onBack} className="detail-back-btn">
                            ← {t('वापस', 'Back')}
                        </button>
                    </div>
                    <div className="header-title" style={{ flex: 1, textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1rem' }}>{t('दवाई विवरण', 'Medicine Details')}</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {onCartOpen && (
                            <button className="header-cart-btn" onClick={onCartOpen}>
                                🛒
                                {cartCount > 0 && (
                                    <span className="header-cart-badge">{cartCount}</span>
                                )}
                            </button>
                        )}

                        <button className="lang-toggle" onClick={toggle}>
                            {lang === 'hi' ? '🌐 EN' : '🌐 हि'}
                        </button>
                    </div>
                </div>
            </header>
            <article className="detail-page">{children}</article>
            <Footer />
        </div>
    );
}
