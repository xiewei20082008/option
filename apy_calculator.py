"""A small, dependency-free desktop calculator for annualized returns."""

import math
import tkinter as tk
from datetime import date, timedelta
from tkinter import ttk


def parse_date(value: str) -> date:
    """Read day-month-year dates; two-digit years mean 2000–2099."""
    parts = value.strip().split("-")
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        raise ValueError("Use DD-MM-YY or DD-MM-YYYY for dates.")
    day, month, year = parts
    if len(year) not in (2, 4):
        raise ValueError("Use a two-digit or four-digit year.")
    year_number = int(year) + (2000 if len(year) == 2 else 0)
    try:
        return date(year_number, int(month), int(day))
    except ValueError as exc:
        raise ValueError("Enter a valid calendar date.") from exc


def calculate_apy(start: date, end: date, principal: float, revenue: float) -> float:
    """Annualize total net profit over actual elapsed days, using a 365-day year.

    Returns a fraction, e.g. 0.05 means 5%. Assumes no intervening cash flows
    and reinvestment at the same rate for the annualized projection.
    """
    days = (end - start).days
    if days <= 0:
        raise ValueError("The end date must be after the start date.")
    if not math.isfinite(principal) or principal <= 0:
        raise ValueError("Investment value must be a finite number greater than zero.")
    if not math.isfinite(revenue) or revenue < -principal:
        raise ValueError("Net revenue must be finite and cannot exceed the investment as a loss.")
    if revenue == -principal:
        return -1.0
    try:
        result = math.expm1(math.log1p(revenue / principal) * 365 / days)
    except (OverflowError, ValueError) as exc:
        raise ValueError("The annualized return is too large to calculate.") from exc
    if not math.isfinite(result):
        raise ValueError("The annualized return is too large to calculate.")
    return result


class APYCalculator(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("APY Calculator")
        self.geometry("520x620")
        self.minsize(480, 600)
        self.configure(background="#f3f6fa")
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TFrame", background="#f3f6fa")
        style.configure("TLabel", background="#f3f6fa", foreground="#172638", font=("Segoe UI", 11))
        style.configure("TEntry", padding=8, font=("Segoe UI", 11))
        style.configure("TButton", padding=10, font=("Segoe UI", 11, "bold"))

        panel = ttk.Frame(self, padding=28)
        panel.pack(fill="both", expand=True)
        panel.columnconfigure(0, weight=1)
        ttk.Label(panel, text="APY Calculator", font=("Segoe UI", 24, "bold")).grid(sticky="w")
        ttk.Label(panel, text="Annualize your investment’s net return.").grid(sticky="w", pady=(4, 20))

        self.start = tk.StringVar(value=date.today().strftime("%d-%m-%Y"))
        self.end = tk.StringVar(value=(date.today() + timedelta(days=365)).strftime("%d-%m-%Y"))
        self.principal = tk.StringVar(value="660")
        self.revenue = tk.StringVar(value="30")
        fields = [
            ("Start date (always today)", self.start),
            ("End date (DD-MM-YY or DD-MM-YYYY)", self.end),
            ("Initial investment value", self.principal),
            ("Total net revenue / profit over this period", self.revenue),
        ]
        for index, (label, variable) in enumerate(fields):
            row = 2 + index * 2
            ttk.Label(panel, text=label).grid(row=row, column=0, sticky="w", pady=(0, 4))
            state = "readonly" if variable is self.start else "normal"
            ttk.Entry(panel, textvariable=variable, state=state).grid(row=row + 1, column=0, sticky="ew", pady=(0, 12))

        ttk.Button(panel, text="Calculate APY", command=self.calculate).grid(row=10, sticky="ew", pady=(2, 14))
        self.result = tk.StringVar(value="APY —")
        ttk.Label(panel, textvariable=self.result, font=("Segoe UI", 25, "bold"), foreground="#146c55").grid(row=11, sticky="w")
        self.details = tk.StringVar()
        ttk.Label(panel, textvariable=self.details, wraplength=440).grid(row=12, sticky="w", pady=(4, 10))
        self.error = tk.StringVar()
        ttk.Label(panel, textvariable=self.error, foreground="#b42318", wraplength=440).grid(row=13, sticky="w")
        ttk.Label(
            panel,
            text="APY = ((1 + net revenue / investment)^(365 / days) − 1) × 100%\n"
            "Assumes the same return repeats and gains are reinvested.\n"
            "Enter net profit, excluding your original investment.",
            font=("Segoe UI", 9), wraplength=440,
        ).grid(row=14, sticky="w", pady=(12, 0))
        self.bind("<Return>", lambda event: self.calculate())
        self.calculate()

    def calculate(self) -> None:
        try:
            start = date.today()
            self.start.set(start.strftime("%d-%m-%Y"))
            end = parse_date(self.end.get())
            try:
                principal = float(self.principal.get().strip())
                revenue = float(self.revenue.get().strip())
            except ValueError as exc:
                raise ValueError("Enter numeric investment and revenue amounts (for example, 660 and 30).") from exc
            apy = calculate_apy(start, end, principal, revenue)
            self.result.set(f"APY {apy:.2%}")
            self.details.set(f"{(end - start).days:,} days · Period return: {revenue / principal:.2%}")
            self.error.set("")
        except ValueError as exc:
            self.result.set("APY —")
            self.details.set("")
            self.error.set(str(exc))


if __name__ == "__main__":
    APYCalculator().mainloop()
