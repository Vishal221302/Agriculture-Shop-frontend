import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../config';

/**
 * CartOrderModal — shown when user clicks "Order Now" in cart.
 * Collects mobile + address, sends all cart items as one order.
 */
export default function CartOrderModal({ onClose, onSuccess }) {
    const { t } = useLanguage();
    const { items, cartCount, cartTotal, hasPrice } = useCart();

    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const errs = {};
        if (!username.trim()) errs.username = t('पूरा नाम जरूरी है', 'Full name is required');
        if (!mobile.trim()) errs.mobile = t('मोबाइल नंबर जरूरी है', 'Mobile number is required');
        else if (!/^[6-9]\d{9}$/.test(mobile.trim())) errs.mobile = t('सही 10 अंक का नंबर डालें', 'Enter a valid 10-digit number');
        if (!address.trim()) errs.address = t('पता जरूरी है', 'Address is required');
        return errs;
    };

    const handleSubmit = async () => {
        if (items.length === 0) return;
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);

        try {
            const orderItems = items.map(i => ({
                product_id: i.product.id,
                quantity: i.quantity,
                price: (i.product.show_price == 1 && i.product.price)
                    ? parseFloat(i.product.price)
                    : null
            }));

            const res = await fetch(API_BASE_URL + '/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: username.trim(),
                    mobile_number: mobile.trim(),
                    address: address.trim(),
                    cart_items: orderItems   // ✅ required: array of { product_id, quantity, price }
                })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                // Call webhook
                try {
                    await fetch('https://n8n.avertisystems.com/webhook/Agro-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            order_id: `ORD-${Date.now()}`,
                            date: new Date().toLocaleString('en-IN'),
                            merchant_number: '918447938552',
                            product_name: items.map(i => `${i.product.medicine_name_en || i.product.medicine_name_hi} (x${i.quantity})`).join(', ') || 'Cart Order',
                            customer_name: username.trim(),
                            phone: mobile.trim(),
                            address: address.trim(),
                            price: hasPrice ? String(cartTotal) : '0',
                            product_image: items.map(i => i.product.product_image ? API_BASE_URL + '/uploads/' + i.product.product_image : '').filter(Boolean).join(', ')
                        })
                    });
                } catch (webhookErr) {
                    console.error('Webhook failed:', webhookErr);
                }
            } else {
                setErrors({ server: data.message || t('ऑर्डर नहीं हो सका', 'Order failed') });
            }
        } catch {
            setErrors({ server: t('सर्वर से कनेक्ट नहीं हो सका', 'Cannot connect to server') });
        }
        setSubmitting(false);
    };

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-handle" />

                {success ? (
                    /* ── SUCCESS ── */
                    <div className="order-success">
                        <span className="order-success-icon">✅</span>
                        <div className="order-success-hi">आपका ऑर्डर हो गया!</div>
                        <div className="order-success-en">Your order has been placed successfully.</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: 4 }}>
                            {t('हम जल्द ही संपर्क करेंगे।', 'We will contact you soon.')}
                        </div>
                        <button
                            className="order-submit"
                            style={{ marginTop: 16, maxWidth: 260 }}
                            onClick={onSuccess}
                        >
                            {t('ठीक है', 'OK, Close')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="order-modal-title">
                            📞 {t('ऑर्डर करें', 'Place Order')}
                        </div>

                        {/* Cart summary */}
                        <div style={{
                            background: 'var(--green-50)',
                            border: '1.5px solid var(--green-100)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            marginBottom: 14,
                            fontSize: '0.82rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--gray-600)' }}>{t('कुल उत्पाद:', 'Products:')}</span>
                                <strong>{items.length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--gray-600)' }}>{t('कुल मात्रा:', 'Total Qty:')}</span>
                                <strong>{cartCount}</strong>
                            </div>
                            {hasPrice && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--green-800)', borderTop: '1px solid var(--green-200)', paddingTop: 6, marginTop: 6 }}>
                                    <span>{t('कुल मूल्य:', 'Total Price:')}</span>
                                    <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>
                                </div>
                            )}
                        </div>

                        {errors.server && (
                            <div style={{ background: 'var(--red-50)', color: 'var(--red-600)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: '0.82rem', fontWeight: 600 }}>
                                ⚠️ {errors.server}
                            </div>
                        )}

                        <div className="order-form-group">
                            <label className="order-label">👤 {t('पूरा नाम *', 'Full Name *')}</label>
                            <input
                                className={`order-input${errors.username ? ' error' : ''}`}
                                type="text"
                                placeholder={t('अपना नाम लिखें', 'Enter your name')}
                                value={username}
                                onChange={e => { setUsername(e.target.value); setErrors(v => ({ ...v, username: null })); }}
                            />
                            {errors.username && <div className="order-error">⚠️ {errors.username}</div>}
                        </div>

                        <div className="order-form-group">
                            <label className="order-label">📱 {t('मोबाइल नंबर *', 'Mobile Number *')}</label>
                            <input
                                className={`order-input${errors.mobile ? ' error' : ''}`}
                                type="tel"
                                inputMode="numeric"
                                placeholder={t('10 अंक का नंबर', '10-digit mobile number')}
                                value={mobile}
                                maxLength={10}
                                onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setErrors(v => ({ ...v, mobile: null })); }}
                            />
                            {errors.mobile && <div className="order-error">⚠️ {errors.mobile}</div>}
                        </div>

                        <div className="order-form-group">
                            <label className="order-label">🏠 {t('पता / गांव *', 'Address / Village *')}</label>
                            <textarea
                                className={`order-input${errors.address ? ' error' : ''}`}
                                rows={3}
                                placeholder={t('गांव, तहसील, जिला...', 'Village, Tehsil, District...')}
                                value={address}
                                onChange={e => { setAddress(e.target.value); setErrors(v => ({ ...v, address: null })); }}
                                style={{ resize: 'vertical' }}
                            />
                            {errors.address && <div className="order-error">⚠️ {errors.address}</div>}
                        </div>

                        <button className="order-submit" onClick={handleSubmit} disabled={submitting}>
                            {submitting
                                ? t('भेज रहे हैं...', 'Placing order...')
                                : `📞 ${t('ऑर्डर कन्फर्म करें', 'Confirm Order')}`
                            }
                        </button>
                        <button className="order-cancel" onClick={onClose}>
                            {t('रद्द करें', 'Cancel')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
