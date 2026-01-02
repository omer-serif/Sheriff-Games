const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Uploads klasörünü statik yap (Resimler buradan sunulur)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. VERİTABANI
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'berkay4115',
    database: 'SheriffGames'
});

db.connect((err) => {
    if (err) console.error('HATA: Veritabanına bağlanılamadı!', err);
    else console.log('BAŞARILI: MySQL Veritabanına bağlandı!');
});

// 2. MULTER (Resim Yükleme)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

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

// Listeler
app.get('/games', (req, res) => {
    db.query("SELECT * FROM Games", (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});
app.get('/assets', (req, res) => {
    db.query("SELECT Assets.*, AssetTypes.type as typeName FROM Assets JOIN AssetTypes ON Assets.assetType = AssetTypes.assetTypeID", (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
});

// Detaylar
app.get('/games/:id', (req, res) => {
    db.query("SELECT * FROM Games WHERE gamesID = ?", [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data[0]);
    });
});
app.get('/assets/:id', (req, res) => {
    db.query("SELECT Assets.*, AssetTypes.type as typeName FROM Assets JOIN AssetTypes ON Assets.assetType = AssetTypes.assetTypeID WHERE assetID = ?", [req.params.id], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data[0]);
    });
});

// 4. EKLEME İŞLEMLERİ (Transaction)
app.post('/api/add-game', upload.fields([{ name: 'coverImage' }, { name: 'gameFile' }]), (req, res) => {
    const { gameName, gameDescription, gamePrice, category, userID } = req.body;
    const coverImage = req.files['coverImage'] ? req.files['coverImage'][0].filename : null;
    const gameFile = req.files['gameFile'] ? req.files['gameFile'][0].filename : null;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);
        const sqlGame = "INSERT INTO Games (`gameName`, `gameDescription`, `gamePrice`, `gameImage`, `gameFile`, `category`) VALUES (?)";
        const values = [gameName, gameDescription, gamePrice, coverImage, gameFile, category];
        
        db.query(sqlGame, [values], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            const newID = result.insertId;
            const sqlRel = "INSERT INTO UserGameDevelops (`user`, `game`, `publicationDate`) VALUES (?, ?, NOW())";
            
            db.query(sqlRel, [userID, newID], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));
                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    res.json({ status: "Success", message: "Oyun yüklendi!" });
                });
            });
        });
    });
});

app.post('/api/add-asset', upload.fields([{ name: 'coverImage' }, { name: 'assetFile' }]), (req, res) => {
    const { assetName, assetDescription, assetPrice, assetType, userID } = req.body;
    const assetImage = req.files['coverImage'] ? req.files['coverImage'][0].filename : null;
    const assetFile = req.files['assetFile'] ? req.files['assetFile'][0].filename : null;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json(err);
        const sqlAsset = "INSERT INTO Assets (`assetName`, `assetDescription`, `assetPrice`, `assetType`, `assetImage`, `assetFile`) VALUES (?)";
        const values = [assetName, assetDescription, assetPrice, assetType, assetImage, assetFile];

        db.query(sqlAsset, [values], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            const newID = result.insertId;
            const sqlRel = "INSERT INTO UserAssetDevelops (`user`, `asset`, `publicationDate`) VALUES (?, ?, NOW())";

            db.query(sqlRel, [userID, newID], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));
                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    res.json({ status: "Success", message: "Asset yüklendi!" });
                });
            });
        });
    });
});

// 5. AUTH
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM User WHERE (userMail = ? OR userName = ?) AND userPassword = ?";
    db.query(sql, [email, email, password], (err, data) => {
        if(err) return res.status(500).json("Hata");
        if(data.length > 0) return res.json({ status: "Success", user: data[0] });
        return res.status(401).json({ status: "Error", message: "Hatalı bilgi" });
    });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO User (`userName`, `userMail`, `userPassword`) VALUES (?)";
    db.query(sql, [[username, email, password]], (err) => {
        if(err) return res.status(500).json({ status: "Error" });
        return res.json({ status: "Success" });
    });
});

