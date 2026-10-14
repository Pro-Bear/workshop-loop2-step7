// Firebase sozlamalari.
// 1) console.firebase.google.com → loyiha → Project settings → "Your apps" → Web app → firebaseConfig
//    qiymatlarini quyidagi obyektga qo'ying (bu kalitlar maxfiy emas, ular brauzerda ochiq bo'ladi).
// 2) Authentication → Sign-in method → Email/Password ni yoqing va admin foydalanuvchini qo'shing.
// 3) Firestore Database yarating va firestore.rules faylidagi qoidalarni joylang.
// Qiymatlar bo'sh qolsa, admin panel "mahalliy rejim"da ishlaydi: o'zgarishlar faqat shu brauzerda saqlanadi.

window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
