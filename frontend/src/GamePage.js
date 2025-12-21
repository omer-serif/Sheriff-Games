import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams URL'deki ID'yi okur
import Navbar from './navbar'; // Senin Akıllı Navbar'ın
import './App.css'; 

function GamePage() {
  const { id } = useParams(); // URL'den ID'yi al (Örn: /game/5 ise id = 5)
  const [game, setGame] = useState(null); // Oyun verisini tutacak
  const [loading, setLoading] = useState(true); // Yükleniyor durumu

  // SLIDER AYARLARI
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Veritabanından OYUNU ÇEK
  useEffect(() => {
    fetch(`http://localhost:3001/games/${id}`)
      .then(res => res.json())
      .then(data => {
        setGame(data);
        setLoading(false);
      })
      .catch(err => console.error("Hata:", err));
  }, [id]);


  // Slider İçin Resim Listesi Hazırla
  // (Eğer veritabanında resim varsa onu kullan, yoksa placeholder kullan)
  const images = game && game.gameImage 
    ? [`http://localhost:3001/uploads/${game.gameImage}`, "https://via.placeholder.com/800x450?text=Gorsel+2", "https://via.placeholder.com/800x450?text=Gorsel+3"]
    : ["https://via.placeholder.com/800x450?text=Resim+Yok", "https://via.placeholder.com/800x450?text=Gorsel+2"];

  const moveSlider = (direction) => {
    let newSlide = currentSlide + direction;
    if (newSlide < 0) newSlide = images.length - 1;
    else if (newSlide >= images.length) newSlide = 0;
    setCurrentSlide(newSlide);
  };

  // Eğer veri henüz gelmediyse "Yükleniyor" göster
  if (loading) {
      return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Oyun bilgileri yükleniyor...</div>;
  }
  
  // Eğer oyun bulunamadıysa (ID yanlışsa)
  if (!game) {
      return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Oyun bulunamadı.</div>;
  }

  return (
    <div className="game-detail-body">
        
        {/* AKILLI NAVBAR (Giriş yaptıysan ismin görünür) */}
        <Navbar />

        <main className="game-detail-container container">
            
            <header className="game-header">
                {/* VERİTABANINDAN GELEN İSİM */}
                <h1>{game.gameName}</h1>
                <p className="tagline">{game.gameDescription ? game.gameDescription.substring(0, 100) + "..." : "Harika bir oyun."}</p>
            </header>

            {/* REACT SLIDER */}
            <section className="game-gallery">
                <div className="slider-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div 
                        className="slider-track" 
                        style={{ 
                            display: 'flex', 
                            transition: 'transform 0.5s ease-in-out',
                            transform: `translateX(-${currentSlide * 100}%)`
                        }}
                    >
                        {images.map((imgSrc, index) => (
                            <div className="slide" key={index} style={{ minWidth: '100%' }}>
                                <img src={imgSrc} alt={`Oyun Görseli ${index + 1}`} style={{ width: '100%', height:'400px', objectFit:'cover', display: 'block' }} />
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
                        {/* VERİTABANINDAN GELEN AÇIKLAMA */}
                        <p>{game.gameDescription || "Bu oyun için detaylı açıklama girilmemiş."}</p>
                    </div>

                    <div className="game-info-box categories">
                        <h3>Kategoriler</h3>
                        {/* Şimdilik sabit, ileride veritabanından çekeriz */}
                        <span className="category-tag">Genel</span>
                        <span className="category-tag">Bağımsız Yapım</span>
                    </div>
                </div>

                <aside className="game-purchase-sidebar">
                    <div className="purchase-box">
                        <span className="price-label">Fiyat:</span>
                        
                        {/* VERİTABANINDAN GELEN FİYAT */}
                        <span className="price-amount">
                            {game.gamePrice === 0 ? "ÜCRETSİZ" : `$${game.gamePrice}`}
                        </span>
                        
                        <Link to="#" className="btn btn-primary buy-btn"><i className="fas fa-shopping-cart"></i> SATIN AL / İNDİR</Link>
                        
                        <div className="details-summary">
                            <p><strong>Yayıncı:</strong> Sheriff Games Topluluğu</p>
                            <p><strong>Platform:</strong> PC (Windows)</p>
                        </div>
                    </div>
                </aside>
            </section>

            {/* YORUM KISMI (Sabit kalabilir şimdilik) */}
            <section className="comments-section">
                <h2>Kullanıcı Yorumları</h2>
                <div className="comment-form-box">
                    <form className="comment-form" onSubmit={(e) => e.preventDefault()}>
                        <textarea name="comment-text" placeholder="Yorum yaz..." rows="4" className="comment-textarea"></textarea>
                        <button className="btn btn-primary comment-submit-btn">GÖNDER</button>
                    </form>
                </div>
            </section>

        </main>

        <footer className="footer">
            <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
        </footer>
    </div>
  );
}

export default GamePage;