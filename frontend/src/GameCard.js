import React from 'react';
import { Link } from 'react-router-dom';

function GameCard({ oyun }) {
  return (
    <div className="game-card">
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