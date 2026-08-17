let chartInstance = null;

function setPreset(rate, btn) {
  document.getElementById('rate').value = rate;
  document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  actualizar();
}

function syncRateSlider() {
  document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
  actualizar();
}

function actualizar() {
  const initial = parseFloat(document.getElementById('initial').value) || 0;
  const monthly = parseFloat(document.getElementById('monthly').value) || 0;
  const annualRate = parseFloat(document.getElementById('rate').value) || 0;
  const years = parseInt(document.getElementById('years').value) || 1;

  // Actualizar badges
  document.getElementById('val-initial').innerText = `$${initial.toLocaleString('en-US')}`;
  document.getElementById('val-monthly').innerText = `$${monthly.toLocaleString('en-US')}`;
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

    const interestEarned = currentBalance - totalInvested;

    labels.push(`Año ${year}`);
    capitalData.push(Math.round(totalInvested));
    interestData.push(Math.round(interestEarned));

    tableRows.push(`
      <tr>
        <td>${year}</td>
        <td>$${Math.round(totalInvested).toLocaleString('en-US')}</td>
        <td style="color:#4ade80">+$${Math.round(interestEarned).toLocaleString('en-US')}</td>
        <td style="color:#38bdf8; font-weight:bold">$${Math.round(currentBalance).toLocaleString('en-US')}</td>
      </tr>
    `);
  }

  const finalInterest = currentBalance - totalInvested;

  document.getElementById('out-capital').innerText = `$${Math.round(totalInvested).toLocaleString('en-US')} USD`;
  document.getElementById('out-ganancia').innerText = `+$${Math.round(finalInterest).toLocaleString('en-US')} USD`;
  document.getElementById('out-total').innerText = `$${Math.round(currentBalance).toLocaleString('en-US')} USD`;

  document.getElementById('breakdown-body').innerHTML = tableRows.join('');

  renderChart(labels, capitalData, interestData);
}

function renderChart(labels, capitalData, interestData) {
  const ctx = document.getElementById('growthChart').getContext('2d');

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
          stack: 'combined'
        },
        {
          label: 'Ganancia por Interés',
          data: interestData,
          backgroundColor: '#4ade80',
          stack: 'combined'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: (item) => `${item.dataset.label}: $${item.raw.toLocaleString('en-US')} USD`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#64748b' },
          grid: { display: false }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#64748b',
            callback: (val) => `$${(val / 1000)}k`
          },
          grid: { color: '#1e294f' }
        }
      }
    }
  });
}

window.onload = actualizar;