const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = 'users.json';

// Načte nebo vytvoří users.json
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/register', async (req, res) => {
  const { username, password, agreed } = req.body;

  if (!username || !password || !agreed) {
    return res.status(400).json({ message: 'Všechna pole jsou povinná a souhlas je nutný.' });
  }

  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'Uživatel již existuje.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  saveUsers(users);

  res.json({ message: 'Registrace proběhla úspěšně.' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Nesprávné přihlašovací údaje.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Nesprávné přihlašovací údaje.' });

  res.json({ message: `Vítejte, ${username}!` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
