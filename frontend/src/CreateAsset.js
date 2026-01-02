import React, { useState, useEffect, useRef } from 'react'; // useRef EKLENDİ
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; 

function CreateAsset() {
  const navigate = useNavigate();

  // REF TANIMLAMALARI
  const assetCoverRef = useRef(null);
  const assetFileRef = useRef(null);

  // --- SAYFA GÜVENLİĞİ ---
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Bu sayfaya erişmek için giriş yapmalısınız!");
        navigate('/login');
    }
  }, [navigate]);

  // --- STATE TANIMLARI ---
  const [assetName, setAssetName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('');
  
  const [coverImage, setCoverImage] = useState(null);
  const [assetFile, setAssetFile] = useState(null);

  const handlePublish = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    const formData = new FormData();
    formData.append('assetName', assetName);
    formData.append('assetDescription', description);
    formData.append('assetPrice', priceType === 'free' ? 0 : price);
    formData.append('assetType', assetType);
    formData.append('userID', currentUser.userID);

    if (coverImage) formData.append('coverImage', coverImage);
    if (assetFile) formData.append('assetFile', assetFile);

    try {
        console.log("Asset sunucuya gönderiliyor...");
        const response = await fetch('http://localhost:3001/api/add-asset', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === "Success") {
            alert("Harika! Asset başarıyla mağazaya yüklendi 🎨");
            navigate('/assets'); // Veya uygun bir yönlendirme
        } else {
            alert("Hata: " + result.message);
        }
    } catch (error) {
        console.error("Yükleme hatası:", error);
        alert("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="create-asset-body">
      <Navbar />
        <main className="create-asset-container container">
            <div className="create-game-card">
                <h2>Yeni Asset'i Yükle</h2>
                <p className="subtitle">Oyunlarınızda kullanılabilecek görsel, ses veya kod varlığını paylaşın.</p>

                <form onSubmit={handlePublish}>
                    <section className="form-section">
                        <h3>1. Asset Tanıtımı</h3>
                        <div className="form-group">
                            <label>Asset Adı *</label>
                            <input type="text" required value={assetName} onChange={(e) => setAssetName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Kısa Açıklama</label>
                            <input type="text" maxLength="150" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Detaylı Açıklama</label>
                            <textarea rows="8" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>2. Görseller ve Asset Dosyası</h3>
                        
                        {/* ASSET ÖNİZLEME */}
                        <div className="form-group">
                            <label>Asset Önizleme *</label>
                            <div className="file-upload-box" onClick={() => assetCoverRef.current.click()}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    required 
                                    ref={assetCoverRef} 
                                    onChange={(e) => setCoverImage(e.target.files[0])} 
                                />
                                <span className="file-label">
                                    <i className="fa fa-image"></i>
                                    {coverImage ? coverImage.name : "Önizleme görselini seçmek için tıkla"}
                                </span>
                            </div>
                        </div>

                        {/* ASSET DOSYASI */}
                        <div className="form-group">
                            <label>Asset Dosyası *</label>
                            <div className="file-upload-box" onClick={() => assetFileRef.current.click()}>
                                <input 
                                    type="file" 
                                    required 
                                    ref={assetFileRef} 
                                    onChange={(e) => setAssetFile(e.target.files[0])} 
                                />
                                <span className="file-label">
                                    <i className="fa fa-folder-open"></i>
                                    {assetFile ? assetFile.name : "ZIP/PNG/FBX dosyasını seçmek için tıkla"}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="form-section last-section">
                        <h3>3. Sınıflandırma ve Fiyatlandırma</h3>
                        <div className="form-group">
                            <label>Asset Türü *</label>
                            <select required value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                                <option value="" disabled>Seçiniz</option>
                                <option value="1">2D Sprite</option>
                                <option value="2">3D Model</option>
                                <option value="3">Ses Efekti</option>
                                <option value="4">UI</option>
                                <option value="5">Müzik</option>
                            </select>
                        </div>
                        <div className="form-group price-group">
                            <label>Fiyatlandırma</label>
                            <select onChange={(e) => setPriceType(e.target.value)} value={priceType}>
                                <option value="free">Ücretsiz</option>
                                <option value="paid">Ücretli</option>
                            </select>
                            {priceType === 'paid' && (
                                <input type="number" step="0.01" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} />
                            )}
                        </div>
                    </section>
                    
                    <button type="submit" className="btn btn-secondary publish-btn">ASSET'İ YAYIMLA</button>
                </form>
            </div>
        </main>
        <footer className="footer"><p>&copy; 2025 Sheriff Games.</p></footer>
    </div>
  );
}

export default CreateAsset;