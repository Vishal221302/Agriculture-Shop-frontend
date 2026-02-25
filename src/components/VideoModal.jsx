import React from 'react';
import { API_BASE_URL } from '../config';

function toEmbedUrl(url) {
    if (!url) return null;
    if (url.includes('/embed/')) return url;
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

/**
 * VideoModal — YouTube iframe or <video> player
 * Props: videoUrl, videoType ('youtube'|'upload'), productName, onClose
 */
export default function VideoModal({ videoUrl, videoType, productName, onClose }) {
    if (!videoUrl) return null;

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box modal-box-video">
                <div className="modal-handle" />
                <div className="modal-title">📹 {productName}</div>

                <div className="video-modal-wrap">
                    {videoType === 'upload' ? (
                        <video
                            className="video-player"
                            controls
                            autoPlay
                            src={API_BASE_URL + '/uploads/' + videoUrl}
                            style={{ width: '100%', borderRadius: 12, background: '#000' }}
                        />
                    ) : (
                        <iframe
                            src={toEmbedUrl(videoUrl)}
                            title="Product Video"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 12 }}
                        />
                    )}
                </div>

                <button className="modal-close" style={{ marginTop: 14 }} onClick={onClose}>✖️ Close</button>
            </div>
        </div>
    );
}
