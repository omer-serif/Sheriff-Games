const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // React'in bağlanmasına izin ver
app.use(express.json());

// ============================================
// 1. VERİTABANI AYARLARI (BURAYI DOLDUR!)
// ============================================
const db = mysql.createConnection({
    host: 'localhost',      // Genelde localhost'tur
    user: 'root',           // MySQL kullanıcı adın (Genelde root)
    password: 'berkay4115',           // MySQL şifren (Varsa yaz, yoksa boş bırak)
    database: 'SheriffGames'  // SENİN OLUŞTURDUĞUN VERİTABANI ADI
});

// 2. Bağlantıyı Kontrol Et
db.connect((err) => {
    if (err) {
        console.error('HATA: Veritabanına bağlanılamadı!', err);
        return;
    }
    console.log('BAŞARILI: MySQL Veritabanına bağlandı!');
});

// ============================================
// 3. API YOLLARI (ROUTES)
// ============================================

// Ana Sayfa Testi
app.get('/', (req, res) => {
    return res.json("Sunucu çalışıyor! Sheriff Games Backend");
});
// backend/server.js dosyasının içine:

// TÜM OYUNLARI GETİR
app.get('/games', (req, res) => {
    // Sadece Games tablosunu çekiyoruz.
    // İleride JOIN işlemi ile türleri de çekeriz ama şimdilik basit tutalım.
    const sql = "SELECT * FROM Games"; 
    
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});


// TEK BİR OYUNUN DETAYINI GETİR (ID'ye göre)
app.get('/games/:id', (req, res) => {
    const gameID = req.params.id; // URL'deki sayıyı alıyoruz
    const sql = "SELECT * FROM Games WHERE gamesID = ?";

    db.query(sql, [gameID], (err, data) => {
        if(err) return res.status(500).json(err);
        
        // Veri dizi olarak gelir [ {oyun...} ]. Biz ilkini alıp obje olarak dönelim.
        return res.json(data[0]); 
    });
});


// 1. TÜM ASSETLERİ GETİR (Tür isimleriyle birlikte)
app.get('/assets', (req, res) => {
    // Assets tablosunu AssetTypes ile birleştiriyoruz (JOIN)
    const sql = "SELECT Assets.*, AssetTypes.type as typeName FROM Assets JOIN AssetTypes ON Assets.assetType = AssetTypes.assetTypeID";
    
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 2. TEK BİR ASSET GETİR (ID'ye göre)
app.get('/assets/:id', (req, res) => {
    const assetID = req.params.id;
    const sql = "SELECT Assets.*, AssetTypes.type as typeName FROM Assets JOIN AssetTypes ON Assets.assetType = AssetTypes.assetTypeID WHERE assetID = ?";

    db.query(sql, [assetID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data[0]); // İlk sonucu döndür
    });
});


app.post('/login', (req, res) => {
    // Frontend'den gelen veriler:
    // req.body.email -> Kullanıcı buraya e-posta YA DA kullanıcı adı yazmış olabilir.
    const girilenBilgi = req.body.email; 
    const girilenSifre = req.body.password;

    // SQL Sorgusu: 
    // "Bana User tablosundan öyle birini getir ki;
    // (Maili EŞİTSE veya Kullanıcı Adı EŞİTSE) VE (Şifresi EŞİTSE)"
    const sql = "SELECT * FROM User WHERE (userMail = ? OR userName = ?) AND userPassword = ?";
    
    db.query(sql, [girilenBilgi, girilenBilgi, girilenSifre], (err, data) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: "Sunucu hatası oluştu." });
        }

        // Eğer data dizisi doluysa, kullanıcı bulunmuş demektir.
        if(data.length > 0) {
            // Giriş Başarılı!
            // İstersen kullanıcının adını da geri gönderebiliriz (hoşgeldin mesajı için)
            return res.json({ 
                status: "Success", 
                message: "Giriş Başarılı", 
                user: data[0] // Bulan kullanıcının bilgilerini gönderiyoruz
            });
        } else {
            // Giriş Başarısız
            return res.status(401).json({ status: "Error", message: "Kullanıcı adı/E-posta veya şifre hatalı!" });
        }
    });
});

// KAYIT OL (REGISTER) İŞLEMİ
app.post('/register', (req, res) => {
    // 1. Frontend'den gelen verileri alıyoruz
    const { username, email, password } = req.body;

    // 2. SQL Sorgusu (Senin User tablonun sütun isimlerine göre)
    const sql = "INSERT INTO User (`userName`, `userMail`, `userPassword`) VALUES (?)";
    
    // Verileri dizi haline getiriyoruz
    const values = [username, email, password];

    db.query(sql, [values], (err, data) => {
        if(err) {
            console.error("MySQL Hatası:", err);
            // Genelde hata "Duplicate entry" yani "Bu mail zaten kayıtlı" hatası olur.
            return res.status(500).json({ status: "Error", message: "Kayıt oluşturulamadı. Bu e-posta veya kullanıcı adı zaten kullanılıyor olabilir." });
        }
        
        // Başarılı olursa
        return res.json({ status: "Success", message: "Kullanıcı başarıyla oluşturuldu." });
    });
});
// Sunucuyu Başlat
app.listen(3001, () => {
    console.log("Sunucu 3001 portunda çalışıyor...");
});