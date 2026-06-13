import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; // Dashboard'daki stillerinin aynısını kullanıyoruz

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22150%22%20viewBox%3D%220%200%20300%20150%22%3E%3Crect%20fill%3D%22%2322223b%22%20width%3D%22300%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23e94560%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EResim%20Yok%3C%2Ftext%3E%3C%2Fsvg%3E";

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

        // Backend'den kullanıcının kütüphanesini çekiyoruz
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
        if (imageName.startsWith("http")) return FALLBACK_IMAGE;
        return `http://localhost:3001/uploads/${imageName}`;
    };

    const handleImageError = (e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; };

    const openTestModal = (game) => {
        setSelectedGameForTest(game);
        setTestModalVisible(true);
    };

    // Web İçin Dosya Seçme ve Yükleme Fonksiyonu
    const handleFileUpload = async (e, mediaType) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('mediaFile', file);
        formData.append('gameId', selectedGameForTest.itemID);
        formData.append('userId', user.userID);
        formData.append('mediaType', mediaType);

        try {
            const response = await fetch(`http://localhost:3001/api/upload-test-media`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.status === 'Success') {
                alert('Başarılı! Test veriniz geliştiriciye iletildi. Katkınız için teşekkürler.');
                setTestModalVisible(false);
            } else {
                alert('Hata: Yükleme başarısız oldu.');
            }
        } catch (error) {
            console.error('Yükleme hatası:', error);
            alert('Sunucu bağlantı sorunu yaşandı.');
        } finally {
            setIsUploading(false);
            e.target.value = null; // İnputu sıfırla ki aynı dosyayı bir daha seçebilsin
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
                        <div className="dash-card-img-wrapper" style={{ height: '150px' }}>
                            <img src={getImageSrc(item.itemImage)} alt={item.itemName} className="dash-card-img" onError={handleImageError} style={{ height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="dash-card-body">
                            <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>{item.itemName}</h4>
                            
                            <button className="btn-dash btn-view" style={{ width: '100%', marginBottom: '10px' }} onClick={() => alert("İndirme işlemi başlatılıyor...")}>
                                📥 {item.itemType === 'Game' ? 'Oyunu' : 'Asseti'} İndir
                            </button>

                            {/* SADECE OYUN VE TEST PROGRAMINDAYSA GÖRÜNÜR */}
                            {item.itemType === 'Game' && item.isTestGame === 1 && (
                                <button className="btn-dash" style={{ width: '100%', backgroundColor: 'rgba(91,91,254,0.15)', color: '#5b5bfe', border: '1px solid #5b5bfe', fontWeight: 'bold' }} onClick={() => openTestModal(item)}>
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

                {/* Sekmeler */}
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

                {/* İçerik Listesi */}
                <div className="panel" style={{ minHeight: '500px' }}>
                    {renderItems(activeTab === 'games' ? libraryData.games : libraryData.assets)}
                </div>
            </div>

            {/* --- TEST YÜKLEME MODALI --- */}
            {testModalVisible && (
                <div className="modal-overlay" onClick={() => !isUploading && setTestModalVisible(false)} style={{ zIndex: 2000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h3 style={{ color: '#fff', textAlign: 'center', fontSize: '22px' }}>{selectedGameForTest?.itemName} - Test Görevi</h3>
                        <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '30px', lineHeight: '1.6' }}>
                            Geliştirici bu oyun için test programı başlattı. Oyunu oynarken karşılaştığınız bir hatayı veya deneyiminizi gösterecek bir medya yükleyin.
                        </p>

                        {isUploading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <div className="loading-screen" style={{ background: 'transparent' }}>Medya Yükleniyor...</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                {/* GİZLİ DOSYA İNPUTLARI */}
                                <input type="file" accept="video/*" ref={videoInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'video')} />
                                <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'image')} />

                                <button onClick={() => videoInputRef.current.click()} style={{ flex: 1, padding: '20px', borderRadius: '10px', backgroundColor: '#e94560', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '30px' }}>🎥</span>
                                    <span style={{ fontWeight: 'bold' }}>Ekran Kaydı Seç</span>
                                </button>

                                <button onClick={() => imageInputRef.current.click()} style={{ flex: 1, padding: '20px', borderRadius: '10px', backgroundColor: '#5b5bfe', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '30px' }}>🖼️</span>
                                    <span style={{ fontWeight: 'bold' }}>Ekran Görüntüsü Seç</span>
                                </button>
                            </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => !isUploading && setTestModalVisible(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '10px' }}>
                                İptal Et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Library;