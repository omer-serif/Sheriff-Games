import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import GameCard from './GameCard';
import './App.css'; 

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22150%22%20viewBox%3D%220%200%20300%20150%22%3E%3Crect%20fill%3D%22%2322223b%22%20width%3D%22300%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%2300bcd4%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EAsset%20Gorseli%3C%2Ftext%3E%3C%2Fsvg%3E";

function Assets() {
  const [sidebarAcik, setSidebarAcik] = useState(false);
  const [assetler, setAssetler] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Filtreler
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All'); 
  const [selectedPrice, setSelectedPrice] = useState('all');

  const [availableTypes, setAvailableTypes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 

  // Asset Tiplerini Çek (Sidebar için)
  useEffect(() => {
    fetch('http://localhost:3001/asset-types')
      .then(res => res.json())
      .then(data => setAvailableTypes(data))
      .catch(err => console.error(err));
  }, []);

  const fetchAssets = (isReset = false) => {
    setLoading(true);
    
    const typeQuery = isReset ? 'All' : selectedType;
    const priceQuery = isReset ? 'all' : selectedPrice;
    const searchQuery = isReset ? '' : searchTerm;

    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (typeQuery !== 'All') params.append('type', typeQuery);
    if (priceQuery !== 'all') params.append('priceType', priceQuery);

    fetch(`http://localhost:3001/assets?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAssetler(data);
        else setAssetler([]);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch(err => {
        setAssetler([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets(true); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => fetchAssets(false);
  const handleClearFilter = () => {
      setSelectedType('All');
      setSelectedPrice('all');
      setSearchTerm('');
      fetchAssets(true);
  };
  const handleSearchSubmit = (e) => { e.preventDefault(); fetchAssets(false); };

  const getImageSrc = (imageName) => {
    if (!imageName || imageName === "null" || imageName === "") return FALLBACK_IMAGE;
    if (imageName.startsWith("http")) return FALLBACK_IMAGE;
    return `http://localhost:3001/uploads/${imageName}`;
  };

  const safeList = Array.isArray(assetler) ? assetler : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = safeList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeList.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- AKILLI SAYFALAMA MANTIĞI ---
  const getPaginationGroup = () => {
    const pageNumbers = [];
    const maxVisibleButtons = 5; // Ortada kaç tane buton görünsün

    // Eğer toplam sayfa sayısı azsa hepsini göster
    if (totalPages <= maxVisibleButtons + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    }

    // Başlangıç ve Bitiş sayfalarını her zaman ekle
    // Aktif sayfanın etrafındaki aralığı belirle
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    // İlk sayfa
    pageNumbers.push(1);

    // Araya "..." lazım mı? (Baştaki boşluk)
    if (startPage > 2) {
        pageNumbers.push("...");
    }

    // Orta kısım
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    // Araya "..." lazım mı? (Sondaki boşluk)
    if (endPage < totalPages - 1) {
        pageNumbers.push("...");
    }

    // Son sayfa
    pageNumbers.push(totalPages);

    return pageNumbers;
  };

  return (
    <div className={`assets-page ${sidebarAcik ? 'sidebar-open' : ''}`}>
        <Navbar />
        <aside id="filter-sidebar" className={`sidebar ${sidebarAcik ? 'open' : ''}`}>
            <button className="sidebar-toggle-btn close-btn" onClick={() => setSidebarAcik(false)}><i className="fas fa-times"></i> Kapat</button>
            <h3>Filtreler</h3>
            <div className="filter-group">
                <h4>Ara</h4>
                <form onSubmit={handleSearchSubmit} style={{display:'flex', gap:'5px'}}>
                    <input type="text" className="search-box" placeholder="Asset adı..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width:'100%'}} />
                </form>
            </div>
            <div className="filter-group">
                <h4>Türler</h4>
                <label><input type="radio" name="type" value="All" checked={selectedType === 'All'} onChange={(e) => setSelectedType(e.target.value)} /> Tümü</label>
                {availableTypes.map(t => (
                    <label key={t.assetTypeID}>
                        <input type="radio" name="type" value={t.assetTypeID} checked={parseInt(selectedType) === t.assetTypeID} onChange={(e) => setSelectedType(e.target.value)} /> {t.type}
                    </label>
                ))}
            </div>
            <div className="filter-group">
                <h4>Fiyat</h4>
                <label><input type="radio" name="price" value="all" checked={selectedPrice === 'all'} onChange={(e) => setSelectedPrice(e.target.value)} /> Tümü</label>
                <label><input type="radio" name="price" value="free" checked={selectedPrice === 'free'} onChange={(e) => setSelectedPrice(e.target.value)} /> Ücretsiz</label>
                <label><input type="radio" name="price" value="paid" checked={selectedPrice === 'paid'} onChange={(e) => setSelectedPrice(e.target.value)} /> Ücretli</label>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                <button className="btn btn-primary" onClick={handleApplyFilter} style={{width:'100%', justifyContent:'center'}}><i className="fas fa-check"></i> Filtreleri Uygula</button>
                <button className="btn btn-secondary" onClick={handleClearFilter} style={{width:'100%', justifyContent:'center', backgroundColor:'transparent', border:'1px solid #666'}}><i className="fas fa-trash"></i> Temizle</button>
            </div>
        </aside>
        <button id="open-sidebar-btn" className="sidebar-toggle-btn open-btn" onClick={() => setSidebarAcik(true)}><i className="fas fa-filter"></i> Filtreler</button>
        <main className="content container">
            <section className="game-list">
                <h2>Tüm Assetler</h2>
                {loading ? <p style={{color:'white', textAlign:'center'}}>Yükleniyor...</p> : (
                    <>
                        {safeList.length === 0 ? (
                            <div style={{textAlign:'center', padding:'50px', border:'1px dashed #444', borderRadius:'10px', marginTop:'20px'}}>
                                <i className="fas fa-box-open" style={{fontSize:'40px', color:'#e94560', marginBottom:'15px'}}></i>
                                <h3 style={{color:'#fff'}}>Sonuç Bulunamadı</h3>
                                <p style={{color:'#aaa'}}>Aradığınız kriterlere uygun asset bulunamadı.</p>
                                <button className="btn btn-secondary" onClick={handleClearFilter} style={{marginTop:'15px'}}>
                                    Tüm Assetleri Göster
                                </button>
                            </div>
                        ) : (
                            <div className="games-grid">
                                {currentAssets.map((asset) => (
                                    <Link to={`/asset/${asset.assetID}`} key={asset.assetID} style={{textDecoration:'none', color:'inherit'}}>
                                        <GameCard oyun={{
                                            baslik: asset.assetName,
                                            tur: asset.typeNames || "Asset", 
                                            fiyatEtiketi: (!asset.assetPrice || asset.assetPrice === 0) ? "Ücretsiz" : `$${asset.assetPrice}`,
                                            resim: getImageSrc(asset.assetImage || asset.coverImage)
                                        }} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {/* YENİLENMİŞ SAYFALAMA ALANI */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        {/* Önceki Sayfa Butonu */}
                        <button 
                            onClick={() => paginate(Math.max(1, currentPage - 1))} 
                            className="page-btn"
                            disabled={currentPage === 1}
                            style={{opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                        >
                            &#10094;
                        </button>

                        {/* Akıllı Sayfa Numaraları */}
                        {getPaginationGroup().map((item, index) => (
                            <button
                                key={index}
                                onClick={() => typeof item === 'number' ? paginate(item) : null}
                                className={`page-btn ${currentPage === item ? 'active' : ''} ${item === '...' ? 'dots' : ''}`}
                                disabled={item === '...'}
                            >
                                {item}
                            </button>
                        ))}

                        {/* Sonraki Sayfa Butonu */}
                        <button 
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            style={{opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                        >
                            &#10095;
                        </button>
                    </div>
                )}
            </section>
        </main>
        <footer className="footer"><p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p></footer>
    </div>
  );
}

export default Assets;