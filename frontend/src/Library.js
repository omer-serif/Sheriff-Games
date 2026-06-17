import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; 

// 🔥 DÜZELTME 1: Çirkin SVG silindi, yerine metalik logomuz eklendi.
const FALLBACK_IMAGE = "/images/sheriffGamesLogo.png";

function Library() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [libraryData, setLibraryData] = useState({ games: [], assets: [] });
    const [activeTab, setActiveTab] = useState('games');
    const [loading, setLoading] = useState(true);

    // Test Yükleme Modalı State'leri
    const [testModalVisible, setTestModalVisible] = useState(false);
    const [selectedGameForTest, setSelectedGameForTest] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // YENİ: Medya Seçimi ve Açıklama State'leri
    const [selectedMediaInfo, setSelectedMediaInfo] = useState(null);
    const [testDescription, setTestDescription] = useState('');

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        setLoading(true);

        fetch(`http://localhost:3001/api/my-library/${currentUser.userID}`)
            .then(res => res.json())
            .then(data => {
                setLibraryData({
                    games: data.games || [],
                    assets: data.assets || []
                });
            })
            .catch(err => console.error("Kütüphane hatası:", err))
            .finally(() => setLoading(false));
    }, [navigate]);

    const getImageSrc = (imageName) => {
        if (!imageName || imageName === "null" || imageName === "") return FALLBACK_IMAGE;
        // DÜZELTME: Eğer resim dış bir linkse (http) fallback yapma, direkt linki kullan
        if (imageName.startsWith("http")) return imageName;
        return `http://localhost:3001/uploads/${imageName}`;
    };

    const handleImageError = (e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; };

    const openTestModal = (game) => {
        setSelectedGameForTest(game);
        setSelectedMediaInfo(null);
        setTestDescription('');
        setTestModalVisible(true);
    };

    // 1. AŞAMA: Sadece Medyayı Seç ve Ekranda Tut
    const handleFileSelect = (e, mediaType) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setSelectedMediaInfo({ file, mediaType });
        e.target.value = null; // Input'u sıfırla
    };

    // 2. AŞAMA: Medyayı ve Açıklamayı Gönder
    const submitTestFeedback = async () => {
        if (!selectedMediaInfo) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('mediaFile', selectedMediaInfo.file);
        
        // Kurşun geçirmez String çevirimi
        formData.append('gameId', String(selectedGameForTest.itemID));
        formData.append('userId', String(user.userID || user.id));
        formData.append('mediaType', selectedMediaInfo.mediaType);
        formData.append('description', String(testDescription || ''));

        try {
            const response = await fetch(`http://localhost:3001/api/upload-test-media`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.status === 'Success') {
                alert('Başarılı! Test veriniz ve açıklamanız geliştiriciye iletildi. Katkınız için teşekkürler.');
                setTestModalVisible(false);
            } else {
                alert('Hata: Yükleme başarısız oldu.');
            }
        } catch (error) {
            console.error('Yükleme hatası:', error);
            alert('Sunucu bağlantı sorunu yaşandı.');
        } finally {
            setIsUploading(false);
            setSelectedMediaInfo(null);
            setTestDescription('');
        }
    };

    if (loading) return <div className="loading-screen">Kütüphane Yükleniyor...</div>;

    const renderItems = (items) => {
        if (items.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>{activeTab === 'games' ? '🎮' : '📦'}</div>
                    <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '20px' }}>Kütüphanenizde henüz hiç {activeTab === 'games' ? 'oyun' : 'asset'} yok.</p>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '16px' }}>
                        Keşfetmeye Başla
                    </button>
                </div>
            );
        }

        return (
            <div className="dashboard-grid">
                {items.map((item, index) => (
                    <div key={`${item.itemType}-${item.itemID}-${index}`} className="dash-item-card">
                        {/* Resmin arkasına siyah arka plan eklendi ki logo şık dursun */}
                        <div className="dash-card-img-wrapper" style={{ height: '150px', backgroundColor: '#161625' }}>
                            <img src={getImageSrc(item.itemImage)} alt={item.itemName} className="dash-card-img" onError={handleImageError} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="dash-card-body">
                            <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>{item.itemName}</h4>
                            
                            <button className="btn-dash btn-view" style={{ width: '100%', marginBottom: '10px' }} onClick={() => alert("İndirme işlemi başlatılıyor...")}>
                                📥 {item.itemType === 'Game' ? 'Oyunu' : 'Asseti'} İndir
                            </button>

                            {/* 🔥 DÜZELTME 2: Detay Sayfasına Git Butonu Eklendi */}
                            <button 
                                className="btn-dash" 
                                style={{ width: '100%', marginBottom: '10px', backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: '1px solid #4caf50', fontWeight: 'bold', cursor: 'pointer', padding: '10px', borderRadius: '5px' }} 
                                onClick={() => navigate(`/${item.itemType === 'Game' ? 'game' : 'asset'}/${item.itemID}`)}
                            >
                                👁️ {item.itemType === 'Game' ? 'Oyun' : 'Asset'} Sayfasına Git
                            </button>

                            {item.itemType === 'Game' && item.isTestGame === 1 && (
                                <button className="btn-dash" style={{ width: '100%', backgroundColor: 'rgba(91,91,254,0.15)', color: '#5b5bfe', border: '1px solid #5b5bfe', fontWeight: 'bold', padding: '10px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => openTestModal(item)}>
                                    <i className="fas fa-flask"></i> Test Görevi
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-body">
            <Navbar />
            <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '16px', cursor: 'pointer', marginRight: '20px' }}>
                        <i className="fas fa-arrow-left"></i> Geri
                    </button>
                    <h2 style={{ color: '#fff', margin: 0 }}>Kütüphanem</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', backgroundColor: '#161625', padding: '10px', borderRadius: '10px', marginBottom: '30px' }}>
                    <button 
                        style={{ flex: 1, padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', backgroundColor: activeTab === 'games' ? 'rgba(233,69,96,0.15)' : 'transparent', color: activeTab === 'games' ? '#E94560' : '#aaa' }}
                        onClick={() => setActiveTab('games')}
                    >
                        Oyunlarım ({libraryData.games.length})
                    </button>
                    <button 
                        style={{ flex: 1, padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', backgroundColor: activeTab === 'assets' ? 'rgba(233,69,96,0.15)' : 'transparent', color: activeTab === 'assets' ? '#E94560' : '#aaa' }}
                        onClick={() => setActiveTab('assets')}
                    >
                        Assetlerim ({libraryData.assets.length})
                    </button>
                </div>

                <div className="panel" style={{ minHeight: '500px' }}>
                    {renderItems(activeTab === 'games' ? libraryData.games : libraryData.assets)}
                </div>
            </div>

            {/* --- TEST YÜKLEME MODALI --- */}
            {testModalVisible && (
                <div className="modal-overlay" onClick={() => !isUploading && setTestModalVisible(false)} style={{ zIndex: 2000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
                        <h3 style={{ color: '#fff', textAlign: 'center', fontSize: '22px' }}>{selectedGameForTest?.itemName} - Test Görevi</h3>
                        
                        {isUploading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <div className="loading-screen" style={{ background: 'transparent' }}>Test Verisi Gönderiliyor...</div>
                            </div>
                        ) : selectedMediaInfo ? (
                            // FORM AŞAMASI
                            <div>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #444' }}>
                                    <p style={{ color: '#fff', fontSize: '14px', margin: 0, wordBreak: 'break-all' }}>
                                        <strong style={{color: '#e94560'}}>Seçilen {selectedMediaInfo.mediaType === 'video' ? 'Video' : 'Fotoğraf'}:</strong> <br/>
                                        {selectedMediaInfo.file.name}
                                    </p>
                                </div>

                                <h4 style={{ color: '#00bcd4', marginBottom: '10px', fontSize: '15px' }}>Karşılaştığınız Durumu Açıklayın:</h4>
                                <textarea 
                                    style={{ width: '100%', height: '120px', backgroundColor: '#111', color: '#fff', border: '1px solid #333', borderRadius: '8px', padding: '15px', marginBottom: '20px', resize: 'vertical', boxSizing: 'border-box' }}
                                    placeholder="Örn: 2. seviyede karakter duvara takılıyor..."
                                    value={testDescription}
                                    onChange={(e) => setTestDescription(e.target.value)}
                                ></textarea>

                                <button onClick={submitTestFeedback} style={{ width: '100%', backgroundColor: '#e94560', color: '#fff', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
                                    Geri Bildirimi Gönder
                                </button>

                                <div style={{ textAlign: 'center' }}>
                                    <button onClick={() => setSelectedMediaInfo(null)} style={{ background: 'transparent', border: '1px solid #555', color: '#fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                                        Farklı Medya Seç
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // MEDYA SEÇİM AŞAMASI
                            <div>
                                <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '30px', lineHeight: '1.6' }}>
                                    Geliştirici bu oyun için test programı başlattı. Oyunu oynarken karşılaştığınız bir hatayı veya deneyiminizi gösterecek bir medya seçin.
                                </p>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                    <input type="file" accept="video/*" ref={videoInputRef} style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'video')} />
                                    <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'image')} />

                                    <button onClick={() => videoInputRef.current.click()} style={{ flex: 1, padding: '20px', borderRadius: '10px', backgroundColor: '#e94560', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '30px' }}>🎥</span>
                                        <span style={{ fontWeight: 'bold' }}>Ekran Kaydı Seç</span>
                                    </button>

                                    <button onClick={() => imageInputRef.current.click()} style={{ flex: 1, padding: '20px', borderRadius: '10px', backgroundColor: '#5b5bfe', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '30px' }}>🖼️</span>
                                        <span style={{ fontWeight: 'bold' }}>Görüntü Seç</span>
                                    </button>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <button onClick={() => setTestModalVisible(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '10px' }}>
                                        İptal Et
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Library;