import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 
import GameCard from './GameCard'; // Kart tasarımını buradan çekiyoruz (Aynı tasarım)

function AssetPage() {
  // Sidebar'ın açık/kapalı durumu
  const [sidebarAcik, setSidebarAcik] = useState(false);

  // GEÇİCİ ASSET VERİLERİ (Veritabanı bağlanana kadar)
  const assetler = [
    { id: 1, baslik: "Kayıp Orman Seti", tur: "2D Environment", fiyatEtiketi: "Ücretsiz", resim: "https://via.placeholder.com/300x180?text=Asset+1" },
    { id: 2, baslik: "Siber UI Paketi", tur: "UI/GUI", fiyatEtiketi: "$4.99", resim: "https://via.placeholder.com/300x180?text=Asset+2" },
    { id: 3, baslik: "Piksel Karakterler", tur: "2D Character", fiyatEtiketi: "Erken Erişim", resim: "https://via.placeholder.com/300x180?text=Asset+3" },
    { id: 4, baslik: "RPG İkon Seti", tur: "Icons", fiyatEtiketi: "Demo", resim: "https://via.placeholder.com/300x180?text=Asset+4" },
    { id: 5, baslik: "Robot Ses Efektleri", tur: "Audio", fiyatEtiketi: "Ücretsiz", resim: "https://via.placeholder.com/300x180?text=Asset+5" },
    { id: 6, baslik: "Dungeon 3D Model", tur: "3D Model", fiyatEtiketi: "$9.99", resim: "https://via.placeholder.com/300x180?text=Asset+6" },
  ];

  return (
    <div className={`assets-page ${sidebarAcik ? 'sidebar-open' : ''}`}>
        
        {/* NAVBAR */}
        <header className="navbar">
            <div className="logo">
                <h1>SHERIFF GAMES</h1>
            </div>
            <nav className="nav-links">
                <Link to="/">Keşfet</Link>
                <Link to="#">Oyunlar</Link>
                <Link to="/assets">Assetler</Link> {/* Linki düzelttik */}
                <Link to="/create-game">Oluştur</Link>
            </nav>
            <div className="user-actions">
                <input type="text" placeholder="Asset ara..." className="search-box" />
                <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
            </div>
        </header>

        {/* SIDEBAR (Filtreler) */}
        <aside id="filter-sidebar" className={`sidebar ${sidebarAcik ? 'open' : ''}`}>
            <button 
                id="close-sidebar-btn" 
                className="sidebar-toggle-btn close-btn"
                onClick={() => setSidebarAcik(false)}
            >
                <i className="fas fa-times"></i> Kapat
            </button>
            
            <h3>Filtreler</h3>

            <div className="filter-group">
                <h4>Türler</h4>
                <label><input type="checkbox" /> 2D</label>
                <label><input type="checkbox" /> 3D</label>
                <label><input type="checkbox" /> UI/GUI</label>
                <label><input type="checkbox" /> Background</label>
                <label><input type="checkbox" /> 2D Character</label>
            </div>

            <div className="filter-group">
                <h4>Fiyat</h4>
                <label><input type="checkbox" /> Ücretsiz</label>
                <label><input type="checkbox" /> Ücretli</label>
            </div>
            
            <button className="btn btn-secondary apply-btn">Filtrele</button>
        </aside>

        {/* SIDEBAR AÇMA BUTONU */}
        <button 
            id="open-sidebar-btn" 
            className="sidebar-toggle-btn open-btn"
            onClick={() => setSidebarAcik(true)}
        >
             <i className="fas fa-filter"></i> Filtreler
        </button>

        {/* ANA İÇERİK */}
        <main className="content container">
            
            <section className="game-list">
                <h2>Tüm Assetler</h2>
                <div className="games-grid">
                    {/* GameCard bileşenini Assetler için tekrar kullanıyoruz */}
                    {assetler.map((asset) => (
                        <GameCard key={asset.id} oyun={asset} />
                    ))}
                </div>
            </section>

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

export default AssetPage;