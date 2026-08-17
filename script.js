let chartInstance = null;
let currentCurrency = 'USD';

function setCurrency(curr) {
  currentCurrency = curr;
  document.getElementById('btn-usd').classList.toggle('active', curr === 'USD');
  document.getElementById('btn-ars').classList.toggle('active', curr === 'ARS');

  const initialInput = document.getElementById('initial');
  const monthlyInput = document.getElementById('monthly');
  const rateInput = document.getElementById('rate');
  const inflationInput = document.getElementById('inflation');

  if (curr === 'ARS') {
    initialInput.min = "0";
    initialInput.max = "5000000";
    initialInput.step = "50000";
    initialInput.value = "0";

    monthlyInput.min = "50000";
    monthlyInput.max = "1000000";
    monthlyInput.step = "25000";
    monthlyInput.value = "100000";

    rateInput.max = "80";
    
    // Inflación ARS (configurada para la realidad argentina actual)
    inflationInput.max = "100";
    inflationInput.step = "1";
    inflationInput.value = "30"; 

    const activePreset = document.querySelector('.btn-preset.active');
    if (!activePreset || !activePreset.classList.contains('is-ars')) {
      document.getElementById('btn-wallet').click();
      return;
    }
  } else {
    initialInput.min = "0";
    initialInput.max = "50000";
    initialInput.step = "500";
    initialInput.value = "0";

    monthlyInput.min = "50";
    monthlyInput.max = "10000";
    monthlyInput.step = "50";
    monthlyInput.value = "1000";

    rateInput.max = "25";

    // Inflación USD (configurada para inflación de EE.UU.)
    inflationInput.max = "10";
    inflationInput.step = "0.5";
    inflationInput.value = "3"; 

    const activePreset = document.querySelector('.btn-preset.active');
    if (!activePreset || !activePreset.classList.contains('is-usd')) {
      document.getElementById('btn-sp').click();
      return;
    }
  }

  actualizar();
}

function selectPreset(rate, curr, title, desc, risk, btn) {
  if (currentCurrency !== curr) {
    setCurrency(curr);
  }
  document.getElementById('rate').value = rate;
  document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('info-title').innerText = title;
  document.getElementById('info-desc').innerText = desc;
  document.getElementById('info-risk-val').innerText = risk;

  actualizar();
}

function syncRateSlider() {
  document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
  document.getElementById('info-title').innerText = "Tasa Personalizada";
  document.getElementById('info-desc').innerText = "Rendimiento ingresado manualmente mediante la barra deslizable.";
  document.getElementById('info-risk-val').innerText = "Variable";
  actualizar();
}

function formatMoney(amount) {
  return `$${Math.round(amount).toLocaleString('es-AR')} ${currentCurrency}`;
}

function actualizar() {
  const initial = parseFloat(document.getElementById('initial').value) || 0;
  const monthly = parseFloat(document.getElementById('monthly').value) || 0;
  const annualRate = parseFloat(document.getElementById('rate').value) || 0;
  const inflationRate = parseFloat(document.getElementById('inflation').value) || 0;
  const years = parseInt(document.getElementById('years').value) || 1;

  document.getElementById('val-initial').innerText = formatMoney(initial);
  document.getElementById('val-monthly').innerText = formatMoney(monthly);
  document.getElementById('val-rate').innerText = `${annualRate}%`;
  document.getElementById('val-inflation').innerText = `${inflationRate}% anual`;
  document.getElementById('val-years').innerText = `${years} año${years > 1 ? 's' : ''}`;

  const r = (annualRate / 100) / 12;
  const labels = [];
  const capitalData = [];
  const interestData = [];
  const realPurchasingPowerData = [];

  let currentBalance = initial;
  let totalInvested = initial;

  for (let year = 1; year <= years; year++) {
    for (let m = 1; m <= 12; m++) {
      currentBalance = (currentBalance + monthly) * (1 + r);
      totalInvested += monthly;
    }

    const interestEarned = Math.max(0, currentBalance - totalInvested);
    
    // Calcula el poder de compra real descontando la inflación acumulada de esos años
    const realBalance = currentBalance / Math.pow(1 + (inflationRate / 100), year);

    labels.push(`Año ${year}`);
    capitalData.push(Math.round(totalInvested));
    interestData.push(Math.round(interestEarned));
    realPurchasingPowerData.push(Math.round(realBalance));
  }

  const finalRealBalance = currentBalance / Math.pow(1 + (inflationRate / 100), years);

  document.getElementById('out-capital').innerText = formatMoney(totalInvested);
  document.getElementById('out-total').innerText = formatMoney(currentBalance);
  document.getElementById('out-real').innerText = formatMoney(finalRealBalance);

  renderChart(labels, capitalData, interestData, realPurchasingPowerData);
}

function renderChart(labels, capitalData, interestData, realData) {
  const canvas = document.getElementById('growthChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: 'Poder de Compra Real',
          data: realData,
          borderColor: '#fbbf24',
          backgroundColor: '#fbbf24',
          borderWidth: 3,
          pointRadius: 4,
          fill: false,
          tension: 0.3
        },
        {
          type: 'bar',
          label: 'Capital Aportado',
          data: capitalData,
          backgroundColor: '#0284c7',
          stack: 'combined',
          borderRadius: 4
        },
        {
          type: 'bar',
          label: 'Interés Nominal',
          data: interestData,
          backgroundColor: '#4ade80',
          stack: 'combined',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#94a3b8', boxWidth: 12, font: { size: 10 } }
        },
        tooltip: {
          callbacks: {
            label: (item) => `${item.dataset.label}: ${formatMoney(item.raw)}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            callback: (val) => currentCurrency === 'ARS' ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000)}k`
          },
          grid: { color: '#1e294f' }
        }
      }
    }
  });
}

window.onload = actualizar;