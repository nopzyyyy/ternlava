# Tern · Currents that Lift & Compound

A high-fidelity DeFi application and 3D landing page built for **Tern** on Robinhood Chain.

## ✨ Features

- **Interactive 3D WebGL Canvas**: Procedural curved grassy terrain with animated daisies, camera perspective, and dynamic pointer-proximity dip physics powered by Three.js shaders.
- **Custom Tern Branding**: Fitted with the white tern bird mark across navigation, favicons, app headers, and dialogs.
- **Complete Suite of Application Pages**:
  - `/radar`: Real-time LP position radar and analytics on Robinhood Chain
  - `/trade/ETH`: Institutional-grade trading terminal with order book & depth
  - `/portfolio`: Wallet balance and active LP tracker
  - `/yield`: Yield-bearing vaults (ETH Vault, NVDA Hedged, SPY Hedged, USDG Vault, etc.)
  - `/theses`: Automated thesis strategies
  - `/launch`: Pool and vault launcher
  - `/docs/*`: 12 full documentation pages (`overview`, `zap`, `range-orders`, `keeper`, `vaults`, `hedged-vaults`, `structured`, `launch`, `perps`, `offchain`, `fees`, `security`)
- **First-Time User Guide**: Embedded walkthrough video modal ("Welcome to Tern").
- **Zero-Dependency Clean-URL Server**: Fast native Node.js HTTP server.

---

## 🚀 Quick Start

### 1. Run with Node.js
```bash
npm start
# or
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── index.html            # Main 3D landing page
├── server.js             # Clean-URL static & application server
├── package.json          # Project manifest & scripts
├── tern-mark.png         # Tern brand mark
├── favicon.svg           # Scalable favicon
├── favicon-32.png        # 32x32 favicon
├── apple-touch-icon.png  # Apple touch icon
├── landing/              # Landing page assets (3D JS bundle, CSS, video, sky background)
├── pages/                # Rebranded application pages (/radar, /trade, /docs, etc.)
└── _next/                # Hydrated client-side Webpack chunks and styles
```
