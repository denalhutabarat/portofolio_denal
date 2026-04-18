// Konfigurasi Link Pembayaran Pakasir
const PAKASIR_USERNAME = "Denal"; // Username sesuai request Anda

let selectedAmount = 0;

function selectNominal(amount) {
    selectedAmount = amount;
    // Reset style semua tombol nominal
    document.querySelectorAll('.btn-nominal').forEach(btn => {
        btn.style.background = "white";
        btn.style.color = "#555";
    });
    // Highlight tombol yang dipilih
    if (event) {
        event.target.style.background = "#3498db";
        event.target.style.color = "white";
    }
    // Kosongkan input custom
    document.getElementById('custom-nominal').value = "";
}

function processPayment() {
    let customValue = document.getElementById('custom-nominal').value;
    let finalAmount = customValue ? parseInt(customValue) : selectedAmount;

    if (!finalAmount || finalAmount < 5000) {
        alert("Masukkan nominal minimal Rp 5000");
        return;
    }

    const orderId = "NAL-" + Date.now();
    const btnPay = document.querySelector('.btn-pay');
    
    btnPay.innerText = "Mengalihkan...";
    btnPay.disabled = true;

    // Membentuk link pembayaran sesuai format yang Anda minta
    const payLink = `https://app.pakasir.com/pay/${PAKASIR_USERNAME}/${finalAmount}?order_id=${orderId}`;

    // Langsung arahkan ke halaman pembayaran
    window.location.href = payLink;
}

// Pastikan fungsi bisa diakses oleh tombol HTML
window.selectNominal = selectNominal;
window.processPayment = processPayment;