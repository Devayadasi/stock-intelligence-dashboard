let mainChart;


// INITIAL LOAD
window.onload = () => {

    initChart();

    loadStockData(
        'TCS',
        document.querySelector('.selector-btn')
    );

    setupSearch();
    setupNotifications();
    setupSettings();
    setupAnalytics();
    setupProfile();
    setupTradeButton();
};


// CHART
function initChart() {

    const ctx =
        document.getElementById('mainChart')
        .getContext('2d');

    mainChart = new Chart(ctx, {

        type: 'line',

        data: {

            labels: [],

            datasets: [
                {
                    label: 'Close Price',

                    data: [],

                    borderColor: '#3b82f6',

                    backgroundColor:
                        'rgba(59,130,246,0.2)',

                    fill: true,

                    tension: 0.4,

                    borderWidth: 3
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false
        }
    });
}


// LOAD STOCK
async function loadStockData(symbol, element) {

    showLoader(true);

    document.querySelectorAll('.selector-btn')
        .forEach(btn => {
            btn.classList.remove('active');
        });

    element.classList.add('active');

    document.getElementById(
        'active-symbol'
    ).innerText = symbol;

    try {

        // DATA API
        const response = await fetch(
            `http://127.0.0.1:8000/data/${symbol}`
        );

        const data = await response.json();

        // SUMMARY API
        const summaryResponse = await fetch(
            `http://127.0.0.1:8000/summary/${symbol}`
        );

        const summary =
            await summaryResponse.json();

        updateUI(data, summary);

    } catch (error) {

        console.log(error);

        alert('API Error');
    }

    showLoader(false);
}


// UPDATE UI
function updateUI(data, summary) {

    const labels =
        data.map(item => item.Date);

    const prices =
        data.map(item => item.Close);

    const latest =
        data[data.length - 1];

    // Cards

    document.getElementById(
        'current-price'
    ).innerText =
        `₹${latest.Close.toFixed(2)}`;

    document.getElementById(
        'stock-volume'
    ).innerText =
        latest.Volume.toLocaleString();

    document.getElementById(
        'high-52'
    ).innerText =
        `₹${summary["52_week_high"]}`;

    document.getElementById(
        'low-52'
    ).innerText =
        `₹${summary["52_week_low"]}`;

    // Return %

    const returnPercent =
        (latest.Daily_Return * 100)
        .toFixed(2);

    const priceChange =
        document.getElementById(
            'price-change'
        );

    priceChange.innerText =
        `${returnPercent}%`;

    if (returnPercent >= 0) {

        priceChange.style.color =
            '#10b981';

    } else {

        priceChange.style.color =
            '#ef4444';
    }

    // Chart

    mainChart.data.labels =
        labels;

    mainChart.data.datasets[0].data =
        prices;

    mainChart.update();
}


// SEARCH
function setupSearch() {

    const searchInput =
        document.getElementById(
            'search-input'
        );

    searchInput.addEventListener(
        'input',

        () => {

            const value =
                searchInput.value
                .toLowerCase();

            document
                .querySelectorAll(
                    '.selector-btn'
                )

                .forEach(btn => {

                    btn.style.display =

                        btn.innerText
                        .toLowerCase()
                        .includes(value)

                        ? 'inline-block'
                        : 'none';
                });
        }
    );
}


// NOTIFICATIONS
function setupNotifications() {

    document.getElementById(
        'notification-btn'
    )

    .addEventListener('click', () => {

        document.getElementById(
            'notification-panel'
        )

        .classList.toggle('hidden');
    });
}


// SETTINGS
function setupSettings() {

    document.getElementById(
        'settings-btn'
    )

    .addEventListener('click', () => {

        document.getElementById(
            'settings-modal'
        )

        .classList.remove('hidden');
    });
}


// ANALYTICS
function setupAnalytics() {

    document.getElementById(
        'analytics-btn'
    )

    .addEventListener('click', () => {

        document.getElementById(
            'analytics-modal'
        )

        .classList.remove('hidden');
    });
}


// PROFILE
function setupProfile() {

    document.getElementById(
        'profile-btn'
    )

    .addEventListener('click', () => {

        document.getElementById(
            'profile-modal'
        )

        .classList.remove('hidden');
    });
}


// SAVE PROFILE
function saveProfile() {

    const name =
        document.getElementById(
            'edit-name'
        ).value;

    const role =
        document.getElementById(
            'edit-role'
        ).value;

    if (name !== '') {

        document.getElementById(
            'profile-name'
        ).innerText = name;
    }

    if (role !== '') {

        document.getElementById(
            'profile-role'
        ).innerText = role;
    }

    document.getElementById(
        'profile-modal'
    ).classList.add('hidden');
}


// TRADE BUTTON
function setupTradeButton() {

    document.getElementById(
        'trade-btn'
    )

    .addEventListener('click', () => {

        window.open(
            'https://zerodha.com',
            '_blank'
        );
    });
}


// COMPARE
async function compareStocks() {

    const symbol1 =
        document.getElementById(
            'active-symbol'
        ).innerText;

    const symbol2 =
        document.getElementById(
            'compare-select'
        ).value;

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/compare?symbol1=${symbol1}&symbol2=${symbol2}`
        );

        const result =
            await response.json();

        alert(
            JSON.stringify(
                result,
                null,
                2
            )
        );

    } catch (error) {

        console.log(error);

        alert('Compare failed');
    }
}


// THEME
function toggleTheme() {

    document.body
        .classList
        .toggle('light-theme');
}


// CLOSE MODAL
window.onclick = (e) => {

    if (
        e.target.classList.contains(
            'modal'
        )
    ) {

        e.target.classList.add(
            'hidden'
        );
    }
};


// LOADER
function showLoader(show) {

    const loader =
        document.getElementById(
            'loader'
        );

    if (show) {

        loader.classList.remove(
            'hidden'
        );

    } else {

        loader.classList.add(
            'hidden'
        );
    }
}