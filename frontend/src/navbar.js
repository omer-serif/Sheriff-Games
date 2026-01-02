import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Sayfa her yüklendiğinde hafızaya bak: Kim var?
  useEffect(() => {
    const kayitliKullanici = localStorage.getItem("currentUser");
    if (kayitliKullanici) {
      setUser(JSON.parse(kayitliKullanici));
    }
  }, []);

  // Çıkış Yapma İşlemi
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="navbar">
        <div className="logo">
          <h1>SHERIFF GAMES</h1>
        </div>
        
        <nav className="nav-links">
          {/* Herkesin görebileceği sayfalar */}
          <Link to="/">Oyunlar</Link> 
          <Link to="/assets">Assetler</Link>
          
          {/* SADECE GİRİŞ YAPANLARIN GÖRECEĞİ BUTONLAR */}
          {user && (
            <>
                <Link to="/create-game">Oyun Yükle</Link>
                <Link to="/create-asset">Asset Yükle</Link>
            </>
          )}
        </nav>
        
        <div className="user-actions">
          <input type="text" placeholder="Oyun ara..." className="search-box" />
          
          {/* Kullanıcı Durumuna Göre Sağ Taraf */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    <i className="fas fa-user"></i> {user.userName}
                </span>
                <Link to="/dashboard" className="btn btn-secondary" style={{fontSize: '0.8rem'}}>Panelim</Link>
                <button 
                    onClick={handleLogout} 
                    className="btn btn-primary" 
                    style={{ backgroundColor: '#e94560', border: 'none' }}
                >
                    Çıkış
                </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
          )}
          
        </div>
      </header>
  );
}

export default Navbar;