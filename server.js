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

app.post('/notes', (req, res) => {
    const { username, title, text } = req.body;
  
    if (!username || !title || !text) {
      return res.status(400).json({ message: 'Chybí údaje.' });
    }
  
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen.' });
  
    if (!user.notes) user.notes = [];
  
    const newNote = {
      title,
      text,
      date: new Date().toISOString()
    };
  
    user.notes.unshift(newNote); // Přidat poznámku na začátek (nejnovější první)
    saveUsers(users);
  
    res.json({ message: 'Poznámka uložena.', note: newNote });
});
  
app.get('/notes/:username', (req, res) => {
    const users = loadUsers();
    const user = users.find(u => u.username === req.params.username);
    if (!user || !user.notes) return res.json([]);
  
    res.json(user.notes);
});

app.delete('/delete-user/:username', (req, res) => {
  const username = req.params.username;
  const users = loadUsers();
  const filtered = users.filter(u => u.username !== username);

  if (users.length === filtered.length) {
    return res.status(404).json({ message: 'Uživatel nenalezen.' });
  }

  saveUsers(filtered);
  res.json({ message: 'Uživatel a jeho poznámky byly smazány.' });
});


app.delete('/notes/:username/:timestamp', (req, res) => {
    const { username, timestamp } = req.params;
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen.' });
  
    user.notes = user.notes?.filter(note => note.date !== timestamp) || [];
    saveUsers(users);
  
    res.json({ message: 'Poznámka smazána.' });
  });

  app.put('/notes/important', (req, res) => {
    const { username, timestamp, important } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ message: 'Uživatel nenalezen.' });
  
    const note = user.notes?.find(note => note.date === timestamp);
    if (!note) return res.status(404).json({ message: 'Poznámka nenalezena.' });
  
    note.important = important;
    saveUsers(users);
  
    res.json({ message: 'Poznámka aktualizována.' });
  });
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});

