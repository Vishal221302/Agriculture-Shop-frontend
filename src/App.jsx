import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import MedicineDetailPage from './pages/MedicineDetailPage';

export default function App() {
    return (
        <LanguageProvider>
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/medicine/:id" element={<MedicineDetailPage />} />
                        {/* Legacy route redirect */}
                        <Route path="/category/:id" element={<HomePage />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </LanguageProvider>
    );
}
