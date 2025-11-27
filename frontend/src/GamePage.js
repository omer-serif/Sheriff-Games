import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 

function GamePage() {
  // SLIDER İÇİN STATE VE MANTIK
  const [currentSlide, setCurrentSlide] = useState(0);

  // Gösterilecek resimlerin listesi (Bunu ileride veritabanından çekeceğiz)
  const images = [
      "images/fetihGörsel7.png",
      "images/fetihGörsel8.png",
      "images/fetihGörsel9.png"
  ];

  const moveSlider = (direction) => {
    let newSlide = currentSlide + direction;

    if (newSlide < 0) {
        newSlide = images.length - 1; // Başa dön
    } else if (newSlide >= images.length) {
        newSlide = 0; // Sona dön
    }
    setCurrentSlide(newSlide);
  };

  return (
    <div className="game-detail-body">
        {/* NAVBAR */}
        <header className="navbar">
            <div className="logo">
                <h1>SHERIFF GAMES</h1>
            </div>
            <nav className="nav-links">
                <Link to="/">Keşfet</Link>
                <Link to="#">Oyunlar</Link>
                <Link to="/create-game">Oluştur</Link>
            </nav>
            <div className="user-actions">
                <input type="text" placeholder="Oyun ara..." className="search-box" />
                <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
            </div>
        </header>

        <main className="game-detail-container container">
            
            <header className="game-header">
                <h1>Uzay Macerası X</h1>
                <p className="tagline">Galaksiler arası keşif, hayatta kalma ve gizem dolu bir macera.</p>
            </header>

            {/* REACT SLIDER */}
            <section className="game-gallery">
                <div className="slider-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div 
                        className="slider-track" 
                        style={{ 
                            display: 'flex', 
                            transition: 'transform 0.5s ease-in-out',
                            transform: `translateX(-${currentSlide * 100}%)` // React ile kaydırma işlemi
                        }}
                    >
                        {images.map((imgSrc, index) => (
                            <div className="slide" key={index} style={{ minWidth: '100%' }}>
                                <img src={imgSrc} alt={`Oyun Ekran Görüntüsü ${index + 1}`} style={{ width: '100%', display: 'block' }} />
                            </div>
                        ))}
                    </div>
                    
                    <button className="slider-btn prev-btn" onClick={() => moveSlider(-1)}><i className="fas fa-chevron-left"></i></button>
                    <button className="slider-btn next-btn" onClick={() => moveSlider(1)}><i className="fas fa-chevron-right"></i></button>
                </div>
            </section>

            <section className="game-body-layout">
                
                <div className="game-description-column">
                    <div className="game-info-box">
                        <h3>Oyun Hakkında</h3>
                        <p>Uzay Macerası X, oyuncuları bilinmeyen bir galaksinin derinliklerine sürükleyen, yoğun bir hayatta kalma ve keşif oyunudur. İnsanlığın kayıp kolonisini bulma göreviyle yola çıkın, ancak sizi bekleyen tehlikeler ve kadim sırlar karşısında dikkatli olun.</p>
                    </div>

                    <div className="game-info-box categories">
                        <h3>Kategoriler ve Etiketler</h3>
                        <span className="category-tag">Aksiyon</span>
                        <span className="category-tag">RPG</span>
                        <span className="category-tag">Keşif</span>
                        <span className="category-tag">Hayatta Kalma</span>
                    </div>
                </div>

                <aside className="game-purchase-sidebar">
                    <div className="purchase-box">
                        <span className="price-label">Fiyat:</span>
                        <span className="price-amount">$9.99</span>
                        
                        <Link to="#" className="btn btn-primary buy-btn"><i className="fas fa-shopping-cart"></i> HEMEN SATIN AL</Link>
                        <Link to="#" className="btn btn-secondary download-btn"><i className="fas fa-download"></i> DEMO İNDİR</Link>
                        
                        <div className="details-summary">
                            <p><strong>Yayıncı:</strong> Sheriff Games Studio</p>
                            <p><strong>Yayın Tarihi:</strong> 15 Ekim 2025</p>
                            <p><strong>Platform:</strong> Windows, Mac</p>
                        </div>
                    </div>
                </aside>
            </section>

            <section className="comments-section">
                <h2>Kullanıcı Yorumları (56)</h2>

                <div className="comment-form-box">
                    <form className="comment-form" onSubmit={(e) => e.preventDefault()}>
                        <textarea name="comment-text" placeholder="Bu oyun hakkında ne düşünüyorsunuz? Yorumunuzu buraya yazın..." rows="4" required className="comment-textarea"></textarea>
                        <button type="submit" className="btn btn-primary comment-submit-btn">YORUMU GÖNDER</button>
                    </form>
                </div>
                
                <div className="comments-list">
                    <div className="comment-item">
                        <p className="comment-meta"><strong>OyuncuGalaksi</strong> <span className="time">5 saat önce</span></p>
                        <p className="comment-text">Oyunun atmosferi harika, keşif hissi mükemmel verilmiş. Fiyatını kesinlikle hak ediyor!</p>
                    </div>

                    <div className="comment-item">
                        <p className="comment-meta"><strong>CoderKedi</strong> <span className="time">1 gün önce</span></p>
                        <p className="comment-text">Oynanış mekanikleri biraz karmaşık ama alışınca bırakılmıyor. Devam güncellemelerini sabırsızlıkla bekliyorum.</p>
                    </div>
                </div>
            </section>

        </main>

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

export default GamePage;