document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Mine SKD</h1>
    <input id="username" placeholder="Enter username">
    <button id="mineBtn">Mine</button>
    <div id="status"></div>
  `;

  document.getElementById('mineBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert("Enter a username");

    try {
      const res = await fetch(`/mine/${username}`, { method: 'POST' });
      const data = await res.json();
      document.getElementById('status').textContent = data.balance ? `Balance: ${data.balance}` : data.error;
    } catch (err) {
      document.getElementById('status').textContent = 'Error connecting to server';
    }
  });
});
