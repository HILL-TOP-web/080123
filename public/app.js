document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Mine SKD</h1>
    <button id="mineBtn">Mine</button>
    <div id="status"></div>
    <h2>Leaderboard</h2>
    <ul id="leaderboard"></ul>
  `;

  const statusEl = document.getElementById('status');
  const leaderboardEl = document.getElementById('leaderboard');
  const username = 'David123'; // Hardcoded username

  async function refreshLeaderboard() {
    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      leaderboardEl.innerHTML = '';
      users.forEach(u => {
        const li = document.createElement('li');
        li.textContent = `${u.username}: ${u.balance} SKD`;
        leaderboardEl.appendChild(li);
      });
    } catch {
      leaderboardEl.textContent = 'Failed to load leaderboard';
    }
  }

  document.getElementById('mineBtn').addEventListener('click', async () => {
    try {
      const res = await fetch(`/mine/${username}`, { method: 'POST' });
      const data = await res.json();
      statusEl.textContent = data.balance ? `Balance: ${data.balance}` : data.error;
      refreshLeaderboard(); // update leaderboard after mining
    } catch (err) {
      statusEl.textContent = 'Error connecting to server';
    }
  });

  // Refresh leaderboard every 5 seconds automatically
  setInterval(refreshLeaderboard, 5000);
  refreshLeaderboard(); // initial load
});
