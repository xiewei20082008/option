/* Calendar days use UTC internally so daylight-saving changes cannot alter the period. */
const APYCalculator = (() => {
  function parseDate(value) {
    const match = /^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/.exec(value.trim());
    if (!match) throw new Error("Use DD-MM-YY or DD-MM-YYYY for dates.");
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]) + (match[3].length === 2 ? 2000 : 0);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error("Enter a valid calendar date.");
    }
    return date;
  }

  function calculateAPY(start, end, principal, profit) {
    const days = (end - start) / 86400000;
    if (!Number.isFinite(days) || days <= 0) throw new Error("The end date must be after the start date.");
    if (!Number.isFinite(principal) || principal <= 0) throw new Error("Investment must be a finite number greater than zero.");
    if (!Number.isFinite(profit) || profit < -principal) throw new Error("Net profit must be finite and cannot exceed the investment as a loss.");
    const apy = profit === -principal ? -1 : Math.expm1(Math.log1p(profit / principal) * 365 / days);
    if (!Number.isFinite(apy)) throw new Error("The annualized return is too large to calculate.");
    return { apy, days, periodReturn: profit / principal };
  }

  function parseAmount(value) {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) {
      throw new Error("Enter numeric amounts, without currency symbols or thousands separators.");
    }
    return Number(value.trim());
  }

  return { parseDate, calculateAPY, parseAmount };
})();
if (typeof module !== "undefined") module.exports = APYCalculator;
