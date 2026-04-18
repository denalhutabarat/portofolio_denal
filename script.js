// Toggle class active untuk hamburger menu
const navbarNav = document.querySelector('.navbar-nav');
// ketika hamburger menu di klik
document.querySelector('#hamburger-menu').onclick = (e) => {
  navbarNav.classList.toggle('active');
  e.preventDefault(); // Mencegah loncat ke atas saat klik #
};

// Klik di luar elemen
const hm = document.querySelector('#hamburger-menu');

document.addEventListener('click', function (e) {
  if (!hm.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove('active');
  }
});

document.querySelectorAll('.navbar-nav a').forEach(link => {
  link.onclick = () => {
    navbarNav.classList.remove('active');
  };
});

// Memastikan seluruh dokumen HTML sudah dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', () => {
    
    // Fungsi untuk membuka halaman baru
    window.openPage = function(name) {
        const mainPage = document.getElementById('main-page');
        const newPage = document.getElementById('new-page');
        const targetName = document.getElementById('target-name');
        const pageTitle = document.getElementById('page-title');

        if (mainPage && newPage) {
            mainPage.classList.add('hidden');
            newPage.classList.remove('hidden');
            
            // Update konten teks
            if(pageTitle) pageTitle.innerText = name;
            if(targetName) targetName.innerText = name;
            
            // Scroll ke atas otomatis
            window.scrollTo(0, 0);
        }
    };

    // Fungsi untuk kembali ke menu utama
    window.goBack = function() {
        const mainPage = document.getElementById('main-page');
        const newPage = document.getElementById('new-page');

        if (mainPage && newPage) {
            newPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
        }
    };
});