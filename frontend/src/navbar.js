import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Sayfa yüklendiğinde hafızayı kontrol et
  useEffect(() => {
    const kayitliKullanici = localStorage.getItem("currentUser");
    if (kayitliKullanici) {
      setUser(JSON.parse(kayitliKullanici));
    }
  }, []);

  // Çıkış Yapma Fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("currentUser"); // Hafızayı temizle
    setUser(null); // State'i boşalt
    navigate('/login'); // Giriş sayfasına at
  };

  return (
    <header className="navbar">
        <div className="logo">
          <h1>SHERIFF GAMES</h1>
        </div>
        
        <nav className="nav-links">
          <Link to="/">Keşfet</Link> 
          <Link to="/assets">Assetler</Link>
          <Link to="/create-game">Oluştur</Link>
          <Link to="/create-asset">Asset Yükle</Link>
        </nav>
        
        <div className="user-actions">
          <input type="text" placeholder="Oyun ara..." className="search-box" />
          
          {/* SİHİRLİ KISIM BURASI */}
          {user ? (
            // EĞER KULLANICI VARSA: İsim ve Çıkış Butonu Göster
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    <i className="fas fa-user"></i> {user.userName}
                </span>
                <Link to="/dashboard" className="btn btn-secondary" style={{fontSize: '0.8rem'}}>Panel</Link>
                <button 
                    onClick={handleLogout} 
                    className="btn btn-primary" 
                    style={{ backgroundColor: '#e94560', border: 'none' }}
                >
                    Çıkış
                </button>
            </div>
          ) : (
            // EĞER KULLANICI YOKSA: Giriş Yap Butonu Göster
            <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
          )}
          
        </div>
      </header>
  );
}

export default Navbar;