function toggleMenu() {
    const menu = document.getElementById('menu');
    // menu.classList.toggle('active');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    
    document.getElementById('hamburger').classList.toggle('active');
}