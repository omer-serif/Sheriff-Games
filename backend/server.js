const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Resim Klasörü
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// 1. VERİTABANI BAĞLANTISI
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'berkay4115',
    database: 'SheriffGames',
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error('❌ HATA: Veritabanına bağlanılamadı!', err);
        return;
    }
    console.log('✅ BAŞARILI: MySQL Veritabanına bağlandı!');
});

// 2. MULTER
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 3. API YOLLARI
app.get('/', (req, res) => res.json("Backend Çalışıyor!"));

// --- OYUN KATEGORİLERİ ---
app.get('/game-types', (req, res) => {
    const sql = "SELECT * FROM gametypes"; 
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- ASSET KATEGORİLERİ ---
app.get('/asset-types', (req, res) => {
    const sql = "SELECT * FROM assettypes"; 
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- OYUN LİSTELEME ---
app.get('/games', (req, res) => {
    const { search, category, priceType } = req.query;
    console.log("🔍 OYUN İSTEĞİ:", req.query);

    let sql = `
        SELECT 
            G.gamesID, G.gameName, G.gamePrice, G.gameDescription, G.gameImage, G.gameFile,
            GROUP_CONCAT(GT.gameType SEPARATOR ', ') as categoryNames 
        FROM Games G
        LEFT JOIN gametypes_game GTG ON G.gamesID = GTG.game
        LEFT JOIN gametypes GT ON GTG.gameType = GT.gameTypeID
        WHERE 1=1 
    `;
    
    let params = [];

    if (search && search.trim() !== '') {
        sql += " AND G.gameName LIKE ?";
        params.push(`%${search}%`);
    }

    if (priceType && priceType !== 'all') {
        if (priceType === 'free') sql += " AND (G.gamePrice = 0 OR G.gamePrice IS NULL)";
        else if (priceType === 'paid') sql += " AND G.gamePrice > 0";
    }

    if (category && category !== 'All') {
        sql += ` AND G.gamesID IN (SELECT game FROM gametypes_game WHERE gameType = (SELECT gameTypeID FROM gametypes WHERE gameType = ?))`;
        params.push(category);
    }

    sql += ` GROUP BY G.gamesID, G.gameName, G.gamePrice, G.gameDescription, G.gameImage, G.gameFile`;
    sql += " ORDER BY G.gamesID DESC";

    db.query(sql, params, (err, data) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        return res.json(data);
    });
});

// --- ASSET LİSTELEME (DÜZELTİLDİ: AT.type kullanıldı) ---
app.get('/assets', (req, res) => {
    const { search, type, priceType } = req.query;
    
    // DİKKAT: Veritabanında sütun adı 'type' olduğu için AT.type yazıyoruz.
    let sql = `
        SELECT 
            A.assetID, A.assetName, A.assetPrice, A.assetDescription, A.assetImage, A.assetFile,
            GROUP_CONCAT(AT.type SEPARATOR ', ') as typeNames 
        FROM Assets A
        LEFT JOIN assettypes_asset ATA ON A.assetID = ATA.asset
        LEFT JOIN assettypes AT ON ATA.assetType = AT.assetTypeID
        WHERE 1=1
    `;
    
    let params = [];

    if (search && search.trim() !== '') {
        sql += " AND A.assetName LIKE ?";
        params.push(`%${search}%`);
    }
    if (priceType && priceType !== 'all') {
        if (priceType === 'free') sql += " AND (A.assetPrice = 0 OR A.assetPrice IS NULL)";
        else if (priceType === 'paid') sql += " AND A.assetPrice > 0";
    }

    // Kategori Filtresi
    if (type && type !== 'All') {
        sql += " AND A.assetID IN (SELECT asset FROM assettypes_asset WHERE assetType = ?)";
        params.push(type);
    }

    // Explicit GROUP BY
    sql += " GROUP BY A.assetID, A.assetName, A.assetPrice, A.assetDescription, A.assetImage, A.assetFile";
    
    sql += " ORDER BY A.assetID DESC";

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error("❌ ASSET SQL HATASI:", err.sqlMessage);
            return res.status(500).json({ error: err.sqlMessage });
        }
        return res.json(data);
    });
});

