import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; 

function AssetPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Asset detayını çek
    fetch(`http://localhost:3001/assets/${id}`)
      .then(res => res.json())
      .then(data => {
        setAsset(data);
        setLoading(false);
      })
      .catch(err => console.error("Hata:", err));
  }, [id]);

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;
  if (!asset) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Asset bulunamadı.</div>;

  return (
    <div className="game-detail-body">
        <Navbar />

        <main className="game-detail-container container">
            
            <header className="game-header">
                <h1>{asset.assetName}</h1>
                <p className="tagline">{asset.typeName} Kategorisinde Profesyonel İçerik</p>
            </header>

            <section className="game-gallery">
                 {/* Tek bir kapak görseli koyuyoruz şimdilik */}
                 <div className="slider-wrapper" style={{display:'flex', justifyContent:'center'}}>
                    <img 
                        src="https://via.placeholder.com/800x400?text=Asset+Detay+Gorseli" 
                        alt={asset.assetName} 
                        style={{width:'100%', maxWidth:'800px', borderRadius:'10px'}}
                    />
                 </div>
            </section>

            <section className="game-body-layout">
                <div className="game-description-column">
                    <div className="game-info-box">
                        <h3>Asset Hakkında</h3>
                        <p>{asset.assetDescription || "Açıklama bulunmuyor."}</p>
                    </div>
                    <div className="game-info-box categories">
                        <h3>Detaylar</h3>
                        <span className="category-tag">{asset.typeName}</span>
                        <span className="category-tag">Lisanslı</span>
                    </div>
                </div>

                <aside className="game-purchase-sidebar">
                    <div className="purchase-box">
                        <span className="price-label">Fiyat:</span>
                        <span className="price-amount">
                            {asset.assetPrice === 0 ? "ÜCRETSİZ" : `$${asset.assetPrice}`}
                        </span>
                        
                        <Link to="#" className="btn btn-primary buy-btn"><i className="fas fa-shopping-cart"></i> SATIN AL</Link>
                        
                        <div className="details-summary">
                            <p><strong>Yayıncı:</strong> Topluluk Geliştiricisi</p>
                            <p><strong>Format:</strong> .unitypackage, .fbx, .png</p>
                        </div>
                    </div>
                </aside>
            </section>
        </main>

        <footer className="footer">
            <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
        </footer>
    </div>
  );
}

export default AssetPage;