// Firebase sozlamalari.
// 1) console.firebase.google.com → loyiha → Project settings → "Your apps" → Web app → firebaseConfig
//    qiymatlarini quyidagi obyektga qo'ying (bu kalitlar maxfiy emas, ular brauzerda ochiq bo'ladi).
// 2) Authentication → Sign-in method → Email/Password ni yoqing va admin foydalanuvchini qo'shing.
// 3) Firestore Database yarating va firestore.rules faylidagi qoidalarni joylang.
// Qiymatlar bo'sh qolsa, admin panel "mahalliy rejim"da ishlaydi: o'zgarishlar faqat shu brauzerda saqlanadi.

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCP7Nt9wOBRGY5krAhgtIGTB1tn_HInmaE",
  authDomain: "ustoz-ai-zamonaviy-kasblar.firebaseapp.com",
  databaseURL: "https://ustoz-ai-zamonaviy-kasblar-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ustoz-ai-zamonaviy-kasblar",
  storageBucket: "ustoz-ai-zamonaviy-kasblar.firebasestorage.app",
  messagingSenderId: "964614884162",
  appId: "1:964614884162:web:5bce7be3779d87527196db",
  measurementId: "G-DL9LK6Y0KM"
};
