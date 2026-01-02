import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import GameCard from './GameCard';
import './App.css';

// Boş görsel (Siyah/Gri bir kutu)
const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22150%22%20viewBox%3D%220%200%20300%20150%22%3E%3Crect%20fill%3D%22%2322223b%22%20width%3D%22300%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23e94560%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ESheriff Games%3C%2Ftext%3E%3C%2Fsvg%3E";

function Home() {
  const [sidebarAcik, setSidebarAcik] = useState(false);
  const [oyunlar, setOyunlar] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Filtreler
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all'); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchGames = (isReset = false) => {
    setLoading(true);
    
    const categoryQuery = isReset ? 'All' : selectedCategory;
    const priceQuery = isReset ? 'all' : selectedPrice;
    const searchQuery = isReset ? '' : searchTerm;

    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (categoryQuery !== 'All') params.append('category', categoryQuery);
    if (priceQuery !== 'all') params.append('priceType', priceQuery);

    fetch(`http://localhost:3001/games?${params.toString()}`)
      .then(res => {
          if (!res.ok) throw new Error("Sunucu Hatası");
          return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
            setOyunlar(data);
        } else {
            console.error("Hatalı veri formatı:", data);
            setOyunlar([]);
        }
        setCurrentPage(1); 
        setLoading(false);
      })
      .catch(err => {
        console.log("Fetch Hatası:", err);
        setOyunlar([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGames(true); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => fetchGames(false);
  const handleClearFilter = () => {
      setSelectedCategory('All');
      setSelectedPrice('all');
      setSearchTerm('');
      fetchGames(true); 
  };
  const handleSearchSubmit = (e) => { e.preventDefault(); fetchGames(false); };

  const getImageSrc = (imageName) => {
    // Eğer resim adı yoksa veya null ise fallback göster
    if (!imageName || imageName === "null" || imageName === "") return FALLBACK_IMAGE;
    // Eğer veritabanında tam URL kayıtlıysa onu kullan
    if (imageName.startsWith("http")) return imageName;
    // Yoksa sunucudan çek
    return `http://localhost:3001/uploads/${imageName}`;
  };

  const safeList = Array.isArray(oyunlar) ? oyunlar : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGames = safeList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeList.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const toggleSidebar = () => setSidebarAcik(!sidebarAcik);

  return (
    <div className={`home-page ${sidebarAcik ? 'sidebar-open' : ''}`}>
      <Navbar />
      <aside id="filter-sidebar" className={`sidebar ${sidebarAcik ? 'open' : ''}`}>
        <button className="sidebar-toggle-btn close-btn" onClick={toggleSidebar}><i className="fas fa-times"></i> Kapat</button>
        <h3>Filtreler</h3>
        <div className="filter-group">
            <h4>Ara</h4>
            <form onSubmit={handleSearchSubmit} style={{display:'flex', gap:'5px'}}>
                <input type="text" className="search-box" placeholder="Oyun adı..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width:'100%'}} />
            </form>
        </div>
        <div className="filter-group">
          <h4>Kategori</h4>
          <label><input type="radio" name="category" value="All" checked={selectedCategory === 'All'} onChange={(e) => setSelectedCategory(e.target.value)} /> Tümü</label>
          <label><input type="radio" name="category" value="Aksiyon" checked={selectedCategory === 'Aksiyon'} onChange={(e) => setSelectedCategory(e.target.value)} /> Aksiyon</label>
          <label><input type="radio" name="category" value="RPG" checked={selectedCategory === 'RPG'} onChange={(e) => setSelectedCategory(e.target.value)} /> RPG</label>
          <label><input type="radio" name="category" value="Strateji" checked={selectedCategory === 'Strateji'} onChange={(e) => setSelectedCategory(e.target.value)} /> Strateji</label>
          <label><input type="radio" name="category" value="Simülasyon" checked={selectedCategory === 'Simülasyon'} onChange={(e) => setSelectedCategory(e.target.value)} /> Simülasyon</label>
          <label><input type="radio" name="category" value="Macera" checked={selectedCategory === 'Macera'} onChange={(e) => setSelectedCategory(e.target.value)} /> Macera</label>
          <label><input type="radio" name="category" value="Korku" checked={selectedCategory === 'Korku'} onChange={(e) => setSelectedCategory(e.target.value)} /> Korku</label>
          <label><input type="radio" name="category" value="Spor" checked={selectedCategory === 'Spor'} onChange={(e) => setSelectedCategory(e.target.value)} /> Spor</label>
          <label><input type="radio" name="category" value="Yarış" checked={selectedCategory === 'Yarış'} onChange={(e) => setSelectedCategory(e.target.value)} /> Yarış</label>
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
      <button className="sidebar-toggle-btn open-btn" onClick={toggleSidebar}><i className="fas fa-filter"></i> Filtreler</button>
      <main className="content container">
        <section className="game-list">
          <h2>Mağaza</h2>
          {loading ? <p style={{color:'white', textAlign:'center'}}>Yükleniyor...</p> : (
              <>
                {safeList.length === 0 ? (
                    <div style={{textAlign:'center', padding:'50px', border:'1px dashed #444', borderRadius:'10px', marginTop:'20px'}}>
                        <i className="fas fa-ghost" style={{fontSize:'40px', color:'#e94560', marginBottom:'15px'}}></i>
                        <h3 style={{color:'#fff'}}>Sonuç Bulunamadı</h3>
                        <p style={{color:'#aaa'}}>Uygun oyun yok.</p>
                        <button className="btn btn-secondary" onClick={handleClearFilter} style={{marginTop:'15px'}}>Tüm Oyunları Göster</button>
                    </div>
                ) : (
                    <div className="games-grid">
                        {currentGames.map((veri) => (
                        <Link to={`/game/${veri.gamesID}`} key={veri.gamesID} style={{textDecoration:'none', color:'inherit'}}>
                            <GameCard oyun={{
                                baslik: veri.gameName,
                                fiyatEtiketi: (!veri.gamePrice || veri.gamePrice === 0) ? "Ücretsiz" : `$${veri.gamePrice}`,
                                tur: veri.categoryNames || "Genel", 
                                resim: getImageSrc(veri.gameImage || veri.coverImage)
                            }} />
                        </Link>
                        ))}
                    </div>
                )}
              </>
          )}
          {totalPages > 1 && (
            <div className="pagination-container">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                ))}
            </div>
          )}
        </section>
      </main>
      <footer className="footer"><p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p></footer>
    </div>
  );
}

export default Home;