// block.js
let blockInterval;
let animationFrame;
let currentSpeed = 800; // Kecepatan awal (ms)

async function saveScore(score, game) {
    if (!window.PLAYER_NAME) return;

    const url = "https://edhdqozlowmybmmtaqng.supabase.co/rest/v1/scores";
    const key = "sb_publishable_ZjVEIJNRJ7Iw8IvHRvqv6w_udas_hdP";

    try {
        // cek data user + game
        const res = await fetch(`${url}?player_name=eq.${window.PLAYER_NAME}&game_type=eq.${game}`, {
            headers: {
                apikey: key,
                Authorization: `Bearer ${key}`
            }
        });

        const data = await res.json();

        if (data.length > 0) {
            // update kalau skor lebih tinggi
            if (score > data[0].score) {
                await fetch(`${url}?id=eq.${data[0].id}`, {
                    method: "PATCH",
                    headers: {
                        apikey: key,
                        Authorization: `Bearer ${key}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ score })
                });
            }
        } else {
            // insert baru
            await fetch(url, {
                method: "POST",
                headers: {
                    apikey: key,
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    player_name: window.PLAYER_NAME,
                    score,
                    game_type: game
                })
            });
        }

    } catch (err) {
        console.error("DB ERROR:", err);
    }
}

export function initBlockGame() {
    const canvas = document.getElementById("mainCanvas");
    const ctx = canvas.getContext("2d");
    const ROWS = 15; const COLS = 10; const SQ = 25;
    canvas.width = COLS * SQ; canvas.height = ROWS * SQ;

    let score = 0;
    let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    const PIECES = [
        [[[1, 1, 1], [1, 1, 1], [1, 1, 1]], "#FF5733"], // Kotak 3x3
        [[[1, 1], [1, 1]], "#F1C40F"],                // Kotak 2x2
        [[[1, 0], [1, 0], [1, 1]], "#3498DB"],          // L Tegak
        [[[0, 1], [0, 1], [1, 1]], "#E67E22"],          // J (L Kebalik)
        [[[1, 1, 1, 1]], "#1ABC9C"],                    // I Panjang
        [[[0, 1, 0], [1, 1, 1]], "#9B59B6"]             // T
    ];

    function randomPiece() {
        const r = Math.floor(Math.random() * PIECES.length);
        const [shape, color] = PIECES[r];
        return {
            shape: shape,
            color: color,
            x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };
    }

    let p = randomPiece();

    function updateScoreUI() {
        const scoreEl = document.getElementById('current-score');
        const highEl = document.getElementById('high-score');
        const high = localStorage.getItem('block_high') || 0;
        if (scoreEl) scoreEl.innerText = score;
        if (highEl) highEl.innerText = high;
    }

    function checkLines() {
        let linesCleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every(cell => cell !== null)) {
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(null));
                score += 100;
                linesCleared++;
                r++;
            }
        }
        if (linesCleared > 0) {
            const high = localStorage.getItem('block_high') || 0;
            if (score > parseInt(high)) {
                localStorage.setItem('block_high', score);
            }
            updateScoreUI();
            updateDifficulty(); // Cek apakah harus tambah cepat
        }
    }

    // Fungsi untuk menambah kecepatan setiap skor naik
    function updateDifficulty() {
        let newSpeed = Math.max(200, 800 - Math.floor(score / 500) * 100);
        if (newSpeed !== currentSpeed) {
            currentSpeed = newSpeed;
            clearInterval(blockInterval);
            blockInterval = setInterval(drop, currentSpeed);
        }
    }

    function drawSquare(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
    }

    function collision(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                let newX = x + c;
                let newY = y + r;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                if (newY >= 0 && board[newY][newX]) return true;
            }
        }
        return false;
    }

    // RESET OTOMATIS TANPA NOTIFIKASI/ALERT
    function autoReset() {
        saveScore(score, "block"); // 🔥 KIRIM SCORE
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        score = 0;
        currentSpeed = 800; // Reset kecepatan juga
        updateScoreUI();
        p = randomPiece();
        // Reset interval agar kecepatan kembali normal
        clearInterval(blockInterval);
        blockInterval = setInterval(drop, currentSpeed);
    }

    function lock() {
        let hitTop = false;
        p.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    if (p.y + r <= 0) {
                        hitTop = true;
                    } else {
                        board[p.y + r][p.x + c] = p.color;
                    }
                }
            });
        });

        if (hitTop) {
            autoReset(); // Langsung panggil reset tanpa alert
        } else {
            checkLines();
            p = randomPiece();
        }
    }

    function drop() {
        if (!collision(p.x, p.y + 1, p.shape)) {
            p.y++;
        } else {
            lock();
        }
    }

    document.onkeydown = (e) => {
        if (e.key === "ArrowLeft") moveB('L');
        if (e.key === "ArrowRight") moveB('R');
        if (e.key === "ArrowDown") moveB('D');
    };

    window.moveB = (dir) => {
        if (dir === 'L' && !collision(p.x - 1, p.y, p.shape)) p.x--;
        if (dir === 'R' && !collision(p.x + 1, p.y, p.shape)) p.x++;
        if (dir === 'D') drop();
    };

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        board.forEach((row, r) => {
            row.forEach((cell, c) => {
                drawSquare(c, r, cell || "#111");
            });
        });
        p.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) drawSquare(p.x + c, p.y + r, p.color);
            });
        });
        animationFrame = requestAnimationFrame(render);
    }

    if (blockInterval) clearInterval(blockInterval);
    if (animationFrame) cancelAnimationFrame(animationFrame);

    currentSpeed = 800;
    blockInterval = setInterval(drop, currentSpeed);
    updateScoreUI();
    render();
}