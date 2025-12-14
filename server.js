import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "super_secret_junior_key";

// JWT Login
app.post('/api/login', (req, res) => {
    const token = jwt.sign({}, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Luhn kontrolü
function luhnCheck(card) {
    card = card.replace(/\s+/g,'');
    let sum = 0, alt = false;
    for(let i=card.length-1;i>=0;i--){
        let n=parseInt(card[i]);
        if(alt){ n*=2; if(n>9)n-=9; }
        sum+=n; alt=!alt;
    }
    return sum%10===0;
}

// Kart algılama
function detectCard(card){
    if(card.startsWith("4")) return "VISA";
    if(card.startsWith("5")) return "MASTERCARD";
    if(card.startsWith("3")) return "AMEX";
    return "UNKNOWN";
}

// Payment sandbox
app.post('/api/pay', (req, res) => {
    const { cardNumber } = req.body;
    if(!luhnCheck(cardNumber)) return res.status(400).json({status:"INVALID_CARD"});
    const brand = detectCard(cardNumber);
    res.json({status:"3D_SECURE_REQUIRED", brand, redirectUrl:"/3d-secure.html"});
});

// 3D Secure callback
app.post('/api/3d-callback', (req, res) => {
    const { success } = req.body;
    if(success) res.json({status:"PAYMENT_SUCCESS"});
    else res.status(400).json({status:"PAYMENT_FAILED"});
});

app.listen(8080, () => console.log("Server running on http://localhost:8080"));
