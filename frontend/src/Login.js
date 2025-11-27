import React, { useState } from 'react';
import './App.css'; // CSS stillerini buradan da çekiyoruz

function Login() {
  // 1. Kullanıcı verilerini tutmak için State tanımlıyoruz
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Form gönderildiğinde ne olacağını belirleyen fonksiyon
  const handleLogin = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    console.log("Giriş Denemesi:", email, password);
    // İLERİDE BURAYA VERİTABANI BAĞLANTISI GELECEK
  };

  return (
    <div className="login-page-wrapper">
        {/* NAVBAR (Login sayfasına özel sade navbar) */}
        <header className="navbar">
            <div className="logo">
                <h1>SHERIFF GAMES</h1>
            </div>
            <nav>
                <a style={{ fontSize: 'large' }} href="/">Ana Sayfa</a>
            </nav>
            <div className="user-actions">
                <a href="/login" className="btn btn-primary">Giriş Yap</a>
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
                            // React'in inputu kontrol etmesi için:
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
                            // React'in inputu kontrol etmesi için:
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" class="btn btn-primary login-btn">Giriş Yap</button>
                </form>

                <div className="login-footer">
                    <a href="#" className="forgot-password">Şifremi Unuttum</a>
                    <p>Hesabın yok mu? <a href="/register" className="register-link">Şimdi Kaydol!</a></p>
                </div>
            </div>
        </main>

        {/* FOOTER */}
        <footer className="footer">
            <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
            <div className="footer-links">
                <a href="#">Hakkımızda</a> |
                <a href="#">Geliştiriciler</a> |
                <a href="#">Destek</a>
            </div>
        </footer>
    </div>
  );
}

export default Login;