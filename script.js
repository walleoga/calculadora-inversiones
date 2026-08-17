let chartInstance = null;
let currentCurrency = 'USD';

function setCurrency(curr) {
  currentCurrency = curr;
  document.getElementById('btn-usd').classList.toggle('active', curr === 'USD');
  document.getElementById('btn-ars').classList.toggle('active', curr === 'ARS');

  const initialInput = document.getElementById('initial');
  const monthlyInput = document.getElementById('monthly');
  const rateInput = document.getElementById('rate');

  if (curr === 'ARS') {
    initialInput.min = "0";
    initialInput.max = "5000000";
    initialInput.step = "50000";
    initialInput.value = "0";

    monthlyInput.min = "50000";
    monthlyInput.max = "1000000";
    monthlyInput.step = "25000";
    monthlyInput.value = "100000";

    rateInput.max = "40";

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
    currentCurrency = curr;
    document.getElementById('btn-usd').classList.toggle('active', curr === 'USD');
    document.getElementById('btn-ars').classList.toggle('active', curr === 'ARS');
    
    const initialInput = document.getElementById('initial');
    const monthlyInput = document.getElementById('monthly');
    const rateInput = document.getElementById('rate');

    if (curr === 'ARS') {
      initialInput.min = "0";
      initialInput.max = "5000000";
      initialInput.step = "50000";
      initialInput.value = "0";

      monthlyInput.min = "50000";
      monthlyInput.max = "1000000";
      monthlyInput.step = "25000";
      monthlyInput.value = "100000";
      rateInput.max = "40";
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
    }
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
  const years = parseInt(document.getElementById('years').value) || 1;

  // Actualizar badges
  document.getElementById('val-initial').innerText = formatMoney(initial);
  document.getElementById('val-monthly').innerText = formatMoney(monthly);
  document.getElementById('val-rate').innerText = `${annualRate}%`;
  document.getElementById('val-years').innerText = `${years} año${years > 1 ? 's' : ''}`;

  const r = (annualRate / 100) / 12;
  const labels = [];
  const capitalData = [];
  const interestData = [];
  const tableRows = [];

  let currentBalance = initial;
  let totalInvested = initial;

  for (let year = 1; year <= years; year++) {
    for (let m = 1; m <= 12; m++) {
      currentBalance = (currentBalance + monthly) * (1 + r);
      totalInvested += monthly;
    }

    const interestEarned = Math.max(0, currentBalance - totalInvested);

    labels.push(`Año ${year}`);
    capitalData.push(Math.round(totalInvested));
    interestData.push(Math.round(interestEarned));

    tableRows.push(`
      <tr>
        <td>${year}</td>
        <td>${formatMoney(totalInvested)}</td>
        <td style="color:#4ade80">+${formatMoney(interestEarned)}</td>
        <td style="color:#38bdf8; font-weight:bold">${formatMoney(currentBalance)}</td>
      </tr>
    `);
  }

  const finalInterest = Math.max(0, currentBalance - totalInvested);

  document.getElementById('out-capital').innerText = formatMoney(totalInvested);
  document.getElementById('out-ganancia').innerText = `+${formatMoney(finalInterest)}`;
  document.getElementById('out-total').innerText = formatMoney(currentBalance);

  document.getElementById('breakdown-body').innerHTML = tableRows.join('');

  renderChart(labels, capitalData, interestData);
}

function renderChart(labels, capitalData, interestData) {
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
          label: 'Capital Aportado',
          data: capitalData,
          backgroundColor: '#0284c7',
          borderRadius: 4
        },
        {
          label: 'Ganancia por Interés',
          data: interestData,
          backgroundColor: '#4ade80',
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
          labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
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