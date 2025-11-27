import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 

function CreateAsset() {
  // Fiyat tipini kontrol etmek için State
  const [priceType, setPriceType] = useState('free');

  return (
    <div className="create-asset-body">
        {/* NAVBAR */}
        <header className="navbar">
            <div className="logo">
                <h1>SHERIFF GAMES</h1>
            </div>
            <nav className="nav-links">
                <Link to="/">Keşfet</Link>
                <Link to="#">Oyunlar</Link>
                <Link to="/create-asset">Assetler</Link>
                <Link to="/create-game">Oluştur</Link>
            </nav>
            <div className="user-actions">
                <input type="text" placeholder="Asset ara..." className="search-box" />
                <Link to="/dashboard" className="btn btn-primary">Panelim</Link>
            </div>
        </header>

        {/* ANA İÇERİK */}
        <main className="create-asset-container container">
            <div className="create-game-card">
                <h2>Yeni Asset'i Yükle</h2>
                <p className="subtitle">Oyunlarınızda kullanılabilecek görsel, ses veya kod varlığını paylaşın.</p>

                <form>
                    
                    {/* BÖLÜM 1 */}
                    <section className="form-section">
                        <h3>1. Asset Tanıtımı</h3>
                        <div className="form-group">
                            <label htmlFor="asset-title">Asset Adı <span className="required">*</span></label>
                            <input type="text" id="asset-title" name="asset-title" required placeholder="Asset'in kısa ve açıklayıcı adı" />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="short-description">Kısa Açıklama (Özet)</label>
                            <input type="text" id="short-description" name="short-description" maxLength="150" placeholder="Asset'in kullanım alanı özeti (max 150 karakter)" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Detaylı Açıklama</label>
                            <textarea id="description" name="description" rows="8" placeholder="Asset'in içeriği, lisansı ve kullanım talimatları"></textarea>
                        </div>
                    </section>

                    {/* BÖLÜM 2 */}
                    <section className="form-section">
                        <h3>2. Görseller ve Asset Dosyası</h3>
                        
                        <div className="form-group">
                            <label htmlFor="cover-image">Asset Önizleme Görseli <span className="required">*</span></label>
                            <div className="file-upload-box">
                                <input type="file" id="cover-image" name="cover-image" accept="image/*" required />
                                <span className="file-label"><i className="fas fa-upload"></i> Önizleme görselini seç (Asset'i gösteren bir resim)</span>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="asset-file">Asset Dosyasını Yükle <span className="required">*</span></label>
                            <div className="file-upload-box">
                                <input type="file" id="asset-file" name="asset-file" required />
                                <span className="file-label"><i className="fas fa-file-archive"></i> ZIP, PNG, FBX veya kod dosyalarını yükle</span>
                            </div>
                        </div>
                    </section>

                    {/* BÖLÜM 3 */}
                    <section className="form-section last-section">
                        <h3>3. Sınıflandırma ve Fiyatlandırma</h3>
                        
                        <div className="form-group">
                            <label htmlFor="asset-type">Asset Türü <span className="required">*</span></label>
                            <select id="asset-type" name="asset-type" required defaultValue="">
                                <option value="" disabled>Bir asset türü seçin</option>
                                <option value="2d_sprite">2D Sprite/Görsel</option>
                                <option value="3d_model">3D Model</option>
                                <option value="audio">Ses/Müzik</option>
                                <option value="code">Kod Parçacığı (Script)</option>
                                <option value="texture">Doku/Materyal</option>
                            </select>
                        </div>

                        <div className="form-group price-group">
                            <label htmlFor="price-type">Fiyatlandırma</label>
                            
                            {/* React State ile kontrol */}
                            <select 
                                id="price-type" 
                                name="price-type" 
                                onChange={(e) => setPriceType(e.target.value)}
                            >
                                <option value="free">Ücretsiz</option>
                                <option value="paid">Ücretli (Fiyat Belirt)</option>
                            </select>

                            {/* Sadece 'paid' seçiliyse bu inputu göster */}
                            {priceType === 'paid' && (
                                <input 
                                    type="number" 
                                    id="price-amount" 
                                    name="price-amount" 
                                    placeholder="0.00" 
                                    step="0.01" 
                                    min="0" 
                                    required 
                                />
                            )}
                        </div>
                    </section>
                    
                    <button type="submit" className="btn btn-secondary publish-btn"><i className="fas fa-box-open"></i> Asset'i Yayımla</button>
                </form>
            </div>
        </main>

        {/* FOOTER */}
        <footer className="footer">
            <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
            <div className="footer-links">
                <a href="#">Hakkımızda</a> |
                <a href="#">Geliştiriciler</a> |
                <a href="#">Destek</a>
            </div>
        </footer>
    </div>
  );
}

export default CreateAsset;