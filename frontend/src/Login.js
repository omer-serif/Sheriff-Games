import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Yönlendirme ve Link araçları
import './App.css';

function Login() {
  const navigate = useNavigate(); // Sayfa değiştirmek için bu fonksiyonu kullanacağız
  
  // State tanımları
  const [email, setEmail] = useState(''); // Kullanıcı buraya username de girebilir
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Sunucuya gönderiliyor:", email, password);

    try {
        // 1. Sunucuya İstek Gönderiyoruz
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }) // 'email' dediğimize bakma, username de olabilir
        });

        // 2. Sunucudan Gelen Cevabı Okuyoruz
        const result = await response.json();

        // 3. Sonucu Kontrol Ediyoruz
        if (result.status === "Success") {
    localStorage.setItem("currentUser", JSON.stringify(result.user));

    alert(`Hoşgeldin ${result.user.userName}! Yönlendiriliyorsunuz...`);
    navigate('/'); 
}
    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        alert("Sunucuyla bağlantı kurulamadı. Backend açık mı?");
    }
  };

  return (
    <div className="login-page-wrapper">
        {/* NAVBAR */}
        <header className="navbar">
            <div className="logo">
                <h1>SHERIFF GAMES</h1>
            </div>
            <nav>
                <Link style={{ fontSize: 'large' }} to="/">Ana Sayfa</Link>
            </nav>
            <div className="user-actions">
                <Link to="/login" className="btn btn-primary">Giriş Yap</Link>
            </div>
        </header>

        {/* LOGIN KUTUSU */}
        <main className="login-container">
            <div className="login-card">
                <h2>Giriş Yap</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Kullanıcı Adı veya E-posta</label>
                        <input 
                            type="text" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="E-posta veya kullanıcı adı"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Şifre</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            placeholder="Şifreniz"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary login-btn">Giriş Yap</button>
                </form>

                <div className="login-footer">
                    <Link to="#" className="forgot-password">Şifremi Unuttum</Link>
                    <p>Hesabın yok mu? <Link to="/register" className="register-link">Şimdi Kaydol!</Link></p>
                </div>
            </div>
        </main>

        {/* FOOTER */}
        <footer className="footer">
            <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
            <div className="footer-links">
                <Link to="#">Hakkımızda</Link> |
                <Link to="#">Geliştiriciler</Link> |
                <Link to="#">Destek</Link>
            </div>
        </footer>
    </div>
  );
}

export default Login;