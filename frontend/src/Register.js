import React, { useState } from 'react';
import './App.css'; // Stilleri çekiyoruz

function Register() {
  // Form verilerini tutacak değişkenler
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Kayıt ol butonuna basınca çalışacak fonksiyon
  const handleRegister = (e) => {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    
    // Basit bir şifre kontrolü
    if(password !== confirmPassword) {
        alert("Şifreler birbiriyle uyuşmuyor!");
        return;
    }

    console.log("Kayıt Verileri:", { username, email, password });
    // BURAYA İLERİDE VERİTABANI KODU GELECEK
  };

  return (
    <div className="register-page-wrapper">
        <header className="navbar">
            <div className="logo">
                <h1>SHERIFF GAMES</h1>
            </div>
            <nav className="nav-links">
                <a href="/">Keşfet</a>
                <a href="#">Oyunlar</a>
                <a href="#">Oluştur</a>
            </nav>
            <div className="user-actions">
                <a href="/login" className="btn btn-primary">Giriş Yap</a>
            </div>
        </header>

        <main className="login-container">
            <div className="login-card register-card">
                <h2>Hemen Kaydol</h2>
                <form onSubmit={handleRegister}>
                    
                    <div className="form-group">
                        <label htmlFor="username">Kullanıcı Adı</label>
                        <input 
                            type="text" 
                            id="username" 
                            required 
                            placeholder="Oyunlarda görünecek adınız"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">E-posta</label>
                        <input 
                            type="email" 
                            id="email" 
                            required 
                            placeholder="Geçerli bir e-posta adresi"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Şifre</label>
                        <input 
                            type="password" 
                            id="password" 
                            required 
                            placeholder="Güçlü bir şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirm-password">Şifre Tekrar</label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            required 
                            placeholder="Şifrenizi tekrar girin"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-secondary register-btn">HESAP OLUŞTUR</button>
                </form>

                <div className="login-footer">
                    <p>Zaten bir hesabın var mı? <a href="/login" className="register-link">Giriş Yap</a></p>
                </div>
            </div>
        </main>

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

export default Register;