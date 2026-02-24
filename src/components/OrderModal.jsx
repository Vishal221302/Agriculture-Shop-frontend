import React, { useState } from 'react';

export default function OrderModal({ product, lang, t, onClose }) {
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const showQty = product.show_quantity == 1;

    const validate = () => {
        const errs = {};
        if (!mobile.trim()) errs.mobile = t('मोबाइल नंबर जरूरी है', 'Mobile number is required');
        else if (!/^[6-9]\d{9}$/.test(mobile.trim())) errs.mobile = t('सही 10 अंक का नंबर डालें', 'Enter a valid 10-digit mobile number');
        if (!address.trim()) errs.address = t('पता जरूरी है', 'Address is required');
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    mobile_number: mobile.trim(),
                    address: address.trim(),
                    quantity: showQty ? quantity : 1
                })
            });
            const data = await res.json();
            if (data.success) setSuccess(true);
            else setErrors({ server: data.message });
        } catch { setErrors({ server: t('सर्वर से कनेक्ट नहीं हो सका', 'Cannot connect to server') }); }
        setSubmitting(false);
    };

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-handle" />

                {success ? (
                    <div className="order-success">
                        <span className="order-success-icon">✅</span>
                        <div className="order-success-hi">आपका ऑर्डर हो गया!</div>
                        <div className="order-success-en">Your order has been placed successfully.</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: 4 }}>
                            {t('हम जल्द ही संपर्क करेंगे।', 'We will contact you soon.')}
                        </div>
                        <button className="order-submit" style={{ marginTop: 16, maxWidth: 260 }} onClick={onClose}>
                            {t('ठीक है', 'OK, Close')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="order-modal-title">
                            📞 {t('ऑर्डर करें', 'Place Order')}
                        </div>
                        <div className="order-product-name">
                            💊 {t(product.medicine_name_hi, product.medicine_name_en)}
                        </div>

                        {/* Price display */}
                        {product.show_price == 1 && product.price && (
                            <div className="order-price-tag">
                                💰 {t('मूल्य:', 'Price:')} <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>
                                {showQty && quantity > 1 && (
                                    <span style={{ marginLeft: 8, fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                                        × {quantity} = ₹{(Number(product.price) * quantity).toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                        )}

                        {errors.server && (
                            <div style={{ background: 'var(--red-50)', color: 'var(--red-600)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: '0.82rem', fontWeight: 600 }}>
                                ⚠️ {errors.server}
                            </div>
                        )}

                        {/* Quantity selector */}
                        {showQty && (
                            <div className="order-form-group">
                                <label className="order-label">📦 {t('मात्रा (units):', 'Quantity (units):')}</label>
                                <div className="qty-selector">
                                    <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                    <span className="qty-value">{quantity}</span>
                                    <button className="qty-btn" onClick={() => setQuantity(q => Math.min(99, q + 1))}>+</button>
                                </div>
                            </div>
                        )}

                        <div className="order-form-group">
                            <label className="order-label">
                                📱 {t('मोबाइल नंबर *', 'Mobile Number *')}
                            </label>
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
                            <label className="order-label">
                                🏠 {t('पता / गांव *', 'Address / Village *')}
                            </label>
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
                            {submitting ? t('भेज रहे हैं...', 'Placing order...') : `📞 ${t('अभी ऑर्डर करें', 'Order Now')}`}
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
