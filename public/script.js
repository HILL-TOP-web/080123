// Example: simple alert for buttons
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`You clicked: ${btn.textContent}`);
    });
  });

  // Example: simple navigation highlight
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.fontWeight = 'bold';
      link.style.textDecoration = 'underline';
    }
  });
});
