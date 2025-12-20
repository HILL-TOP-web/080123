document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Mine SKD</h1>
    <button id="mineBtn">Mine</button>
    <div id="status"></div>
    <h2>Global Balance</h2>
    <div id="balance"></div>
  `;

  const statusEl = document.getElementById('status');
  const balanceEl = document.getElementById('balance');

  async function refreshBalance() {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      balanceEl.textContent = `${data.balance} SKD`;
    } catch {
      balanceEl.textContent = 'Failed to load balance';
    }
  }

  document.getElementById('mineBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('/mine', { method: 'POST' });
      const data = await res.json();
      statusEl.textContent = data.message;
      refreshBalance();
    } catch (err) {
      statusEl.textContent = 'Error connecting to server';
    }
  });

  // Refresh balance every 5 seconds automatically
  setInterval(refreshBalance, 5000);
  refreshBalance(); // initial load
});
