const btn = document.getElementById('hamburger');
const nav = document.getElementById('nav');

function toggleMenu(){
  const open = nav.style.display === 'grid' || nav.style.display === 'block';
  nav.style.display = open ? 'none' : 'grid';
  btn.setAttribute('aria-expanded', String(!open));
}

if (btn && nav) {
  btn.addEventListener('click', toggleMenu);
  nav.style.display = 'none';
}