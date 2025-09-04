document.addEventListener('DOMContentLoaded', () => {

  // --- CONFIGURATION ---
  const FINNHUB_API_KEY = 'd2qfiehr01qn21mj9togd2qfiehr01qn21mj9tp0'; // Make sure this is correct
  const DATA_URL = 'https://drive.google.com/file/d/1F4vXd_fyhVM0XK9VWyprty6bv0j-wCn5Sug7qvov0tk/view?usp=sharing'; // Make sure this is correct

  // --- MAIN FUNCTION ---
  async function updateGrid() {
    console.log('1. Script started. Attempting to fetch data...'); // <-- NEW DEBUG LINE 1

    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error('Could not fetch data.');
      const peopleData = await response.json();

      console.log('2. Successfully fetched and parsed data:', peopleData); // <-- NEW DEBUG LINE 2

      for (const person of peopleData) {
        const elementId = `data-col-${person.id}`;
        console.log(`3. Processing person with ID: "${person.id}". Looking for HTML element with ID: "${elementId}"`); // <-- NEW DEBUG LINE 3
        const container = document.getElementById(elementId);

        if (container) {
          console.log(`4. Found element for "${person.id}". Updating HTML.`); // <-- NEW DEBUG LINE 4
          container.querySelector('.net-worth span').textContent = person.netWorth;
          container.querySelector('.company-name span').textContent = person.companyName;
          const stockInfoEl = container.querySelector('.stock-info');

          if (person.ticker) {
            stockInfoEl.querySelector('.ticker').textContent = person.ticker + ':';
            const stockData = await getStockQuote(person.ticker);
            updateStockUI(container, stockData);
          } else {
            stockInfoEl.textContent = 'Private';
            stockInfoEl.classList.add('private-company');
          }
        } else {
          // This is a critical failure point
          console.error(`ERROR: Did not find HTML element with ID: "${elementId}". Check for typos in your index.hbs or JSON file.`);
        }
      }
    } catch (error) {
      // This will now catch errors from fetching or parsing JSON
      console.error('CRITICAL ERROR:', error);
    }
  }

  // --- HELPER FUNCTIONS (Unchanged) ---
  async function getStockQuote(ticker) {
    const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Failed to fetch stock data for ${ticker}.`);
    return await response.json();
  }

  function updateStockUI(container, data) {
    const priceEl = container.querySelector('.price');
    const changeEl = container.querySelector('.change');
    if (priceEl && changeEl && data.c) {
      const currentPrice = data.c.toFixed(2);
      const change = data.d;
      const percentChange = data.dp.toFixed(2);
      priceEl.textContent = `$${currentPrice}`;
      changeEl.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)} (${percentChange}%)`;
      changeEl.classList.remove('gain', 'loss', 'no-change');
      if (change > 0) changeEl.classList.add('gain');
      else if (change < 0) changeEl.classList.add('loss');
      else changeEl.classList.add('no-change');
    } else {
      container.querySelector('.stock-info').textContent = 'Data unavailable';
    }
  }

  // --- START THE PROCESS ---
  updateGrid();
});
