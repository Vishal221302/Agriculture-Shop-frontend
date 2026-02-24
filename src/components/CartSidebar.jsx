import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import CartOrderModal from './CartOrderModal';

/**
 * CartSidebar — shown on tablet/desktop (≥768px) as a sticky right panel.
 * On mobile this component is hidden; CartDrawer is used instead.
 */

function SidebarItem({ item, onRemove, onQtyChange }) {
    const { t } = useLanguage();
    const { product, quantity } = item;
    const showPrice = product.show_price == 1 && product.price;
    const showQty = product.show_quantity == 1;
    const imgSrc = product.product_image ? `/uploads/${product.product_image}` : null;
    const subtotal = showPrice ? Number(product.price) * quantity : null;

    return (
        <div className="sidebar-cart-item">
            {/* Image */}
            <div className="sidebar-cart-img">
                {imgSrc
                    ? <img src={imgSrc} alt={product.medicine_name_en} />
                    : <span style={{ fontSize: '1.4rem' }}>💊</span>
                }
            </div>

            {/* Info */}
            <div className="sidebar-cart-info">
                <div className="sidebar-cart-name-hi">{product.medicine_name_hi}</div>
                <div className="sidebar-cart-name-en">{product.medicine_name_en}</div>

                {showPrice && (
                    <div className="sidebar-cart-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                        {quantity > 1 && (
                            <span className="sidebar-cart-subtotal">
                                {' '}× {quantity} = ₹{subtotal.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                )}

                <div className="sidebar-cart-controls">
                    {showQty ? (
                        <div className="sidebar-qty-row">
                            <button className="sidebar-qty-btn" onClick={() => onQtyChange(product.id, quantity - 1)}>−</button>
                            <span className="sidebar-qty-val">{quantity}</span>
                            <button className="sidebar-qty-btn" onClick={() => onQtyChange(product.id, quantity + 1)}>+</button>
                        </div>
                    ) : (
                        <span className="sidebar-qty-fixed">{t('मात्रा:', 'Qty:')} {quantity}</span>
                    )}
                    <button
                        className="sidebar-remove-btn"
                        onClick={() => onRemove(product.id)}
                        title={t('हटाएं', 'Remove')}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartSidebar() {
    const { t } = useLanguage();
    const { items, removeFromCart, updateQty, clearCart, cartCount, cartTotal, hasPrice } = useCart();
    const [showOrderModal, setShowOrderModal] = useState(false);

    const handleOrderSuccess = () => {
        setShowOrderModal(false);
        clearCart();
    };

    return (
        <>
            <aside className="cart-sidebar">
                {/* Header */}
                <div className="cart-sidebar-header">
                    <span className="cart-sidebar-title">🛒 {t('मेरा कार्ट', 'My Cart')}</span>
                    {cartCount > 0 && (
                        <span className="cart-sidebar-badge">{cartCount}</span>
                    )}
                </div>

                {/* Items */}
                <div className="cart-sidebar-body">
                    {items.length === 0 ? (
                        <div className="cart-sidebar-empty">
                            <div style={{ fontSize: '2rem' }}>🧺</div>
                            <div className="cart-sidebar-empty-hi">कार्ट खाली है</div>
                            <div className="cart-sidebar-empty-en">Cart is empty</div>
                            <div className="cart-sidebar-empty-hint">
                                {t('किसी उत्पाद पर "कार्ट में जोड़ें" दबाएं', 'Click "Add to Cart" on any product')}
                            </div>
                        </div>
                    ) : (
                        <div className="sidebar-cart-items">
                            {items.map(item => (
                                <SidebarItem
                                    key={item.product.id}
                                    item={item}
                                    onRemove={removeFromCart}
                                    onQtyChange={updateQty}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                    <div className="cart-sidebar-footer">
                        <div className="cart-sidebar-summary">
                            <div className="cart-sidebar-row">
                                <span>{t('उत्पाद:', 'Products:')}</span>
                                <strong>{items.length}</strong>
                            </div>
                            <div className="cart-sidebar-row">
                                <span>{t('कुल मात्रा:', 'Total Qty:')}</span>
                                <strong>{cartCount}</strong>
                            </div>
                            {hasPrice && (
                                <div className="cart-sidebar-row total">
                                    <span>{t('कुल मूल्य:', 'Total:')}</span>
                                    <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>
                                </div>
                            )}
                        </div>
                        <button
                            className="cart-sidebar-order-btn"
                            onClick={() => setShowOrderModal(true)}
                        >
                            📞 {t('ऑर्डर करें', 'Order Now')}
                        </button>
                        <button
                            className="cart-sidebar-clear-btn"
                            onClick={clearCart}
                        >
                            🗑️ {t('कार्ट खाली करें', 'Clear Cart')}
                        </button>
                    </div>
                )}
            </aside>

            {showOrderModal && (
                <CartOrderModal
                    onClose={() => setShowOrderModal(false)}
                    onSuccess={handleOrderSuccess}
                />
            )}
        </>
    );
}
