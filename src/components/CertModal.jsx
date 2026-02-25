import React from 'react';
import { API_BASE_URL } from '../config';

/**
 * CertModal — shows certification images in a lightbox grid
 * Props: images (array of filenames), onClose
 */
export default function CertModal({ images, productName, onClose }) {
    if (!images || images.length === 0) return null;

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box modal-box-center">
                <div className="modal-handle" />
                <div className="modal-title">🏅 {productName}</div>
                <div className="modal-subtitle" style={{ marginBottom: 16 }}>
                    Certification Documents · प्रमाण पत्र
                </div>

                <div className="cert-modal-grid">
                    {images.map((img, i) => (
                        <a
                            key={i}
                            href={API_BASE_URL + '/uploads/' + img}
                            target="_blank"
                            rel="noreferrer"
                            className="cert-modal-item"
                            title={`Certificate ${i + 1}`}
                        >
                            <div className="cert-img-wrap">
                                <img
                                    className="cert-img"
                                    src={API_BASE_URL + '/uploads/' + img}
                                    alt={`Certificate ${i + 1}`}
                                    loading="lazy"
                                />
                            </div>
                            <div className="cert-modal-label">Cert {i + 1} 🔍</div>
                        </a>
                    ))}
                </div>

                <button className="modal-close" onClick={onClose}>✖️ Close</button>
            </div>
        </div>
    );
}
