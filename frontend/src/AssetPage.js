import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './App.css';

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22150%22%20viewBox%3D%220%200%20300%20150%22%3E%3Crect%20fill%3D%22%2322223b%22%20width%3D%22300%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22%23e94560%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EResim%20Yok%3C%2Ftext%3E%3C%2Fsvg%3E";

function AssetPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [allImages, setAllImages] = useState([]);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        setUser(currentUser);

        fetch(`http://localhost:3001/assets/${id}`)
            .then(res => {
                if(!res.ok) throw new Error("Asset bulunamadı");
                return res.json();
            })
            .then(data => {
                setAsset(data);
                
                const imagesList = [data.assetImage];
                if (data.galleryImages && Array.isArray(data.galleryImages) && data.galleryImages.length > 0) {
                    imagesList.push(...data.galleryImages);
                }
                setAllImages(imagesList);
            })
            .catch(err => {
                console.error(err);
                navigate('/');
            })
            .finally(() => setLoading(false));

        fetch(`http://localhost:3001/api/asset-comments/${id}`)
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error(err));

    }, [id, navigate]);

    const getImageSrc = (imgName) => {
        if (!imgName || imgName === "null") return FALLBACK_IMAGE;
        return `http://localhost:3001/uploads/${imgName}`;
    };

    const nextSlide = () => {
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleBuy = async () => {
        if (!user) { alert("Satın almak için giriş yapın!"); navigate('/login'); return; }

        try {
            const res = await fetch('http://localhost:3001/api/buy-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: user.userID, assetID: asset.assetID, price: asset.assetPrice })
            });
            const result = await res.json();
            if (result.status === 'Success') alert("Başarıyla kütüphaneye eklendi! 📦");
            else alert("Hata: " + result.message);
        } catch (error) { alert("İşlem hatası."); }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!user) { alert("Yorum yapmak için giriş yapmalısınız."); return; }
        if (!newComment.trim()) return;

        try {
            const res = await fetch('http://localhost:3001/api/add-asset-comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetID: asset.assetID, userID: user.userID, commentText: newComment })
            });
            const result = await res.json();
            if(result.status === 'Success') {
                setComments(prev => [{userName: user.userName, commentText: newComment, commentDate: new Date()}, ...prev]);
                setNewComment("");
            }
        } catch(err) { console.error(err); }
    };

    if (loading) return <div className="loading-text">Yükleniyor...</div>;
    if (!asset) return <div className="loading-text">Asset bulunamadı.</div>;

    return (
        <div className="game-detail-body">
            <Navbar />
            <div className="container game-detail-container">
                
                <header className="game-header">
                    <h1>{asset.assetName}</h1>
               
                </header>

                <section className="game-gallery">
                    <div className="slider-container">
                        {allImages.length > 1 && (
                            <button className="slider-btn prev-btn" onClick={prevSlide}>&#10094;</button>
                        )}
                        
                        <img 
                            src={getImageSrc(allImages[currentImageIndex])} 
                            alt={`Slide ${currentImageIndex}`} 
                            className="slider-image"
                        />

                        {allImages.length > 1 && (
                            <button className="slider-btn next-btn" onClick={nextSlide}>&#10095;</button>
                        )}
                    </div>
                </section>

            
                {allImages.length > 1 && (
                    <div className="thumbnail-row">
                        {allImages.map((img, index) => (
                            <img 
                                key={index}
                                src={getImageSrc(img)}
                                alt={`Thumb ${index}`}
                                className={`thumb-img ${currentImageIndex === index ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                )}

                <div className="game-body-layout">
                    <div className="game-description-column">
                        <div className="modern-description-box">
                            <h3>Asset Hakkında</h3>
                            <div className="description-text">
                                {asset.assetDescription || "Açıklama yok."}
                            </div>
                        </div>

                        <div className="game-info-box categories">
                            <h3>Türler</h3>
                            <div className="categories-wrapper">
                                {asset.typeNames && asset.typeNames.split(', ').map((tag, index) => (
                                    <span key={index} className="category-tag asset-tag"><i className="fas fa-layer-group"></i> {tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="game-purchase-sidebar">
                        <div className="purchase-box">
                            <div className="price-tag-large">
            
                                <span className="price-lbl">FİYAT</span>
                                <span className="price-val">
                                    {(!asset.assetPrice || asset.assetPrice === 0) ? "ÜCRETSİZ" : `₺${asset.assetPrice}`}
                                </span>
                            </div>
                            

                            <button className="btn btn-primary buy-btn" onClick={handleBuy}>
                                {(!asset.assetPrice || asset.assetPrice === 0) ? <><i className="fas fa-download"></i> İNDİR</> : <><i className="fas fa-shopping-cart"></i> SATIN AL</>}
                            </button>
                            
                            <div className="details-summary">
                                <div className="summary-row">
                                    <span className="summary-label">Yayıncı:</span>
                                    <span className="summary-value author">{asset.publisherName || "Anonim"}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Firma:</span>
                                    <span className="summary-value firm">Sheriff Games</span>
                                </div>
                            </div>
                            <div className="publisher-signature"><span>Sheriff Games</span> Topluluğu Tarafından Sunulur.</div>
                        </div>
                    </aside>
                </div>

                <section className="comments-section">
                    <h2>Kullanıcı Yorumları ({comments.length})</h2>
                    <div className="comments-list" style={{marginBottom: '30px'}}>
                        {comments.length === 0 ? (
                            <p style={{color: '#aaa', fontStyle: 'italic'}}>Henüz yorum yapılmamış.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.commentID} style={{backgroundColor: '#22223b', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '3px solid #00bcd4'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                        <span style={{color: '#00bcd4', fontWeight:'bold'}}>{comment.userName}</span>
                                        <span style={{color: '#666', fontSize:'0.8rem'}}>{new Date(comment.commentDate).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{color: '#ddd'}}>{comment.commentText}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="comment-form-box">
                        <form className="comment-form" onSubmit={handlePostComment}>
                            <textarea 
                                name="comment-text" 
                                placeholder={user ? "Bu asset hakkında ne düşünüyorsun?" : "Giriş yapmalısın."} 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows="4" 
                                className="comment-textarea"
                                disabled={!user}
                            ></textarea>
                            <button className="btn btn-primary comment-submit-btn" disabled={!user}>GÖNDER</button>
                        </form>
                    </div>
                </section>

            </div>
            <footer className="footer"><p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p></footer>
        </div>
    );
}

export default AssetPage;