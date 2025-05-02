    document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const agreed = document.getElementById('agreeCheckbox').checked;
  
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, agreed })
    });
  
    const data = await res.json();
    document.getElementById('message').textContent = data.message;
  });
  
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
  
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    document.getElementById('message').textContent = data.message;
  });
  


  let currentUser = null;

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
  
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    document.getElementById('message').textContent = data.message;
  
    if (res.ok) {
      currentUser = username;
      document.getElementById('noteSection').style.display = 'block';
      loadNotes();
    }
  });
  
  document.getElementById('noteForm').addEventListener('submit', async e => {
    e.preventDefault();
  
    const title = document.getElementById('noteTitle').value;
    const text = document.getElementById('noteText').value;
  
    const res = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, title, text })
    });
  
    const data = await res.json();
    if (res.ok) {
      loadNotes();
      document.getElementById('noteForm').reset();
    }
  
    document.getElementById('message').textContent = data.message;
  });
  
  async function loadNotes() {
    const res = await fetch(`/notes/${currentUser}`);
    const notes = await res.json();
  
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';
  
    notes.forEach(note => {
      const noteEl = document.createElement('div');
      noteEl.innerHTML = `
        <h4>${note.title}</h4>
        <small>${new Date(note.date).toLocaleString()}</small>
        <p>${note.text}</p>
        <hr>
      `;
      container.appendChild(noteEl);
    });
  }
  