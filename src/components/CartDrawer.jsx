import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import CartOrderModal from './CartOrderModal';

function CartItem({ item, onRemove, onQtyChange }) {
    const { t } = useLanguage();
    const { product, quantity } = item;
    const showPrice = product.show_price == 1 && product.price;
    const showQty = product.show_quantity == 1;
    const imgSrc = product.product_image
        ? `/uploads/${product.product_image}`
        : null;

    return (
        <div className="cart-item">
            <div className="cart-item-img">
                {imgSrc
                    ? <img src={imgSrc} alt={product.medicine_name_en} />
                    : <div className="cart-item-img-placeholder">💊</div>
                }
            </div>
            <div className="cart-item-info">
                <div className="cart-item-name-hi">{product.medicine_name_hi}</div>
                <div className="cart-item-name-en">{product.medicine_name_en}</div>
                {showPrice && (
                    <div className="cart-item-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                        {quantity > 1 && (
                            <span className="cart-item-subtotal">
                                {' '}× {quantity} = ₹{(Number(product.price) * quantity).toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                )}
                <div className="cart-item-qty-row">
                    {showQty ? (
                        <div className="cart-qty-selector">
                            <button className="cart-qty-btn" onClick={() => onQtyChange(product.id, quantity - 1)}>−</button>
                            <span className="cart-qty-val">{quantity}</span>
                            <button className="cart-qty-btn" onClick={() => onQtyChange(product.id, quantity + 1)}>+</button>
                        </div>
                    ) : (
                        <span className="cart-qty-fixed">{t('मात्रा:', 'Qty:')} {quantity}</span>
                    )}
                    <button className="cart-remove-btn" onClick={() => onRemove(product.id)} title={t('हटाएं', 'Remove')}>
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartDrawer({ open, onClose }) {
    const { t } = useLanguage();
    const { items, removeFromCart, updateQty, clearCart, cartCount, cartTotal, hasPrice } = useCart();
    const [showOrderModal, setShowOrderModal] = useState(false);

    const handleClose = () => {
        setShowOrderModal(false);
        onClose();
    };

    const handleOrderSuccess = () => {
        setShowOrderModal(false);
        clearCart();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`cart-backdrop${open ? ' open' : ''}`}
                onClick={handleClose}
            />
            {/* Drawer */}
            <div className={`cart-drawer${open ? ' open' : ''}`}>
                {/* Header */}
                <div className="cart-drawer-header">
                    <div className="cart-drawer-title">
                        🛒 {t('मेरा कार्ट', 'My Cart')}
                        {cartCount > 0 && (
                            <span className="cart-drawer-count">{cartCount}</span>
                        )}
                    </div>
                    <button className="cart-close-btn" onClick={handleClose}>✕</button>
                </div>

                {/* Body */}
                <div className="cart-drawer-body">
                    {items.length === 0 ? (
                        /* ---- EMPTY ---- */
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🧺</div>
                            <div className="cart-empty-hi">कार्ट खाली है</div>
                            <div className="cart-empty-en">Your cart is empty</div>
                            <div className="cart-empty-hint">
                                {t('उत्पाद जोड़ने के लिए "कार्ट में जोड़ें" दबाएं', 'Press "Add to Cart" on any product')}
                            </div>
                            <button className="cart-close-btn-alt" onClick={handleClose}>
                                {t('खरीदारी करें', 'Start Shopping')}
                            </button>
                        </div>
                    ) : (
                        /* ---- ITEM LIST ---- */
                        <div className="cart-items-list">
                            {items.map(item => (
                                <CartItem
                                    key={item.product.id}
                                    item={item}
                                    onRemove={removeFromCart}
                                    onQtyChange={updateQty}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer — show when items present */}
                {items.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-footer-summary">
                            <div className="cart-footer-row">
                                <span>{t('उत्पाद:', 'Products:')}</span>
                                <strong>{items.length}</strong>
                            </div>
                            <div className="cart-footer-row">
                                <span>{t('कुल मात्रा:', 'Total Qty:')}</span>
                                <strong>{cartCount}</strong>
                            </div>
                            {hasPrice && (
                                <div className="cart-footer-row total">
                                    <span>{t('कुल मूल्य:', 'Total:')}</span>
                                    <strong className="cart-footer-total">₹{cartTotal.toLocaleString('en-IN')}</strong>
                                </div>
                            )}
                        </div>
                        <button className="cart-order-btn" onClick={() => setShowOrderModal(true)}>
                            📞 {t('ऑर्डर करें', 'Order Now')}
                        </button>
                    </div>
                )}
            </div>

            {/* Cart Order Modal */}
            {showOrderModal && (
                <CartOrderModal
                    onClose={() => setShowOrderModal(false)}
                    onSuccess={handleOrderSuccess}
                />
            )}
        </>
    );
}
