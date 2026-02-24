import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import OrderModal from '../components/OrderModal';
import CertModal from '../components/CertModal';
import VideoModal from '../components/VideoModal';
import CartDrawer from '../components/CartDrawer';
import CartSidebar from '../components/CartSidebar';
import Footer from '../components/Footer';

/* ── Toast ── */
function Toast({ message, onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2200);
        return () => clearTimeout(t);
    }, [onDone]);
    return <div className="cart-toast">{message}</div>;
}

export default function HomePage() {
    const { lang, selectLang, showDropdown, setShowDropdown, dropdownRef, t } = useLanguage();
    const { cartCount } = useCart();
    const { id: categoryParam } = useParams();   // from /category/:id route
    const navigate = useNavigate();

    const [banner, setBanner] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);

    // Modal state
    const [orderProduct, setOrderProduct] = useState(null);
    const [certProduct, setCertProduct] = useState(null);
    const [videoProduct, setVideoProduct] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg) => setToast(msg), []);

    useEffect(() => {
        Promise.all([
            fetch('/api/banner').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/products').then(r => r.json()),
        ]).then(([bData, cData, pData]) => {
            if (bData.success && bData.data) setBanner(bData.data);
            if (cData.success) setCategories(cData.data || []);
            if (pData.success) setAllProducts(pData.data || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // Sync activeCategory when the URL param changes (e.g. browser back/forward)
    useEffect(() => {
        setActiveCategory(categoryParam || 'all');
    }, [categoryParam]);

    const filtered = activeCategory === 'all'
        ? allProducts
        : allProducts.filter(p => String(p.category_id) === activeCategory);

    const activeCat = categories.find(c => String(c.id) === activeCategory);

    const toEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('embed')) return url;
        const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
        return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}` : url;
    };

    return (
        <div>
            {/* Toast notification */}
            {toast && <Toast message={toast} onDone={() => setToast(null)} />}

            {/* Cart Drawer — mobile only */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

            {/* ========== HEADER ========== */}
            <header className="header">
                <div className="header-inner">
                    <div className="header-brand">
                        <span className="header-logo">🌾</span>
                        <div className="header-title">
                            <h1>{t('किसान कृषि केंद्र', 'Kisan Krishi Kendra')}</h1>
                            <p>{t('कृषि दवाई की दुकान', 'Agriculture Medicine Shop')}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* 🛒 Cart Icon — mobile only (sidebar handles desktop) */}
                        <button
                            className="header-cart-btn header-cart-mobile-only"
                            onClick={() => setCartOpen(true)}
                            title={t('कार्ट देखें', 'View Cart')}
                        >
                            🛒
                            {cartCount > 0 && (
                                <span className="header-cart-badge">{cartCount}</span>
                            )}
                        </button>

                        {/* Language dropdown */}
                        <div className="lang-dropdown-wrap" ref={dropdownRef}>
                            <button
                                className="lang-toggle"
                                onClick={() => setShowDropdown(v => !v)}
                                aria-haspopup="true"
                                aria-expanded={showDropdown}
                            >
                                🌐 {lang === 'hi' ? 'हिंदी ▾' : 'English ▾'}
                            </button>
                            {showDropdown && (
                                <div className="lang-dropdown">
                                    <button
                                        className={`lang-option${lang === 'hi' ? ' active' : ''}`}
                                        onClick={() => selectLang('hi')}
                                    >
                                        🇮🇳 हिंदी {lang === 'hi' && '✓'}
                                    </button>
                                    <button
                                        className={`lang-option${lang === 'en' ? ' active' : ''}`}
                                        onClick={() => selectLang('en')}
                                    >
                                        🌐 English {lang === 'en' && '✓'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== BANNER ========== */}
            {banner && (
                <section
                    className={`banner${banner.show_bg == 0 ? ' banner--no-bg' : ''}`}
                    style={banner.show_bg != 0 && banner.bg_color ? { background: banner.bg_color } : undefined}
                >
                    {banner.banner_type === 'video' && banner.video_url ? (
                        banner.video_url.startsWith('http') ? (
                            <iframe className="banner-img" src={toEmbedUrl(banner.video_url)} title="Banner" allow="autoplay; muted" style={{ border: 'none', opacity: banner.show_bg == 0 ? 1 : 0.5 }} />
                        ) : (
                            <video className="banner-video" src={`/uploads/${banner.video_url}`} autoPlay muted loop playsInline />
                        )
                    ) : banner.banner_image ? (
                        <img className="banner-img" src={`/uploads/${banner.banner_image}`} alt="Banner" style={{ opacity: banner.show_bg == 0 ? 1 : undefined }} />
                    ) : null}
                    {banner.show_bg != 0 && (
                        <div className="banner-overlay" style={{ background: banner.bg_color ? `${banner.bg_color}99` : undefined }} />
                    )}
                    {(banner.title_hi || banner.title_en) && (
                        <div className="banner-content">
                            <span className="banner-emoji">🌱</span>
                            <h2 className="banner-title">{t(banner.title_hi, banner.title_en)}</h2>
                            {(banner.description_hi || banner.description_en) && (
                                <p className="banner-subtitle">{t(banner.description_hi, banner.description_en)}</p>
                            )}
                            <div className="banner-badge">✅ {t('विश्वसनीय · किफायती · असरदार', 'Trusted · Affordable · Effective')}</div>
                        </div>
                    )}
                </section>
            )}

            {/* ========== CATEGORY CARDS ========== */}
            <section className="cat-cards-section">
                <div className="cat-cards-inner">
                    <button
                        className={`cat-card-btn${activeCategory === 'all' ? ' active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        <div className="cat-card-img-wrap">
                            <div className="cat-card-emoji">🌿</div>
                            <div className="cat-card-overlay" />
                            <div className="cat-card-text">
                                <span className="cat-card-name">{t('सभी', 'All')}</span>
                            </div>
                        </div>
                    </button>

                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`cat-card-btn${activeCategory === String(cat.id) ? ' active' : ''}`}
                            onClick={() => navigate(`/category/${cat.id}`)}
                        >
                            <div className="cat-card-img-wrap">
                                {cat.category_image ? (
                                    <img className="cat-card-img" src={`/uploads/${cat.category_image}`} alt={cat.name_en} />
                                ) : (
                                    <div className="cat-card-emoji">{cat.icon || '🌾'}</div>
                                )}
                                <div className="cat-card-overlay" />
                                <div className="cat-card-text">
                                    <span className="cat-card-name">{t(cat.name_hi, cat.name_en)}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ========== MAIN CONTENT — Products + Cart Sidebar ========== */}
            <div className="page-with-cart">
                {/* ── Left: Products ── */}
                <main className="page-content page-content--with-sidebar">
                    {/* Toolbar */}
                    <div className="section-header">
                        <h2 className="section-title">
                            {activeCategory === 'all'
                                ? t('सभी दवाइयां', 'All Medicines')
                                : t(activeCat?.name_hi || 'दवाइयां', activeCat?.name_en || 'Medicines')}
                        </h2>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {!loading && <span className="section-count">{filtered.length} {t('उत्पाद', 'items')}</span>}
                            <div className="view-toggle">
                                <button
                                    className={`vtoggle-btn${viewMode === 'list' ? ' active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >☰ {t('सूची', 'List')}</button>
                                <button
                                    className={`vtoggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >⊞ {t('ग्रिड', 'Grid')}</button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-wrap"><div className="spinner" /><span>{t('लोड हो रहा है...', 'Loading...')}</span></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-msg"><span className="empty-icon">🌾</span>{t('कोई दवाई नहीं मिली', 'No medicines found')}</div>
                    ) : viewMode === 'list' ? (
                        <div className="product-list">
                            {filtered.map(p => (
                                <ListItem
                                    key={p.id}
                                    product={p}
                                    lang={lang}
                                    t={t}
                                    onOrder={() => setOrderProduct(p)}
                                    onCert={() => setCertProduct(p)}
                                    onVideo={() => setVideoProduct(p)}
                                    onAddToCart={(msg) => showToast(msg)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filtered.map(p => (
                                <GridCard
                                    key={p.id}
                                    product={p}
                                    lang={lang}
                                    t={t}
                                    onOrder={() => setOrderProduct(p)}
                                    onCert={() => setCertProduct(p)}
                                    onVideo={() => setVideoProduct(p)}
                                    onAddToCart={(msg) => showToast(msg)}
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* ── Right: Cart Sidebar (desktop only) ── */}
                <CartSidebar />
            </div>

            {/* ========== MODALS ========== */}
            {orderProduct && (
                <OrderModal
                    product={orderProduct}
                    lang={lang}
                    t={t}
                    onClose={() => setOrderProduct(null)}
                />
            )}
            {certProduct && (
                <CertModal
                    images={Array.isArray(certProduct.certification_images)
                        ? certProduct.certification_images
                        : certProduct.certification_images
                            ? JSON.parse(certProduct.certification_images)
                            : []}
                    productName={t(certProduct.medicine_name_hi, certProduct.medicine_name_en)}
                    onClose={() => setCertProduct(null)}
                />
            )}
            {videoProduct && (
                <VideoModal
                    videoUrl={videoProduct.video_url}
                    videoType={videoProduct.video_type}
                    productName={t(videoProduct.medicine_name_hi, videoProduct.medicine_name_en)}
                    onClose={() => setVideoProduct(null)}
                />
            )}

            <Footer />
        </div>
    );
}

/* ===================== LIST ITEM ===================== */
function ListItem({ product: p, lang, t, onOrder, onCert, onVideo, onAddToCart }) {
    const { addToCart } = useCart();

    const certImages = (() => {
        if (Array.isArray(p.certification_images)) return p.certification_images;
        if (typeof p.certification_images === 'string' && p.certification_images) {
            try { return JSON.parse(p.certification_images); } catch { return []; }
        }
        return [];
    })();

    const [qty, setQty] = useState(1);
    const showPrice = p.show_price == 1 && p.price;
    const showQty = p.show_quantity == 1;

    const medicineName = lang === 'hi' ? p.medicine_name_hi : p.medicine_name_en;
    const diseaseName = lang === 'hi' ? p.disease_name_hi : p.disease_name_en;
    const categoryName = lang === 'hi' ? p.category_name_hi : p.category_name_en;

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(p, showQty ? qty : 1);
        onAddToCart(lang === 'hi'
            ? `✅ "${p.medicine_name_hi}" कार्ट में जोड़ा!`
            : `✅ Added "${p.medicine_name_en}" to cart!`
        );
    };

    return (
        <div className="list-item">
            <Link to={`/medicine/${p.id}`} className="list-img-link" tabIndex={-1} aria-hidden="true">
                <div className="list-img-wrap">
                    {p.product_image ? (
                        <img className="list-img" src={`/uploads/${p.product_image}`} alt={p.medicine_name_en} loading="lazy" />
                    ) : (
                        <div className="list-img-placeholder">💊</div>
                    )}
                </div>
            </Link>

            <div className="list-body">
                <Link to={`/medicine/${p.id}`} className="list-info-link">
                    <div className="list-info">
                        {categoryName && <div className="list-cat-tag">{categoryName}</div>}
                        <div className="list-name-main">{medicineName}</div>
                        {p.company_name && (
                            <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginBottom: 2 }}>🏭 {p.company_name}</div>
                        )}
                        <div className="list-meta-row">
                            {diseaseName && <div className="list-disease-tag">🦟 {diseaseName}</div>}
                            {p.dosage_per_bigha && (
                                <div className="list-dosage">
                                    🌿 {t('मात्रा:', 'Dose:')} <strong>{p.dosage_per_bigha}</strong>
                                </div>
                            )}
                            {p.package_qty && (
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 7px', borderRadius: 5, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                    📦 {p.package_qty} {p.package_unit}
                                </div>
                            )}
                        </div>
                        {(showPrice || showQty) && (
                            <div className="list-price-qty-row">
                                {showPrice && (
                                    <span className="list-price-badge">💰 ₹{Number(p.price).toLocaleString('en-IN')}</span>
                                )}
                                {showQty && (
                                    <div className="qty-selector qty-selector--sm">
                                        <button className="qty-btn" onClick={e => { e.preventDefault(); setQty(q => Math.max(1, q - 1)); }}>−</button>
                                        <span className="qty-value">{qty}</span>
                                        <button className="qty-btn" onClick={e => { e.preventDefault(); setQty(q => Math.min(99, q + 1)); }}>+</button>
                                    </div>
                                )}
                                {showPrice && showQty && qty > 1 && (
                                    <span className="list-price-total">= ₹{(Number(p.price) * qty).toLocaleString('en-IN')}</span>
                                )}
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            <div className="list-actions">
                {certImages.length > 0 && (
                    <button className="action-btn cert-btn" onClick={onCert}>
                        📜<span>{t('सर्टिफिकेट', 'Cert')}</span>
                    </button>
                )}
                {p.video_url && (
                    <button className="action-btn video-btn" onClick={onVideo}>
                        ▶️<span>{t('वीडियो', 'Video')}</span>
                    </button>
                )}
                <button className="action-btn cart-add-btn" onClick={handleAddToCart}>
                    🛒<span>{t('कार्ट', 'Cart')}</span>
                </button>
                <button className="action-btn order-now-btn" onClick={onOrder}>
                    📞<span>{t('ऑर्डर', 'Order')}</span>
                </button>
            </div>
        </div>
    );
}

/* ===================== GRID CARD ===================== */
function GridCard({ product: p, lang, t, onOrder, onCert, onVideo, onAddToCart }) {
    const { addToCart } = useCart();

    const certImages = (() => {
        if (Array.isArray(p.certification_images)) return p.certification_images;
        if (typeof p.certification_images === 'string' && p.certification_images) {
            try { return JSON.parse(p.certification_images); } catch { return []; }
        }
        return [];
    })();

    const showPrice = p.show_price == 1 && p.price;
    const medicineName = lang === 'hi' ? p.medicine_name_hi : p.medicine_name_en;
    const diseaseName = lang === 'hi' ? p.disease_name_hi : p.disease_name_en;
    const categoryName = lang === 'hi' ? p.category_name_hi : p.category_name_en;

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(p, 1);
        onAddToCart(lang === 'hi'
            ? `✅ "${p.medicine_name_hi}" कार्ट में जोड़ा!`
            : `✅ Added "${p.medicine_name_en}" to cart!`
        );
    };

    return (
        <div className="medicine-card">
            <Link to={`/medicine/${p.id}`} className="medicine-card-link">
                <div className="medicine-card-img-wrap">
                    {p.product_image ? (
                        <img className="medicine-card-img" src={`/uploads/${p.product_image}`} alt={p.medicine_name_en} loading="lazy" />
                    ) : (
                        <div className="medicine-card-img-placeholder">💊</div>
                    )}
                </div>
                <div className="medicine-card-body">
                    {categoryName && <span className="medicine-category-tag">{categoryName}</span>}
                    <div className="medicine-name-hi">{medicineName}</div>
                    <div className="medicine-name-en">{lang === 'hi' ? p.medicine_name_en : p.medicine_name_hi}</div>
                    {p.company_name && (
                        <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, marginBottom: 2 }}>🏭 {p.company_name}</div>
                    )}
                    {diseaseName && <span className="medicine-disease">🦠 {diseaseName}</span>}
                    {p.package_qty && (
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 5, display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 2, alignSelf: 'flex-start' }}>
                            📦 {p.package_qty} {p.package_unit}
                        </div>
                    )}
                    {p.dosage_per_bigha && (
                        <div className="medicine-dosage">🌿 {t('मात्रा:', 'Dose:')} <strong>{p.dosage_per_bigha}</strong></div>
                    )}
                    {showPrice && (
                        <div className="medicine-price-badge">💰 ₹{Number(p.price).toLocaleString('en-IN')}</div>
                    )}
                </div>
            </Link>
            <div className="medicine-card-footer">
                <div className="card-actions">
                    {certImages.length > 0 && (
                        <button className="action-btn cert-btn small" onClick={onCert}>📜 {t('सर्टिफिकेट', 'Cert')}</button>
                    )}
                    {p.video_url && (
                        <button className="action-btn video-btn small" onClick={onVideo}>▶️ {t('वीडियो', 'Video')}</button>
                    )}
                </div>
                <div className="card-order-btns">
                    <button className="cart-add-btn-card" onClick={handleAddToCart}>
                        🛒 {t('कार्ट में जोड़ें', 'Add to Cart')}
                    </button>
                    <button className="view-btn" onClick={onOrder}>
                        📞 {t('ऑर्डर करें', 'Order Now')}
                    </button>
                </div>
            </div>
        </div>
    );
}
