import React from 'react';
import { Link } from 'react-router-dom'; // Sayfa geçişleri için
import './App.css'; 

function Dashboard() {
  return (
    <div className="dashboard-body">
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

        <div className="dashboard-wrapper container">
            
            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="dashboard-sidebar">
                <div className="profile-info">
                    <img src="https://via.placeholder.com/60/e94560/e0e0e0?text=SG" alt="Profil Resmi" className="profile-avatar" />
                    <h4>Sheriff Games Studio</h4>
                    <p>Yayıncı Seviyesi: Elit</p>
                </div>
                
                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-item active">
                        <i className="fas fa-chart-line"></i> Genel Bakış
                    </Link>
                    <Link to="#" className="nav-item">
                        <i className="fas fa-gamepad"></i> Oyunlarım
                    </Link>
                    <Link to="/create-game" className="nav-item">
                        <i className="fas fa-plus-circle"></i> Yeni Oyun Ekle
                    </Link>
                    <Link to="#" className="nav-item">
                        <i className="fas fa-dollar-sign"></i> Finans/Ödemeler
                    </Link>
                    <Link to="#" className="nav-item">
                        <i className="fas fa-cog"></i> Ayarlar
                    </Link>
                </nav>
            </aside>

            {/* ANA İÇERİK */}
            <main className="dashboard-content">
                <h2>Genel Bakış</h2>

                {/* İSTATİSTİK KARTLARI */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <i className="fas fa-download stat-icon"></i>
                        <p className="stat-value">12,450</p>
                        <p className="stat-label">Toplam İndirme</p>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-users stat-icon"></i>
                        <p className="stat-value">4.7K</p>
                        <p className="stat-label">Aylık Aktif Kullanıcı</p>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-coins stat-icon"></i>
                        <p className="stat-value">$8,250</p>
                        <p className="stat-label">Bu Ayki Gelir</p>
                    </div>
                    <div className="stat-card accent-card">
                        <i className="fas fa-star stat-icon"></i>
                        <p className="stat-value">4.8 / 5</p>
                        <p className="stat-label">Ortalama Puan</p>
                    </div>
                </section>

                <section className="chart-panel panel">
                    <h3>Son 30 Günlük İndirme Grafiği</h3>
                    <div className="chart-placeholder">
                        <p>[Buraya Grafik Eklenecek - Örn: Çizgi Grafik]</p>
                    </div>
                </section>

                <section className="actions-and-notifications-grid">
                    <div className="quick-actions panel">
                        <h3>Hızlı Eylemler</h3>
                        <Link to="/create-game" className="action-btn btn btn-secondary"><i className="fas fa-plus"></i> Yeni Oyun Oluştur</Link>
                        <Link to="#" className="action-btn btn btn-secondary"><i className="fas fa-bullhorn"></i> Duyuru Yayınla</Link>
                        <Link to="#" className="action-btn btn btn-secondary"><i className="fas fa-money-check-alt"></i> Ödeme Talep Et</Link>
                    </div>

                    <div className="notifications-panel panel">
                        <h3>Son Bildirimler</h3>
                        <ul className="notification-list">
                            <li><i className="fas fa-bell"></i> "Uzay Macerası X" 1000 indirmeyi geçti!</li>
                            <li><i className="fas fa-comment"></i> 3 yeni yorum bekliyor.</li>
                            <li className="warning"><i className="fas fa-exclamation-triangle"></i> Ödeme ayarlarınızı güncelleyin.</li>
                        </ul>
                    </div>
                </section>
            </main>
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

export default Dashboard;