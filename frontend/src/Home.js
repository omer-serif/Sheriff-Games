import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import GameCard from './GameCard';
import './App.css';

function Home() {
  const [sidebarAcik, setSidebarAcik] = useState(false);
  const [oyunlar, setOyunlar] = useState([]); 

  // --- SAYFALAMA (PAGINATION) AYARLARI ---
  const [currentPage, setCurrentPage] = useState(1); // Başlangıç sayfası: 1
  const itemsPerPage = 12; // Sayfa başına kaç oyun gözükecek?

  // Veriyi Çek
  useEffect(() => {
    fetch('http://localhost:3001/games')
      .then(res => res.json())
      .then(data => {
        setOyunlar(data);
      })
      .catch(err => console.log("Hata:", err));
  }, []);

  // --- MATEMATİKSEL HESAPLAMALAR ---
  // Bu sayfada gösterilecek son oyunun index'i (Örn: 1. sayfa için 1 * 12 = 12)
  const indexOfLastItem = currentPage * itemsPerPage;
  // Bu sayfada gösterilecek ilk oyunun index'i (Örn: 12 - 12 = 0)
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Tüm oyunlar listesinden sadece o aralığı kesip alıyoruz
  const currentGames = oyunlar.slice(indexOfFirstItem, indexOfLastItem);

  // Toplam sayfa sayısını bul (Örn: 15 oyun varsa 15/12 = 1.25 -> Yukarı yuvarla -> 2 Sayfa)
  const totalPages = Math.ceil(oyunlar.length / itemsPerPage);

  // Sayfa değiştirme fonksiyonu
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const toggleSidebar = () => {
    setSidebarAcik(!sidebarAcik);
  };

  return (
    <div className={`home-page ${sidebarAcik ? 'sidebar-open' : ''}`}>
      
      <Navbar />

      <aside id="filter-sidebar" className={`sidebar ${sidebarAcik ? 'open' : ''}`}>
        <button className="sidebar-toggle-btn close-btn" onClick={toggleSidebar}>
          <i className="fas fa-times"></i> Kapat
        </button>
        <h3>Filtreler</h3>
        <div className="filter-group">
          <h4>Türler</h4>
          <label><input type="checkbox" /> Aksiyon</label>
          <label><input type="checkbox" /> RPG</label>
        </div>
        <button className="btn btn-secondary apply-btn">Filtrele</button>
      </aside>

      <button className="sidebar-toggle-btn open-btn" onClick={toggleSidebar}>
         <i className="fas fa-filter"></i> Filtreler
      </button>

      <main className="content container">
        <section className="game-list">
          <h2>Mağaza</h2>
          <div className="games-grid">
            
            {/* DİKKAT: Artık 'oyunlar' yerine 'currentGames' map ediyoruz */}
            {currentGames.map((veri) => (
              <Link to={`/game/${veri.gamesID}`} key={veri.gamesID} style={{textDecoration:'none', color:'inherit'}}>
                  <GameCard oyun={{
                      baslik: veri.gameName,
                      fiyatEtiketi: veri.gamePrice === 0 ? "Ücretsiz" : `$${veri.gamePrice}`,
                      tur: "Genel", 
                      resim: "images/fetihPP.png" 
                  }} />
              </Link>
            ))}

          </div>

          {/* --- SAYFALAMA BUTONLARI --- */}
          {totalPages > 1 && ( // Eğer sadece 1 sayfa varsa butonları gösterme
            <div className="pagination-container">
                {/* 1'den totalPages'e kadar sayıları oluşturup buton yapıyoruz */}
                {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                        key={i + 1} 
                        onClick={() => paginate(i + 1)}
                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
          )}

        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}

export default Home;