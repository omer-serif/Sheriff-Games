import React from 'react';

// Bu bileşen dışarıdan 'oyun' verisi alır ve ekrana basar
function GameCard({ oyun }) {
  return (
    <div className="game-card">
      {/* Resim yolunu public klasörüne göre ayarlıyoruz */}
      <img src={oyun.resim} alt={oyun.baslik} />
      
      <div className="card-info">
        <h4>{oyun.baslik}</h4>
        <p className="tagline">{oyun.tur} / {oyun.fiyatEtiketi}</p>
        <span className="price">{oyun.fiyatEtiketi}</span>
      </div>
    </div>
  );
}

export default GameCard;