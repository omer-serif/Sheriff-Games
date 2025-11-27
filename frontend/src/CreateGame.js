import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 

function CreateGame() {
  // Fiyat tipini kontrol etmek için State (Başlangıçta 'free')
  const [priceType, setPriceType] = useState('free');

  // Select değiştiğinde çalışacak fonksiyon
  const handlePriceChange = (e) => {
    setPriceType(e.target.value);
  };

  return (
    <div className="create-game-body">
        {/* NAVBAR */}
        {/* GÜNCELLENMİŞ NAVBAR */}
      <header className="navbar">
              <div className="logo">
                <h1>SHERIFF GAMES</h1>
              </div>
              <nav className="nav-links">
                {/* Ana Sayfa */}
                <Link to="/">Oyunlar</Link> 
                
                {/* Assetler Sayfası */}
                <Link to="/assets">Assetler</Link>
                
                {/* Oyun Ekleme Sayfası */}
                <Link to="/create-game">Oyun Yükle</Link>
                
                {/* Asset Ekleme Sayfası (Yeni ekledik) */}
                <Link to="/create-asset">Asset Yükle</Link>
              </nav>
              
              <div className="user-actions">
                <input type="text" placeholder="Oyun ara..." className="search-box" />
                
                {/* Giriş Yap yerine Panelim butonunu gösteriyoruz */}
                <Link to="/dashboard" className="btn btn-primary">Panelim</Link>
                {/* Eğer çıkış yapmış gibi görünmek istersen aşağıdakini kullan: */}
                {/* <Link to="/login" className="btn btn-primary">Giriş Yap</Link> */}
              </div>
            </header>

        {/* ANA FORM ALANI */}
        <main className="create-game-container container">
            <div className="create-game-card">
                <h2>Yeni Oyununu Yayımla</h2>
                <p className="subtitle">Oyununuz hakkında gerekli bilgileri doldurun ve Sheriff Games topluluğuyla paylaşın.</p>

                <form>
                    
                    {/* BÖLÜM 1 */}
                    <section className="form-section">
                        <h3>1. Temel Tanıtım</h3>
                        <div className="form-group">
                            <label htmlFor="game-title">Oyun Adı <span className="required">*</span></label>
                            <input type="text" id="game-title" name="game-title" required placeholder="Oyununuzun benzersiz adı" />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="short-description">Kısa Açıklama (Tanıtım Yazısı)</label>
                            <input type="text" id="short-description" name="short-description" maxLength="150" placeholder="Oyunun tek cümlelik özeti (max 150 karakter)" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Detaylı Açıklama</label>
                            <textarea id="description" name="description" rows="8" placeholder="Oyunun hikayesi, oynanışı ve özellikleri"></textarea>
                        </div>
                    </section>

                    {/* BÖLÜM 2 */}
                    <section className="form-section">
                        <h3>2. Görseller ve Dosyalar</h3>
                        
                        <div className="form-group">
                            <label htmlFor="cover-image">Oyun Kapak Görseli (Banner) <span className="required">*</span></label>
                            <div className="file-upload-box">
                                <input type="file" id="cover-image" name="cover-image" accept="image/*" required />
                                <span className="file-label"><i className="fas fa-upload"></i> Kapak görselini seç (Önerilen: 1280x720)</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="screenshots">Ekran Görüntüleri/Videolar</label>
                            <div className="file-upload-box multiple">
                                 <input type="file" id="screenshots" name="screenshots[]" accept="image/*,video/*" multiple />
                                 <span className="file-label"><i className="fas fa-images"></i> Birden fazla görsel/video yükle</span>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="game-file">Oyun Dosyası Yükle <span className="required">*</span></label>
                            <div className="file-upload-box">
                                <input type="file" id="game-file" name="game-file" required />
                                <span className="file-label"><i className="fas fa-gamepad"></i> ZIP, EXE, veya WEB dosyalarını yükle</span>
                            </div>
                        </div>
                    </section>

                    {/* BÖLÜM 3 */}
                    <section className="form-section last-section">
                        <h3>3. Sınıflandırma ve Fiyatlandırma</h3>
                        
                        <div className="form-group">
                            <label htmlFor="category">Kategori/Tür <span className="required">*</span></label>
                            <select id="category" name="category" required defaultValue="">
                                <option value="" disabled>Bir kategori seçin</option>
                                <option value="action">Aksiyon</option>
                                <option value="rpg">RPG</option>
                                <option value="platformer">Platformer</option>
                                <option value="strategy">Strateji</option>
                                <option value="simulation">Simülasyon</option>
                                <option value="puzzle">Bulmaca</option>
                            </select>
                        </div>

                        <div className="form-group price-group">
                            <label htmlFor="price-type">Fiyatlandırma</label>
                            
                            {/* React State ile kontrol edilen Select */}
                            <select id="price-type" name="price-type" onChange={handlePriceChange}>
                                <option value="free">Ücretsiz</option>
                                <option value="paid">Ücretli (Fiyat Belirt)</option>
                            </select>

                            {/* Eğer priceType 'paid' ise inputu göster, değilse gizle */}
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
                        
                        <div className="form-group">
                            <label>
                                <input type="checkbox" id="early-access" name="early-access" style={{width: 'auto', marginRight: '10px'}} /> 
                                Erken Erişim (Early Access) olarak işaretle
                            </label>
                        </div>

                    </section>
                    
                    <button type="submit" className="btn btn-secondary publish-btn"><i className="fas fa-check"></i> Oyunu Yayımla</button>
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

export default CreateGame;