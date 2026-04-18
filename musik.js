// musik.js
const music = document.getElementById('bgMusic');
const musicMenu = document.getElementById('musicMenu');

const playlist = [
    { title: "Ada Untukmu", src: "public/musik/Ada Untukmu.mp3" }, // Diperbaiki: Untumu -> Untukmu
    { title: "Bersamamu", src: "public/musik/Bersamamu.mp3" },
    { title: "Mantra", src: "public/musik/Mantra.mp3" },
    { title: "Kota Ini Tak Sama Tanpamu", src: "public/musik/Kota.mp3" }
];

let currentTrackIndex = 0;
let isPlaying = false;

export function toggleMusicMenu() {
    musicMenu.classList.toggle('active');
}

export function startAutoPlaylist() {
    if (!isPlaying) {
        playTrack(0);
        isPlaying = true;
    }
}

export function playSong(title, url) {
    music.src = url;
    music.play().catch(err => console.log("Interaksi diperlukan"));
    isPlaying = true;
    musicMenu.classList.remove('active');
    showToast(title);
}

function playTrack(index) {
    if (index >= playlist.length) index = 0;
    currentTrackIndex = index;
    
    music.src = playlist[index].src;
    
    music.play().catch(err => {
        console.error("Gagal memutar musik: ", err);
    });

    showToast(playlist[index].title);
}

function showToast(title) {
    const toast = document.getElementById('music-toast');
    const titleEl = document.getElementById('track-title');
    if (toast && titleEl) {
        titleEl.innerText = "Memutar: " + title;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
}

music.onended = () => {
    currentTrackIndex++;
    playTrack(currentTrackIndex);
};

export function stopMusic() {
    music.pause();
    music.currentTime = 0;
    isPlaying = false;
    musicMenu.classList.remove('active');
}