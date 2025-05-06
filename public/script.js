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
  
  let showOnlyImportant = false;


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
      document.getElementById('currentUserName').textContent = currentUser;
      document.getElementById('noteSection').style.display = 'block';
      loadNotes();
    }
  });

  document.getElementById('deleteAccount').addEventListener('click', async () => {
    const confirmUsername = prompt('Pro potvrzení smažte účet zadáním svého uživatelského jména:');
    if (!confirmUsername || confirmUsername !== currentUser) {
      alert('Jméno nesouhlasí. Účet nebyl smazán.');
      return;
    }
  
    if (!confirm('Opravdu chcete smazat svůj účet včetně všech poznámek?')) return;
  
    const res = await fetch(`/delete-user/${currentUser}`, {
      method: 'DELETE'
    });
  
    const data = await res.json();
    alert(data.message);
  
    if (res.ok) {
      currentUser = null;
      document.getElementById('noteSection').style.display = 'none';
      document.getElementById('message').textContent = '';
      document.getElementById('currentUserName').textContent = '';
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
  
    // Filtrování
    const filtered = showOnlyImportant ? notes.filter(n => n.important) : notes;
  
    filtered.forEach(note => {
      const noteEl = document.createElement('div');
      noteEl.style.border = '1px solid #ccc';
      noteEl.style.padding = '10px';
      noteEl.style.margin = '10px 0';
      if (note.important) noteEl.style.backgroundColor = '#fff7cc';
  
      noteEl.innerHTML = `
        <h4>${note.title}</h4>
        <small>${new Date(note.date).toLocaleString()}</small><br>
        <p>${note.text}</p>
        <label>
          <input type="checkbox" ${note.important ? 'checked' : ''}>
          Důležité
        </label>
        <button class="delete-btn">Smazat</button>
      `;
  
      const checkbox = noteEl.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', async () => {
        await fetch('/notes/important', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser,
            timestamp: note.date,
            important: checkbox.checked
          })
        });
        loadNotes();
      });
  
      const deleteBtn = noteEl.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        await fetch(`/notes/${currentUser}/${note.date}`, { method: 'DELETE' });
        loadNotes();
      });
  
      container.appendChild(noteEl);
    });
  }

  document.getElementById('showAll').addEventListener('click', () => {
    showOnlyImportant = false;
    loadNotes();
  });
  
  document.getElementById('showImportant').addEventListener('click', () => {
    showOnlyImportant = true;
    loadNotes();
  });
  
  
  
  