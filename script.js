function setRate(value) {
  document.getElementById('rate').value = value;
}

function calcular() {
  const p = parseFloat(document.getElementById('monthly').value);
  const annualRate = parseFloat(document.getElementById('rate').value);
  const years = parseInt(document.getElementById('years').value);

  if (isNaN(p) || isNaN(annualRate) || isNaN(years) || p <= 0 || years <= 0) {
    alert("Por favor ingresá valores válidos mayores a 0.");
    return;
  }

  const r = (annualRate / 100) / 12;
  const n = years * 12;

  // Total aportado de bolsillo
  const capitalAportado = p * n;

  // Fórmula de valor futuro con aportes mensuales (anualidad)
  const totalFinal = p * ((Math.pow(1 + r, n) - 1) / r);
  const gananciaInteres = totalFinal - capitalAportado;

  // Mostrar resultados formateados
  document.getElementById('out-capital').innerText = `$${Math.round(capitalAportado).toLocaleString('en-US')} USD`;
  document.getElementById('out-ganancia').innerText = `+$${Math.round(gananciaInteres).toLocaleString('en-US')} USD`;
  document.getElementById('out-total').innerText = `$${Math.round(totalFinal).toLocaleString('en-US')} USD`;
}

// Ejecuta el cálculo inicial al cargar la página
window.onload = calcular;