import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList 
} from 'recharts';
import Navbar from './navbar';
import './App.css';

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22150%22%20viewBox%3D%220%200%20300%20150%22%3E%3Crect%20fill%3D%22%2322223b%22%20width%3D%22300%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23e94560%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EResim%20Yok%3C%2Ftext%3E%3C%2Fsvg%3E";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [myGames, setMyGames] = useState([]);
  const [myAssets, setMyAssets] = useState([]);
  const [mySales, setMySales] = useState([]);
  const [mainChartData, setMainChartData] = useState([]); 
  
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);

  // --- DÜZENLEME STATE'LERİ ---
  const [editingItem, setEditingItem] = useState(null); 
  const [editForm, setEditForm] = useState({ name: '', description: '', price: 0 });
  
  const [currentCoverPreview, setCurrentCoverPreview] = useState(null);
  const [newCoverFile, setNewCoverFile] = useState(null);
  
  const [currentGallery, setCurrentGallery] = useState([]); 
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); 
  
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  // SİLİNECEK RESİMLER
  const [deletedImageIDs, setDeletedImageIDs] = useState([]);

  const [deletingItem, setDeletingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null); 

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [modalChartData, setModalChartData] = useState([]); 

  // YENİ: YORUM MODALI STATE'LERİ
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedItemNameForComments, setSelectedItemNameForComments] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);


  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
        fetch(`http://localhost:3001/api/my-sales/${currentUser.userID}`).then(res => res.ok ? res.json() : []),
        fetch(`http://localhost:3001/api/publisher-total-stats/${currentUser.userID}`).then(res => res.ok ? res.json() : [])
    ])
    .then(([gamesData, assetsData, salesData, statsData]) => {
        setMyGames(gamesData || []);
        setMyAssets(assetsData || []);
        setMySales(salesData || []);
        
        const processedStats = (statsData || []).map(item => ({
            name: item.Name || item.name, 
            totalDownloads: Number(item.totalDownloads || 0),
            type: item.Type
        }));
        setMainChartData(processedStats); 
    })
    .catch(err => console.error("Veri hatası:", err))
    .finally(() => setLoading(false));

  }, [navigate]);

  const getImageSrc = (imageName) => {
      if (!imageName || imageName === "null" || imageName === "") return FALLBACK_IMAGE;
      if (imageName.startsWith("http")) return FALLBACK_IMAGE;
      return `http://localhost:3001/uploads/${imageName}`;
  };

  const handleImageError = (e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; };

  const handleEditClick = (item, type) => {
    const priceValue = (type === 'Game' ? item.gamePrice : item.assetPrice) || 0;
    const coverImg = type === 'Game' ? item.gameImage : item.assetImage;
    const itemID = type === 'Game' ? item.gamesID : item.assetID;

    setEditingItem({ ...item, type, id: itemID }); 
    setEditForm({
        name: type === 'Game' ? item.gameName : item.assetName,
        description: type === 'Game' ? item.gameDescription : item.assetDescription,
        price: priceValue
    });

    setCurrentCoverPreview(getImageSrc(coverImg));
    setNewCoverFile(null);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]); 
    setDeletedImageIDs([]); 

    fetch(`http://localhost:3001/api/get-edit-details/${type}/${itemID}`)
        .then(res => res.json())
        .then(data => {
            setCurrentGallery(data.galleryImages || []);
        })
        .catch(err => console.error("Galeri detay hatası:", err));
  };

  const handleCoverChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setNewCoverFile(file);
          setCurrentCoverPreview(URL.createObjectURL(file));
      }
  };

  const handleGalleryAdd = (e) => {
      const files = Array.from(e.target.files);
      setNewGalleryFiles(files);

      const previews = files.map(file => URL.createObjectURL(file));
      setNewGalleryPreviews(previews);
  };

  const handleImageDeleteClick = (imageID) => {
      setImageToDelete(imageID); 
  };

  const confirmDeleteImage = () => {
      if (!imageToDelete) return;
      setCurrentGallery(prev => prev.filter(img => img.imageID !== imageToDelete));
      setDeletedImageIDs(prev => [...prev, imageToDelete]);
      setImageToDelete(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('type', editingItem.type);
    formData.append('id', editingItem.id);
    formData.append('name', editForm.name);
    formData.append('description', editForm.description);
    formData.append('price', editForm.price);
    formData.append('deletedImageIDs', JSON.stringify(deletedImageIDs));

    if (newCoverFile) {
        formData.append('coverImage', newCoverFile);
    }

    for (let i = 0; i < newGalleryFiles.length; i++) {
        formData.append('newGalleryImages', newGalleryFiles[i]);
    }

    try {
        const response = await fetch('http://localhost:3001/api/update-item', {
            method: 'PUT', 
            body: formData 
        });
        const result = await response.json();
        if(result.status === "Success") {
            alert("Başarıyla güncellendi! ✅");
            setEditingItem(null); 
            window.location.reload(); 
        } else {
            alert("Hata: " + result.message);
        }
    } catch (error) { alert("Sunucu hatası: " + error.message); }
  };

  const handleDeleteClick = (item, type) => { setDeletingItem({ ...item, type }); };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const id = deletingItem.type === 'Game' ? deletingItem.gamesID : deletingItem.assetID;
    
    try {
        const response = await fetch('http://localhost:3001/api/delete-item', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: deletingItem.type, id: id })
        });
        const result = await response.json();
        if (result.status === "Success") {
            alert("Silindi! 🗑️");
            setDeletingItem(null);
            window.location.reload();
        } else { alert("Silinemedi: " + result.message); }
    } catch (error) { alert(`HATA: ${error.message}`); }
  };

  const handleViewDetails = (item) => {
      const type = activeTab === 'games' ? 'Game' : 'Asset';
      const id = activeTab === 'games' ? item.gamesID : item.assetID;
      const name = activeTab === 'games' ? item.gameName : item.assetName;

      setSelectedItemName(name);

      fetch(`http://localhost:3001/api/item-sales-details?type=${type}&id=${id}`)
        .then(res => res.json())
        .then(data => {
            setSelectedItemDetails(data);
            const chartMap = {};
            data.forEach(sale => {
                const dateKey = new Date(sale.purchaseDate).toLocaleDateString('tr-TR');
                chartMap[dateKey] = (chartMap[dateKey] || 0) + 1;
            });
            const processedChartData = Object.keys(chartMap).map(date => ({
                tarih: date,
                indirme: Number(chartMap[date])
            }));
            setModalChartData(processedChartData);
            setShowDetailModal(true);
        })
        .catch(err => console.error("Detay çekme hatası:", err));
  };

  const handleViewPage = (id, type) => {
      if(type === 'Game') {
          navigate(`/game/${id}`);
      } else {
          navigate(`/asset/${id}`);
      }
  };

  // --- YENİ: YORUMLARI GÖRÜNTÜLEME FONKSİYONU ---
  const handleViewComments = (item, type) => {
      const id = type === 'Game' ? item.gamesID : item.assetID;
      const name = type === 'Game' ? item.gameName : item.assetName;
      
      setSelectedItemNameForComments(name);
      setCommentsLoading(true);
      setShowCommentsModal(true); // Modalı aç

      const endpoint = type === 'Game' 
          ? `http://localhost:3001/api/game-comments/${id}`
          : `http://localhost:3001/api/asset-comments/${id}`;

      fetch(endpoint)
          .then(res => res.json())
          .then(data => {
              setSelectedComments(data);
              setCommentsLoading(false);
          })
          .catch(err => {
              console.error("Yorum hatası:", err);
              setCommentsLoading(false);
              setSelectedComments([]);
          });
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#22223b', padding: '10px', border: '1px solid #e94560', borderRadius:'5px' }}>
          <p style={{ color: '#fff', margin:0, fontWeight:'bold' }}>{label}</p>
          <p style={{ color: '#e94560', margin:0 }}>{`İndirme: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="loading-screen">Yükleniyor...</div>;
  if (!user) return null;

  return (
    <div className="dashboard-body">
      <Navbar />

      <div className="dashboard-wrapper container">
        
        <aside className="dashboard-sidebar">
            <div className="profile-info">
                <div className="avatar-circle">{user.userName ? user.userName.charAt(0).toUpperCase() : "U"}</div>
                <h4>{user.userName}</h4>
                <p style={{color:'#aaa', fontSize:'12px'}}>Geliştirici Hesabı</p>
            </div>
            
            <nav className="dashboard-nav">
                <button className={`nav-item ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
                    <i className="fas fa-gamepad"></i> Oyunlarım ({myGames.length})
                </button>
                <button className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
                    <i className="fas fa-cubes"></i> Assetlerim ({myAssets.length})
                </button>
                <button className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
                    <i className="fas fa-wallet"></i> Satış Geçmişi
                </button>
                <button className="nav-item action" onClick={() => setShowCreateModal(true)}>
                    <i className="fas fa-plus"></i> Yeni İçerik Ekle
                </button>
            </nav>
        </aside>

        <main className="dashboard-content">
            <div className="panel" style={{marginBottom:'30px'}}>
                <h2>Genel Performans</h2>
                <div className="chart-panel">
                    <h3>Oyun/Asset Bazlı Toplam İndirmeler</h3>
                    {mainChartData.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={mainChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#ccc" tick={{fontSize: 12}} />
                                    <YAxis stroke="#ccc" allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="totalDownloads" name="Toplam İndirme" fill="#e94560" barSize={50} radius={[5, 5, 0, 0]}>
                                        <LabelList dataKey="totalDownloads" position="top" fill="white" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (<p style={{color:'#aaa', textAlign:'center', padding:'40px'}}>Henüz veri yok.</p>)}
                </div>
                
                <section className="stats-grid">
                    <div className="stat-card accent-card">
                        <i className="fas fa-download stat-icon"></i>
                        <span className="stat-value">{mySales.length}</span>
                        <span className="stat-label">Toplam İndirme</span>
                    </div>
                    <div className="stat-card accent-card">
                        <i className="fas fa-coins stat-icon"></i>
                        <span className="stat-value">₺{mySales.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0).toFixed(2)}</span>
                        <span className="stat-label">Toplam Kazanç</span>
                    </div>
                </section>
            </div>

            {activeTab === 'games' && (
                <div className="panel">
                    <h3>Yayınlanan Oyunlar</h3>
                    {myGames.length === 0 ? <p className="no-data">Henüz oyun yüklemediniz.</p> : (
                        <div className="dashboard-grid">
                            {myGames.map(game => (
                                <div key={game.gamesID} className="dash-item-card">
                                    <div className="dash-card-img-wrapper">
                                        <img src={getImageSrc(game.gameImage || game.coverImage)} alt={game.gameName} className="dash-card-img" onError={handleImageError} />
                                    </div>
                                    <div className="dash-card-body">
                                        <h4>{game.gameName}</h4>
                                        <p style={{color:'#e94560', fontWeight:'bold'}}>{game.gamePrice > 0 ? `₺${game.gamePrice}` : "Ücretsiz"}</p>
                                        <div className="dash-btn-group">
                                            <button onClick={() => handleEditClick(game, 'Game')} className="btn-dash btn-edit"><i className="fas fa-edit"></i> Düzenle</button>
                                            <button onClick={() => handleDeleteClick(game, 'Game')} className="btn-dash btn-delete"><i className="fas fa-trash"></i> Sil</button>
                                        </div>
                                        <button onClick={() => handleViewPage(game.gamesID, 'Game')} className="btn-dash btn-view"><i className="fas fa-eye"></i> Sayfayı Görüntüle</button>
                                        
                                        {/* YENİ EKLENEN YORUM BUTONU */}
                                        <button onClick={() => handleViewComments(game, 'Game')} className="btn-dash btn-comments"><i className="fas fa-comments"></i> Yorumları Gör</button>
                                        
                                        <button onClick={() => handleViewDetails(game)} className="btn-dash btn-detail"><i className="fas fa-chart-bar"></i> Detay & Grafik</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'assets' && (
                <div className="panel">
                    <h3>Yayınlanan Assetler</h3>
                    {myAssets.length === 0 ? <p className="no-data">Henüz asset yüklemediniz.</p> : (
                        <div className="dashboard-grid">
                            {myAssets.map(asset => (
                                <div key={asset.assetID} className="dash-item-card">
                                    <div className="dash-card-img-wrapper">
                                        <img src={getImageSrc(asset.assetImage || asset.coverImage)} alt={asset.assetName} className="dash-card-img" onError={handleImageError} />
                                    </div>
                                    <div className="dash-card-body">
                                        <h4>{asset.assetName}</h4>
                                        <p style={{color:'#e94560', fontWeight:'bold'}}>{asset.assetPrice > 0 ? `₺${asset.assetPrice}` : "Ücretsiz"}</p>
                                        <div className="dash-btn-group">
                                            <button onClick={() => handleEditClick(asset, 'Asset')} className="btn-dash btn-edit"><i className="fas fa-edit"></i> Düzenle</button>
                                            <button onClick={() => handleDeleteClick(asset, 'Asset')} className="btn-dash btn-delete"><i className="fas fa-trash"></i> Sil</button>
                                        </div>
                                        <button onClick={() => handleViewPage(asset.assetID, 'Asset')} className="btn-dash btn-view"><i className="fas fa-eye"></i> Sayfayı Görüntüle</button>
                                        
                                        {/* YENİ EKLENEN YORUM BUTONU */}
                                        <button onClick={() => handleViewComments(asset, 'Asset')} className="btn-dash btn-comments"><i className="fas fa-comments"></i> Yorumları Gör</button>

                                        <button onClick={() => handleViewDetails(asset)} className="btn-dash btn-detail"><i className="fas fa-chart-bar"></i> Detay & Grafik</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="panel">
                    <h3>İşlem Geçmişi</h3>
                    {mySales.length === 0 ? <p className="no-data">Henüz işlem yok.</p> : (
                        <table className="sales-table">
                            <thead><tr><th>Tarih</th><th>Kullanıcı</th><th>Ürün</th><th>Kazanç</th></tr></thead>
                            <tbody>
                                {mySales.map(sale => (
                                    <tr key={sale.saleID || Math.random()}>
                                        <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                        <td>{sale.buyerName || "Gizli"}</td>
                                        <td>{sale.itemName}</td>
                                        <td className="profit">{sale.price > 0 ? `+₺${sale.price}` : "Ücretsiz"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </main>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Ne Yüklemek İstersiniz?</h3>
                <div className="selection-buttons">
                    <Link to="/create-game" className="selection-card"><i className="fas fa-gamepad"></i><span>Oyun Yükle</span></Link>
                    <Link to="/create-asset" className="selection-card"><i className="fas fa-cubes"></i><span>Asset Yükle</span></Link>
                </div>
                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <button onClick={() => setShowCreateModal(false)} className="btn-cancel">İptal</button>
                </div>
            </div>
        </div>
      )}

      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} style={{maxHeight:'95vh', overflowY:'auto'}}>
                <h3>Düzenle: {editingItem.type === 'Game' ? 'Oyun' : 'Asset'}</h3>
                <form onSubmit={handleUpdate}>
                    <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                        <div style={{flex: 1, minWidth:'350px'}}>
                            <label>Ad</label>
                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                            
                            <label>Açıklama</label>
                            <textarea rows="15" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required></textarea>
                            
                            <label>Fiyat (₺)</label>
                            <input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} required />
                        </div>

                        <div style={{flex: 1, minWidth:'350px'}}>
                            <label>Kapak Görseli</label>
                            <div className="file-upload-box" style={{padding:'20px', marginBottom:'20px', backgroundColor:'#161625'}} onClick={() => coverInputRef.current.click()}>
                                <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} />
                                {currentCoverPreview && <img src={currentCoverPreview} alt="Kapak" style={{width:'100%', height:'300px', objectFit:'cover', borderRadius:'8px', marginBottom:'15px', border:'2px solid #e94560'}} />}
                                <span className="file-label" style={{fontSize:'16px'}}><i className="fas fa-camera"></i> Kapak Değiştir</span>
                            </div>

                            <label>Galeri Görselleri (Mevcut)</label>
                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'15px', marginBottom:'30px'}}>
                                {currentGallery.map(img => (
                                    <div key={img.imageID} style={{position:'relative'}}>
                                        <img src={getImageSrc(img.image)} alt="Galeri" style={{width:'100%', height:'100px', objectFit:'cover', borderRadius:'6px', border:'1px solid #555'}} />
                                        <button 
                                            type="button"
                                            onClick={() => handleImageDeleteClick(img.imageID)}
                                            style={{position:'absolute', top:'-8px', right:'-8px', background:'#d32f2f', color:'white', border:'2px solid #222', borderRadius:'50%', width:'24px', height:'24px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}
                                        >&times;</button>
                                    </div>
                                ))}
                                {currentGallery.length === 0 && <span style={{color:'#666', fontSize:'14px', fontStyle:'italic'}}>Galeri boş (veya hepsi silinecek).</span>}
                            </div>

                            <label>Yeni Görsel Ekle</label>
                            <div className="file-upload-box" style={{padding:'20px', backgroundColor:'#161625'}} onClick={() => galleryInputRef.current.click()}>
                                <input type="file" accept="image/*" multiple ref={galleryInputRef} onChange={handleGalleryAdd} />
                                <span className="file-label" style={{fontSize:'16px'}}>
                                    <i className="fas fa-plus"></i> 
                                    {newGalleryFiles.length > 0 ? `${newGalleryFiles.length} dosya seçildi` : "Yeni Resimler Ekle"}
                                </span>
                            </div>

                            {newGalleryPreviews.length > 0 && (
                                <div style={{marginTop:'15px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'15px'}}>
                                    {newGalleryPreviews.map((src, index) => (
                                        <img key={index} src={src} alt={`Yeni-${index}`} style={{width:'100%', height:'100px', objectFit:'cover', borderRadius:'6px', border:'1px solid #e94560'}} />
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                    
                    <div className="modal-actions" style={{marginTop:'30px', borderTop:'1px solid #444', paddingTop:'20px'}}>
                        <button type="button" onClick={() => setEditingItem(null)} className="btn-cancel" style={{padding:'12px 25px', fontSize:'16px'}}>Vazgeç</button>
                        <button type="submit" className="btn-save" style={{padding:'12px 25px', fontSize:'16px'}}>Değişiklikleri Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {imageToDelete && (
        <div className="modal-overlay" style={{zIndex: 2000}} onClick={() => setImageToDelete(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{color:'#d32f2f'}}>Görseli Kaldır</h3>
                <p style={{textAlign:'center', color:'#ccc'}}>
                    Bu görseli listeden kaldırmak istediğinize emin misiniz? <br/>
                    (Not: Kalıcı silme işlemi "Kaydet" butonuna basınca gerçekleşir.)
                </p>
                <div className="modal-actions">
                    <button onClick={() => setImageToDelete(null)} className="btn-cancel">Vazgeç</button>
                    <button onClick={confirmDeleteImage} className="btn-delete-confirm">Kaldır</button>
                </div>
            </div>
        </div>
      )}

      {deletingItem && (
        <div className="modal-overlay" onClick={() => setDeletingItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{color:'#d32f2f'}}>Siliniyor: {deletingItem.type === 'Game' ? deletingItem.gameName : deletingItem.assetName}</h3>
                <p style={{textAlign:'center', color:'#ccc'}}>Bu işlem geri alınamaz. Emin misiniz?</p>
                <div className="modal-actions">
                    <button onClick={() => setDeletingItem(null)} className="btn-cancel">İptal</button>
                    <button onClick={handleDeleteConfirm} className="btn-delete-confirm">Evet, Sil</button>
                </div>
            </div>
        </div>
      )}

      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #444', marginBottom:'20px'}}>
                    <h3 style={{margin:0, color:'#e94560', border:'none'}}>{selectedItemName} - İndirme Geçmişi</h3>
                    <button onClick={() => setShowDetailModal(false)} style={{background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer'}}>&times;</button>
                </div>

                <div style={{marginBottom:'30px', padding:'10px', backgroundColor:'#161625', borderRadius:'8px'}}>
                    <h4 style={{color:'#aaa', textAlign:'center', marginBottom:'10px', fontSize:'14px'}}>Zaman İçindeki İndirmeler</h4>
                    {modalChartData.length > 0 ? (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={modalChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="tarih" stroke="#888" tick={{fontSize: 12}} />
                                    <YAxis stroke="#888" allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="indirme" name="İndirme" fill="#00bcd4" barSize={30} radius={[5, 5, 0, 0]}>
                                        <LabelList dataKey="indirme" position="top" fill="white" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (<p style={{textAlign:'center', color:'#666', padding:'20px'}}>Henüz grafik verisi oluşmadı.</p>)}
                </div>

                <div style={{maxHeight:'300px', overflowY:'auto'}}>
                    <table className="sales-table">
                        <thead><tr><th>Kullanıcı</th><th>Tarih</th><th>Tutar</th></tr></thead>
                        <tbody>
                            {selectedItemDetails.length > 0 ? selectedItemDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td>{detail.buyerName}</td>
                                    <td>{new Date(detail.purchaseDate).toLocaleString('tr-TR')}</td>
                                    <td>{detail.price === 0 ? "Ücretsiz" : `₺${detail.price}`}</td>
                                </tr>
                            )) : (<tr><td colSpan="3" style={{textAlign:'center', color:'#aaa'}}>Kayıt bulunamadı.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* --- YENİ EKLENEN: YORUM GÖRÜNTÜLEME MODALI --- */}
      {showCommentsModal && (
        <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} style={{maxHeight: '80vh', overflowY:'auto'}}>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #444', marginBottom:'20px', paddingBottom:'10px'}}>
                    <h3 style={{margin:0, color:'#f39c12'}}>{selectedItemNameForComments} - Yorumlar</h3>
                    <button onClick={() => setShowCommentsModal(false)} style={{background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer'}}>&times;</button>
                </div>

                {commentsLoading ? (
                    <p style={{textAlign:'center', color:'#aaa'}}>Yorumlar yükleniyor...</p>
                ) : selectedComments.length === 0 ? (
                    <p style={{textAlign:'center', color:'#aaa', fontStyle:'italic', padding:'20px'}}>Henüz bu içeriğe yorum yapılmamış.</p>
                ) : (
                    <div className="dashboard-comments-list">
                        {selectedComments.map((comment, index) => (
                            <div key={index} className="dashboard-comment-item">
                                <div className="dash-comment-header">
                                    <span className="dash-comment-user">{comment.userName || "Anonim Kullanıcı"}</span>
                                    <span className="dash-comment-date">{new Date(comment.commentDate).toLocaleString('tr-TR')}</span>
                                </div>
                                <p className="dash-comment-text">{comment.commentText}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      <footer className="footer"><p>&copy; 2025 Sheriff Games.</p></footer>
    </div>
  );
}

export default Dashboard;