app.get('/games/:id', (req, res) => {
    const sql = `
        SELECT 
            G.gamesID, 
            G.gameName, 
            G.gamePrice, 
            G.gameDescription, 
            G.gameImage, 
            G.gameFile,
            U.userName as publisherName, 
            GROUP_CONCAT(GT.gameType SEPARATOR ', ') as categoryNames 
        FROM games G
        LEFT JOIN usergamedevelops UGD ON G.gamesID = UGD.game
        LEFT JOIN user U ON UGD.user = U.userID
        LEFT JOIN gametypes_game GTG ON G.gamesID = GTG.game
        LEFT JOIN gametypes GT ON GTG.gameType = GT.gameTypeID
        WHERE G.gamesID = ?
        GROUP BY G.gamesID, G.gameName, G.gamePrice, G.gameDescription, G.gameImage, G.gameFile, U.userName
    `;
    
    db.query(sql, [req.params.id], (err, data) => {
        if(err) {
            console.error("SQL Hatası (Game Detail):", err); // Hatayı konsola bas
            return res.status(500).json(err);
        }
        // Eğer kayıt yoksa boş dönmesin, kontrol edelim
        if (data.length === 0) return res.status(404).json({ message: "Oyun bulunamadı" });
        
        return res.json(data[0]); 
    });
});

// --- ASSET DETAY (Workbench'teki Kanıtlanmış Sorgu) ---
app.get('/assets/:id', (req, res) => {
    const sql = `
        SELECT 
            A.assetID, 
            A.assetName, 
            A.assetPrice, 
            A.assetDescription, 
            A.assetImage, 
            A.assetFile,
            U.userName as publisherName,
            GROUP_CONCAT(AT.type SEPARATOR ', ') as typeNames 
        FROM assets A
        LEFT JOIN userassetdevelops UAD ON A.assetID = UAD.asset
        LEFT JOIN user U ON UAD.user = U.userID
        LEFT JOIN assettypes_asset ATA ON A.assetID = ATA.asset
        LEFT JOIN assettypes AT ON ATA.assetType = AT.assetTypeID
        WHERE A.assetID = ?
        GROUP BY A.assetID, A.assetName, A.assetPrice, A.assetDescription, A.assetImage, A.assetFile, U.userName
    `;
    
    db.query(sql, [req.params.id], (err, data) => {
        if(err) {
            console.error("SQL Hatası (Asset Detail):", err);
            return res.status(500).json(err);
        }
        if (data.length === 0) return res.status(404).json({ message: "Asset bulunamadı" });

        return res.json(data[0]);
    });
});
// EKLEME İŞLEMLERİ
app.post('/api/add-game', upload.fields([{ name: 'coverImage' }, { name: 'gameFile' }]), (req, res) => {
    const { gameName, gameDescription, gamePrice, gameTypes, userID } = req.body; 
    const coverImage = req.files['coverImage'] ? req.files['coverImage'][0].filename : null;
    const gameFile = req.files['gameFile'] ? req.files['gameFile'][0].filename : null;

    let typeIDs = [];
    try { typeIDs = JSON.parse(gameTypes); } catch (e) {}

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);
        const sqlGame = "INSERT INTO Games (`gameName`, `gameDescription`, `gamePrice`, `gameImage`, `gameFile`) VALUES (?)";
        db.query(sqlGame, [[gameName, gameDescription, gamePrice, coverImage, gameFile]], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({error: err.message}));
            const newID = result.insertId;
            const sqlRel = "INSERT INTO UserGameDevelops (`user`, `game`) VALUES (?, ?)";
            db.query(sqlRel, [userID, newID], (err) => {
                if (err) return db.rollback(() => res.status(500).json({error: err.message}));
                if (typeIDs.length > 0) {
                    const typeValues = typeIDs.map(id => [newID, id]); 
                    db.query("INSERT INTO gametypes_game (`game`, `gameType`) VALUES ?", [typeValues], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({error: err.message}));
                        db.commit((err) => { if(err) return db.rollback(() => res.status(500).json(err)); res.json({ status: "Success" }); });
                    });
                } else {
                    db.commit((err) => { if(err) return db.rollback(() => res.status(500).json(err)); res.json({ status: "Success" }); });
                }
            });
        });
    });
});

