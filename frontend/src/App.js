import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Sayfalarımızı çağırıyoruz
import Home from './Home';
import Login from './Login';
import Register from './Register';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Tarayıcıda hangi adrese gidilirse o bileşeni göster */}
          
          {/* Ana Sayfa ( / ) */}
          <Route path="/" element={<Home />} />
          
          {/* Giriş Yap ( /login ) */}
          <Route path="/login" element={<Login />} />
          
          {/* Kaydol ( /register ) */}
          <Route path="/register" element={<Register />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;