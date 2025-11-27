import React, { useState } from 'react';
import './App.css'; // CSS dosyamızı çağırdık
import GameCard from './GameCard'; // Az önce oluşturduğumuz kart bileşeni

function Home() {
  // Sidebar'ın açık olup olmadığını kontrol eden değişken
  const [sidebarAcik, setSidebarAcik] = useState(false);

  // GEÇİCİ VERİTABANI (Daha sonra burayı SQL'den çekeceğiz)
  const oyunlar = [
    { id: 1, baslik: "Kayıp Orman", tur: "Platformer", fiyatEtiketi: "Ücretsiz", resim: "images/fetihPP.png" },
    { id: 2, baslik: "Siber Dedektif", tur: "Gizem", fiyatEtiketi: "$4.99", resim: "images/fetihPP.png" },
    { id: 3, baslik: "Piksel Savaşları", tur: "Aksiyon", fiyatEtiketi: "Erken Erişim", resim: "images/fetihPP.png" },
    { id: 4, baslik: "Rüya Dokumacı", tur: "Bulmaca", fiyatEtiketi: "Demo", resim: "images/fetihPP.png" },
    { id: 5, baslik: "Robot Yarışı", tur: "Yarış", fiyatEtiketi: "Ücretsiz", resim: "images/fetihPP.png" },
    { id: 6, baslik: "Vampir Avı", tur: "RPG", fiyatEtiketi: "$9.99", resim: "images/fetihPP.png" },
  ];

  // Sidebar açma/kapama fonksiyonu
  const toggleSidebar = () => {
    setSidebarAcik(!sidebarAcik);
  };

  return (
    <div className={`App ${sidebarAcik ? 'sidebar-open' : ''}`}>
      
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <h1>SHERIFF GAMES</h1>
        </div>
        <nav className="nav-links">
          <a href="#">Keşfet</a>
          <a href="#">Oyunlar</a>
          <a href="#">Oluştur</a>
          <a href="#">Topluluk</a>
        </nav>
        <div className="user-actions">
          <input type="text" placeholder="Oyun ara..." className="search-box" />
          <a href="/login" className="btn btn-primary">Giriş Yap</a>
        </div>
      </header>

      {/* SIDEBAR (Filtreleme) */}
      <aside id="filter-sidebar" className={`sidebar ${sidebarAcik ? 'open' : ''}`}>
        <button id="close-sidebar-btn" className="sidebar-toggle-btn close-btn" onClick={toggleSidebar}>
          <i className="fas fa-times"></i> Kapat
        </button>
        
        <h3>Filtreler</h3>

        <div className="filter-group">
          <h4>Türler</h4>
          <label><input type="checkbox" /> Aksiyon</label>
          <label><input type="checkbox" /> RPG</label>
          <label><input type="checkbox" /> Platformer</label>
          <label><input type="checkbox" /> Bulmaca</label>
          <label><input type="checkbox" /> Strateji</label>
        </div>

        <div className="filter-group">
          <h4>Fiyat</h4>
          <label><input type="checkbox" /> Ücretsiz</label>
          <label><input type="checkbox" /> Ücretli</label>
          <label><input type="checkbox" /> İndirimli</label>
        </div>

        <button className="btn btn-secondary apply-btn">Filtrele</button>
      </aside>

      {/* SIDEBAR AÇMA BUTONU */}
      <button id="open-sidebar-btn" className="sidebar-toggle-btn open-btn" onClick={toggleSidebar}>
         <i className="fas fa-filter"></i> Filtreler
      </button>

      {/* ANA İÇERİK */}
      <main className="content container">
        
        <section className="game-list">
          <h2>Popüler Bağımsız Oyunlar</h2>
          <div className="games-grid">
            {/* Burada tek tek div yazmak yerine döngü (map) kullanıyoruz */}
            {oyunlar.map((oyun) => (
              <GameCard key={oyun.id} oyun={oyun} />
            ))}
          </div>
        </section>

      </main>

      {/* PAGINATION */}
      <div className="pagination-container container">
        <div className="pagination">
          <a href="#" className="page-link disabled"><i className="fas fa-chevron-left"></i> Önceki</a>
          <a href="#" className="page-link active">1</a>
          <a href="#" className="page-link">2</a>
          <a href="#" className="page-link">3</a>
          <span className="page-ellipsis">...</span>
          <a href="#" className="page-link">10</a>
          <a href="#" className="page-link">Sonraki <i className="fas fa-chevron-right"></i></a>
        </div>
      </div>

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

export default Home;