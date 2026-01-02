import React, { useState, useEffect, useRef } from 'react'; // useRef EKLENDİ
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; 

function CreateGame() {
  const navigate = useNavigate();
  
  // REF TANIMLAMALARI (Gizli inputları tetiklemek için)
  const coverInputRef = useRef(null);
  const gameFileInputRef = useRef(null);

  // --- SAYFA GÜVENLİĞİ ---
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Bu sayfaya erişmek için giriş yapmalısınız!");
        navigate('/login');
    }
  }, [navigate]);

  // --- STATE TANIMLARI ---
  const [gameName, setGameName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  
  // Dosyalar
  const [coverImage, setCoverImage] = useState(null);
  const [gameFile, setGameFile] = useState(null);

  const handlePriceChange = (e) => {
    setPriceType(e.target.value);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser) return; 

    const formData = new FormData();
    formData.append('gameName', gameName);
    formData.append('gameDescription', description); 
    formData.append('gamePrice', priceType === 'free' ? 0 : price);
    formData.append('category', category);
    formData.append('userID', currentUser.userID);

    if (coverImage) formData.append('coverImage', coverImage);
    if (gameFile) formData.append('gameFile', gameFile);

    try {
        console.log("Sunucuya gönderiliyor...");
        const response = await fetch('http://localhost:3001/api/add-game', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === "Success") {
            alert("Tebrikler! Oyununuz başarıyla yayımlandı 🚀");
            navigate('/'); 
        } else {
            alert("Hata: " + result.message);
        }
    } catch (error) {
        console.error("Yükleme hatası:", error);
        alert("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="create-game-body">
      <Navbar />
        <main className="create-game-container container">
            <div className="create-game-card">
                <h2>Yeni Oyununu Yayımla</h2>
                <p className="subtitle">Oyununuz hakkında gerekli bilgileri doldurun ve Sheriff Games topluluğuyla paylaşın.</p>

                <form onSubmit={handlePublish}>
                    <section className="form-section">
                        <h3>1. Temel Tanıtım</h3>
                        <div className="form-group">
                            <label>Oyun Adı *</label>
                            <input type="text" required value={gameName} onChange={(e) => setGameName(e.target.value)} />
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
                        <h3>2. Görseller ve Dosyalar</h3>
                        
                        {/* KAPAK GÖRSELİ */}
                        <div className="form-group">
                            <label>Oyun Kapak Görseli *</label>
                            {/* Div'e tıklayınca input'u tetikle */}
                            <div className="file-upload-box" onClick={() => coverInputRef.current.click()}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    required 
                                    ref={coverInputRef} // Ref bağlandı
                                    onChange={(e) => setCoverImage(e.target.files[0])} 
                                />
                                <span className="file-label">
                                    <i className="fa fa-image"></i> 
                                    {coverImage ? coverImage.name : "Kapak görselini seçmek için tıklayın"}
                                </span>
                            </div>
                        </div>

                        {/* OYUN DOSYASI */}
                        <div className="form-group">
                            <label>Oyun Dosyası *</label>
                            <div className="file-upload-box" onClick={() => gameFileInputRef.current.click()}>
                                <input 
                                    type="file" 
                                    required 
                                    ref={gameFileInputRef} // Ref bağlandı
                                    onChange={(e) => setGameFile(e.target.files[0])} 
                                />
                                <span className="file-label">
                                    <i className="fa fa-upload"></i>
                                    {gameFile ? gameFile.name : "ZIP/EXE dosyasını seçmek için tıklayın"}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="form-section last-section">
                        <h3>3. Sınıflandırma ve Fiyatlandırma</h3>
                        <div className="form-group">
                            <label>Kategori *</label>
                            <select required value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="" disabled>Seçiniz</option>
                                <option value="Aksiyon">Aksiyon</option>
                                <option value="RPG">RPG</option>
                                <option value="Strateji">Strateji</option>
                                <option value="Simülasyon">Simülasyon</option>
                            </select>
                        </div>
                        <div className="form-group price-group">
                            <label>Fiyatlandırma</label>
                            <select onChange={handlePriceChange} value={priceType}>
                                <option value="free">Ücretsiz</option>
                                <option value="paid">Ücretli</option>
                            </select>
                            {priceType === 'paid' && (
                                <input type="number" step="0.01" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} />
                            )}
                        </div>
                    </section>
                    
                    <button type="submit" className="btn btn-secondary publish-btn">OYUNU YAYIMLA</button>
                </form>
            </div>
        </main>
        <footer className="footer"><p>&copy; 2025 Sheriff Games.</p></footer>
    </div>
  );
}

export default CreateGame;