// 6. DASHBOARD VERİLERİ
app.get('/api/my-games/:userID', (req, res) => {
    const sql = `SELECT Games.* FROM Games JOIN UserGameDevelops ON Games.gamesID = UserGameDevelops.game WHERE UserGameDevelops.user = ?`;
    db.query(sql, [req.params.userID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.get('/api/my-assets/:userID', (req, res) => {
    const sql = `SELECT Assets.*, AssetTypes.type as typeName FROM Assets JOIN UserAssetDevelops ON Assets.assetID = UserAssetDevelops.asset JOIN AssetTypes ON Assets.assetType = AssetTypes.assetTypeID WHERE UserAssetDevelops.user = ?`;
    db.query(sql, [req.params.userID], (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.get('/api/my-sales/:userID', (req, res) => {
    const sellerID = req.params.userID;
    const sql = `
        SELECT 'Game' as itemType, G.gameName as itemName, G.gamePrice as price, U.userName as buyerName, UBG.purchaseDate as saleDate 
        FROM UserByGame UBG JOIN Games G ON UBG.game = G.gamesID JOIN UserGameDevelops UGD ON G.gamesID = UGD.game JOIN User U ON UBG.user = U.userID WHERE UGD.user = ?
        UNION ALL
        SELECT 'Asset' as itemType, A.assetName as itemName, A.assetPrice as price, U.userName as buyerName, UBA.purchaseDate as saleDate
        FROM UserByAsset UBA JOIN Assets A ON UBA.asset = A.assetID JOIN UserAssetDevelops UAD ON A.assetID = UAD.asset JOIN User U ON UBA.user = U.userID WHERE UAD.user = ?
        ORDER BY saleDate DESC`;
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

// 7. SİLME İŞLEMİ (404 HATASINI ÇÖZEN KISIM BURASI)
app.delete('/api/delete-item', (req, res) => {
    const { type, id } = req.body;
    
    db.beginTransaction((err) => {
        if(err) return res.status(500).json(err);

        if(type === 'Game') {
            const sqlDev = "DELETE FROM UserGameDevelops WHERE game = ?";
            const sqlBuy = "DELETE FROM UserByGame WHERE game = ?";
            const sqlGame = "DELETE FROM Games WHERE gamesID = ?";
            
            db.query(sqlDev, [id], (err) => {
                if(err) return db.rollback(() => res.status(500).json(err));
                db.query(sqlBuy, [id], (err) => {
                    if(err) return db.rollback(() => res.status(500).json(err));
                    db.query(sqlGame, [id], (err) => {
                        if(err) return db.rollback(() => res.status(500).json(err));
                        db.commit((err) => {
                            if(err) return db.rollback(() => res.status(500).json(err));
                            res.json({ status: "Success" });
                        });
                    });
                });
            });
        } else if (type === 'Asset') {
            const sqlDev = "DELETE FROM UserAssetDevelops WHERE asset = ?";
            const sqlBuy = "DELETE FROM UserByAsset WHERE asset = ?";
            const sqlAsset = "DELETE FROM Assets WHERE assetID = ?";

            db.query(sqlDev, [id], (err) => {
                if(err) return db.rollback(() => res.status(500).json(err));
                db.query(sqlBuy, [id], (err) => {
                    if(err) return db.rollback(() => res.status(500).json(err));
                    db.query(sqlAsset, [id], (err) => {
                        if(err) return db.rollback(() => res.status(500).json(err));
                        db.commit((err) => {
                            if(err) return db.rollback(() => res.status(500).json(err));
                            res.json({ status: "Success" });
                        });
                    });
                });
            });
        }
    });
});

app.listen(3001, () => {
    console.log("Sunucu 3001 portunda çalışıyor...");
});