app.post('/api/add-asset', upload.fields([{ name: 'coverImage' }, { name: 'assetFile' }]), (req, res) => {
    const { assetName, assetDescription, assetPrice, assetTypes, userID } = req.body;
    const assetImage = req.files['coverImage'] ? req.files['coverImage'][0].filename : null;
    const assetFile = req.files['assetFile'] ? req.files['assetFile'][0].filename : null;

    let typeIDs = [];
    try { typeIDs = JSON.parse(assetTypes); } catch (e) { console.error("JSON Parse Hatası:", e); }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);
        
        const sql = "INSERT INTO Assets (`assetName`, `assetDescription`, `assetPrice`, `assetImage`, `assetFile`) VALUES (?)";
        db.query(sql, [[assetName, assetDescription, assetPrice, assetImage, assetFile]], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({error: err.message}));
            const newID = result.insertId;
            const sqlRel = "INSERT INTO UserAssetDevelops (`user`, `asset`) VALUES (?, ?)";
            db.query(sqlRel, [userID, newID], (err) => {
                if (err) return db.rollback(() => res.status(500).json({error: err.message}));
                
                if (typeIDs.length > 0) {
                    const typeValues = typeIDs.map(id => [newID, id]);
                    db.query("INSERT INTO assettypes_asset (`asset`, `assetType`) VALUES ?", [typeValues], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({error: err.message}));
                        db.commit((err) => { if(err) return db.rollback(() => res.status(500).json(err)); res.json({ status: "Success" }); });
                    });
                } else {
                    db.commit((err) => { if(err) return db.rollback(() => res.status(500).json(err)); res.json({ status: "Success" }); });
                }
            });
        });
    });
});

// AUTH
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM User WHERE (userMail = ? OR userName = ?) AND userPassword = ?", [email, email, password], (err, data) => {
        if(err) return res.status(500).json("Hata");
        if(data.length > 0) return res.json({ status: "Success", user: data[0] });
        return res.status(401).json({ status: "Error", message: "Hatalı bilgi" });
    });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    db.query("INSERT INTO User (`userName`, `userMail`, `userPassword`) VALUES (?)", [[username, email, password]], (err) => {
        if(err) return res.status(500).json({ status: "Error" });
        return res.json({ status: "Success" });
    });
});

