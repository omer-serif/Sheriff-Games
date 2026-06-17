import React from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_LOGO = '/images/sheriffGamesLogo.png';
function GameCard({ oyun }) {
  return (
    <div className="game-card">
      <img 
        // 2. ADIM: Veri boş gelirse direkt logoyu bas (|| operatörü)
        src={oyun.resim || DEFAULT_LOGO} 
        alt={oyun.baslik} 
        // 3. ADIM: Veri var ama resim sunucuda kırık/hatalıysa (404 Error) devreye gir
        onError={(e) => {
          e.target.onerror = null; // React'te sonsuz döngüye girmeyi önleyen güvenlik kilidi
          e.target.src = DEFAULT_LOGO; // Kırık resmi logoyla değiştir
        }}
      />
      <div className="card-info">
        <h4>{oyun.baslik}</h4>
        <p className="tagline">{oyun.tur} / {oyun.fiyatEtiketi}</p>
        <span className="price">{oyun.fiyatEtiketi}</span>
      </div>
    </div>
  );
}

export default GameCard;