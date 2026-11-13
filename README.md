# APY Calculator

## Web version

Open `web/index.html` in your browser. The calculator runs entirely on your
device, with no installation, backend, or external dependencies. The desktop
version is also available below.

## Deploy to GitHub Pages

1. Create a GitHub repository and upload this project, including the hidden
   `.github/workflows/pages.yml` file. Use `main` as the default branch.
2. In the repository, open **Settings → Pages → Build and deployment** and
   select **GitHub Actions** as the source.
3. Push to `main`, or run **Deploy APY Calculator to GitHub Pages** from the
   **Actions** tab using **Run workflow**.
4. After deployment succeeds, find the published link in **Settings → Pages**
   or the workflow's `github-pages` deployment. It normally looks like
   `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The workflow tests the calculation logic before publishing only the `web/`
folder. Pull requests run tests without deploying. If you use a branch other
than `main`, update both branch filters and the deployment condition in the
workflow. No personal access token or additional secrets are required.

GitHub's setup instructions:
[Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Run the web calculation tests locally with Node.js 22 or later:

```powershell
node --test tests/calculator.test.cjs
```

## Desktop version

Run the desktop UI with Python (Tkinter is included in most desktop Python installations):

```powershell
python apy_calculator.py
```

The start date always uses today and cannot be edited. Enter a future end date,
initial investment, and total net profit expected over that period. The end date
defaults to 365 days from today. Dates use **DD-MM-YY** or
**DD-MM-YYYY**: `27-06-17` means **27 June 2017**. Two-digit years mean 2000–2099.
Amounts use a decimal point and no currency symbols or thousands separators.

The calculator uses actual elapsed days and a 365-day year:

```text
APY = ((1 + net profit / initial investment) ** (365 / days) - 1) * 100%
```

For example, an investment of 660 earning 30 over 365 days has an APY of
4.55%. Revenue means net profit, excluding the original 660. Negative profit
is supported down to a complete loss of the investment.

This is an effective annualized return assuming the same rate repeats and
profits are reinvested, with no additional deposits or withdrawals. It is
not a forecast or a quoted deposit-account yield.
