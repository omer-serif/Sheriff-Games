import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import GameCard from './GameCard';
import './App.css'; 

function Assets() {
  const [sidebarAcik, setSidebarAcik] = useState(false);
  const [assetler, setAssetler] = useState([]); // Tüm veriler

  // --- SAYFALAMA AYARLARI ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Sayfa başı 12 asset

  // 1. Assetleri Çek
  useEffect(() => {
    fetch('http://localhost:3001/assets')
      .then(res => res.json())
      .then(data => {
        setAssetler(data);
      })
      .catch(err => console.log("Hata:", err));
  }, []);

  // --- MATEMATİKSEL HESAPLAMALAR ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Ekrana basılacak olan dilim (Sadece 12 tanesi)
  const currentAssets = assetler.slice(indexOfFirstItem, indexOfLastItem);

  // Toplam sayfa sayısı
  const totalPages = Math.ceil(assetler.length / itemsPerPage);

  // Sayfa değiştirme fonksiyonu
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className={`assets-page ${sidebarAcik ? 'sidebar-open' : ''}`}>
        
        <Navbar />

        {/* SIDEBAR */}
        <aside id="filter-sidebar" className={`sidebar ${sidebarAcik ? 'open' : ''}`}>
            <button className="sidebar-toggle-btn close-btn" onClick={() => setSidebarAcik(false)}>
                <i className="fas fa-times"></i> Kapat
            </button>
            <h3>Filtreler</h3>
            <div className="filter-group">
                <h4>Türler</h4>
                <label><input type="checkbox" /> 2D</label>
                <label><input type="checkbox" /> 3D</label>
            </div>
            <button className="btn btn-secondary apply-btn">Filtrele</button>
        </aside>

        <button id="open-sidebar-btn" className="sidebar-toggle-btn open-btn" onClick={() => setSidebarAcik(true)}>
             <i className="fas fa-filter"></i> Filtreler
        </button>

        {/* ANA İÇERİK */}
        <main className="content container">
            <section className="game-list">
                <h2>Tüm Assetler</h2>
                <div className="games-grid">
                    
                    {/* DİKKAT: Artık 'assetler' değil 'currentAssets' dönüyoruz */}
                    {currentAssets.map((asset) => (
                        <Link to={`/asset/${asset.assetID}`} key={asset.assetID} style={{textDecoration:'none', color:'inherit'}}>
                            <GameCard oyun={{
                                baslik: asset.assetName,
                                tur: asset.typeName || "Asset", 
                                fiyatEtiketi: asset.assetPrice === 0 ? "Ücretsiz" : `$${asset.assetPrice}`,
                                resim: "https://via.placeholder.com/300x180?text=Asset+Gorseli"
                            }} />
                        </Link>
                    ))}

                </div>

                {/* --- SAYFALAMA BUTONLARI --- */}
                {totalPages > 1 && (
                    <div className="pagination-container">
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

export default Assets;