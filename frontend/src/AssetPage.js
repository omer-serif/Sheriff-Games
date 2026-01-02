import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './navbar';
import './App.css'; 

function AssetPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  // YORUM STATE'LERİ
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    setUser(currentUser);

    fetch(`http://localhost:3001/assets/${id}`)
      .then(res => res.json())
      .then(data => {
        setAsset(data);
        setLoading(false);
      })
      .catch(err => console.error("Hata:", err));

    fetchComments();
  }, [id]);

  const fetchComments = () => {
    fetch(`http://localhost:3001/api/asset-comments/${id}`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error("Yorum Hatası:", err));
  };

  const handlePostComment = (e) => {
      e.preventDefault();
      if(!user) {
          alert("Yorum yapmak için giriş yapmalısınız!");
          return;
      }
      if(!newComment.trim()) return;

      fetch('http://localhost:3001/api/add-asset-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              assetID: id,
              userID: user.userID,
              commentText: newComment
          })
      })
      .then(res => res.json())
      .then(res => {
          if(res.status === "Success") {
              setNewComment(""); 
              fetchComments(); 
          }
      });
  };

  // --- İNDİRME / SATIN ALMA FONKSİYONU ---
  const handleDownload = () => {
    if (!user) {
        alert("İndirmek için giriş yapmalısınız!");
        return;
    }

    // 1. Veritabanına Kaydet (UserByAsset tablosu)
    fetch('http://localhost:3001/api/buy-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userID: user.userID,
            assetID: asset.assetID,
            price: asset.assetPrice || 0
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "Success") {
            alert("İşlem Başarılı! İndirme Başlıyor...");
            
            // 2. Dosyayı İndir
            if (asset.assetFile) {
                const fileUrl = `http://localhost:3001/uploads/${asset.assetFile}`;
                window.open(fileUrl, '_blank');
            } else {
                alert("Hata: Dosya bulunamadı.");
            }
        } else {
            alert("Bir hata oluştu: " + data.message);
        }
    })
    .catch(err => console.error("Satın alma hatası:", err));
  };

  if (loading) return <div className="loading-text">Yükleniyor...</div>;
  if (!asset) return <div className="loading-text">Asset bulunamadı.</div>;

  const imageUrl = asset.assetImage 
    ? `http://localhost:3001/uploads/${asset.assetImage}` 
    : "https://via.placeholder.com/800x400?text=Resim+Yok";

  return (
    <div className="game-detail-body">
        <Navbar />

        <main className="game-detail-container container">
            <header className="game-header">
                <h1>{asset.assetName}</h1>
            </header>

            <section className="game-gallery">
                 <div className="detail-image-wrapper">
                    <img src={imageUrl} alt={asset.assetName} className="detail-image" />
                 </div>
            </section>

            <section className="game-body-layout">
                <div className="game-description-column">
                    <div className="modern-description-box">
                        <h3>Asset Hakkında</h3>
                        <div className="description-text">
                            {asset.assetDescription || "Açıklama yok."}
                        </div>
                    </div>
                    
                    <div className="game-info-box">
                        <h3>Türler</h3>
                        <div className="categories-wrapper">
                            {asset.typeNames ? (
                                asset.typeNames.split(',').map((type, index) => (
                                    <span key={index} className="category-tag asset-tag"><i className="fas fa-layer-group"></i> {type.trim()}</span>
                                ))
                            ) : (<span className="category-tag asset-tag">Genel</span>)}
                        </div>
                    </div>
                </div>

                <aside className="game-purchase-sidebar">
                    <div className="purchase-box">
                        <div className="price-tag-large">
                            <span className="price-lbl">LİSANS FİYATI</span>
                            <span className="price-val">
                                {(!asset.assetPrice || asset.assetPrice === 0) ? "ÜCRETSİZ" : `₺${asset.assetPrice}`}
                            </span>
                        </div>
                        
                        {/* BUTONA ONCLICK EKLENDİ */}
                        <button className="btn btn-primary buy-btn" onClick={handleDownload}>
                            {(!asset.assetPrice || asset.assetPrice === 0) ? <><i className="fas fa-download"></i> İNDİR</> : <><i className="fas fa-shopping-cart"></i> SATIN AL</>}
                        </button>
                        
                        <div className="details-summary">
                            <div className="summary-row"><span className="summary-label">Geliştirici:</span><span className="summary-value author">{asset.publisherName || "Anonim"}</span></div>
                            <div className="summary-row"><span className="summary-label">Firma:</span><span className="summary-value firm">Sheriff Games</span></div>
                        </div>
                        <div className="publisher-signature"><span>Sheriff Games</span> Topluluğu Tarafından Sunulur.</div>
                    </div>
                </aside>
            </section>

            {/* --- YORUM ALANI --- */}
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
                            rows="4" 
                            className="comment-textarea"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!user}
                        ></textarea>
                        <button className="btn btn-primary comment-submit-btn" disabled={!user}>GÖNDER</button>
                    </form>
                </div>
            </section>

        </main>
        <footer className="footer"><p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p></footer>
    </div>
  );
}

export default AssetPage;