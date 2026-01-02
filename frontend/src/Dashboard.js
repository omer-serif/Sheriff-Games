import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css';

// --- İNTERNET GEREKTİRMEYEN GÖMÜLÜ RESİM (Base64) ---
const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22150%22%20viewBox%3D%220%200%20300%20150%22%3E%3Crect%20fill%3D%22%2322223b%22%20width%3D%22300%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23e94560%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EResim%20Yok%3C%2Ftext%3E%3C%2Fsvg%3E";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [myGames, setMyGames] = useState([]);
  const [myAssets, setMyAssets] = useState([]);
  const [mySales, setMySales] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(true);

  // MODAL STATE'LERİ
  const [editingItem, setEditingItem] = useState(null); 
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });
  const [deletingItem, setDeletingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false); // Yeni Ekleme Modalı

  // --- 1. VERİ ÇEKME ---
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        navigate('/login');
        return;
    }
    setUser(currentUser);
    setLoading(true);

    Promise.all([
        fetch(`http://localhost:3001/api/my-games/${currentUser.userID}`).then(res => res.ok ? res.json() : []),
        fetch(`http://localhost:3001/api/my-assets/${currentUser.userID}`).then(res => res.ok ? res.json() : []),
        fetch(`http://localhost:3001/api/my-sales/${currentUser.userID}`).then(res => res.ok ? res.json() : [])
    ])
    .then(([gamesData, assetsData, salesData]) => {
        setMyGames(gamesData || []);
        setMyAssets(assetsData || []);
        setMySales(salesData || []);
    })
    .catch(err => console.error("Veri hatası:", err))
    .finally(() => setLoading(false));

  }, [navigate]);

  // --- 2. GÖRSEL YÖNETİMİ ---
  const getImageSrc = (imageName) => {
      if (!imageName || imageName === "null" || imageName === "") return FALLBACK_IMAGE;
      if (imageName.startsWith("http")) return FALLBACK_IMAGE;
      return `http://localhost:3001/uploads/${imageName}`;
  };

  const handleImageError = (e) => {
      e.target.onerror = null; 
      e.target.src = FALLBACK_IMAGE;
  };

  // --- 3. DÜZENLEME ---
  const handleEditClick = (item, type) => {
    setEditingItem({ ...item, type }); 
    setEditForm({
        name: type === 'Game' ? item.gameName : item.assetName,
        description: type === 'Game' ? item.gameDescription : item.assetDescription,
        price: type === 'Game' ? item.gamePrice : item.assetPrice
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3001/api/update-item', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: editingItem.type,
                id: editingItem.type === 'Game' ? editingItem.gamesID : editingItem.assetID,
                name: editForm.name,
                description: editForm.description,
                price: editForm.price
            })
        });
        
        const result = await response.json();
        if(result.status === "Success") {
            alert("Başarıyla güncellendi! ✅");
            setEditingItem(null); 
            window.location.reload(); 
        } else {
            alert("Hata: " + result.message);
        }
    } catch (error) {
        alert("Sunucu hatası.");
    }
  };

  // --- 4. SİLME İŞLEMİ ---
  const handleDeleteClick = (item, type) => {
    setDeletingItem({ ...item, type });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    try {
        const response = await fetch('http://localhost:3001/api/delete-item', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: deletingItem.type,
                id: deletingItem.type === 'Game' ? deletingItem.gamesID : deletingItem.assetID
            })
        });

        if (!response.ok) throw new Error(`HTTP Hata: ${response.status}`);

        const result = await response.json();

        if (result.status === "Success") {
            alert("Silindi! 🗑️");
            setDeletingItem(null);
            window.location.reload();
        } else {
            alert("Silinemedi: " + result.message);
        }
    } catch (error) {
        alert(`HATA: ${error.message}`);
    }
  };

  if (loading) return <div className="loading-screen">Yükleniyor...</div>;
  if (!user) return null;

  return (
    <div className="dashboard-body">
      <Navbar />

      <div className="dashboard-wrapper container">
        {/* SIDEBAR */}
        <aside className="dashboard-sidebar">
            <div className="profile-info">
                <div className="avatar-circle">
                    {user.userName ? user.userName.charAt(0).toUpperCase() : "U"}
                </div>
                <h4>{user.userName}</h4>
                <p style={{color:'#aaa', fontSize:'12px'}}>Geliştirici Hesabı</p>
            </div>
            
            <nav className="dashboard-nav">
                <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <i className="fas fa-chart-line"></i> Genel Bakış
                </button>
                <button className={`nav-item ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
                    <i className="fas fa-gamepad"></i> Oyunlarım ({myGames.length})
                </button>
                <button className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
                    <i className="fas fa-cubes"></i> Assetlerim ({myAssets.length})
                </button>
                <button className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
                    <i className="fas fa-wallet"></i> Satış Geçmişi
                </button>
                
                {/* YENİ EKLENEN BUTON: MODAL AÇIYOR */}
                <button className="nav-item action" onClick={() => setShowCreateModal(true)}>
                    <i className="fas fa-plus"></i> Yeni İçerik Ekle
                </button>
            </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-content">
            
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="panel">
                    <h2>Hoş Geldin, {user.userName}!</h2>
                    <section className="stats-grid">
                        <div className="stat-card">
                            <i className="fas fa-shopping-cart stat-icon"></i>
                            <span className="stat-value">{mySales.length}</span>
                            <span className="stat-label">Toplam Satış</span>
                        </div>
                        <div className="stat-card">
                            <i className="fas fa-layer-group stat-icon"></i>
                            <span className="stat-value">{myGames.length + myAssets.length}</span>
                            <span className="stat-label">Yüklü Ürün</span>
                        </div>
                        <div className="stat-card accent-card">
                            <i className="fas fa-coins stat-icon"></i>
                            <span className="stat-value">${mySales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0).toFixed(2)}</span>
                            <span className="stat-label">Toplam Kazanç</span>
                        </div>
                    </section>
                </div>
            )}

            {/* OYUNLARIM */}
            {activeTab === 'games' && (
                <div className="panel">
                    <h3>Yayınlanan Oyunlar</h3>
                    {myGames.length === 0 ? <p className="no-data">Henüz oyun yüklemediniz.</p> : (
                        <div className="dashboard-grid">
                            {myGames.map(game => (
                                <div key={game.gamesID} className="dash-item-card">
                                    <div className="dash-card-img-wrapper">
                                        <img 
                                            src={getImageSrc(game.coverImage)} 
                                            alt={game.gameName}
                                            className="dash-card-img"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="dash-card-body">
                                        <h4>{game.gameName}</h4>
                                        <p style={{color:'#e94560', fontWeight:'bold'}}>
                                            {game.gamePrice > 0 ? `$${game.gamePrice}` : "Ücretsiz"}
                                        </p>
                                        <div className="dash-btn-group">
                                            <button onClick={() => handleEditClick(game, 'Game')} className="btn-dash btn-edit">
                                                <i className="fas fa-edit"></i> Düzenle
                                            </button>
                                            <button onClick={() => handleDeleteClick(game, 'Game')} className="btn-dash btn-delete">
                                                <i className="fas fa-trash"></i> Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ASSETLERİM */}
            {activeTab === 'assets' && (
                <div className="panel">
                    <h3>Yayınlanan Assetler</h3>
                    {myAssets.length === 0 ? <p className="no-data">Henüz asset yüklemediniz.</p> : (
                        <div className="dashboard-grid">
                            {myAssets.map(asset => (
                                <div key={asset.assetID} className="dash-item-card">
                                    <div className="dash-card-img-wrapper">
                                        <img 
                                            src={getImageSrc(asset.coverImage)} 
                                            alt={asset.assetName}
                                            className="dash-card-img"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="dash-card-body">
                                        <h4>{asset.assetName}</h4>
                                        <p style={{color:'#e94560', fontWeight:'bold'}}>
                                            {asset.assetPrice > 0 ? `$${asset.assetPrice}` : "Ücretsiz"}
                                        </p>
                                        <div style={{marginBottom:'10px'}}>
                                            <span className="asset-tag">{asset.typeName || 'Asset'}</span>
                                        </div>
                                        <div className="dash-btn-group">
                                            <button onClick={() => handleEditClick(asset, 'Asset')} className="btn-dash btn-edit">
                                                <i className="fas fa-edit"></i> Düzenle
                                            </button>
                                            <button onClick={() => handleDeleteClick(asset, 'Asset')} className="btn-dash btn-delete">
                                                <i className="fas fa-trash"></i> Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* SATIŞLAR */}
            {activeTab === 'sales' && (
                <div className="panel">
                    <h3>Satış Hareketleri</h3>
                    {mySales.length === 0 ? <p className="no-data">Henüz satış yapılmadı.</p> : (
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Alıcı</th>
                                    <th>Ürün</th>
                                    <th>Kazanç</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mySales.map(sale => (
                                    <tr key={sale.saleID}>
                                        <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                        <td>{sale.buyerName || "Gizli"}</td>
                                        <td>{sale.itemType}</td>
                                        <td className="profit">+${sale.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </main>
      </div>

      {/* --- YENİ İÇERİK SEÇİM MODALI --- */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Ne Yüklemek İstersiniz?</h3>
                <div className="selection-buttons">
                    <Link to="/create-game" className="selection-card">
                        <i className="fas fa-gamepad"></i>
                        <span>Oyun Yükle</span>
                    </Link>
                    <Link to="/create-asset" className="selection-card">
                        <i className="fas fa-cubes"></i>
                        <span>Asset Yükle</span>
                    </Link>
                </div>
                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <button onClick={() => setShowCreateModal(false)} className="btn-cancel">İptal</button>
                </div>
            </div>
        </div>
      )}

      {/* DÜZENLEME MODALI */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Düzenle: {editingItem.type}</h3>
                <form onSubmit={handleUpdate}>
                    <label>Ürün Adı</label>
                    <input 
                        type="text" required value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    />
                    <label>Açıklama</label>
                    <textarea 
                        rows="5" value={editForm.description} 
                        onChange={e => setEditForm({...editForm, description: e.target.value})} 
                    ></textarea>
                    <label>Fiyat ($)</label>
                    <input 
                        type="number" step="0.01" min="0" value={editForm.price} 
                        onChange={e => setEditForm({...editForm, price: e.target.value})} 
                    />
                    <div className="modal-actions">
                        <button type="button" onClick={() => setEditingItem(null)} className="btn-cancel">Vazgeç</button>
                        <button type="submit" className="btn-save">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* SİLME ONAY MODALI */}
      {deletingItem && (
        <div className="modal-overlay" onClick={() => setDeletingItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{textAlign:'center', maxWidth:'400px'}}>
                <h3 style={{color:'#d32f2f', borderBottom:'none'}}>⚠️ Dikkat!</h3>
                <p style={{fontSize:'18px', color:'white'}}>
                    <strong>{deletingItem.type === 'Game' ? deletingItem.gameName : deletingItem.assetName}</strong>
                </p>
                <p>Bu içeriği silmek üzeresiniz. Bu işlem geri alınamaz.</p>
                <div className="modal-actions" style={{justifyContent:'center', marginTop:'20px'}}>
                    <button type="button" onClick={() => setDeletingItem(null)} className="btn-cancel">Vazgeç</button>
                    <button type="button" onClick={handleDeleteConfirm} className="btn-delete-confirm">Evet, Sil</button>
                </div>
            </div>
        </div>
      )}

      <footer className="footer"><p>&copy; 2025 Sheriff Games.</p></footer>
    </div>
  );
}

export default Dashboard;