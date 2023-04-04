const t_ss = 0.2140;
const rc_ss = 0.70;
const rc_irs = 0.75;

const irs_rates = [
  [7479, 0.145],
  [11284, 0.21],
  [15992, 0.265],
  [20700, 0.285],
  [26355, 0.35],
  [38632, 0.37],
  [50483, 0.435],
  [78834, 0.45],
  [Infinity, 0.48],
];

function getIrsRate(grossYearly) {
  const taxableIncome = grossYearly * rc_irs;
  for (let i = 0; i < irs_rates.length; i++) {
    const [incomeRange, taxRate] = irs_rates[i];
    if (taxableIncome <= incomeRange) {
      return { irsN: i, irsRate: taxRate };
    }
  }
  const lastIrsRate = irs_rates[irs_rates.length - 1][1];
  return { irsN: irs_rates.length - 1, irsRate: lastIrsRate };
}

function getTaxRate(tIrs) {
  return rc_irs * tIrs + rc_ss * t_ss;
}

function calculateTaxes(grossYearly = null, netMontly = null) {
  let success = false;
  let irsN, irsRate, taxRate, taxYearly, grossMonthly, netYearly;

  if (grossYearly !== null) {
    ({ irsN, irsRate } = getIrsRate(grossYearly));
    taxRate = getTaxRate(irsRate);
    netYearly = grossYearly - grossYearly * taxRate;
    netMontly = netYearly / 12;
    success = true;
  
  } else if (netMontly !== null) {
    netYearly = netMontly * 12;
    for (let i = 0; i < irs_rates.length; i++) {
      const [maxIncomeIrs, irsRateTest] = irs_rates[i];
      taxRate = getTaxRate(irsRateTest);
      grossYearly = netYearly / (1 - taxRate);
      if (grossYearly * rc_irs <= maxIncomeIrs) {
        irsN = i;
        irsRate = irsRateTest;
        success = true;
        break;
      }
    }
  }

  if (!success) {
    return {};
  }

  taxYearly = grossYearly - netYearly;
  grossMonthly = grossYearly / 12;

  return {
    "IRS Rate": `${(irsRate * 100).toFixed(2)} % ${irsN + 1}/${irs_rates.length}`,
    'Total Tax Rate': `${(taxRate * 100).toFixed(2)} %`,
    "Taxes Yearly": `${taxYearly.toFixed(2)} €`,
    "Gross Yearly": `${grossYearly.toFixed(2)} €`,
    "Gross Monthly": `${grossMonthly.toFixed(2)} €`,
    "Net Yearly": `${netYearly.toFixed(2)} €`,
    "Net Monthly": `${netMontly.toFixed(2)} €`,
  };
}

// Select DOM elements
const grossYearlyInput = document.getElementById('in_gross-yearly');
const netMonthlyInput = document.getElementById('in_net-monthly');
const calculateButton = document.getElementById('calculate');
const resultsDiv = document.getElementById('results');
const resultValues = resultsDiv.querySelectorAll('.result .value');

// Add event listener to calculate button
calculateButton.addEventListener('click', () => {
  let grossYearly, netMonthly;
  if (grossYearlyInput.value && grossYearlyInput.value >= 0) {
    grossYearly = Number(grossYearlyInput.value);
  }
  if (netMonthlyInput.value && netMonthlyInput.value >= 0) {
    netMonthly = Number(netMonthlyInput.value);
  }
  const results = calculateTaxes(grossYearly, netMonthly);

  // Loop through result value elements and set their text content
  Object.entries(results).forEach(([key, value], i) => {
    resultValues[i].textContent = value;
  });

  // Reset inputs
  grossYearlyInput.value = ""
  netMonthlyInput.value = ""
});