// DASHBOARD
app.get('/api/my-games/:userID', (req, res) => {
    const sql = `SELECT Games.* FROM Games JOIN UserGameDevelops ON Games.gamesID = UserGameDevelops.game WHERE UserGameDevelops.user = ?`;
    db.query(sql, [req.params.userID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});
app.get('/api/my-assets/:userID', (req, res) => {
    const sql = `SELECT Assets.* FROM Assets JOIN UserAssetDevelops ON Assets.assetID = UserAssetDevelops.asset WHERE UserAssetDevelops.user = ?`;
    db.query(sql, [req.params.userID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});
app.get('/api/my-sales/:userID', (req, res) => {
    const sellerID = req.params.userID;
    const sql = `
        SELECT 'Game' as itemType, G.gameName as itemName, G.gamePrice as price, U.userName as buyerName, UBG.purchaseDate as saleDate FROM UserByGame UBG JOIN Games G ON UBG.game = G.gamesID JOIN UserGameDevelops UGD ON G.gamesID = UGD.game JOIN User U ON UBG.user = U.userID WHERE UGD.user = ?
        UNION ALL
        SELECT 'Asset' as itemType, A.assetName as itemName, A.assetPrice as price, U.userName as buyerName, UBA.purchaseDate as saleDate FROM UserByAsset UBA JOIN Assets A ON UBA.asset = A.assetID JOIN UserAssetDevelops UAD ON A.assetID = UAD.asset JOIN User U ON UBA.user = U.userID WHERE UAD.user = ? ORDER BY saleDate DESC`;
    db.query(sql, [sellerID, sellerID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.put('/api/update-item', (req, res) => {
    const { type, id, name, description, price } = req.body;
    let sql = type === 'Game' ? "UPDATE Games SET gameName=?, gameDescription=?, gamePrice=? WHERE gamesID=?" : "UPDATE Assets SET assetName=?, assetDescription=?, assetPrice=? WHERE assetID=?";
    db.query(sql, [name, description, price, id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

app.delete('/api/delete-item', (req, res) => {
    const { type, id } = req.body;
    db.beginTransaction((err) => {
        if(err) return res.status(500).json(err);
        if(type === 'Game') {
            db.query("DELETE FROM gametypes_game WHERE game = ?", [id], (err) => {
                if(err) return db.rollback(() => res.status(500).json(err));
                db.query("DELETE FROM UserGameDevelops WHERE game = ?", [id], (err) => {
                    if(err) return db.rollback(() => res.status(500).json(err));
                    db.query("DELETE FROM UserByGame WHERE game = ?", [id], (err) => {
                        if(err) return db.rollback(() => res.status(500).json(err));
                        db.query("DELETE FROM Games WHERE gamesID = ?", [id], (err) => {
                            if(err) return db.rollback(() => res.status(500).json(err));
                            db.commit((err) => { if(err) return db.rollback(() => res.status(500).json(err)); res.json({ status: "Success" }); });
                        });
                    });
                });
            });
        } else if (type === 'Asset') {
            db.query("DELETE FROM assettypes_asset WHERE asset = ?", [id], (err) => {
                if(err) return db.rollback(() => res.status(500).json(err));
                db.query("DELETE FROM UserAssetDevelops WHERE asset = ?", [id], (err) => {
                    if(err) return db.rollback(() => res.status(500).json(err));
                    db.query("DELETE FROM UserByAsset WHERE asset = ?", [id], (err) => {
                        if(err) return db.rollback(() => res.status(500).json(err));
                        db.query("DELETE FROM Assets WHERE assetID = ?", [id], (err) => {
                            if(err) return db.rollback(() => res.status(500).json(err));
                            db.commit((err) => { if(err) return db.rollback(() => res.status(500).json(err)); res.json({ status: "Success" }); });
                        });
                    });
                });
            });
        }
    });
});

// ==========================================
// YORUM SİSTEMİ (COMMENTS)
// ==========================================

// --- OYUN YORUMLARINI GETİR ---
app.get('/api/game-comments/:gameID', (req, res) => {
    const sql = `
        SELECT GC.*, U.userName 
        FROM GameComments GC 
        JOIN User U ON GC.userID = U.userID 
        WHERE GC.gameID = ? 
        ORDER BY GC.commentDate DESC
    `;
    db.query(sql, [req.params.gameID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- OYUNA YORUM YAP ---
app.post('/api/add-game-comment', (req, res) => {
    const { gameID, userID, commentText } = req.body;
    const sql = "INSERT INTO GameComments (gameID, userID, commentText) VALUES (?, ?, ?)";
    db.query(sql, [gameID, userID, commentText], (err, result) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success", message: "Yorum eklendi" });
    });
});

// --- ASSET YORUMLARINI GETİR ---
app.get('/api/asset-comments/:assetID', (req, res) => {
    const sql = `
        SELECT AC.*, U.userName 
        FROM AssetComments AC 
        JOIN User U ON AC.userID = U.userID 
        WHERE AC.assetID = ? 
        ORDER BY AC.commentDate DESC
    `;
    db.query(sql, [req.params.assetID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// --- ASSETE YORUM YAP ---
app.post('/api/add-asset-comment', (req, res) => {
    const { assetID, userID, commentText } = req.body;
    const sql = "INSERT INTO AssetComments (assetID, userID, commentText) VALUES (?, ?, ?)";
    db.query(sql, [assetID, userID, commentText], (err, result) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success", message: "Yorum eklendi" });
    });
});

app.post('/api/buy-game', (req, res) => {
    const { userID, gameID, price } = req.body;
    
    // userbygame tablosuna ekle (user, game, price, purchaseDate)
    const sql = "INSERT INTO userbygame (user, game, price, purchaseDate) VALUES (?, ?, ?, NOW())";
    
    db.query(sql, [userID, gameID, price], (err, result) => {
        if (err) {
            console.error("Oyun Satın Alma Hatası:", err);
            return res.status(500).json({ status: "Error", message: err.message });
        }
        return res.json({ status: "Success", message: "Oyun kütüphaneye eklendi." });
    });
});

// 2. ASSET SATIN AL / İNDİR KAYDI
app.post('/api/buy-asset', (req, res) => {
    const { userID, assetID, price } = req.body;

    // userbyasset tablosuna ekle (user, asset, price, purchaseDate)
    const sql = "INSERT INTO userbyasset (user, asset, price, purchaseDate) VALUES (?, ?, ?, NOW())";

    db.query(sql, [userID, assetID, price], (err, result) => {
        if (err) {
            console.error("Asset Satın Alma Hatası:", err);
            return res.status(500).json({ status: "Error", message: err.message });
        }
        return res.json({ status: "Success", message: "Asset kütüphaneye eklendi." });
    });
});

// ==========================================
// DASHBOARD İSTATİSTİKLERİ
// ==========================================

// 1. KULLANICININ TOPLAM İNDİRME GRAFİĞİ VERİLERİ (Günlük Bazda)
app.get('/api/dashboard-stats/:userID', (req, res) => {
    const userID = req.params.userID;
    
    // Hem oyun hem asset satışlarını tarihe göre birleştirip sayıyoruz
    const sql = `
        SELECT DATE_FORMAT(purchaseDate, '%Y-%m-%d') as saleDate, COUNT(*) as count 
        FROM (
            SELECT purchaseDate FROM userbygame UBG 
            JOIN Games G ON UBG.game = G.gamesID 
            JOIN UserGameDevelops UGD ON G.gamesID = UGD.game 
            WHERE UGD.user = ?
            UNION ALL
            SELECT purchaseDate FROM userbyasset UBA 
            JOIN Assets A ON UBA.asset = A.assetID 
            JOIN UserAssetDevelops UAD ON A.assetID = UAD.asset 
            WHERE UAD.user = ?
        ) as AllSales
        GROUP BY saleDate
        ORDER BY saleDate ASC
    `;

    db.query(sql, [userID, userID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 2. TEK BİR İÇERİĞİN DETAYLI SATIŞ LİSTESİ (Kim aldı, ne zaman aldı?)
app.get('/api/item-sales-details', (req, res) => {
    const { type, id } = req.query; // type: 'Game' veya 'Asset', id: içerik ID'si

    let sql = "";
    if (type === 'Game') {
        sql = `
            SELECT U.userName as buyerName, UBG.purchaseDate, UBG.price 
            FROM userbygame UBG
            JOIN user U ON UBG.user = U.userID
            WHERE UBG.game = ?
            ORDER BY UBG.purchaseDate DESC
        `;
    } else {
        sql = `
            SELECT U.userName as buyerName, UBA.purchaseDate, UBA.price 
            FROM userbyasset UBA
            JOIN user U ON UBA.user = U.userID
            WHERE UBA.asset = ?
            ORDER BY UBA.purchaseDate DESC
        `;
    }

    db.query(sql, [id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// ==========================================
// YENİ DASHBOARD GRAFİK VERİSİ (GARANTİ VERİ DÖNDÜRÜR)
// ==========================================
app.get('/api/publisher-total-stats/:userID', (req, res) => {
    const userID = req.params.userID;
    
    const sql = `
        SELECT 
            G.gameName as name, 
            (SELECT COUNT(*) FROM userbygame WHERE game = G.gamesID) as totalDownloads, 
            'Oyun' as type
        FROM games G
        JOIN usergamedevelops UGD ON G.gamesID = UGD.game
        WHERE UGD.user = ?
        
        UNION ALL
        
        SELECT 
            A.assetName as name, 
            (SELECT COUNT(*) FROM userbyasset WHERE asset = A.assetID) as totalDownloads, 
            'Asset' as type
        FROM assets A
        JOIN userassetdevelops UAD ON A.assetID = UAD.asset
        WHERE UAD.user = ?
    `;

    db.query(sql, [userID, userID], (err, data) => {
        if(err) {
            console.error("Grafik SQL Hatası:", err);
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

app.listen(3001, () => {
    console.log("Sunucu 3001 portunda çalışıyor...");
});