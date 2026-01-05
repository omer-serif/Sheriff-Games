import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; 

function CreateAsset() {
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const assetFileInputRef = useRef(null);
  const galleryInputRef = useRef(null); 

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Giriş yapmalısınız!");
        navigate('/login');
    }
  }, [navigate]);

  const [assetName, setAssetName] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('');
  
  const [availableTypes, setAvailableTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // DOSYA VE ÖNİZLEME STATE'LERİ
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null); 

  const [assetFile, setAssetFile] = useState(null);
  
  const [galleryFiles, setGalleryFiles] = useState([]); 
  const [galleryPreviews, setGalleryPreviews] = useState([]); 

  useEffect(() => {
      fetch('http://localhost:3001/asset-types')
        .then(res => res.json())
        .then(data => {
            console.log("Türler:", data);
            setAvailableTypes(data);
        })
        .catch(err => console.error("Hata:", err));
  }, []);

  const handleTypeChange = (e) => {
      const typeID = parseInt(e.target.value, 10);
      if (e.target.checked) {
          setSelectedTypes(prev => [...prev, typeID]);
      } else {
          setSelectedTypes(prev => prev.filter(id => id !== typeID));
      }
  };

  // --- KAPAK RESMİ SEÇİLİNCE ---
  const handleCoverChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setCoverImage(file);
          setCoverPreview(URL.createObjectURL(file));
      }
  };

  // --- GALERİ RESİMLERİ SEÇİLİNCE ---
  const handleGalleryChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
          setGalleryFiles(files);
          const previewUrls = files.map(file => URL.createObjectURL(file));
          setGalleryPreviews(previewUrls);
      }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return; 

    if (selectedTypes.length === 0) {
        alert("Lütfen en az bir asset türü seçiniz.");
        return;
    }

    const formData = new FormData();
    formData.append('assetName', assetName);
    formData.append('assetDescription', description);
    formData.append('assetPrice', priceType === 'free' ? 0 : price);
    formData.append('userID', currentUser.userID);
    formData.append('assetTypes', JSON.stringify(selectedTypes));

    if (coverImage) formData.append('coverImage', coverImage);
    if (assetFile) formData.append('assetFile', assetFile);

    for (let i = 0; i < galleryFiles.length; i++) {
        formData.append('galleryImages', galleryFiles[i]);
    }

    try {
        const response = await fetch('http://localhost:3001/api/add-asset', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === "Success") {
            alert("Tebrikler! Asset ve görseller başarıyla yayımlandı 📦");
            navigate('/assets'); 
        } else {
            alert("Hata: " + result.message);
        }
    } catch (error) {
        alert("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="create-game-body">
      <Navbar />
        <main className="create-game-container container">
            <div className="create-game-card">
                <h2>Yeni Asset Yayımla</h2>
                <form onSubmit={handlePublish}>
                    <section className="form-section">
                        <h3>1. Asset Bilgileri</h3>
                        <div className="form-group">
                            <label>Asset Adı *</label>
                            <input type="text" required value={assetName} onChange={(e) => setAssetName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Açıklama</label>
                            <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>2. Dosyalar ve Görseller</h3>
                        
                        {/* KAPAK GÖRSELİ */}
                        <div className="form-group">
                            <label>Kapak Görseli *</label>
                            <div className="file-upload-box" onClick={() => coverInputRef.current.click()}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    required 
                                    ref={coverInputRef} 
                                    onChange={handleCoverChange} 
                                />
                                <span className="file-label">
                                    <i className="fas fa-image"></i> {coverImage ? "Kapak Resmi Değiştir" : "Kapak Resmi Seç"}
                                </span>
                            </div>
                            
                            {/* KAPAK ÖNİZLEME */}
                            {coverPreview && (
                                <div className="preview-area">
                                    <img src={coverPreview} alt="Kapak Önizleme" className="cover-preview-img" />
                                </div>
                            )}
                        </div>

                        {/* YENİ: ASSET GALERİ GÖRSELLERİ */}
                        <div className="form-group">
                            <label>Asset Galeri Görselleri (Çoklu Seçim - Opsiyonel)</label>
                            <div className="file-upload-box" onClick={() => galleryInputRef.current.click()}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple // Çoklu seçim
                                    ref={galleryInputRef} 
                                    onChange={handleGalleryChange} 
                                />
                                <span className="file-label">
                                    <i className="fas fa-images"></i> 
                                    {galleryFiles.length > 0 ? `${galleryFiles.length} adet görsel seçildi` : "Galeri Görselleri Seç"}
                                </span>
                            </div>

                            {/* GALERİ ÖNİZLEME */}
                            {galleryPreviews.length > 0 && (
                                <div className="preview-area gallery-grid-preview">
                                    {galleryPreviews.map((src, index) => (
                                        <img key={index} src={src} alt={`Galeri ${index}`} className="gallery-preview-img" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ASSET DOSYASI */}
                        <div className="form-group">
                            <label>Asset Dosyası (.zip, .unitypackage vb.) *</label>
                            <div className="file-upload-box" onClick={() => assetFileInputRef.current.click()}>
                                <input type="file" required ref={assetFileInputRef} onChange={(e) => setAssetFile(e.target.files[0])} />
                                <span className="file-label"><i className="fas fa-box-open"></i> {assetFile ? assetFile.name : "Dosya Yükle"}</span>
                            </div>
                        </div>
                    </section>

                    <section className="form-section last-section">
                        <h3>3. Tür ve Fiyat</h3>
                        <div className="form-group">
                            <label>Asset Türleri * (Çoklu seçim)</label>
                            <div className="checkbox-group" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', background: '#22223b', padding: '20px', borderRadius: '8px', border: '1px solid #444', position:'relative', zIndex:10}}>
                                {availableTypes.map(type => (
                                    <label key={type.assetTypeID} style={{display:'flex', alignItems:'center', cursor:'pointer', color:'white'}}>
                                        <input 
                                            type="checkbox" 
                                            value={type.assetTypeID}
                                            checked={selectedTypes.includes(type.assetTypeID)}
                                            onChange={handleTypeChange}
                                            style={{width: '18px', height: '18px', marginRight: '10px'}}
                                        />
                                        {type.type} 
                                    </label>
                                ))}
                            </div>
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
                    
                    <button type="submit" className="btn btn-secondary publish-btn">ASSETİ YAYIMLA</button>
                </form>
            </div>
        </main>
        <footer className="footer"><p>&copy; 2025 Sheriff Games.</p></footer>
    </div>
  );
}

export default CreateAsset;