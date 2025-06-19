function randomPing() {
    const radar = document.querySelector('.radar-container');
    const ping = document.createElement('div');
    ping.className = 'ping';

    const x = Math.random() * 100;
    const y = Math.random() * 100;

    ping.style.left = `calc(${x}% - 4px)`;
    ping.style.top = `calc(${y}% - 4px)`;

    radar.appendChild(ping);

    setTimeout(() => ping.remove(), 4000);
}

// Simulate chat pings every 1s
setInterval(randomPing, 1000);