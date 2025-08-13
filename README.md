# 💬 Blawgify Chat

**Magyar nyelvű webalkalmazás**, ahol minden regisztrált felhasználó cseveghet bármely más regisztrált felhasználóval valós időben.  
A projekt **React**-tel készült, a háttérben **Supabase**-szal, és **Netlify**-on van hosztolva.  
Email megerősítés szükséges a regisztrációhoz.

🔗 **Élő demo**: [https://blawgify.netlify.app/](https://blawgify.netlify.app/)

---

## ✨ Funkciók

- Regisztráció és bejelentkezés email megerősítéssel
- Minden regisztrált felhasználóval való chatelés
- Valós idejű üzenetküldés **Supabase** segítségével
- Magyar nyelvű felhasználói felület

---

## 🛠️ Technológiai stack

- **Frontend**: React
- **Backend és adatbázis**: Supabase (PostgreSQL + valós idejű csatornák)
- **Hosztolás**: Netlify
- **Hitelesítés**: Supabase Auth (email alapú)

---

## 📦 Telepítés és futtatás

1. **Klónozd a repót:**
   ```bash
   git clone https://github.com/oacmut/chat-webapp.git
   cd chat-webapp
   ```
2. **Telepítsd a függőségeket:**
   ```bash
   npm install
   ```
3. **Hozz létre `.env` fájlt** a projekt gyökerében:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Indítsd el fejlesztői módban:**
   ```bash
   npm run dev
   ```
5. **Nyisd meg** a böngészőben:  
   [http://localhost:3000](http://localhost:3000)

---

## 🌍 English version

**Hungarian language web application** where every registered user can chat with any other registered user in real time.  
Built with **React**, powered by **Supabase**, and hosted on **Netlify**.  
Email verification is required upon registration.

🔗 **Live demo**: [https://blawgify.netlify.app/](https://blawgify.netlify.app/)

### ✨ Features
- Registration & login with email verification  
- Chat with any registered user  
- Real-time messaging with **Supabase**  
- Hungarian language UI  

### 🛠️ Tech stack
- **Frontend**: React  
- **Backend & Database**: Supabase (PostgreSQL + real-time channels)  
- **Hosting**: Netlify  
- **Authentication**: Supabase Auth (email-based)  

### 📦 Installation
```bash
git clone https://github.com/oacmut/chat-webapp.git
cd chat-webapp
npm install
```
Create a `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run in dev mode:
```bash
npm run dev
```

---

💡 **Note:** Supabase keys in the `.env` file must be set correctly for the app to connect to the database.
