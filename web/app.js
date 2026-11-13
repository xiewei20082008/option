const field = (id) => document.getElementById(id);
const { parseDate, calculateAPY, parseAmount } = APYCalculator;

function formatDate(date) {
  return `${String(date.getUTCDate()).padStart(2, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCFullYear()).padStart(4, "0")}`;
}

function today() {
  const now = new Date();
  return parseDate(`${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`);
}

function calculate(event) {
  if (event) event.preventDefault();
  const start = today();
  field("start").value = formatDate(start);
  try {
    const { apy, days, periodReturn } = calculateAPY(start, parseDate(field("end").value), parseAmount(field("principal").value), parseAmount(field("profit").value));
    const percent = (value) => `${(value * 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
    // Multiplying a finite fraction by 100 can itself overflow.
    if (!Number.isFinite(apy * 100)) throw new Error("The annualized return is too large to display.");
    field("apy").textContent = percent(apy);
    field("details").textContent = `${days.toLocaleString("en-GB")} days · Period return: ${percent(periodReturn)}`;
    field("error").textContent = "";
  } catch (error) {
    field("apy").textContent = "—";
    field("details").textContent = "";
    field("error").textContent = error.message;
  }
}

field("end").value = formatDate(new Date(today().getTime() + 365 * 86400000));
field("calculator").addEventListener("submit", calculate);
window.addEventListener("focus", calculate);
calculate();
