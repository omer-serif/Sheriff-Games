import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Yönlendirme için
import Navbar from './navbar';
import './App.css'; 

function Register() {
  const navigate = useNavigate(); // Kayıt bitince sayfayı değiştirmek için

  // Form verilerini tutacak değişkenler
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Kayıt ol butonuna basınca çalışacak fonksiyon
  const handleRegister = async (e) => {
    e.preventDefault(); 
    
    // 1. Şifre Kontrolü
    if(password !== confirmPassword) {
        alert("Şifreler birbiriyle uyuşmuyor!");
        return;
    }

    try {
        console.log("Kayıt verisi gönderiliyor...");
        
        // 2. Backend'e İstek Atıyoruz
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        // 3. Sonucu Kontrol Ediyoruz
        if (result.status === "Success") {
            alert("Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
            navigate('/login'); // Başarılıysa Giriş sayfasına git
        } else {
            alert(result.message); // Hata varsa mesajı göster (Örn: Mail kullanılıyor)
        }

    } catch (error) {
        console.error("Hata:", error);
        alert("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="register-page-wrapper">
        {/* YENİ NAVBAR'I BURAYA DA EKLEDİK */}
        <Navbar />

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
                    <p>Zaten bir hesabın var mı? <Link to="/login" className="register-link">Giriş Yap</Link></p>
                </div>
            </div>
        </main>

        <footer className="footer">
            <p>&copy; 2025 Sheriff Games. Tüm Hakları Saklıdır.</p>
        </footer>
    </div>
  );
}

export default Register;