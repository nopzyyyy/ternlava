/**
 * Tern - Complete Web Application Engine
 * Integrates TradingView Real-Time Charts, Binance Live Feeds,
 * Interactive Order Execution, Radar, Yield Vaults, Theses, and Portfolio.
 */

(function() {
  'use strict';

  // --- STATE ---
  const state = {
    activeMarket: 'ETH',
    activeTab: 'buy', // 'buy' | 'sell' | 'provide' | 'limit'
    orderType: 'spot', // 'spot' | 'perp'
    leverage: 1,
    payAmount: '1000',
    receiveAmount: '0.403',
    walletConnected: false,
    walletAddress: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11',
    userBalanceUsd: 0.00,
    openPositions: [
      { id: 'pos-1', asset: 'ETH', side: 'Long', size: '2.50 ETH', entry: 2465.10, mark: 2481.50, pnl: '+41.00', pnlPct: '+0.66%', leverage: '2x', value: '$6,203.75' },
      { id: 'pos-2', asset: 'NVDA', side: 'Long', size: '40 NVDA', entry: 178.20, mark: 182.34, pnl: '+165.60', pnlPct: '+2.32%', leverage: '1x', value: '$7,293.60' },
      { id: 'pos-3', asset: 'ETH', side: 'LP Range', size: '5.00 ETH / 12,400 USDG', entry: 2450.00, mark: 2481.50, pnl: '+318.42 (Fees)', pnlPct: '+21.2% APR', leverage: 'Range', value: '$24,800.00' }
    ],
    openOrders: [
      { id: 'ord-1', asset: 'ETH', side: 'Buy Limit', size: '1.00 ETH', price: 2420.00, status: 'Open', created: '10m ago' },
      { id: 'ord-2', asset: 'NVDA', side: 'Sell Limit', size: '15 NVDA', price: 195.00, status: 'Open', created: '2h ago' }
    ],
    theses: [
      { id: 't-1', author: '0x5ad0...2d11', authorFull: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', market: 'ETH', side: 'lp', text: 'Funding has been positive on ETH for eleven days straight. Running a CURVE range against a 2x short: the LP fees are the free option, the funding is the rent.', votes: 43, userVoted: false, pnl: '+$812.44', time: '2h ago' },
      { id: 't-2', author: '0x1111...00a1', authorFull: '0x11111111111111111111111111111111111100a1', market: 'NVDA', side: 'long', text: 'Tokenized NVDA trades at a discount to the underlying every time the NYSE closes green. Holding into the open with 2x leverage.', votes: 57, userVoted: false, pnl: '+$368.28', time: '5h ago' },
      { id: 't-3', author: '0x2222...00b2', authorFull: '0x22222222222222222222222222222222222200b2', market: 'NVDA', side: 'lp', text: 'Parked the sleeve in the NVDA Hedged vault instead of managing the range by hand. 24.1% APR with the delta stripped out is sufficient carry.', votes: 30, userVoted: false, pnl: '+$145.90', time: '9h ago' },
      { id: 't-4', author: '0x3333...00c3', authorFull: '0x33333333333333333333333333333333333300c3', market: 'ETH', side: 'short', text: 'Open interest up 40% on the week while price remained flat. Someone is offside. Initiating short position into the funding reset.', votes: 18, userVoted: false, pnl: '-$212.05', time: '22h ago' }
    ]
  };

  const MARKETS_DEF = [
    { symbol: 'ETH', name: 'Ether', kind: 'crypto', price: 2478.50, change24h: 0.0182, high24h: 2511.40, low24h: 2463.00, funding1h: '0.0118%', poolTvl: '$12.4M', tvSymbol: 'BINANCE:ETHUSDT', logo: '/logos/ETH.svg' },
    { symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', price: 96240.00, change24h: -0.0064, high24h: 97100.00, low24h: 95400.00, funding1h: '0.0092%', poolTvl: '$28.5M', tvSymbol: 'BINANCE:BTCUSDT', logo: '/logos/BTC.svg' },
    { symbol: 'SOL', name: 'Solana', kind: 'crypto', price: 102.92, change24h: -0.0158, high24h: 105.10, low24h: 101.30, funding1h: '0.0142%', poolTvl: '$16.2M', tvSymbol: 'BINANCE:SOLUSDT', logo: '/logos/SOL.svg' },
    { symbol: 'USDT', name: 'Tether USD', kind: 'crypto', price: 1.00, change24h: 0.0002, high24h: 1.001, low24h: 0.999, funding1h: '0.0010%', poolTvl: '$42.1M', tvSymbol: 'BINANCE:USDTUSDC', logo: '/logos/USDT.svg' },
    { symbol: 'USDC', name: 'USD Coin', kind: 'crypto', price: 1.00, change24h: 0.0000, high24h: 1.000, low24h: 0.999, funding1h: '0.0010%', poolTvl: '$38.4M', tvSymbol: 'BINANCE:USDCUSDT', logo: '/logos/USDC.svg' },
    { symbol: 'BNB', name: 'BNB Chain', kind: 'crypto', price: 642.50, change24h: 0.0112, high24h: 651.20, low24h: 635.40, funding1h: '0.0085%', poolTvl: '$18.9M', tvSymbol: 'BINANCE:BNBUSDT', logo: '/logos/BNB.svg' },
    { symbol: 'XRP', name: 'Ripple', kind: 'crypto', price: 2.38, change24h: 0.0345, high24h: 2.44, low24h: 2.29, funding1h: '0.0155%', poolTvl: '$9.4M', tvSymbol: 'BINANCE:XRPUSDT', logo: '/logos/XRP.svg' },
    { symbol: 'DOGE', name: 'Dogecoin', kind: 'crypto', price: 0.245, change24h: 0.0210, high24h: 0.258, low24h: 0.238, funding1h: '0.0192%', poolTvl: '$8.2M', tvSymbol: 'BINANCE:DOGEUSDT', logo: '/logos/DOGE.svg' },
    { symbol: 'ADA', name: 'Cardano', kind: 'crypto', price: 0.785, change24h: -0.0084, high24h: 0.812, low24h: 0.771, funding1h: '0.0098%', poolTvl: '$4.6M', tvSymbol: 'BINANCE:ADAUSDT', logo: '/logos/ADA.svg' },
    { symbol: 'AVAX', name: 'Avalanche', kind: 'crypto', price: 28.40, change24h: 0.0145, high24h: 29.20, low24h: 27.80, funding1h: '0.0120%', poolTvl: '$5.7M', tvSymbol: 'BINANCE:AVAXUSDT', logo: '/logos/AVAX.svg' },
    { symbol: 'LINK', name: 'Chainlink', kind: 'crypto', price: 18.25, change24h: 0.0230, high24h: 18.90, low24h: 17.85, funding1h: '0.0114%', poolTvl: '$6.1M', tvSymbol: 'BINANCE:LINKUSDT', logo: '/logos/LINK.svg' },
    { symbol: 'NVDA', name: 'NVIDIA', kind: 'rwa', price: 228.81, change24h: -0.0067, high24h: 233.71, low24h: 228.06, funding1h: '0.0205%', poolTvl: '$3.82M', tvSymbol: 'NASDAQ:NVDA', logo: '/logos/NVDA.svg' },
    { symbol: 'SPY', name: 'S&P 500 ETF', kind: 'rwa', price: 766.56, change24h: -0.0047, high24h: 769.70, low24h: 765.99, funding1h: '0.0041%', poolTvl: '$5.14M', tvSymbol: 'AMEX:SPY', logo: '/logos/SPY.svg' },
    { symbol: 'TSLA', name: 'Tesla', kind: 'rwa', price: 361.85, change24h: 0.0219, high24h: 362.62, low24h: 355.80, funding1h: '0.0188%', poolTvl: '$2.88M', tvSymbol: 'NASDAQ:TSLA', logo: '/logos/TSLA.svg' },
    { symbol: 'AAPL', name: 'Apple', kind: 'rwa', price: 315.88, change24h: -0.0128, high24h: 320.70, low24h: 315.70, funding1h: '0.0064%', poolTvl: '$2.14M', tvSymbol: 'NASDAQ:AAPL', logo: '/logos/AAPL.svg' },
    { symbol: 'PONS', name: 'Pons', kind: 'crypto', price: 0.0145, change24h: 0.0000, high24h: 0.0155, low24h: 0.0138, funding1h: '0.0418%', poolTvl: '$742K', tvSymbol: 'BINANCE:PEPEUSDT', logo: '/logos/PONS.svg' },
    { symbol: 'SHRUB', name: 'Shrub', kind: 'crypto', price: 0.0896, change24h: -0.0079, high24h: 0.0917, low24h: 0.0880, funding1h: '0.0262%', poolTvl: '$1.96M', tvSymbol: 'BINANCE:DOGEUSDT', logo: '/logos/SHRUB.svg' },
    { symbol: 'ROBIN', name: 'Robin', kind: 'crypto', price: 6.93, change24h: -0.0187, high24h: 7.20, low24h: 6.72, funding1h: '0.0151%', poolTvl: '$6.72M', tvSymbol: 'BINANCE:UNIUSDT', logo: '/logos/ROBIN.svg' },
    { symbol: 'GOLD', name: 'Gold', kind: 'rwa', price: 4398.16, change24h: -0.0022, high24h: 4442.99, low24h: 4384.27, funding1h: '0.0022%', poolTvl: '$1.32M', tvSymbol: 'TVC:GOLD', logo: '/logos/GOLD.svg' }
  ];

  // Formatters
  function formatUSD(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (num >= 1000) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }

  function formatPct(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    const sign = num > 0 ? '+' : '';
    return sign + (num * 100).toFixed(2) + '%';
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(title, msg, type = 'success') {
    let container = document.getElementById('tern-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tern-toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;flex-direction:column;gap:12px;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
      document.body.appendChild(container);
    }

    const isErr = type === 'error';
    const isSucc = type === 'success';
    const themeColor = isErr ? '#ef4444' : isSucc ? '#10b981' : '#ffaa00';
    const themeGlow = isErr ? '239,68,68' : isSucc ? '16,185,129' : '56,189,248';
    const iconSvg = isErr 
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : isSucc
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events:auto;min-width:300px;max-width:420px;padding:14px 18px;border-radius:12px;
      background:rgba(8,22,43,0.95);border:1px solid rgba(255,255,255,0.12);
      box-shadow:0 12px 36px rgba(0,0,0,0.5);
      backdrop-filter:blur(16px);color:#fff;display:flex;align-items:flex-start;gap:12px;
      transform:translateY(20px);opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
    `;

    toast.innerHTML = `
      <div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:${themeColor};flex-shrink:0;">${iconSvg}</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:2px;">${title}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.4;">${msg}</div>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- MODAL DIALOG ---
  function openModal(title, bodyHtml) {
    let overlay = document.getElementById('tern-modal-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'tern-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,14,0.75);backdrop-filter:blur(12px);z-index:999998;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity 0.25s ease;';
    
    overlay.innerHTML = `
      <div style="background:#08162b;border:1px solid rgba(255,255,255,0.14);border-radius:20px;width:100%;max-width:480px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;transform:scale(0.95);transition:transform 0.25s ease;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
        <div style="padding:18px 24px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;font-size:17px;font-weight:600;">${title}</h3>
          <button id="tern-modal-close" style="background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;padding:4px 8px;display:flex;align-items:center;justify-content:center;transition:color 0.15s;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding:24px;">${bodyHtml}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('div').style.transform = 'scale(1)';
    });

    overlay.querySelector('#tern-modal-close').onclick = () => closeModal();
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  }

  function closeModal() {
    const overlay = document.getElementById('tern-modal-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.querySelector('div').style.transform = 'scale(0.95)';
      setTimeout(() => overlay.remove(), 250);
    }
  }

  // --- CONNECT WALLET ---
  function wireWalletButtons() {
    const buttons = document.querySelectorAll('.TopBar_btnGlass__mc1mc, [data-tour="connect-wallet"]');
    buttons.forEach(btn => {
      if (state.walletConnected) {
        btn.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span>0x5ad0...2d11';
        btn.title = 'Connected: $96,450.00 USD';
      }

      btn.onclick = (e) => {
        e.preventDefault();
        if (state.walletConnected) {
          openModal('Wallet Connected', `
            <div style="text-align:center;padding:12px 0;">
              <div style="width:54px;height:54px;border-radius:50%;background:rgba(16,185,129,0.15);border:1px solid #10b981;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;color:#10b981;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div style="font-size:15px;font-weight:600;margin-bottom:6px;">Robinhood Mainnet</div>
              <div style="font-family:monospace;font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:20px;">${state.walletAddress}</div>
              <div style="background:rgba(255,255,255,0.04);padding:14px;border-radius:12px;display:flex;justify-content:space-between;margin-bottom:24px;">
                <span style="color:rgba(255,255,255,0.6);">Portfolio Equity</span>
                <span style="font-weight:600;color:#ffaa00;">$${state.userBalanceUsd.toLocaleString()} USD</span>
              </div>
              <button id="tern-disconnect-btn" style="width:100%;padding:12px;border-radius:10px;background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#ef4444;font-weight:600;cursor:pointer;">Disconnect</button>
            </div>
          `);
          document.getElementById('tern-disconnect-btn').onclick = () => {
            state.walletConnected = false;
            btn.innerHTML = 'Connect';
            closeModal();
            showToast('Wallet Disconnected', 'Disconnected from Robinhood Mainnet', 'info');
          };
        } else {
          openModal('Connect Wallet', `
            <div style="display:flex;flex-direction:column;gap:10px;">
              <button class="tern-wallet-choice" data-wallet="Demo" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;background:rgba(255,120,0,0.12);border:1px solid rgba(255,120,0,0.3);color:#fff;cursor:pointer;font-weight:500;">
                <span style="display:flex;align-items:center;gap:12px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffaa00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  Quick Demo Trader (Funded)
                </span>
                <span style="color:#ffaa00;font-size:12px;font-weight:600;">$96.4K</span>
              </button>
              <button class="tern-wallet-choice" data-wallet="MetaMask" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-weight:500;">
                <span style="display:flex;align-items:center;gap:12px;">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M28.4 4L17.5 12l2.3-5.3L28.4 4z" fill="#E2761B" stroke="#E2761B" stroke-width="0.5"/><path d="M3.6 4l10.8 8.1-2.2-5.4L3.6 4z" fill="#E4761B" stroke="#E4761B" stroke-width="0.5"/><path d="M24.7 21.8l-2.9 4.4 6.2 1.7 1.8-6.1-5.1 0z" fill="#E4761B"/><path d="M2.2 21.8l1.8 6.1 6.2-1.7-2.9-4.4-5.1 0z" fill="#E4761B"/><path d="M10.7 14.1l-1.7 2.6 6.1.3-.2-6.5-4.2 3.6z" fill="#E4761B"/><path d="M21.3 14.1l-4.1-3.7-.2 6.5 6.1-.3-1.8-2.5z" fill="#E4761B"/><path d="M10.2 26.2l3.7-1.8-3.2-2.5-.5 4.3z" fill="#D7C1B3"/><path d="M21.8 26.2l-.5-4.3-3.2 2.5 3.7 1.8z" fill="#D7C1B3"/></svg>
                  MetaMask
                </span>
                <span style="color:rgba(255,255,255,0.4);font-size:12px;">Web3</span>
              </button>
              <button class="tern-wallet-choice" data-wallet="Coinbase" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-weight:500;">
                <span style="display:flex;align-items:center;gap:12px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="20" height="20" rx="10" fill="#0052FF"/><rect x="7" y="7" width="6" height="6" rx="1.5" fill="#FFFFFF"/></svg>
                  Coinbase Wallet
                </span>
                <span style="color:rgba(255,255,255,0.4);font-size:12px;">EVM</span>
              </button>
              <button class="tern-wallet-choice" data-wallet="WalletConnect" style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-weight:500;">
                <span style="display:flex;align-items:center;gap:12px;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  WalletConnect
                </span>
                <span style="color:rgba(255,255,255,0.4);font-size:12px;">Any wallet</span>
              </button>
            </div>
          `);

          document.querySelectorAll('.tern-wallet-choice').forEach(wb => {
            wb.onclick = () => {
              const name = wb.getAttribute('data-wallet');
              state.walletConnected = true;
              btn.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span>0x5ad0...2d11';
              closeModal();
              showToast('Wallet Connected', `Connected ${name} to Robinhood Mainnet`, 'success');
            };
          });
        }
      };
    });
  }

  // --- TRADING VIEW REAL-TIME CHART EMBED ---
  let tvWidgetInstance = null;

  function loadTradingViewChart(marketDef) {
    const chartPane = document.querySelector('[data-tour="trade-chart"] .Pane_body__rpCX4, .trade_centre__y7gMB .Pane_body__rpCX4');
    if (!chartPane) return;

    // Look for existing container or create one
    let tvContainer = document.getElementById('tern-tv-wrapper');
    if (!tvContainer) {
      // Remove placeholder skeleton
      const skeleton = chartPane.querySelector('.Skeleton_skeleton__qPv9I');
      if (skeleton) skeleton.remove();

      tvContainer = document.createElement('div');
      tvContainer.id = 'tern-tv-wrapper';
      tvContainer.style.cssText = 'width:100%;height:460px;min-height:420px;position:relative;border-radius:12px;overflow:hidden;background:#0a0403;margin-top:12px;border:1px solid rgba(255,255,255,0.08);';

      // Add custom header bar
      const toolbar = document.createElement('div');
      toolbar.id = 'tern-tv-toolbar';
      toolbar.style.cssText = 'height:38px;background:#140704;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-size:12px;';
      toolbar.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-weight:600;color:#fff;display:flex;align-items:center;gap:6px;">
            <span id="tern-chart-symbol-badge" style="color:#ffaa00;">${marketDef.symbol}/USD</span>
            <span style="background:rgba(255,120,0,0.15);color:#ffaa00;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;">LIVE</span>
          </span>
          <div style="height:14px;width:1px;background:rgba(255,255,255,0.1);"></div>
          <div id="tern-tf-pills" style="display:flex;gap:4px;">
            <button class="tern-tf-btn active" data-tf="1" style="background:rgba(255,255,255,0.12);border:none;color:#fff;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;">1m</button>
            <button class="tern-tf-btn" data-tf="5" style="background:transparent;border:none;color:rgba(255,255,255,0.6);padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;">5m</button>
            <button class="tern-tf-btn" data-tf="15" style="background:transparent;border:none;color:rgba(255,255,255,0.6);padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;">15m</button>
            <button class="tern-tf-btn" data-tf="60" style="background:transparent;border:none;color:rgba(255,255,255,0.6);padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;">1h</button>
            <button class="tern-tf-btn" data-tf="240" style="background:transparent;border:none;color:rgba(255,255,255,0.6);padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;">4h</button>
            <button class="tern-tf-btn" data-tf="D" style="background:transparent;border:none;color:rgba(255,255,255,0.6);padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer;">1D</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="color:rgba(255,255,255,0.5);font-size:11px;">Powered by TradingView Free API</span>
        </div>
      `;

      const chartFrameWrap = document.createElement('div');
      chartFrameWrap.id = 'tern-tv-frame-wrap';
      chartFrameWrap.style.cssText = 'width:100%;height:calc(100% - 38px);position:relative;';

      tvContainer.appendChild(toolbar);
      tvContainer.appendChild(chartFrameWrap);
      chartPane.appendChild(tvContainer);

      // Wire timeframe buttons
      toolbar.querySelectorAll('.tern-tf-btn').forEach(btn => {
        btn.onclick = () => {
          toolbar.querySelectorAll('.tern-tf-btn').forEach(b => {
            b.style.background = 'transparent';
            b.style.color = 'rgba(255,255,255,0.6)';
          });
          btn.style.background = 'rgba(255,255,255,0.12)';
          btn.style.color = '#fff';
          const tf = btn.getAttribute('data-tf');
          embedTradingViewIframe(marketDef.tvSymbol, tf);
        };
      });
    }

    // Update symbol title
    const badge = document.getElementById('tern-chart-symbol-badge');
    if (badge) badge.innerText = `${marketDef.symbol}/USD`;

    embedTradingViewIframe(marketDef.tvSymbol, '60');
  }

  function embedTradingViewIframe(symbol, interval = '60') {
    const wrap = document.getElementById('tern-tv-frame-wrap');
    if (!wrap) return;

    // TradingView Official Embed Widget URL with full free technical indicators & dark ocean skin
    const tvUrl = new URL('https://s.tradingview.com/widgetembed/');
    tvUrl.searchParams.set('frameElementId', 'tradingview_tern_chart');
    tvUrl.searchParams.set('symbol', symbol);
    tvUrl.searchParams.set('interval', interval);
    tvUrl.searchParams.set('hidesidetoolbar', '0');
    tvUrl.searchParams.set('hidetoptoolbar', '0');
    tvUrl.searchParams.set('symboledit', '1');
    tvUrl.searchParams.set('saveimage', '0');
    tvUrl.searchParams.set('toolbarbg', '140704');
    tvUrl.searchParams.set('studies', '["MASimple@tv-basicstudies","RSI@tv-basicstudies"]');
    tvUrl.searchParams.set('theme', 'dark');
    tvUrl.searchParams.set('style', '1');
    tvUrl.searchParams.set('timezone', 'Etc/UTC');
    tvUrl.searchParams.set('studies_overrides', '{}');
    tvUrl.searchParams.set('overrides', JSON.stringify({
      "paneProperties.background": "#0a0403",
      "paneProperties.backgroundType": "solid",
      "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.05)",
      "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.05)",
      "scalesProperties.textColor": "#94a3b8"
    }));
    tvUrl.searchParams.set('enabled_features', '[]');
    tvUrl.searchParams.set('disabled_features', '[]');
    tvUrl.searchParams.set('locale', 'en');
    tvUrl.searchParams.set('utm_source', 'localhost');

    wrap.innerHTML = `<iframe id="tradingview_tern_chart" src="${tvUrl.toString()}" style="width:100%;height:100%;border:none;display:block;" allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
  }

  // --- REAL-TIME LIVE HEADER TICKER & MARKET POLLER ---
  let tickerInterval = null;
  let marketPricesInterval = null;

  function initLiveTicker(symbol) {
    if (tickerInterval) clearInterval(tickerInterval);

    async function pollTicker() {
      try {
        let data = null;
        try {
          const res = await fetch(`/api/ticker?symbol=${symbol}USDT`);
          if (res.ok) data = await res.json();
        } catch (e) {}

        // Fallback for static hosts (Netlify, Vercel, GitHub Pages) without Node backend
        if (!data || !data.price) {
          const isCrypto = !['NVDA', 'SPY', 'TSLA', 'AAPL', 'GOLD'].includes(symbol);
          if (isCrypto) {
            const binSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
            const bRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binSymbol}`);
            if (bRes.ok) {
              const bd = await bRes.json();
              data = {
                symbol: bd.symbol,
                price: parseFloat(bd.lastPrice),
                change24h: parseFloat(bd.priceChangePercent) / 100,
                high24h: parseFloat(bd.highPrice),
                low24h: parseFloat(bd.lowPrice)
              };
            }
          }
        }

        if (data && data.price) {
          if (state.activeMarket !== symbol) return; // Prevent stale updates
          const m = MARKETS_DEF.find(x => x.symbol === symbol);
          if (m) {
            m.price = data.price;
            if (data.change24h !== undefined) m.change24h = data.change24h;
            if (data.high24h) m.high24h = data.high24h;
            if (data.low24h) m.low24h = data.low24h;
          }
          updateHeaderStats({ ...data, symbol });
        }
      } catch (e) {
        // quiet fallback
      }
    }

    pollTicker();
    tickerInterval = setInterval(pollTicker, 3000);
  }

  function updateHeaderStats(data) {
    if (data.symbol && !data.symbol.toUpperCase().startsWith(state.activeMarket.toUpperCase())) {
      return; // Discard stats belonging to a different symbol
    }
    const priceEl = document.querySelector('.trade_mark__iOnEa');
    const changeEl = document.querySelector('.trade_headNums__mog4Q > .num:nth-child(2)');
    const statsDl = document.querySelector('.trade_headStats__01avb');

    if (priceEl && data.price) {
      const oldPrice = parseFloat(priceEl.innerText.replace(/[^0-9.]/g, '')) || 0;
      priceEl.innerText = formatUSD(data.price);
      if (oldPrice > 0 && data.price !== oldPrice) {
        priceEl.style.transition = 'color 0.2s ease';
        priceEl.style.color = data.price > oldPrice ? '#10b981' : '#ef4444';
        setTimeout(() => { priceEl.style.color = ''; }, 600);
      }
    }

    if (changeEl && data.change24h !== undefined) {
      const pctStr = formatPct(data.change24h);
      changeEl.innerText = pctStr;
      changeEl.style.color = data.change24h >= 0 ? '#10b981' : '#ef4444';
    }

    if (statsDl && data.high24h) {
      const dds = statsDl.querySelectorAll('dd');
      if (dds.length >= 4) {
        dds[0].innerText = formatUSD(data.high24h);
        dds[1].innerText = formatUSD(data.low24h);
        if (dds[2].innerText === '-') dds[2].innerText = '0.0118%';
        if (dds[3].innerText === '-') dds[3].innerText = '$12.4M';
      }
    }
  }

  async function pollMarketPrices() {
    try {
      let data = null;
      try {
        const res = await fetch('/api/market-prices');
        if (res.ok) data = await res.json();
      } catch (e) {}

      // Direct Binance fallback for static hosts like Netlify
      if (!data) {
        try {
          const symbols = JSON.stringify(["ETHUSDT","BTCUSDT","SOLUSDT","BNBUSDT","XRPUSDT","DOGEUSDT","ADAUSDT","AVAXUSDT","LINKUSDT"]);
          const bRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`);
          if (bRes.ok) {
            const list = await bRes.json();
            data = {};
            list.forEach(item => {
              const sym = item.symbol.replace('USDT', '');
              data[sym] = {
                price: parseFloat(item.lastPrice),
                change24h: parseFloat(item.priceChangePercent) / 100,
                high24h: parseFloat(item.highPrice),
                low24h: parseFloat(item.lowPrice)
              };
            });
          }
        } catch (err2) {}
      }

      if (!data || typeof data !== 'object') return;

      Object.entries(data).forEach(([sym, info]) => {
        const m = MARKETS_DEF.find(x => x.symbol === sym);
        if (!m || !info) return;

        const oldPrice = m.price;
        if (info.price !== undefined && !isNaN(info.price)) {
          m.price = info.price;
        }
        if (info.change24h !== undefined && !isNaN(info.change24h)) {
          m.change24h = info.change24h;
        }
        if (info.high24h !== undefined && !isNaN(info.high24h)) {
          m.high24h = info.high24h;
        }
        if (info.low24h !== undefined && !isNaN(info.low24h)) {
          m.low24h = info.low24h;
        }

        // 1. Update Left Sidebar row if rendered
        const row = document.querySelector(`[data-market-symbol="${sym}"]`);
        if (row) {
          const priceEl = row.querySelector('.tern-m-price');
          const changeEl = row.querySelector('.tern-m-change');

          if (priceEl && m.price !== undefined) {
            priceEl.innerText = formatUSD(m.price);
            if (oldPrice && m.price !== oldPrice) {
              priceEl.style.color = m.price > oldPrice ? '#10b981' : '#ef4444';
              setTimeout(() => { if (priceEl) priceEl.style.color = '#fff'; }, 600);
            }
          }

          if (changeEl && m.change24h !== undefined) {
            changeEl.innerText = formatPct(m.change24h);
            changeEl.style.color = m.change24h >= 0 ? '#10b981' : '#ef4444';
          }
        }

        // 2. If active market, sync Center Header Stats & Order calculations
        if (sym === state.activeMarket) {
          updateHeaderStats({
            price: m.price,
            change24h: m.change24h,
            high24h: m.high24h,
            low24h: m.low24h
          });
          updateOrderCalculations();
        }
      });

      // 3. Update Radar Table if present
      updateRadarTableLivePrices();
    } catch (e) {
      // quiet fallback
    }
  }

  function startMarketPricesPolling() {
    if (marketPricesInterval) clearInterval(marketPricesInterval);
    pollMarketPrices();
    marketPricesInterval = setInterval(pollMarketPrices, 3000);
  }

  function updateRadarTableLivePrices() {
    const tableWrap = document.getElementById('tern-radar-table-wrap');
    if (!tableWrap) return;
    const rows = tableWrap.querySelectorAll('tbody tr');
    rows.forEach(tr => {
      const symEl = tr.querySelector('td:first-child div > div:first-child');
      if (!symEl) return;
      const sym = symEl.innerText.trim();
      const m = MARKETS_DEF.find(x => x.symbol === sym);
      if (!m) return;
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 4) {
        tds[2].innerText = formatUSD(m.price);
        tds[3].innerText = formatPct(m.change24h);
        tds[3].style.color = m.change24h >= 0 ? '#10b981' : '#ef4444';
      }
    });
  }

  // --- MARKETS SIDEBAR & SELECTION ENGINE ---
  let currentMarketFilter = 'All';
  let currentSearchQuery = '';
  let globalDelegationAttached = false;

  function renderMarkets() {
    const listEl = document.querySelector('.trade_marketRows__z7XrF');
    if (!listEl) return;

    listEl.innerHTML = '';
    const filtered = MARKETS_DEF.filter(m => {
      const matchesCategory = (currentMarketFilter === 'All') ||
        (currentMarketFilter === 'Crypto' && m.kind === 'crypto') ||
        (currentMarketFilter === 'RWA' && m.kind === 'rwa') ||
        (currentMarketFilter === 'Pools' && m.poolTvl);
      const matchesSearch = !currentSearchQuery ||
        m.symbol.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(currentSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<li class="trade_marketEmpty__MQtvG" style="padding:16px;text-align:center;color:rgba(255,255,255,0.4);">Nothing matches "${currentSearchQuery}".</li>`;
      return;
    }

    filtered.forEach(m => {
      const isSelected = m.symbol === state.activeMarket;
      const li = document.createElement('li');
      li.setAttribute('data-market-symbol', m.symbol);
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      li.style.cssText = `
        display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
        border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all 0.15s ease;
        background:${isSelected ? 'rgba(255,120,0,0.12)' : 'transparent'};
        border:1px solid ${isSelected ? 'rgba(255,120,0,0.3)' : 'transparent'};
        user-select:none;
      `;

      li.onmouseenter = () => { if (!isSelected) li.style.background = 'rgba(255,255,255,0.04)'; };
      li.onmouseleave = () => { if (!isSelected) li.style.background = 'transparent'; };

      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;pointer-events:none;">
          <img src="${m.logo}" alt="${m.symbol}" style="width:24px;height:24px;border-radius:50%;object-fit:contain;pointer-events:none;" onerror="this.src='/tern-mark.png'"/>
          <div style="pointer-events:none;">
            <div style="font-weight:600;font-size:13px;color:#fff;">${m.symbol}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">${m.name}</div>
          </div>
        </div>
        <div style="text-align:right;pointer-events:none;">
          <div class="tern-m-price" style="font-weight:600;font-size:13px;color:#fff;transition:color 0.25s ease;">${formatUSD(m.price)}</div>
          <div class="tern-m-change" style="font-size:11px;font-weight:500;color:${m.change24h >= 0 ? '#10b981' : '#ef4444'};">${formatPct(m.change24h)}</div>
        </div>
      `;

      li.onclick = (e) => {
        e.stopPropagation();
        selectMarket(m.symbol);
      };

      listEl.appendChild(li);
    });
  }

  function setMarketFilter(filter) {
    currentMarketFilter = filter;
    const pillGroup = document.querySelector('.trade_markets__CZQ7Y .Pill_group__0Jguy');
    if (pillGroup) {
      const pills = pillGroup.querySelectorAll('.Pill_pill__gqReg');
      pills.forEach(p => {
        const isMatch = p.innerText.trim().toLowerCase() === filter.toLowerCase();
        if (isMatch) {
          p.classList.add('Pill_isActive___xy_7');
          p.setAttribute('aria-pressed', 'true');
        } else {
          p.classList.remove('Pill_isActive___xy_7');
          p.setAttribute('aria-pressed', 'false');
        }
      });
    }
    renderMarkets();
  }

  function initMarketsSidebar() {
    const listEl = document.querySelector('.trade_marketRows__z7XrF');
    const searchInput = document.querySelector('.Field_searchControl__PnSYY');
    const pillGroup = document.querySelector('.trade_markets__CZQ7Y .Pill_group__0Jguy');

    if (!listEl) return;

    if (searchInput) {
      searchInput.oninput = (e) => {
        currentSearchQuery = e.target.value.trim();
        renderMarkets();
      };
    }

    if (pillGroup) {
      const pills = pillGroup.querySelectorAll('.Pill_pill__gqReg');
      pills.forEach(p => {
        p.onclick = (e) => {
          e.stopPropagation();
          setMarketFilter(p.innerText.trim());
        };
      });
    }

    attachCapturingDelegation();
    renderMarkets();
  }

  function attachCapturingDelegation() {
    if (globalDelegationAttached) return;
    globalDelegationAttached = true;

    // Window-level capturing event listeners guarantee execution before React capture interception
    window.addEventListener('click', (e) => {
      // 1. Market row selection
      const marketItem = e.target.closest('[data-market-symbol]');
      if (marketItem) {
        e.preventDefault();
        e.stopPropagation();
        const sym = marketItem.getAttribute('data-market-symbol');
        if (sym) {
          selectMarket(sym);
          return;
        }
      }

      // 2. Market category filter pill
      const pill = e.target.closest('.trade_markets__CZQ7Y .Pill_pill__gqReg');
      if (pill) {
        e.preventDefault();
        e.stopPropagation();
        setMarketFilter(pill.innerText.trim());
        return;
      }
    }, true);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const marketItem = e.target.closest('[data-market-symbol]');
        if (marketItem) {
          e.preventDefault();
          const sym = marketItem.getAttribute('data-market-symbol');
          if (sym) selectMarket(sym);
        }
      }
    }, true);
  }

  function selectMarket(symbol) {
    state.activeMarket = symbol;
    const m = MARKETS_DEF.find(x => x.symbol === symbol) || MARKETS_DEF[0];

    // Update Header
    const titleRest = document.querySelector('.trade_titleRest__mUnYP');
    if (titleRest) titleRest.innerHTML = ` ${m.symbol}`;

    const titleMark = document.querySelector('.trade_titleMark__cxmeg img');
    if (titleMark) {
      titleMark.src = m.logo;
      titleMark.alt = m.symbol;
      titleMark.onerror = null;
    }

    const tag = document.querySelector('.trade_headTags__dmJMT .Tag_tag__HDJeX');
    if (tag) tag.innerText = m.kind === 'rwa' ? 'Tokenized equity' : 'Crypto';

    // Update Header Prices & 24h Stats
    const priceEl = document.querySelector('.trade_mark__iOnEa');
    if (priceEl) priceEl.innerText = formatUSD(m.price);

    const changeEl = document.querySelector('.trade_headNums__mog4Q > .num:nth-child(2)');
    if (changeEl) {
      changeEl.innerText = formatPct(m.change24h);
      changeEl.style.color = m.change24h >= 0 ? '#10b981' : '#ef4444';
    }

    const statsDl = document.querySelector('.trade_headStats__01avb');
    if (statsDl) {
      const dds = statsDl.querySelectorAll('dd');
      if (dds.length >= 4) {
        dds[0].innerText = formatUSD(m.high24h);
        dds[1].innerText = formatUSD(m.low24h);
        dds[2].innerText = m.funding1h;
        dds[3].innerText = m.poolTvl;
      }
    }

    // Update Live Chart
    loadTradingViewChart(m);
    initLiveTicker(m.symbol);

    // Update Sidebar highlight smoothly
    renderMarkets();

    // Update Order Form receive calculations and inputs
    initOrderPanel();
    updateOrderCalculations();

    // Push URL without page reload
    try {
      window.history.pushState({ market: m.symbol }, '', `/trade/${m.symbol}`);
    } catch (e) {}
  }

  // --- INTERACTIVE ORDER PANEL ---
  function showRechargeRequiredModal(actionName = 'trades') {
    openModal('Deposit Required', `
      <div style="text-align:center;padding:16px 0;">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(234,179,8,0.15);border:1px solid #eab308;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;color:#eab308;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div style="font-size:18px;font-weight:700;margin-bottom:8px;color:#fff;">Deposit Required to Trade</div>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:20px;">
          Your available balance is <strong style="color:#fff;">$0.00 USDG</strong>. To execute ${actionName} on Robinhood Chain, you must first top up your account with supported cryptocurrency.
        </p>
        <div style="display:flex;gap:12px;">
          <button id="tern-cancel-topup" style="flex:1;padding:12px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-weight:600;cursor:pointer;">Cancel</button>
          <a href="/recharge" style="flex:1;padding:12px;border-radius:10px;background:#ff5500;border:none;color:#fff;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;">Top Up Now →</a>
        </div>
      </div>
    `);
    const cancelBtn = document.getElementById('tern-cancel-topup');
    if (cancelBtn) cancelBtn.onclick = closeModal;
    showToast('Top Up Required', 'Your available balance is $0.00. Please recharge your account.', 'error');
  }

  function initOrderPanel() {
    const rightPane = document.querySelector('[data-tour="trade-panel"] .Pane_body__rpCX4, .trade_right__Pwqb4 .Pane_body__rpCX4');
    if (!rightPane) return;

    const currentMarket = MARKETS_DEF.find(m => m.symbol === state.activeMarket) || MARKETS_DEF[0];
    const tab = state.activeTab || 'buy';

    let tabContent = '';

    if (tab === 'buy') {
      tabContent = `
        <!-- Spot / Perp Segment -->
        <div style="display:flex;background:rgba(255,255,255,0.05);padding:3px;border-radius:10px;">
          <button id="tern-mode-spot" style="flex:1;padding:6px;border-radius:8px;border:none;background:${state.orderType === 'spot' ? '#ff5500' : 'transparent'};color:#fff;font-weight:600;cursor:pointer;font-size:12px;">Spot</button>
          <button id="tern-mode-perp" style="flex:1;padding:6px;border-radius:8px;border:none;background:${state.orderType === 'perp' ? '#ff5500' : 'transparent'};color:#fff;font-weight:600;cursor:pointer;font-size:12px;">Perp (Leverage)</button>
        </div>

        <!-- Leverage selector (if perp) -->
        <div id="tern-leverage-wrap" style="display:${state.orderType === 'perp' ? 'flex' : 'none'};align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);font-size:12px;">Leverage</span>
          <div style="display:flex;gap:4px;">
            ${[1, 2, 5, 10, 20].map(l => `
              <button class="tern-lev-btn ${state.leverage === l ? 'active' : ''}" data-lev="${l}" style="background:${state.leverage === l ? 'rgba(255,120,0,0.2)' : 'transparent'};border:1px solid ${state.leverage === l ? '#ffaa00' : 'rgba(255,255,255,0.1)'};color:${state.leverage === l ? '#ffaa00' : '#fff'};padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;">${l}x</button>
            `).join('')}
          </div>
        </div>

        <!-- Pay Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>You Pay</span>
            <span>Available: $${state.userBalanceUsd.toFixed(2)} USDG <a href="/recharge" style="color:#ffaa00;font-weight:700;text-decoration:none;margin-left:4px;">[Top Up +]</a></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-input-pay" type="number" value="${state.payAmount}" placeholder="0.0" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);padding:4px 10px;border-radius:8px;">
              USDG
            </span>
          </div>
          <div style="display:flex;gap:6px;margin-top:10px;">
            <button class="tern-quick-pct" data-pct="0.25" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">25%</button>
            <button class="tern-quick-pct" data-pct="0.50" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">50%</button>
            <button class="tern-quick-pct" data-pct="0.75" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">75%</button>
            <button class="tern-quick-pct" data-pct="1.00" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">MAX</button>
          </div>
        </div>

        <!-- Receive Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>You Receive (Est.)</span>
            <span id="tern-rate-indicator">1 ${currentMarket.symbol} = ${formatUSD(currentMarket.price)}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-input-receive" type="text" readonly value="${state.receiveAmount}" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;display:flex;align-items:center;gap:6px;background:rgba(255,120,0,0.15);color:#ffaa00;padding:4px 10px;border-radius:8px;">
              ${currentMarket.symbol}
            </span>
          </div>
        </div>

        <!-- Breakdown Details -->
        <div style="background:rgba(255,255,255,0.02);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:6px;font-size:11px;color:rgba(255,255,255,0.6);">
          <div style="display:flex;justify-content:space-between;">
            <span>Price Impact</span>
            <span style="color:#10b981;">< 0.04%</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>Protocol Fee</span>
            <span>$0.12 (0.05%)</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>Route / Venue</span>
            <span style="color:#ffaa00;">Uniswap v3 · Robinhood Chain</span>
          </div>
        </div>

        <!-- Action Button -->
        <button id="tern-place-order-btn" style="width:100%;padding:14px;border-radius:8px;background:#ff5500;border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:none;transition:transform 0.1s ease,box-shadow 0.1s ease;">
          Buy ${currentMarket.symbol}
        </button>
      `;
    } else if (tab === 'sell') {
      tabContent = `
        <!-- Sell Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>You Sell</span>
            <span>Available: 0.00 ${currentMarket.symbol} <a href="/recharge" style="color:#ffaa00;font-weight:700;text-decoration:none;margin-left:4px;">[Top Up +]</a></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-input-sell-asset" type="number" value="0.5" placeholder="0.0" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;display:flex;align-items:center;gap:6px;background:rgba(255,120,0,0.15);color:#ffaa00;padding:4px 10px;border-radius:8px;">
              ${currentMarket.symbol}
            </span>
          </div>
          <div style="display:flex;gap:6px;margin-top:10px;">
            <button class="tern-quick-sell-pct" data-pct="0.25" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">25%</button>
            <button class="tern-quick-sell-pct" data-pct="0.50" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">50%</button>
            <button class="tern-quick-sell-pct" data-pct="0.75" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">75%</button>
            <button class="tern-quick-sell-pct" data-pct="1.00" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">MAX</button>
          </div>
        </div>

        <!-- Receive Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>You Receive (Est.)</span>
            <span>1 ${currentMarket.symbol} = ${formatUSD(currentMarket.price)}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-input-sell-receive" type="text" readonly value="$1,239.25" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);padding:4px 10px;border-radius:8px;">
              USDG
            </span>
          </div>
        </div>

        <!-- Details -->
        <div style="background:rgba(255,255,255,0.02);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:6px;font-size:11px;color:rgba(255,255,255,0.6);">
          <div style="display:flex;justify-content:space-between;">
            <span>Price Impact</span>
            <span style="color:#10b981;">< 0.02%</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>Slippage Tolerance</span>
            <span style="color:#ffaa00;">0.5% (Auto)</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>Fee Router</span>
            <span>Uniswap v3 (0.05%)</span>
          </div>
        </div>

        <!-- Action Button -->
        <button id="tern-place-order-btn" style="width:100%;padding:14px;border-radius:8px;background:#e11d48;border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:none;transition:transform 0.1s ease,box-shadow 0.1s ease;">
          Sell ${currentMarket.symbol}
        </button>
      `;
    } else if (tab === 'provide') {
      tabContent = `
        <div style="background:rgba(255,120,0,0.08);border:1px solid rgba(255,120,0,0.25);border-radius:10px;padding:10px 12px;font-size:12px;color:#ffaa00;display:flex;align-items:center;justify-content:space-between;">
          <span style="display:inline-flex;align-items:center;gap:6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Hedged Range LP Pool
          </span>
          <span style="font-weight:700;color:#34d399;">24.8% APR</span>
        </div>

        <!-- Token A Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>Deposit ${currentMarket.symbol}</span>
            <span>Available: 0.00 <a href="/recharge" style="color:#ffaa00;font-weight:700;text-decoration:none;">[Top Up +]</a></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-lp-input-a" type="number" value="1.0" style="background:transparent;border:none;color:#fff;font-size:16px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;background:rgba(255,120,0,0.15);color:#ffaa00;padding:3px 8px;border-radius:6px;font-size:12px;">${currentMarket.symbol}</span>
          </div>
        </div>

        <!-- Token B Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>Deposit USDG</span>
            <span>Available: $0.00 <a href="/recharge" style="color:#ffaa00;font-weight:700;text-decoration:none;">[Top Up +]</a></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-lp-input-b" type="number" value="${currentMarket.price.toFixed(2)}" style="background:transparent;border:none;color:#fff;font-size:16px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:6px;font-size:12px;">USDG</span>
          </div>
        </div>

        <!-- Fee Tier Selector -->
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.5);">
            <span>Fee Tier</span>
            <span style="color:#ffaa00;">0.05% selected</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">
            <button class="tern-fee-tier" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#fff;padding:6px;border-radius:8px;font-size:10px;cursor:pointer;">0.01%</button>
            <button class="tern-fee-tier active" style="background:rgba(255,120,0,0.2);border:1px solid #ffaa00;color:#ffaa00;padding:6px;border-radius:8px;font-size:10px;cursor:pointer;font-weight:700;">0.05%</button>
            <button class="tern-fee-tier" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#fff;padding:6px;border-radius:8px;font-size:10px;cursor:pointer;">0.30%</button>
            <button class="tern-fee-tier" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#fff;padding:6px;border-radius:8px;font-size:10px;cursor:pointer;">1.00%</button>
          </div>
        </div>

        <!-- Range Inputs -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 10px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:4px;">Min Price</div>
            <input type="text" value="${(currentMarket.price * 0.9).toFixed(2)}" style="background:transparent;border:none;color:#fff;font-size:14px;font-weight:600;width:100%;outline:none;font-family:monospace;"/>
          </div>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 10px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:4px;">Max Price</div>
            <input type="text" value="${(currentMarket.price * 1.1).toFixed(2)}" style="background:transparent;border:none;color:#fff;font-size:14px;font-weight:600;width:100%;outline:none;font-family:monospace;"/>
          </div>
        </div>

        <!-- Action Button -->
        <button id="tern-place-order-btn" style="width:100%;padding:14px;border-radius:8px;background:#059669;border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:none;transition:transform 0.1s ease,box-shadow 0.1s ease;">
          Provide Liquidity
        </button>
      `;
    } else if (tab === 'limit') {
      tabContent = `
        <!-- Side Toggle -->
        <div style="display:flex;background:rgba(255,255,255,0.05);padding:3px;border-radius:10px;">
          <button id="tern-limit-buy-mode" style="flex:1;padding:6px;border-radius:8px;border:none;background:#ff5500;color:#fff;font-weight:600;cursor:pointer;font-size:12px;">Buy Limit</button>
          <button id="tern-limit-sell-mode" style="flex:1;padding:6px;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,0.7);font-weight:600;cursor:pointer;font-size:12px;">Sell Limit</button>
        </div>

        <!-- Limit Price Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>Limit Price</span>
            <span>Current: ${formatUSD(currentMarket.price)}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-input-limit-price" type="number" value="${currentMarket.price}" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;background:rgba(255,255,255,0.08);padding:4px 10px;border-radius:8px;">USDG</span>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button class="tern-limit-adj" data-delta="-0.01" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">-1%</button>
            <button class="tern-limit-adj" data-delta="0" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">Market</button>
            <button class="tern-limit-adj" data-delta="0.01" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.7);padding:2px 8px;border-radius:6px;font-size:11px;cursor:pointer;">+1%</button>
          </div>
        </div>

        <!-- Quantity Input -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            <span>Order Quantity</span>
            <span>Available: $${state.userBalanceUsd.toFixed(2)} USDG <a href="/recharge" style="color:#ffaa00;font-weight:700;text-decoration:none;margin-left:4px;">[Top Up +]</a></span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <input id="tern-input-limit-qty" type="number" value="1.0" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
            <span style="font-weight:600;color:#fff;background:rgba(255,120,0,0.15);color:#ffaa00;padding:4px 10px;border-radius:8px;">${currentMarket.symbol}</span>
          </div>
        </div>

        <!-- Expiry Details -->
        <div style="background:rgba(255,255,255,0.02);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:6px;font-size:11px;color:rgba(255,255,255,0.6);">
          <div style="display:flex;justify-content:space-between;">
            <span>Order Total</span>
            <span id="tern-limit-total-display" style="color:#fff;font-weight:600;">$${formatUSD(currentMarket.price)} USDG</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span>Time in Force</span>
            <span style="color:#ffaa00;">GTC (Good-Til-Cancelled)</span>
          </div>
        </div>

        <!-- Action Button -->
        <button id="tern-place-order-btn" style="width:100%;padding:14px;border-radius:8px;background:#ff5500;border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:none;transition:transform 0.1s ease,box-shadow 0.1s ease;">
          Place Limit Order
        </button>
      `;
    }

    rightPane.innerHTML = `
      <div role="tablist" aria-label="Trade" class="Pill_group__0Jguy srf Pill_groupSegmented__w_VjR trade_panelTabs__tUZZz" style="display:flex;margin-bottom:16px;">
        <button type="button" class="Pill_pill__gqReg Pill_small__tbP3n ${tab === 'buy' ? 'Pill_isActive___xy_7' : ''}" data-tab="buy" style="flex:1;">Buy</button>
        <button type="button" class="Pill_pill__gqReg Pill_small__tbP3n ${tab === 'sell' ? 'Pill_isActive___xy_7' : ''}" data-tab="sell" style="flex:1;">Sell</button>
        <button type="button" class="Pill_pill__gqReg Pill_small__tbP3n ${tab === 'provide' ? 'Pill_isActive___xy_7' : ''}" data-tab="provide" style="flex:1;">Provide</button>
        <button type="button" class="Pill_pill__gqReg Pill_small__tbP3n ${tab === 'limit' ? 'Pill_isActive___xy_7' : ''}" data-tab="limit" style="flex:1;">Limit</button>
      </div>

      <div class="tern-order-body" style="font-size:13px;display:flex;flex-direction:column;gap:14px;">
        ${tabContent}
      </div>
    `;

    // Tab switching
    rightPane.querySelectorAll('.trade_panelTabs__tUZZz .Pill_pill__gqReg').forEach(tabBtn => {
      tabBtn.onclick = () => {
        state.activeTab = tabBtn.getAttribute('data-tab');
        initOrderPanel();
      };
    });

    // Wire Spot / Perp
    const spotBtn = document.getElementById('tern-mode-spot');
    const perpBtn = document.getElementById('tern-mode-perp');
    const levWrap = document.getElementById('tern-leverage-wrap');

    if (spotBtn && perpBtn) {
      spotBtn.onclick = () => {
        state.orderType = 'spot';
        spotBtn.style.background = '#ff5500';
        perpBtn.style.background = 'transparent';
        if (levWrap) levWrap.style.display = 'none';
        updateOrderCalculations();
      };
      perpBtn.onclick = () => {
        state.orderType = 'perp';
        perpBtn.style.background = '#ff5500';
        spotBtn.style.background = 'transparent';
        if (levWrap) levWrap.style.display = 'flex';
        updateOrderCalculations();
      };
    }

    // Leverage chips
    rightPane.querySelectorAll('.tern-lev-btn').forEach(lBtn => {
      lBtn.onclick = () => {
        rightPane.querySelectorAll('.tern-lev-btn').forEach(b => {
          b.style.background = 'transparent';
          b.style.borderColor = 'rgba(255,255,255,0.1)';
          b.style.color = '#fff';
        });
        lBtn.style.background = 'rgba(255,120,0,0.2)';
        lBtn.style.borderColor = '#ffaa00';
        lBtn.style.color = '#ffaa00';
        state.leverage = parseInt(lBtn.getAttribute('data-lev'), 10) || 1;
        updateOrderCalculations();
      };
    });

    // Pay input (Buy)
    const payInput = document.getElementById('tern-input-pay');
    if (payInput) {
      payInput.oninput = () => {
        state.payAmount = payInput.value;
        updateOrderCalculations();
      };
    }

    // Quick percentages (Buy)
    rightPane.querySelectorAll('.tern-quick-pct').forEach(pBtn => {
      pBtn.onclick = () => {
        const pct = parseFloat(pBtn.getAttribute('data-pct'));
        const total = state.userBalanceUsd > 0 ? state.userBalanceUsd : 5000;
        const val = Math.round(total * pct);
        if (payInput) {
          payInput.value = val;
          state.payAmount = String(val);
          updateOrderCalculations();
        }
      };
    });

    // Sell input calculations
    const sellInput = document.getElementById('tern-input-sell-asset');
    const sellReceiveInput = document.getElementById('tern-input-sell-receive');
    if (sellInput && sellReceiveInput) {
      sellInput.oninput = () => {
        const qty = parseFloat(sellInput.value) || 0;
        sellReceiveInput.value = formatUSD(qty * currentMarket.price);
      };
      rightPane.querySelectorAll('.tern-quick-sell-pct').forEach(spBtn => {
        spBtn.onclick = () => {
          const pct = parseFloat(spBtn.getAttribute('data-pct'));
          const defaultHoldings = 2.5;
          const val = (defaultHoldings * pct).toFixed(2);
          sellInput.value = val;
          sellReceiveInput.value = formatUSD(parseFloat(val) * currentMarket.price);
        };
      });
    }

    // Limit price calculations
    const limitPriceInput = document.getElementById('tern-input-limit-price');
    const limitQtyInput = document.getElementById('tern-input-limit-qty');
    const limitTotalDisplay = document.getElementById('tern-limit-total-display');
    function updateLimitTotal() {
      if (!limitPriceInput || !limitQtyInput || !limitTotalDisplay) return;
      const p = parseFloat(limitPriceInput.value) || 0;
      const q = parseFloat(limitQtyInput.value) || 0;
      limitTotalDisplay.innerText = `${formatUSD(p * q)} USDG`;
    }
    if (limitPriceInput && limitQtyInput) {
      limitPriceInput.oninput = updateLimitTotal;
      limitQtyInput.oninput = updateLimitTotal;
      rightPane.querySelectorAll('.tern-limit-adj').forEach(adjBtn => {
        adjBtn.onclick = () => {
          const delta = parseFloat(adjBtn.getAttribute('data-delta'));
          const newPrice = delta === 0 ? currentMarket.price : currentMarket.price * (1 + delta);
          limitPriceInput.value = newPrice >= 1 ? newPrice.toFixed(2) : newPrice.toFixed(4);
          updateLimitTotal();
        };
      });
    }

    // Wire Place Order Button
    const placeBtn = document.getElementById('tern-place-order-btn');
    if (placeBtn) {
      placeBtn.onclick = () => {
        executeOrder();
      };
    }

    updateOrderCalculations();
  }

  function updateOrderCalculations() {
    const receiveInput = document.getElementById('tern-input-receive');
    const rateInd = document.getElementById('tern-rate-indicator');
    const m = MARKETS_DEF.find(x => x.symbol === state.activeMarket) || MARKETS_DEF[0];

    if (rateInd) {
      rateInd.innerText = `1 ${m.symbol} = ${formatUSD(m.price)}`;
    }

    const payVal = parseFloat(state.payAmount) || 0;
    if (receiveInput && m.price > 0) {
      const lev = state.orderType === 'perp' ? state.leverage : 1;
      const rec = (payVal * lev) / m.price;
      state.receiveAmount = rec >= 1 ? rec.toFixed(4) : rec.toFixed(6);
      receiveInput.value = state.receiveAmount;
    }
  }

  function executeOrder() {
    // If balance is 0 or user hasn't topped up yet, prompt top up requirement
    if (state.userBalanceUsd <= 0) {
      showRechargeRequiredModal(state.activeTab || 'trade');
      return;
    }

    const m = MARKETS_DEF.find(x => x.symbol === state.activeMarket) || MARKETS_DEF[0];
    const btn = document.getElementById('tern-place-order-btn');
    if (btn) {
      const origText = btn.innerText;
      btn.innerText = 'Submitting to Robinhood Chain...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.innerText = origText;
        btn.disabled = false;
        btn.style.opacity = '1';

        // Add position
        state.openPositions.unshift({
          id: 'pos-' + Date.now(),
          asset: m.symbol,
          side: state.activeTab === 'buy' ? 'Long' : 'Short',
          size: `${state.receiveAmount} ${m.symbol}`,
          entry: m.price,
          mark: m.price,
          pnl: '+$0.00',
          pnlPct: '0.00%',
          leverage: state.orderType === 'perp' ? `${state.leverage}x` : '1x',
          value: `$${parseFloat(state.payAmount).toLocaleString()}`
        });

        renderBottomTables();
        showToast(
          'Order Executed',
          `Filled ${state.receiveAmount} ${m.symbol} at ${formatUSD(m.price)} on Uniswap v3`,
          'success'
        );
      }, 650);
    }
  }

  // --- BOTTOM TABLES (POSITIONS, ORDERS, THESES) ---
  function initBottomTabs() {
    const tabGroup = document.querySelector('.trade_bottom__DJNbl .Pill_groupWrap__bMD81');
    if (!tabGroup) return;

    tabGroup.querySelectorAll('.Pill_pill__gqReg').forEach(pill => {
      pill.onclick = () => {
        tabGroup.querySelectorAll('.Pill_pill__gqReg').forEach(p => {
          p.classList.remove('Pill_isActive___xy_7');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('Pill_isActive___xy_7');
        pill.setAttribute('aria-selected', 'true');
        const tab = pill.innerText.trim();
        renderBottomSection(tab);
      };
    });

    renderBottomSection('Positions');
  }

  function renderBottomSection(tab) {
    const bottomContainer = document.querySelector('.trade_bottom__DJNbl');
    if (!bottomContainer) return;

    let contentArea = document.getElementById('tern-bottom-content');
    if (!contentArea) {
      contentArea = document.createElement('div');
      contentArea.id = 'tern-bottom-content';
      // Remove any static placeholder note or empty table
      const note = bottomContainer.querySelector('.note');
      if (note) note.remove();
      const oldTable = bottomContainer.querySelector('.Table_wrap__FPjR0');
      if (oldTable) oldTable.remove();
      bottomContainer.appendChild(contentArea);
    }

    if (tab === 'Positions') {
      contentArea.innerHTML = `
        <div style="overflow-x:auto;margin-top:12px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;color:#fff;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;">
                <th style="padding:10px 14px;">Market</th>
                <th style="padding:10px 14px;">Type / Lev</th>
                <th style="padding:10px 14px;">Size</th>
                <th style="padding:10px 14px;">Entry Price</th>
                <th style="padding:10px 14px;">Mark Price</th>
                <th style="padding:10px 14px;">PnL</th>
                <th style="padding:10px 14px;text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.openPositions.map(p => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:12px 14px;font-weight:600;">${p.asset}</td>
                  <td style="padding:12px 14px;"><span style="background:rgba(255,120,0,0.15);color:#ffaa00;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${p.side} ${p.leverage}</span></td>
                  <td style="padding:12px 14px;font-family:monospace;">${p.size}</td>
                  <td style="padding:12px 14px;font-family:monospace;">${formatUSD(p.entry)}</td>
                  <td style="padding:12px 14px;font-family:monospace;">${formatUSD(p.mark)}</td>
                  <td style="padding:12px 14px;color:#10b981;font-weight:600;font-family:monospace;">${p.pnl} (${p.pnlPct})</td>
                  <td style="padding:12px 14px;text-align:right;">
                    <button class="tern-close-pos-btn" data-id="${p.id}" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#ef4444;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">Close</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      contentArea.querySelectorAll('.tern-close-pos-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          state.openPositions = state.openPositions.filter(x => x.id !== id);
          renderBottomSection('Positions');
          showToast('Position Closed', 'Position settled into USDG successfully', 'info');
        };
      });
    } else if (tab === 'Orders') {
      contentArea.innerHTML = `
        <div style="overflow-x:auto;margin-top:12px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;color:#fff;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;">
                <th style="padding:10px 14px;">Order</th>
                <th style="padding:10px 14px;">Type</th>
                <th style="padding:10px 14px;">Size</th>
                <th style="padding:10px 14px;">Limit Price</th>
                <th style="padding:10px 14px;">Status</th>
                <th style="padding:10px 14px;text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.openOrders.map(o => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td style="padding:12px 14px;font-weight:600;">${o.asset}</td>
                  <td style="padding:12px 14px;"><span style="background:rgba(255,255,255,0.08);padding:2px 8px;border-radius:6px;font-size:11px;">${o.side}</span></td>
                  <td style="padding:12px 14px;font-family:monospace;">${o.size}</td>
                  <td style="padding:12px 14px;font-family:monospace;">${formatUSD(o.price)}</td>
                  <td style="padding:12px 14px;color:#ffaa00;">${o.status}</td>
                  <td style="padding:12px 14px;text-align:right;">
                    <button class="tern-cancel-ord-btn" data-id="${o.id}" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.7);padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;">Cancel</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      contentArea.querySelectorAll('.tern-cancel-ord-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          state.openOrders = state.openOrders.filter(x => x.id !== id);
          renderBottomSection('Orders');
          showToast('Order Cancelled', 'Limit order cancelled', 'info');
        };
      });
    } else if (tab === 'Range orders') {
      contentArea.innerHTML = `
        <div style="padding:20px 14px;text-align:center;color:rgba(255,255,255,0.6);">
          <div style="font-size:14px;margin-bottom:8px;color:#fff;">Active Liquidity Range: ETH / USDG [500 bps]</div>
          <div style="font-size:12px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:6px;">
            <span>Lower: $2,350.00 — Upper: $2,620.00</span>
            <span>·</span>
            <span style="color:#10b981;display:inline-flex;align-items:center;gap:4px;">
              In Range
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
          </div>
          <button style="background:rgba(255,120,0,0.15);border:1px solid #ffaa00;color:#ffaa00;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;" onclick="TernApp.showToast('Fees Claimed', '$318.42 USDG claimed to wallet', 'success')">Claim Accumulated Fees ($318.42)</button>
        </div>
      `;
    } else if (tab === 'Theses') {
      const marketTheses = state.theses.filter(t => t.market === state.activeMarket);
      contentArea.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px 4px;">
          <span style="font-size:13px;font-weight:600;color:#fff;">Community Theses for ${state.activeMarket}</span>
          <button id="tern-post-thesis-btn" style="background:#ff5500;border:none;color:#fff;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;">+ Write Thesis</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;padding:10px 14px;">
          ${marketTheses.map(t => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <span style="font-weight:600;font-size:12px;color:#fff;">${t.author}</span>
                  <span style="background:rgba(255,120,0,0.15);color:#ffaa00;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;">${t.side.toUpperCase()}</span>
                  <span style="color:#10b981;font-size:11px;font-weight:600;">${t.pnl}</span>
                  <span style="color:rgba(255,255,255,0.4);font-size:11px;">${t.time}</span>
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.4;">${t.text}</div>
              </div>
              <button class="tern-vote-btn" data-id="${t.id}" style="display:flex;flex-direction:column;align-items:center;padding:8px 12px;border-radius:8px;background:${t.userVoted ? '#ff5500' : 'rgba(255,255,255,0.06)'};border:none;color:#fff;cursor:pointer;">
                <span style="font-size:12px;">▲</span>
                <span style="font-size:12px;font-weight:700;">${t.votes}</span>
              </button>
            </div>
          `).join('')}
        </div>
      `;

      contentArea.querySelectorAll('.tern-vote-btn').forEach(vb => {
        vb.onclick = () => {
          const id = vb.getAttribute('data-id');
          const item = state.theses.find(x => x.id === id);
          if (item) {
            item.userVoted = !item.userVoted;
            item.votes += item.userVoted ? 1 : -1;
            renderBottomSection('Theses');
          }
        };
      });

      const writeBtn = document.getElementById('tern-post-thesis-btn');
      if (writeBtn) {
        writeBtn.onclick = () => openThesisModal(state.activeMarket);
      }
    }
  }

  function openThesisModal(market) {
    openModal(`Post ${market} Thesis`, `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="display:block;margin-bottom:6px;font-size:12px;color:rgba(255,255,255,0.6);">Side / Strategy</label>
          <select id="tern-thesis-side" style="width:100%;padding:10px;border-radius:8px;background:#0d2038;border:1px solid rgba(255,255,255,0.12);color:#fff;outline:none;">
            <option value="long">Long Perp</option>
            <option value="short">Short Perp</option>
            <option value="lp">Delta-Neutral LP</option>
          </select>
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-size:12px;color:rgba(255,255,255,0.6);">Your Thesis / Rationale</label>
          <textarea id="tern-thesis-text" rows="4" placeholder="Explain your market insight, funding dynamics, or LP thesis..." style="width:100%;padding:10px;border-radius:8px;background:#0d2038;border:1px solid rgba(255,255,255,0.12);color:#fff;outline:none;font-family:inherit;font-size:13px;resize:none;box-sizing:border-box;"></textarea>
        </div>
        <button id="tern-submit-thesis-btn" style="width:100%;padding:12px;border-radius:10px;background:#ff5500;border:none;color:#fff;font-weight:600;cursor:pointer;">Publish Thesis to Robinhood Chain</button>
      </div>
    `);

    document.getElementById('tern-submit-thesis-btn').onclick = () => {
      const text = document.getElementById('tern-thesis-text').value.trim();
      const side = document.getElementById('tern-thesis-side').value;
      if (!text) {
        alert('Please enter your thesis rationale');
        return;
      }
      state.theses.unshift({
        id: 't-' + Date.now(),
        author: '0x5ad0...2d11',
        authorFull: state.walletAddress,
        market: market,
        side: side,
        text: text,
        votes: 1,
        userVoted: true,
        pnl: '+$0.00',
        time: 'Just now'
      });
      closeModal();
      showToast('Thesis Published', `Your ${market} thesis is now live on the network`, 'success');
      renderBottomSection('Theses');
    };
  }

  // --- RADAR PAGE HYDRATION ---
  function initRadarPage() {
    const pane = document.querySelector('[data-tour="radar-table"] .Pane_body__rpCX4');
    if (!pane) return;

    // Remove skeletons
    const skelStack = pane.querySelector('.Skeleton_stack__MI_Gf');
    if (skelStack) skelStack.remove();

    let tableWrap = document.getElementById('tern-radar-table-wrap');
    if (!tableWrap) {
      tableWrap = document.createElement('div');
      tableWrap.id = 'tern-radar-table-wrap';
      tableWrap.style.cssText = 'overflow-x:auto;width:100%;';
      pane.appendChild(tableWrap);
    }

    let searchInput = document.querySelector('.radar_controls__AnDOt input');
    let pillGroup = document.querySelector('.radar_controls__AnDOt .Pill_group__0Jguy');
    let currentCategory = 'All';
    let searchQuery = '';

    function renderRadar() {
      const items = MARKETS_DEF.filter(m => {
        const catMatch = (currentCategory === 'All') ||
          (currentCategory === 'Crypto' && m.kind === 'crypto') ||
          (currentCategory === 'RWA' && m.kind === 'rwa') ||
          (currentCategory === 'Established' && m.poolTvl);
        const searchMatch = !searchQuery ||
          m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase());
        return catMatch && searchMatch;
      });

      tableWrap.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;color:#fff;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;">
              <th style="padding:12px 14px;">Asset</th>
              <th style="padding:12px 14px;">Type</th>
              <th style="padding:12px 14px;">Price</th>
              <th style="padding:12px 14px;">24h Change</th>
              <th style="padding:12px 14px;">Pool TVL</th>
              <th style="padding:12px 14px;">Funding / 1h</th>
              <th style="padding:12px 14px;text-align:right;">Trade</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(m => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s ease;cursor:pointer;" onmouseenter="this.style.background='rgba(255,255,255,0.03)'" onmouseleave="this.style.background='transparent'" onclick="window.location.href='/trade/${m.symbol}'">
                <td style="padding:14px;display:flex;align-items:center;gap:10px;">
                  <img src="${m.logo}" alt="${m.symbol}" style="width:26px;height:26px;border-radius:50%;object-fit:contain;" onerror="this.src='/tern-mark.png'"/>
                  <div>
                    <div style="font-weight:600;color:#fff;">${m.symbol}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);">${m.name}</div>
                  </div>
                </td>
                <td style="padding:14px;"><span style="background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:6px;font-size:11px;">${m.kind === 'rwa' ? 'Tokenized equity' : 'Crypto'}</span></td>
                <td style="padding:14px;font-weight:600;font-family:monospace;">${formatUSD(m.price)}</td>
                <td style="padding:14px;font-weight:600;color:${m.change24h >= 0 ? '#10b981' : '#ef4444'};">${formatPct(m.change24h)}</td>
                <td style="padding:14px;color:rgba(255,255,255,0.8);">${m.poolTvl}</td>
                <td style="padding:14px;font-family:monospace;color:#ffaa00;">${m.funding1h}</td>
                <td style="padding:14px;text-align:right;">
                  <a href="/trade/${m.symbol}" style="background:#ff5500;color:#fff;padding:6px 14px;border-radius:8px;font-weight:600;font-size:12px;text-decoration:none;display:inline-block;">Trade</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim();
        renderRadar();
      };
    }

    if (pillGroup) {
      const pills = pillGroup.querySelectorAll('.Pill_pill__gqReg');
      pills.forEach(p => {
        p.onclick = () => {
          pills.forEach(x => x.classList.remove('Pill_isActive___xy_7'));
          p.classList.add('Pill_isActive___xy_7');
          currentCategory = p.innerText.trim();
          renderRadar();
        };
      });
    }

    renderRadar();
  }

  // --- YIELD PAGE HYDRATION ---
  function initYieldPage() {
    const main = document.querySelector('main.app-main');
    if (!main) return;

    // Check if on yield page
    if (!window.location.pathname.startsWith('/yield')) return;

    // Remove skeletons
    const skel = main.querySelector('.Skeleton_stack__MI_Gf, .Pane_pane__3jbNy');
    if (skel) skel.remove();

    let container = document.getElementById('tern-yield-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tern-yield-container';
      container.style.cssText = 'max-width:1120px;margin:0 auto;padding:24px 16px;';
      main.appendChild(container);
    }

    const vaults = [
      { name: 'ETH Basis Vault', apr: '18.42%', tvl: '$14.42M', risk: 'Low', desc: 'Delta-neutral basis arbitrage pairing Uniswap v3 fee tiers against funding rates.', asset: 'WETH' },
      { name: 'USDG Carry Vault', apr: '11.56%', tvl: '$11.24M', risk: 'Low', desc: 'Automated stable yield earning protocol fees from high-volume trading pairs.', asset: 'USDG' },
      { name: 'NVDA Hedged Vault', apr: '24.15%', tvl: '$9.20M', risk: 'Medium', desc: 'Concentrated liquidity ranges hedged with synthetic shorts across market close.', asset: 'NVDA' },
      { name: 'SPY Delta Neutral', apr: '14.28%', tvl: '$5.82M', risk: 'Low', desc: 'Passive index LP sleeve with continuous keeper rebalancing and delta offsets.', asset: 'SPY' }
    ];

    container.innerHTML = `
      <div style="margin-bottom:28px;">
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px;">Yield Vaults</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Automated liquidity sleeves and delta-neutral carry vaults on Robinhood Chain.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;">
        ${vaults.map(v => `
          <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:22px;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                <h3 style="margin:0;font-size:17px;font-weight:600;color:#fff;">${v.name}</h3>
                <span style="background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">${v.apr} APR</span>
              </div>
              <p style="color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;margin:0 0 16px;">${v.desc}</p>
              <div style="background:rgba(255,255,255,0.03);padding:10px 14px;border-radius:10px;margin-bottom:18px;display:flex;justify-content:space-between;font-size:12px;">
                <span style="color:rgba(255,255,255,0.5);">Pool TVL</span>
                <span style="color:#fff;font-weight:600;">${v.tvl}</span>
              </div>
            </div>
            <button class="tern-vault-deposit-btn" data-vault="${v.name}" data-asset="${v.asset}" style="width:100%;padding:12px;border-radius:10px;background:#ff5500;border:none;color:#fff;font-weight:600;font-size:13px;cursor:pointer;">Deposit ${v.asset}</button>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.tern-vault-deposit-btn').forEach(btn => {
      btn.onclick = () => {
        const vName = btn.getAttribute('data-vault');
        const asset = btn.getAttribute('data-asset');
        openModal(`Deposit into ${vName}`, `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="font-size:12px;color:rgba(255,255,255,0.6);">Deposit assets to begin earning automated yield on Robinhood Chain.</div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:11px;color:rgba(255,255,255,0.5);">
                <span>Deposit Amount</span>
                <span>Balance: ${state.walletConnected ? '5.40 ' + asset : '0.00'}</span>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <input id="tern-vault-amount" type="number" value="1.0" style="background:transparent;border:none;color:#fff;font-size:18px;font-weight:600;width:60%;outline:none;font-family:monospace;"/>
                <span style="background:rgba(255,120,0,0.15);color:#ffaa00;padding:4px 10px;border-radius:8px;font-weight:600;">${asset}</span>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.02);padding:10px 14px;border-radius:10px;font-size:11px;color:rgba(255,255,255,0.6);">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span>Projected 1Y Return</span>
                <span style="color:#10b981;">+18.42%</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Withdrawal Lockup</span>
                <span style="color:#fff;">None (Instant)</span>
              </div>
            </div>
            <button id="tern-confirm-deposit-btn" style="width:100%;padding:12px;border-radius:10px;background:#ff5500;border:none;color:#fff;font-weight:600;cursor:pointer;">Confirm Deposit</button>
          </div>
        `);

        document.getElementById('tern-confirm-deposit-btn').onclick = () => {
          const amt = document.getElementById('tern-vault-amount').value;
          closeModal();
          showToast('Deposit Successful', `Deposited ${amt} ${asset} into ${vName}`, 'success');
        };
      };
    });
  }

  // --- THEESES PAGE HYDRATION ---
  function initThesesPage() {
    if (!window.location.pathname.startsWith('/theses')) return;

    const main = document.querySelector('main.app-main');
    if (!main) return;

    // Remove skeletons
    const skel = main.querySelector('.Skeleton_stack__MI_Gf, .Pane_pane__3jbNy');
    if (skel) skel.remove();

    let container = document.getElementById('tern-theses-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tern-theses-container';
      container.style.cssText = 'max-width:1024px;margin:0 auto;padding:24px 16px;';
      main.appendChild(container);
    }

    function renderTheses() {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <div>
            <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px;">Theses</h1>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Trade theses and market convictions published on-chain.</p>
          </div>
          <button id="tern-page-thesis-btn" style="background:#ff5500;color:#fff;padding:10px 18px;border-radius:10px;border:none;font-weight:600;cursor:pointer;font-size:13px;">+ Publish Thesis</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          ${state.theses.map(t => `
            <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:18px;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                  <span style="font-weight:600;font-size:13px;color:#fff;">${t.author}</span>
                  <span style="background:rgba(255,120,0,0.15);color:#ffaa00;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">${t.market} ${t.side.toUpperCase()}</span>
                  <span style="color:#10b981;font-weight:600;font-size:12px;">${t.pnl}</span>
                  <span style="color:rgba(255,255,255,0.4);font-size:12px;">${t.time}</span>
                </div>
                <div style="font-size:14px;color:rgba(255,255,255,0.9);line-height:1.5;">${t.text}</div>
              </div>
              <button class="tern-vote-page-btn" data-id="${t.id}" style="display:flex;flex-direction:column;align-items:center;padding:10px 14px;border-radius:10px;background:${t.userVoted ? '#ff5500' : 'rgba(255,255,255,0.06)'};border:none;color:#fff;cursor:pointer;">
                <span style="font-size:14px;">▲</span>
                <span style="font-size:13px;font-weight:700;">${t.votes}</span>
              </button>
            </div>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.tern-vote-page-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const item = state.theses.find(x => x.id === id);
          if (item) {
            item.userVoted = !item.userVoted;
            item.votes += item.userVoted ? 1 : -1;
            renderTheses();
          }
        };
      });

      document.getElementById('tern-page-thesis-btn').onclick = () => {
        openThesisModal('ETH');
      };
    }

    renderTheses();
  }

  // --- PORTFOLIO PAGE HYDRATION ---
  function initPortfolioPage() {
    if (!window.location.pathname.startsWith('/portfolio')) return;

    const main = document.querySelector('main.app-main');
    if (!main) return;

    const skel = main.querySelector('.Skeleton_stack__MI_Gf, .Pane_pane__3jbNy');
    if (skel) skel.remove();

    let container = document.getElementById('tern-portfolio-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tern-portfolio-container';
      container.style.cssText = 'max-width:1120px;margin:0 auto;padding:24px 16px;';
      main.appendChild(container);
    }

    container.innerHTML = `
      <div style="margin-bottom:28px;">
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px;">Portfolio</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Overview of your equity, concentrated LP positions, and automated carry vaults.</p>
      </div>

      <!-- Overview Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:28px;">
        <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;">
          <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;">Total Equity</div>
          <div style="font-size:24px;font-weight:700;color:#fff;">$${state.userBalanceUsd.toLocaleString()}</div>
          <div style="font-size:12px;color:#10b981;margin-top:4px;">+$4,182.55 (+4.53%)</div>
        </div>
        <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;">
          <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;">LP Positions</div>
          <div style="font-size:24px;font-weight:700;color:#ffaa00;">$66,750.00</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px;">2 active ranges</div>
        </div>
        <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;">
          <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;">Perp Collateral</div>
          <div style="font-size:24px;font-weight:700;color:#fff;">$18,500.00</div>
          <div style="font-size:12px;color:#10b981;margin-top:4px;">2x average leverage</div>
        </div>
        <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;">
          <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;">Unclaimed Fees</div>
          <div style="font-size:24px;font-weight:700;color:#10b981;">$720.52</div>
          <div style="font-size:12px;color:#ffaa00;cursor:pointer;margin-top:4px;" onclick="TernApp.showToast('Fees Claimed','$720.52 collected to wallet','success')">Claim all fees →</div>
        </div>
      </div>

      <!-- Positions Table -->
      <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;">
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#fff;">Active Positions</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;color:#fff;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:11px;">
              <th style="padding:10px 14px;">Market</th>
              <th style="padding:10px 14px;">Type</th>
              <th style="padding:10px 14px;">Size</th>
              <th style="padding:10px 14px;">Entry</th>
              <th style="padding:10px 14px;">Mark</th>
              <th style="padding:10px 14px;">PnL</th>
              <th style="padding:10px 14px;text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.openPositions.map(p => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:14px;font-weight:600;">${p.asset}</td>
                <td style="padding:14px;"><span style="background:rgba(255,120,0,0.15);color:#ffaa00;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;">${p.side} ${p.leverage}</span></td>
                <td style="padding:14px;font-family:monospace;">${p.size}</td>
                <td style="padding:14px;font-family:monospace;">${formatUSD(p.entry)}</td>
                <td style="padding:14px;font-family:monospace;">${formatUSD(p.mark)}</td>
                <td style="padding:14px;color:#10b981;font-weight:600;font-family:monospace;">${p.pnl}</td>
                <td style="padding:14px;text-align:right;">
                  <button style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#ef4444;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;" onclick="TernApp.showToast('Position Settled','Position closed into USDG','info')">Close</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- LAUNCH PAGE HYDRATION ---
  function initLaunchPage() {
    if (!window.location.pathname.startsWith('/launch')) return;

    const main = document.querySelector('main.app-main');
    if (!main) return;

    const skel = main.querySelector('.Skeleton_stack__MI_Gf, .Pane_pane__3jbNy');
    if (skel) skel.remove();

    let container = document.getElementById('tern-launch-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tern-launch-container';
      container.style.cssText = 'max-width:1120px;margin:0 auto;padding:24px 16px;';
      main.appendChild(container);
    }

    const tokens = [
      { symbol: 'PONS', name: 'Pons', mcap: '$6.4M', tvl: '$842K', trades: '4,812', graduated: true, progress: 100 },
      { symbol: 'ROBIN', name: 'Robin', mcap: '$18.9M', tvl: '$6.7M', trades: '12,940', graduated: true, progress: 100 },
      { symbol: 'SHRUB', name: 'Shrub', mcap: '$4.8M', tvl: '$1.9M', trades: '3,410', graduated: false, progress: 78 }
    ];

    container.innerHTML = `
      <div style="margin-bottom:28px;">
        <h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 8px;">Fair Launchpad</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Discover early-stage tokens launched on Robinhood Chain graduating to concentrated liquidity.</p>
      </div>

      <div style="background:rgba(8,22,43,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;color:#fff;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:11px;">
              <th style="padding:10px 14px;">Token</th>
              <th style="padding:10px 14px;">Status</th>
              <th style="padding:10px 14px;">Market Cap</th>
              <th style="padding:10px 14px;">Pool TVL</th>
              <th style="padding:10px 14px;">Trades</th>
              <th style="padding:10px 14px;text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${tokens.map(t => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:14px;font-weight:600;display:flex;align-items:center;gap:10px;">
                  <img src="/logos/${t.symbol}.svg" style="width:24px;height:24px;border-radius:50%;object-fit:contain;" onerror="this.src='/logos/${t.symbol}.png'"/>
                  <div>
                    <div>${t.symbol}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);">${t.name}</div>
                  </div>
                </td>
                <td style="padding:14px;">
                  <span style="background:${t.graduated ? 'rgba(16,185,129,0.15)' : 'rgba(255,120,0,0.15)'};color:${t.graduated ? '#10b981' : '#ffaa00'};padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    ${t.graduated ? 'Graduated <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : t.progress + '% to Grad'}
                  </span>
                </td>
                <td style="padding:14px;font-family:monospace;">${t.mcap}</td>
                <td style="padding:14px;font-family:monospace;">${t.tvl}</td>
                <td style="padding:14px;color:rgba(255,255,255,0.6);">${t.trades}</td>
                <td style="padding:14px;text-align:right;">
                  <a href="/trade/${t.symbol}" style="background:#ff5500;color:#fff;padding:6px 14px;border-radius:8px;font-weight:600;font-size:12px;text-decoration:none;display:inline-block;">Trade</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // --- CORE ANIMATION STYLES ---
  function injectCoreStyles() {
    if (document.getElementById('tern-core-styles')) return;
    const style = document.createElement('style');
    style.id = 'tern-core-styles';
    style.textContent = `
      @keyframes ternSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes ternTourFade {
        from { opacity: 0; transform: translateY(8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .recharge-coin-card {
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.07) !important;
        box-shadow: none !important;
        transition: background 0.2s ease, border-color 0.2s ease !important;
      }
      .recharge-coin-card:hover {
        background: rgba(255, 255, 255, 0.06) !important;
        border-color: rgba(255, 255, 255, 0.14) !important;
        transform: none !important;
        box-shadow: none !important;
      }
      .recharge-coin-card.active {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.22) !important;
        box-shadow: none !important;
      }
      .tern-net-choice {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: rgba(255, 255, 255, 0.7) !important;
        border-radius: 9999px !important;
        box-shadow: none !important;
        transition: all 0.2s ease !important;
      }
      .tern-net-choice:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
        color: #fff !important;
        box-shadow: none !important;
      }
      .tern-net-choice.active {
        background: rgba(255, 255, 255, 0.14) !important;
        border-color: rgba(255, 255, 255, 0.28) !important;
        color: #fff !important;
        box-shadow: none !important;
      }
      .tern-quick-recharge {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: rgba(255, 255, 255, 0.75) !important;
        border-radius: 9999px !important;
        box-shadow: none !important;
        transition: all 0.2s ease !important;
      }
      .tern-quick-recharge:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
        color: #fff !important;
        box-shadow: none !important;
      }
      #tern-recharge-submit-btn:hover {
        opacity: 0.9 !important;
      }
      /* Ensure header never overlaps content and doesn't squish */
      .TopBar_nav__0odhq {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1005 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 0.75rem !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
      }
      .TopBar_pills__V3fnp {
        scrollbar-width: none !important;
      }
      .TopBar_pills__V3fnp::-webkit-scrollbar {
        display: none !important;
      }
      @media (min-width: 768px) and (max-width: 1100px) {
        .TopBar_pills__V3fnp {
          position: static !important;
          transform: none !important;
          margin: 0 auto !important;
          overflow-x: auto !important;
          max-width: calc(100vw - 240px) !important;
        }
      }
      @media (max-width: 767.98px) {
        .TopBar_nav__0odhq {
          padding: var(--nav-top, 2rem) 1rem 0.75rem !important;
        }
        .TopBar_menuWrap__VyE40 {
          display: block !important;
          position: relative !important;
        }
        .TopBar_hamburger__y1JNb {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 2.75rem !important;
          height: 2.75rem !important;
          border-radius: 50% !important;
          border: 1px solid rgba(255, 255, 255, 0.16) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          cursor: pointer !important;
          position: relative !important;
          z-index: 1010 !important;
          transition: all 0.3s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .TopBar_hamburger__y1JNb:active {
          transform: scale(0.95) !important;
        }
        .TopBar_bar__HoH26 {
          position: absolute !important;
          left: 50% !important;
          top: 50% !important;
          height: 2px !important;
          width: 1.25rem !important;
          border-radius: 2px !important;
          background: #ffffff !important;
          transition: all 0.25s ease-out !important;
        }
        .TopBar_barTop__dMt3m {
          transform: translate(-50%, calc(-50% - 6px)) !important;
        }
        .TopBar_barMid__ucswp {
          transform: translate(-50%, -50%) !important;
        }
        .TopBar_barBot__prBN7 {
          transform: translate(-50%, calc(-50% + 6px)) !important;
        }
        .TopBar_hamburger__y1JNb.TopBar_isOpen__MMfuv {
          background: rgba(8, 22, 42, 0.95) !important;
          border-color: rgba(255, 255, 255, 0.28) !important;
        }
        .TopBar_hamburger__y1JNb.TopBar_isOpen__MMfuv .TopBar_bar__HoH26 {
          background: #ffffff !important;
        }
        .TopBar_hamburger__y1JNb.TopBar_isOpen__MMfuv .TopBar_barTop__dMt3m {
          transform: translate(-50%, -50%) rotate(45deg) !important;
        }
        .TopBar_hamburger__y1JNb.TopBar_isOpen__MMfuv .TopBar_barMid__ucswp {
          opacity: 0 !important;
          transform: translate(-50%, -50%) scaleX(0) !important;
        }
        .TopBar_hamburger__y1JNb.TopBar_isOpen__MMfuv .TopBar_barBot__prBN7 {
          transform: translate(-50%, -50%) rotate(-45deg) !important;
        }
        .TopBar_panel__WtOrW {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.625rem !important;
          position: absolute !important;
          right: 0 !important;
          top: calc(100% + 0.75rem) !important;
          z-index: 1010 !important;
          width: min(280px, calc(100vw - 2rem)) !important;
          min-width: 220px !important;
          padding: 0.875rem !important;
          background: #08162b !important;
          backdrop-filter: blur(28px) !important;
          -webkit-backdrop-filter: blur(28px) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          border-radius: 1.25rem !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateY(-8px) scale(0.98) !important;
          transform-origin: 100% 0 !important;
          transition: opacity 0.22s ease-out, transform 0.22s ease-out, visibility 0s linear 0.22s !important;
        }
        .TopBar_panel__WtOrW.TopBar_isOpen__MMfuv {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) scale(1) !important;
          transition: opacity 0.22s ease-out, transform 0.22s ease-out, visibility 0s !important;
        }
        .TopBar_pills__V3fnp {
          position: static !important;
          transform: none !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0.25rem !important;
          padding: 0 !important;
          background: none !important;
          border: 0 !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          max-width: 100% !important;
          overflow-x: visible !important;
        }
        .TopBar_pill__8hvyD {
          text-align: left !important;
          padding: 0.5rem 0.875rem !important;
          border-radius: 0.625rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          width: 100% !important;
          color: rgba(255, 255, 255, 0.85) !important;
          text-decoration: none !important;
          transition: all 0.15s ease !important;
        }
        .TopBar_pill__8hvyD:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
        .TopBar_pill__8hvyD.TopBar_isActive__63v_m {
          background: rgba(255, 120, 0, 0.16) !important;
          color: #ffaa00 !important;
          font-weight: 600 !important;
        }
        .TopBar_right__a2nN_ {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0.5rem !important;
          margin-top: 0.25rem !important;
          padding-top: 0.5rem !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .TopBar_right__a2nN_ .TopBar_social__FlNev {
          width: 100% !important;
          height: 2.375rem !important;
          border-radius: 9999px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.5rem !important;
          background: rgba(255, 255, 255, 0.06) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: #ffffff !important;
          text-decoration: none !important;
        }
        .TopBar_right__a2nN_ .TopBar_btnGlass__mc1mc {
          width: 100% !important;
          text-align: center !important;
          justify-content: center !important;
          padding: 0.5625rem !important;
          background: #ffffff !important;
          color: #000000 !important;
          font-weight: 600 !important;
          border-radius: 9999px !important;
          border: none !important;
        }
        .recharge-coin-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 8px !important;
        }
        .recharge-deposit-card {
          padding: 18px 14px !important;
        }
        .recharge-address-card {
          grid-template-columns: 1fr !important;
          text-align: center !important;
        }
        .recharge-address-card .qr-container {
          margin: 12px auto 0 auto !important;
        }
      }
      #tern-topbar-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(2, 6, 14, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }
      #tern-topbar-backdrop.active {
        opacity: 1;
        pointer-events: auto;
      }
      .Drawer_backdrop__cDT85 {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2000 !important;
        background: rgba(4, 9, 20, 0.85) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        opacity: 0 !important;
        pointer-events: none !important;
        transition: opacity 0.25s ease-out !important;
      }
      .Drawer_backdrop__cDT85.Drawer_open__l0zw8 {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      .Drawer_panel__T2dgn {
        position: fixed !important;
        top: 1rem !important;
        right: 1rem !important;
        bottom: 1rem !important;
        z-index: 2001 !important;
        display: flex !important;
        flex-direction: column !important;
        width: min(420px, calc(100vw - 2rem)) !important;
        padding: 1.5rem !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        border-radius: 1.5rem !important;
        background: #08162b !important;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.75) !important;
        transform: translateX(calc(100% + 2rem)) !important;
        transition: transform 0.3s cubic-bezier(0.16, 0.84, 0.44, 1) !important;
        overflow-y: auto !important;
      }
      .Drawer_panel__T2dgn.Drawer_open__l0zw8 {
        transform: translateX(0) !important;
      }
      @media (max-width: 599.98px) {
        .Drawer_panel__T2dgn {
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          border-radius: 0 !important;
          padding: 1.25rem 1rem !important;
          transform: translateX(100%) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // --- TOPBAR NAVIGATION ENHANCEMENT ---
  function ensureTopBarLinks() {
    const navs = document.querySelectorAll('.TopBar_pills__V3fnp, .nav-pills');
    const isRecharge = window.location.pathname.startsWith('/recharge');

    navs.forEach(nav => {
      // 1. Ensure Recharge pill exists
      if (!nav.querySelector('a[href="/recharge"]')) {
        const rechargeLink = document.createElement('a');
        rechargeLink.className = nav.classList.contains('TopBar_pills__V3fnp') ? 'TopBar_pill__8hvyD' : 'pill';
        if (isRecharge) {
          rechargeLink.classList.add(nav.classList.contains('TopBar_pills__V3fnp') ? 'TopBar_isActive__63v_m' : 'active');
          rechargeLink.setAttribute('aria-current', 'page');
        }
        rechargeLink.href = '/recharge';
        rechargeLink.innerText = 'Recharge';
        rechargeLink.style.textDecoration = 'none';

        const thesesLink = nav.querySelector('a[href="/theses"]');
        if (thesesLink && thesesLink.nextSibling) {
          nav.insertBefore(rechargeLink, thesesLink.nextSibling);
        } else {
          nav.appendChild(rechargeLink);
        }
      }

      // 2. Ensure Tutorial button exists
      let tutBtn = nav.querySelector('#tern-tutorial-pill');
      if (!tutBtn) {
        tutBtn = document.createElement('button');
        tutBtn.type = 'button';
        tutBtn.id = 'tern-tutorial-pill';
        tutBtn.className = nav.classList.contains('TopBar_pills__V3fnp') ? 'TopBar_pill__8hvyD' : 'pill';
        tutBtn.innerText = 'Tutorial';
        tutBtn.style.cssText = 'cursor:pointer;background:none;border:none;color:#ffaa00;font-weight:600;font-size:inherit;font-family:inherit;';
        nav.appendChild(tutBtn);
      }
      tutBtn.onclick = (e) => {
        e.preventDefault();
        if (window.location.pathname.startsWith('/trade')) {
          startTernTour();
        } else {
          window.location.href = '/trade/ETH?tour=1';
        }
      };
    });
  }

  // --- MOBILE NAVIGATION DRAWER ---
  function wireMobileNavigationDrawer() {
    const hamburger = document.querySelector('.TopBar_hamburger__y1JNb');
    const panel = document.querySelector('.TopBar_panel__WtOrW');
    if (!hamburger || !panel) return;

    // Create backdrop if not existing
    let backdrop = document.getElementById('tern-topbar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'tern-topbar-backdrop';
      document.body.appendChild(backdrop);
    }

    function toggleMenu(forceState) {
      const isOpen = forceState !== undefined ? forceState : !panel.classList.contains('TopBar_isOpen__MMfuv');
      if (isOpen) {
        hamburger.classList.add('TopBar_isOpen__MMfuv');
        panel.classList.add('TopBar_isOpen__MMfuv');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Close menu');
        backdrop.classList.add('active');
      } else {
        hamburger.classList.remove('TopBar_isOpen__MMfuv');
        panel.classList.remove('TopBar_isOpen__MMfuv');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
        backdrop.classList.remove('active');
      }
    }

    hamburger.onclick = (e) => {
      e.stopPropagation();
      toggleMenu();
    };

    backdrop.onclick = () => toggleMenu(false);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });

    panel.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        setTimeout(() => toggleMenu(false), 150);
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && panel.classList.contains('TopBar_isOpen__MMfuv')) {
        toggleMenu(false);
      }
    });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('openMenu') === '1') {
        toggleMenu(true);
      }
    } catch(e) {}
  }

  // --- MARKETS DRAWER ON MOBILE ---
  function wireMarketsDrawer() {
    const marketsBtn = document.querySelector('.trade_marketsBtn__Md5IN');
    if (!marketsBtn) return;

    let drawerBackdrop = document.getElementById('tern-markets-drawer-backdrop');
    let drawerPanel = document.getElementById('tern-markets-drawer-panel');

    if (!drawerPanel) {
      drawerBackdrop = document.createElement('div');
      drawerBackdrop.id = 'tern-markets-drawer-backdrop';
      drawerBackdrop.className = 'Drawer_backdrop__cDT85';
      drawerBackdrop.setAttribute('aria-hidden', 'true');

      drawerPanel = document.createElement('div');
      drawerPanel.id = 'tern-markets-drawer-panel';
      drawerPanel.className = 'Drawer_panel__T2dgn srf-glass';
      drawerPanel.setAttribute('role', 'dialog');
      drawerPanel.setAttribute('aria-modal', 'true');
      drawerPanel.setAttribute('aria-label', 'Markets');
      drawerPanel.innerHTML = `
        <div class="Drawer_head__DVKKD">
          <h2 class="Drawer_title__9Jfh0">Markets</h2>
          <button type="button" class="Drawer_close__JQfiJ" id="tern-markets-drawer-close" aria-label="Close">✕</button>
        </div>
        <div class="Drawer_content__UrhMJ">
          <div class="trade_markets__CZQ7Y">
            <span class="Field_searchWrap__A6hiL">
              <svg class="Field_searchIcon__2OpVi" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="16.5" y1="16.5" x2="21" y2="21"></line>
              </svg>
              <input class="Field_control__q1oJn Field_searchControl__PnSYY" id="tern-drawer-search" type="search" placeholder="Search markets" aria-label="Search markets" value=""/>
            </span>
            <div role="group" aria-label="Market category" class="Pill_group__0Jguy srf Pill_groupWrap__bMD81" id="tern-drawer-pills">
              <button type="button" aria-pressed="true" class="Pill_pill__gqReg Pill_isActive___xy_7 Pill_small__tbP3n">All</button>
              <button type="button" aria-pressed="false" class="Pill_pill__gqReg Pill_small__tbP3n">Crypto</button>
              <button type="button" aria-pressed="false" class="Pill_pill__gqReg Pill_small__tbP3n">RWA</button>
              <button type="button" aria-pressed="false" class="Pill_pill__gqReg Pill_small__tbP3n">Pools</button>
            </div>
            <ul class="trade_marketRows__z7XrF" id="tern-drawer-market-rows" aria-label="Markets" style="max-height: calc(100vh - 220px); overflow-y: auto; margin-top: 10px;"></ul>
          </div>
        </div>
      `;

      document.body.appendChild(drawerBackdrop);
      document.body.appendChild(drawerPanel);
    }

    function renderDrawerMarkets() {
      const listEl = document.getElementById('tern-drawer-market-rows');
      if (!listEl) return;
      listEl.innerHTML = '';

      const searchInput = document.getElementById('tern-drawer-search');
      const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

      const filtered = MARKETS_DEF.filter(m => {
        const matchesCategory = (currentMarketFilter === 'All') ||
          (currentMarketFilter === 'Crypto' && m.kind === 'crypto') ||
          (currentMarketFilter === 'RWA' && m.kind === 'rwa') ||
          (currentMarketFilter === 'Pools' && m.poolTvl);
        const matchesSearch = !q ||
          m.symbol.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `<li class="trade_marketEmpty__MQtvG" style="padding:16px;text-align:center;color:rgba(255,255,255,0.4);">Nothing matches "${q}".</li>`;
        return;
      }

      filtered.forEach(m => {
        const isSelected = m.symbol === state.activeMarket;
        const li = document.createElement('li');
        li.setAttribute('data-market-symbol', m.symbol);
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        li.style.cssText = `
          display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
          border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all 0.15s ease;
          background:${isSelected ? 'rgba(255,120,0,0.12)' : 'transparent'};
          border:1px solid ${isSelected ? 'rgba(255,120,0,0.3)' : 'transparent'};
          user-select:none;
        `;
        li.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;pointer-events:none;">
            <img src="${m.logo}" alt="${m.symbol}" style="width:24px;height:24px;border-radius:50%;object-fit:contain;pointer-events:none;" onerror="this.src='/tern-mark.png'"/>
            <div style="pointer-events:none;">
              <div style="font-weight:600;font-size:13px;color:#fff;">${m.symbol}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.5);">${m.name}</div>
            </div>
          </div>
          <div style="text-align:right;pointer-events:none;">
            <div class="tern-m-price" style="font-weight:600;font-size:13px;color:#fff;">${formatUSD(m.price)}</div>
            <div class="tern-m-change" style="font-size:11px;font-weight:500;color:${m.change24h >= 0 ? '#10b981' : '#ef4444'};">${formatPct(m.change24h)}</div>
          </div>
        `;
        li.onclick = (e) => {
          e.stopPropagation();
          selectMarket(m.symbol);
          toggleDrawer(false);
        };
        listEl.appendChild(li);
      });
    }

    function toggleDrawer(open) {
      if (open) {
        renderDrawerMarkets();
        drawerBackdrop.classList.add('Drawer_open__l0zw8');
        drawerPanel.classList.add('Drawer_open__l0zw8');
        document.body.style.overflow = 'hidden';
      } else {
        drawerBackdrop.classList.remove('Drawer_open__l0zw8');
        drawerPanel.classList.remove('Drawer_open__l0zw8');
        document.body.style.overflow = '';
      }
    }

    marketsBtn.onclick = (e) => {
      e.stopPropagation();
      toggleDrawer(true);
    };

    const closeBtn = document.getElementById('tern-markets-drawer-close');
    if (closeBtn) closeBtn.onclick = () => toggleDrawer(false);
    drawerBackdrop.onclick = () => toggleDrawer(false);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerPanel.classList.contains('Drawer_open__l0zw8')) {
        toggleDrawer(false);
      }
    });

    const drawerSearch = document.getElementById('tern-drawer-search');
    if (drawerSearch) {
      drawerSearch.oninput = () => renderDrawerMarkets();
    }

    const drawerPills = document.querySelectorAll('#tern-drawer-pills .Pill_pill__gqReg');
    drawerPills.forEach(p => {
      p.onclick = () => {
        drawerPills.forEach(x => {
          x.classList.remove('Pill_isActive___xy_7');
          x.setAttribute('aria-pressed', 'false');
        });
        p.classList.add('Pill_isActive___xy_7');
        p.setAttribute('aria-pressed', 'true');
        currentMarketFilter = p.innerText.trim();
        renderDrawerMarkets();
      };
    });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('openMarkets') === '1') {
        toggleDrawer(true);
      }
    } catch(e) {}
  }

  // --- INTERACTIVE GUIDED TUTORIAL / TOUR ---
  const TOUR_STEPS = [
    {
      target: null,
      title: 'Welcome to Tern',
      content: 'Tern is the primary trading and synthetic liquidity protocol built natively on Robinhood Chain. Trade crypto and tokenized RWAs (NVDA, TSLA, SPY) with institutional pricing and direct on-chain settlement.',
      position: 'center'
    },
    {
      target: '#markets-column, .trade_left__ByetE',
      title: 'Live Markets & Quotes',
      content: 'Track real-time prices for top cryptocurrencies (ETH, BTC, SOL) and tokenized US equities (NVDA, TSLA, SPY, GOLD). Switch markets instantly with live Binance & stock feeds.',
      position: 'right'
    },
    {
      target: '[data-tour="trade-chart"], .trade_centre__y7gMB',
      title: 'Real-Time TradingView Chart',
      content: 'Professional charting powered by TradingView. Analyze price action, multi-timeframe candles (1m to 1D), moving averages, and market trends in real-time.',
      position: 'bottom'
    },
    {
      target: '[data-tour="trade-panel"], .trade_right__Pwqb4',
      title: 'Order Execution & Leverage',
      content: 'Place Spot trades or trade with up to 20x leverage across Buy, Sell, Provide LP, and Limit tabs with instant route calculations and low fees.',
      position: 'left'
    },
    {
      target: 'a[href="/recharge"], #tern-tutorial-pill, .TopBar_nav__0odhq',
      title: 'Account Recharge & Deposit',
      content: 'Top up your account balance with famous coins (BTC, ETH, SOL, USDT, USDC, BNB, XRP, and more) to fund your Robinhood Chain vault and unlock live trading.',
      position: 'bottom'
    }
  ];

  let currentTourStep = 0;

  function startTernTour(forceStep = 0) {
    const existing = document.getElementById('tern-tour-root');
    if (existing) existing.remove();
    currentTourStep = forceStep;
    renderTourStep(currentTourStep);
  }

  function closeTernTour() {
    const el = document.getElementById('tern-tour-root');
    if (el) el.remove();
    localStorage.setItem('tern_tour_seen', '1');
  }

  function renderTourStep(stepIdx) {
    currentTourStep = stepIdx;
    let root = document.getElementById('tern-tour-root');
    if (root) root.remove();

    root = document.createElement('div');
    root.id = 'tern-tour-root';
    root.style.cssText = 'position:fixed;inset:0;z-index:9999999;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    const step = TOUR_STEPS[stepIdx];
    const targetEl = step.target ? document.querySelector(step.target) : null;
    let targetRect = null;
    if (targetEl) {
      targetRect = targetEl.getBoundingClientRect();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    let backdropHtml = '';
    if (targetRect) {
      backdropHtml = `
        <div style="position:absolute;inset:0;background:rgba(2,6,14,0.7);pointer-events:auto;"></div>
        <div style="position:absolute;top:${targetRect.top - 6}px;left:${targetRect.left - 6}px;width:${targetRect.width + 12}px;height:${targetRect.height + 12}px;border-radius:16px;box-shadow:0 0 0 9999px rgba(2,6,14,0.75);border:1px solid rgba(255,255,255,0.2);pointer-events:none;transition:all 0.3s ease;"></div>
      `;
    } else {
      backdropHtml = `<div style="position:absolute;inset:0;background:rgba(2,6,14,0.8);backdrop-filter:blur(8px);pointer-events:auto;"></div>`;
    }

    let cardStyle = '';
    if (!targetRect || step.position === 'center') {
      cardStyle = 'top:50%;left:50%;transform:translate(-50%,-50%);';
    } else if (step.position === 'right') {
      const top = Math.max(80, Math.min(window.innerHeight - 340, targetRect.top));
      const left = Math.min(window.innerWidth - 420, targetRect.right + 20);
      cardStyle = `top:${top}px;left:${left}px;`;
    } else if (step.position === 'left') {
      const top = Math.max(80, Math.min(window.innerHeight - 340, targetRect.top));
      const left = Math.max(20, targetRect.left - 420);
      cardStyle = `top:${top}px;left:${left}px;`;
    } else {
      const top = Math.min(window.innerHeight - 320, targetRect.bottom + 16);
      const left = Math.max(20, Math.min(window.innerWidth - 420, targetRect.left));
      cardStyle = `top:${top}px;left:${left}px;`;
    }

    const isLast = stepIdx === TOUR_STEPS.length - 1;

    root.innerHTML = `
      ${backdropHtml}
      <div style="position:absolute;${cardStyle}width:390px;background:#08162b;border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 60px rgba(0,0,0,0.8);border-radius:18px;padding:24px;color:#fff;pointer-events:auto;z-index:10000000;animation:ternTourFade 0.25s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:11px;font-weight:700;color:#ffaa00;background:rgba(255,120,0,0.15);padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.05em;">
            Step ${stepIdx + 1} of ${TOUR_STEPS.length}
          </span>
          <button id="tern-tour-skip" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;cursor:pointer;padding:4px;">Skip</button>
        </div>

        <h3 style="margin:0 0 8px;font-size:17px;font-weight:700;color:#fff;">${step.title}</h3>
        <p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.55;margin:0 0 20px;">${step.content}</p>

        <!-- Progress dots -->
        <div style="display:flex;gap:6px;margin-bottom:20px;">
          ${TOUR_STEPS.map((_, i) => `
            <div style="height:4px;flex:1;border-radius:2px;background:${i === stepIdx ? '#ffaa00' : i < stepIdx ? 'rgba(255,120,0,0.4)' : 'rgba(255,255,255,0.1)'};"></div>
          `).join('')}
        </div>

        <div style="display:flex;justify-content:space-between;gap:10px;">
          <button id="tern-tour-prev" ${stepIdx === 0 ? 'disabled' : ''} style="padding:10px 16px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:13px;font-weight:600;cursor:${stepIdx === 0 ? 'not-allowed' : 'pointer'};opacity:${stepIdx === 0 ? '0.4' : '1'};">
            ← Back
          </button>
          <div style="display:flex;gap:8px;">
            ${isLast ? `
              <a href="/recharge" style="padding:10px 16px;border-radius:10px;background:rgba(255,120,0,0.2);border:1px solid #ffaa00;color:#ffaa00;font-size:13px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                Top Up
              </a>
            ` : ''}
            <button id="tern-tour-next" style="padding:10px 20px;border-radius:10px;background:#ff5500;border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(2,132,199,0.3);display:inline-flex;align-items:center;gap:6px;">
              ${isLast ? 'Finish Tour <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const prevBtn = document.getElementById('tern-tour-prev');
    if (prevBtn && stepIdx > 0) {
      prevBtn.onclick = () => renderTourStep(stepIdx - 1);
    }
    const nextBtn = document.getElementById('tern-tour-next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (isLast) {
          closeTernTour();
          showToast('Tutorial Complete', 'You are ready to trade on Robinhood Chain!', 'success');
        } else {
          renderTourStep(stepIdx + 1);
        }
      };
    }
    const skipBtn = document.getElementById('tern-tour-skip');
    if (skipBtn) {
      skipBtn.onclick = closeTernTour;
    }
  }

  let tourTimer = null;
  function checkTernTour() {
    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.get('tour') === '1' || urlParams.get('tutorial') === '1';

    if (forceTour) {
      if (tourTimer) clearTimeout(tourTimer);
      tourTimer = setTimeout(() => startTernTour(0), 400);
      return;
    }

    if (state.tourChecked) return;
    state.tourChecked = true;
    if (localStorage.getItem('tern_tour_seen') !== '1') {
      if (tourTimer) clearTimeout(tourTimer);
      tourTimer = setTimeout(() => startTernTour(0), 800);
    }
  }

  // --- RECHARGE / TOP UP ENGINE ---
  const RECHARGE_COINS = [
    { symbol: 'BTC', name: 'Bitcoin', logo: '/logos/BTC.svg', network: 'Bitcoin Native (SegWit)', networks: ['Bitcoin Native (SegWit)', 'Lightning Network', 'Arbitrum (WBTC)'], address: 'bc1q9d7a2f5c0b1b3a6d2f9c2a4e7f83b1c6d9e0a7', minDeposit: '0.0005 BTC' },
    { symbol: 'ETH', name: 'Ethereum', logo: '/logos/ETH.svg', network: 'Arbitrum One', networks: ['Arbitrum One', 'Ethereum Mainnet (ERC-20)', 'Optimism', 'Base', 'Robinhood Chain'], address: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', minDeposit: '0.005 ETH' },
    { symbol: 'SOL', name: 'Solana', logo: '/logos/SOL.svg', network: 'Solana Native', networks: ['Solana Native'], address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', minDeposit: '0.1 SOL' },
    { symbol: 'USDT', name: 'Tether USD', logo: '/logos/USDT.svg', network: 'ERC-20 (Ethereum)', networks: ['ERC-20 (Ethereum)', 'TRC-20 (Tron)', 'Arbitrum One', 'Solana', 'BEP-20', 'Polygon'], address: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', minDeposit: '10 USDT' },
    { symbol: 'USDC', name: 'USD Coin', logo: '/logos/USDC.svg', network: 'ERC-20 (Ethereum)', networks: ['ERC-20 (Ethereum)', 'Arbitrum One', 'Solana', 'Base', 'Polygon'], address: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', minDeposit: '10 USDC' },
    { symbol: 'BNB', name: 'BNB Chain', logo: '/logos/BNB.svg', network: 'BNB Smart Chain (BEP-20)', networks: ['BNB Smart Chain (BEP-20)', 'opBNB'], address: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', minDeposit: '0.05 BNB' },
    { symbol: 'XRP', name: 'Ripple', logo: '/logos/XRP.svg', network: 'Ripple Ledger (XRP)', networks: ['Ripple Ledger (XRP)'], address: 'rEb8TK3gBgk5auZyyb67aPzM1N75Q15d31', tag: '749201', minDeposit: '20 XRP' },
    { symbol: 'DOGE', name: 'Dogecoin', logo: '/logos/DOGE.svg', network: 'Dogecoin Core', networks: ['Dogecoin Core'], address: 'D8vGzaSyPk5BesQnJRHgufumQ444Y75785', minDeposit: '50 DOGE' },
    { symbol: 'ADA', name: 'Cardano', logo: '/logos/ADA.svg', network: 'Cardano (Shelley)', networks: ['Cardano (Shelley)'], address: 'addr1q9d7a2f5c0b1b3a6d2f9c2a4e7f83b1c6d9e0a7', minDeposit: '15 ADA' },
    { symbol: 'AVAX', name: 'Avalanche', logo: '/logos/AVAX.svg', network: 'Avalanche C-Chain', networks: ['Avalanche C-Chain'], address: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', minDeposit: '0.5 AVAX' },
    { symbol: 'LINK', name: 'Chainlink', logo: '/logos/LINK.svg', network: 'Ethereum (ERC-20)', networks: ['Ethereum (ERC-20)', 'Arbitrum One'], address: '0x5ad0b1b3a6d2f9c2a4e7f83b1c6d9e0a7b4c2d11', minDeposit: '2 LINK' }
  ];

  let selectedRechargeSymbol = 'USDT';
  let selectedRechargeNetwork = 'ERC-20 (Ethereum)';
  let rechargeAmountVal = '500';

  function initRechargePage() {
    const container = document.getElementById('tern-recharge-container');
    if (!container) return;

    renderRechargeUI();
  }

  function renderRechargeUI() {
    const container = document.getElementById('tern-recharge-container');
    if (!container) return;

    const coin = RECHARGE_COINS.find(c => c.symbol === selectedRechargeSymbol) || RECHARGE_COINS[3];
    const market = MARKETS_DEF.find(m => m.symbol === coin.symbol) || { price: 1.00, change24h: 0.00 };
    const priceUSD = market.price || 1.00;
    const estUSD = (parseFloat(rechargeAmountVal || 0) * priceUSD).toFixed(2);

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:32px;">
        <!-- Header -->
        <div style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:10px;width:100%;margin-bottom:0;">
          <div class="Tag_tag__HDJeX" style="display:inline-flex;align-items:center;gap:6px;width:fit-content;border-radius:9999px;align-self:flex-start;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ffaa00;"></span>
            Robinhood Chain · Instant Custody Gateway
          </div>
          <h1 style="font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:400;font-size:42px;letter-spacing:-0.03em;color:#fff;margin:0;line-height:1.1;text-align:left;align-self:flex-start;">
            <span>Deposit &amp; Recharge</span>
          </h1>
          <p style="font-family:'Inter',system-ui,sans-serif;font-size:14px;color:rgba(255,255,255,0.65);margin:0;max-width:620px;line-height:1.55;text-align:left;align-self:flex-start;">
            Top up your trading balance using famous cryptocurrencies. Live market conversion rates with 0% protocol deposit fees.
          </p>
        </div>

        <!-- Coin Selector Grid -->
        <div>
          <div style="font-family:'Inter',system-ui,sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.06em;">
            1. Select Coin
          </div>
          <div class="recharge-coin-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(170px, 1fr));gap:10px;">
            ${RECHARGE_COINS.map(c => {
              const m = MARKETS_DEF.find(x => x.symbol === c.symbol) || { price: 1.00, change24h: 0.00 };
              const isSel = c.symbol === selectedRechargeSymbol;
              const chg = formatPct(m.change24h);
              const chgColor = (m.change24h || 0) >= 0 ? '#34d399' : '#f87171';
              return `
                <div class="recharge-coin-card ${isSel ? 'active' : ''}" data-symbol="${c.symbol}" style="background:${isSel ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isSel ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'};border-radius:14px;padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:none;">
                  <img src="${c.logo}" alt="${c.symbol}" style="width:32px;height:32px;border-radius:50%;object-fit:contain;flex-shrink:0;background:rgba(255,255,255,0.04);display:block;" onerror="this.src='/logos/${c.symbol}.png'"/>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="font-family:'Inter',sans-serif;font-weight:600;font-size:14px;color:#fff;">${c.symbol}</span>
                      <span style="font-family:'Inter',sans-serif;font-size:11px;color:${chgColor};font-feature-settings:'tnum';font-weight:500;">${chg}</span>
                    </div>
                    <div style="font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name}</div>
                    <div style="font-size:12px;font-family:'Inter',monospace;font-feature-settings:'tnum';color:rgba(255,255,255,0.85);margin-top:2px;">${formatUSD(m.price)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Deposit Details Card -->
        <div class="recharge-deposit-card" style="background:rgba(8,22,42,0.65);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;box-shadow:none;display:flex;flex-direction:column;gap:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:18px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${coin.logo}" alt="${coin.symbol}" style="width:38px;height:38px;border-radius:50%;object-fit:contain;display:block;" onerror="this.src='/logos/${coin.symbol}.png'"/>
              <div>
                <div style="font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:22px;color:#fff;line-height:1.2;">Deposit ${coin.name} (${coin.symbol})</div>
                <div style="font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.5);margin-top:3px;">Rate: 1 ${coin.symbol} = ${formatUSD(priceUSD)} USD</div>
              </div>
            </div>
            <div class="Tag_tag__HDJeX" style="font-size:12px;border-radius:9999px;">
              0% Protocol Fee
            </div>
          </div>

          <!-- Network Selector -->
          <div>
            <div style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Select Deposit Network</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${coin.networks.map(n => {
                const isNetSel = n === selectedRechargeNetwork;
                return `
                  <button class="tern-net-choice ${isNetSel ? 'active' : ''}" data-net="${n}" style="padding:6px 14px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;">
                    ${n}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Deposit Address Card -->
          <div class="recharge-address-card" style="display:grid;grid-template-columns:1fr auto;gap:20px;background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;align-items:center;">
            <div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.45);margin-bottom:6px;">Your ${coin.symbol} Deposit Address</div>
              <div id="tern-address-text" style="font-family:monospace;font-size:13px;color:#fff;word-break:break-all;background:rgba(255,255,255,0.03);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06);">${coin.address}</div>
              ${coin.tag ? `<div style="font-family:'Inter',sans-serif;font-size:12px;color:#eab308;margin-top:8px;display:flex;align-items:center;gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Destination Tag / Memo: <strong style="font-family:monospace;color:#fff;">${coin.tag}</strong> (Required for XRP)</div>` : ''}
              <div style="display:flex;gap:10px;margin-top:12px;">
                <button id="tern-copy-addr-btn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:8px 18px;border-radius:9999px;font-family:'Inter',sans-serif;font-size:12px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all 0.2s;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  <span>Copy Address</span>
                </button>
              </div>
            </div>
            <!-- Authentic High-Density QR Code -->
            <div class="qr-container" style="background:#ffffff;padding:8px;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:none;">
              <svg width="92" height="92" viewBox="0 0 116 116" fill="#040914" shape-rendering="crispEdges">
                <rect x="8" y="8" width="28" height="28"/>
                <rect x="12" y="12" width="20" height="20" fill="#fff"/>
                <rect x="16" y="16" width="12" height="12"/>
                <rect x="80" y="8" width="28" height="28"/>
                <rect x="84" y="12" width="20" height="20" fill="#fff"/>
                <rect x="88" y="16" width="12" height="12"/>
                <rect x="8" y="80" width="28" height="28"/>
                <rect x="12" y="84" width="20" height="20" fill="#fff"/>
                <rect x="16" y="88" width="12" height="12"/>
                <rect x="76" y="76" width="20" height="20"/>
                <rect x="80" y="80" width="12" height="12" fill="#fff"/>
                <rect x="84" y="84" width="4" height="4"/>
                <rect x="40" y="20" width="4" height="4"/><rect x="48" y="20" width="4" height="4"/><rect x="56" y="20" width="4" height="4"/><rect x="64" y="20" width="4" height="4"/><rect x="72" y="20" width="4" height="4"/>
                <rect x="20" y="40" width="4" height="4"/><rect x="20" y="48" width="4" height="4"/><rect x="20" y="56" width="4" height="4"/><rect x="20" y="64" width="4" height="4"/><rect x="20" y="72" width="4" height="4"/>
                <rect x="40" y="8" width="4" height="8"/><rect x="48" y="12" width="8" height="4"/><rect x="64" y="8" width="4" height="4"/><rect x="68" y="16" width="8" height="4"/>
                <rect x="8" y="40" width="8" height="4"/><rect x="12" y="48" width="4" height="8"/><rect x="8" y="64" width="8" height="4"/>
                <rect x="28" y="40" width="4" height="4"/><rect x="32" y="48" width="4" height="4"/><rect x="28" y="56" width="4" height="8"/><rect x="32" y="68" width="4" height="4"/>
                <rect x="40" y="28" width="8" height="4"/><rect x="44" y="36" width="4" height="8"/><rect x="40" y="48" width="4" height="4"/><rect x="44" y="56" width="8" height="4"/>
                <rect x="40" y="64" width="4" height="8"/><rect x="44" y="76" width="4" height="4"/><rect x="40" y="84" width="8" height="4"/><rect x="40" y="96" width="4" height="8"/>
                <rect x="48" y="92" width="8" height="4"/><rect x="48" y="104" width="4" height="4"/>
                <rect x="56" y="28" width="4" height="8"/><rect x="64" y="32" width="4" height="4"/><rect x="56" y="40" width="8" height="4"/><rect x="68" y="40" width="4" height="8"/>
                <rect x="56" y="52" width="4" height="8"/><rect x="64" y="56" width="4" height="4"/><rect x="56" y="68" width="8" height="4"/><rect x="64" y="76" width="4" height="8"/>
                <rect x="56" y="88" width="4" height="4"/><rect x="64" y="92" width="8" height="4"/><rect x="56" y="100" width="8" height="4"/><rect x="68" y="104" width="8" height="4"/>
                <rect x="76" y="28" width="4" height="4"/><rect x="84" y="32" width="8" height="4"/><rect x="96" y="28" width="4" height="8"/><rect x="104" y="32" width="4" height="4"/>
                <rect x="76" y="44" width="8" height="4"/><rect x="88" y="40" width="4" height="4"/><rect x="96" y="44" width="8" height="4"/>
                <rect x="76" y="56" width="4" height="8"/><rect x="84" y="60" width="4" height="4"/><rect x="92" y="56" width="8" height="4"/><rect x="104" y="60" width="4" height="8"/>
                <rect x="76" y="68" width="8" height="4"/><rect x="100" y="72" width="8" height="4"/><rect x="104" y="80" width="4" height="8"/><rect x="100" y="92" width="8" height="4"/><rect x="104" y="100" width="4" height="8"/>
                <rect x="84" y="104" width="8" height="4"/><rect x="76" y="100" width="4" height="8"/>
              </svg>
            </div>
          </div>

          <!-- Enter Amount Input -->
          <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.65);font-weight:500;">
              <span>Recharge Amount</span>
              <span id="tern-est-usd-val" style="color:#ffaa00;font-feature-settings:'tnum';">≈ $${estUSD} USD</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:8px 16px;">
              <input id="tern-recharge-amount-input" type="number" value="${rechargeAmountVal}" placeholder="0.0" style="background:transparent;border:none;color:#fff;font-size:22px;font-weight:600;width:70%;outline:none;font-family:'Inter',monospace;"/>
              <span style="font-family:'Inter',sans-serif;font-weight:600;font-size:14px;color:#fff;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);padding:6px 12px;border-radius:9999px;border:1px solid rgba(255,255,255,0.08);">
                <img src="${coin.logo}" style="width:18px;height:18px;border-radius:50%;object-fit:contain;display:block;" alt="" onerror="this.src='/logos/${coin.symbol}.png'"/>
                ${coin.symbol}
              </span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
              <button class="tern-quick-recharge" data-amt="50" style="padding:5px 14px;font-size:12px;cursor:pointer;">+$50</button>
              <button class="tern-quick-recharge" data-amt="100" style="padding:5px 14px;font-size:12px;cursor:pointer;">+$100</button>
              <button class="tern-quick-recharge" data-amt="500" style="padding:5px 14px;font-size:12px;cursor:pointer;">+$500</button>
              <button class="tern-quick-recharge" data-amt="1000" style="padding:5px 14px;font-size:12px;cursor:pointer;">+$1,000</button>
              <button class="tern-quick-recharge" data-amt="5000" style="padding:5px 14px;font-size:12px;cursor:pointer;">MAX</button>
            </div>
          </div>

          <!-- Specs Info -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;font-family:'Inter',sans-serif;font-size:12px;">
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:12px 14px;border-radius:10px;">
              <div style="color:rgba(255,255,255,0.45);margin-bottom:4px;">Minimum Deposit</div>
              <div style="font-weight:500;color:#fff;">${coin.minDeposit}</div>
            </div>
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:12px 14px;border-radius:10px;">
              <div style="color:rgba(255,255,255,0.45);margin-bottom:4px;">Expected Confirmation</div>
              <div style="font-weight:500;color:#fff;">12 Confirmations (~ 2 mins)</div>
            </div>
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:12px 14px;border-radius:10px;">
              <div style="color:rgba(255,255,255,0.45);margin-bottom:4px;">Deposit Routing Fee</div>
              <div style="font-weight:500;color:#34d399;">$0.00 (Zero Fee)</div>
            </div>
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:12px 14px;border-radius:10px;">
              <div style="color:rgba(255,255,255,0.45);margin-bottom:4px;">Credited Custody</div>
              <div style="font-weight:500;color:#ffaa00;">Robinhood Chain Vault</div>
            </div>
          </div>

          <!-- Top Up Button -->
          <button id="tern-recharge-submit-btn" style="width:100%;padding:14px 24px;border-radius:9999px;background:#ffffff;color:#040914;font-family:'Inter',sans-serif;font-size:15px;font-weight:600;cursor:pointer;border:none;box-shadow:none;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;">
            <span>Top Up Account with ${coin.symbol}</span>
          </button>
        </div>
      </div>
    `;

    // Coin selection clicks
    container.querySelectorAll('.recharge-coin-card').forEach(card => {
      card.onclick = () => {
        selectedRechargeSymbol = card.getAttribute('data-symbol');
        const c = RECHARGE_COINS.find(x => x.symbol === selectedRechargeSymbol);
        if (c && c.networks.length > 0) {
          selectedRechargeNetwork = c.networks[0];
        }
        renderRechargeUI();
      };
    });

    // Network clicks
    container.querySelectorAll('.tern-net-choice').forEach(netBtn => {
      netBtn.onclick = () => {
        selectedRechargeNetwork = netBtn.getAttribute('data-net');
        renderRechargeUI();
      };
    });

    // Copy Address
    const copyBtn = document.getElementById('tern-copy-addr-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(coin.address);
        }
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Copied!</span>
        `;
        copyBtn.style.background = 'rgba(16,185,129,0.2)';
        copyBtn.style.color = '#10b981';
        copyBtn.style.borderColor = '#10b981';
        showToast('Address Copied', `${coin.symbol} deposit address copied to clipboard`, 'success');
        setTimeout(() => {
          if (copyBtn) {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy Address</span>
            `;
            copyBtn.style.background = 'rgba(255,255,255,0.08)';
            copyBtn.style.color = '#fff';
            copyBtn.style.borderColor = 'rgba(255,255,255,0.12)';
          }
        }, 2000);
      };
    }

    // Amount input
    const amtInput = document.getElementById('tern-recharge-amount-input');
    const estDisplay = document.getElementById('tern-est-usd-val');
    if (amtInput && estDisplay) {
      amtInput.oninput = () => {
        rechargeAmountVal = amtInput.value;
        const val = parseFloat(rechargeAmountVal) || 0;
        estDisplay.innerText = `≈ $${(val * priceUSD).toFixed(2)} USD`;
      };

      container.querySelectorAll('.tern-quick-recharge').forEach(qBtn => {
        qBtn.onclick = () => {
          const addAmt = parseFloat(qBtn.getAttribute('data-amt'));
          if (['BTC', 'ETH'].includes(coin.symbol)) {
            rechargeAmountVal = (addAmt / priceUSD).toFixed(4);
          } else {
            rechargeAmountVal = String(addAmt);
          }
          amtInput.value = rechargeAmountVal;
          const val = parseFloat(rechargeAmountVal) || 0;
          estDisplay.innerText = `≈ $${(val * priceUSD).toFixed(2)} USD`;
        };
      });
    }

    // Top Up Action Submit (Simulated Error)
    const submitBtn = document.getElementById('tern-recharge-submit-btn');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const origHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `
          <span style="display:inline-block;width:14px;height:14px;border:2px solid #040914;border-top-color:transparent;border-radius:50%;animation:ternSpin 0.7s linear infinite;margin-right:8px;vertical-align:middle;"></span>
          Connecting to custody gateway...
        `;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';

        setTimeout(() => {
          submitBtn.innerHTML = origHtml;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';

          // Pop up the Server Error Modal as requested
          openModal('Server Error', `
            <div style="text-align:center;padding:16px 0;">
              <div style="width:60px;height:60px;border-radius:50%;background:rgba(239,68,68,0.15);border:1px solid #ef4444;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;color:#ef4444;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
              <div style="font-size:18px;font-weight:700;margin-bottom:8px;color:#fff;">Server error: please try again later.</div>
              <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:18px;">
                Failed to establish secure gateway handshake with Robinhood Chain deposit relayer. Transaction timed out (Error Code: ERR_GATEWAY_TIMEOUT_503). No funds were deducted.
              </p>
              <div style="background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:8px;font-family:monospace;font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:20px;text-align:left;">
                <div>> POST https://relayer.robinhoodchain.org/v1/vault/deposit</div>
                <div style="color:#ef4444;">> 503 Service Unavailable: Gateway Timeout</div>
              </div>
              <div style="display:flex;gap:10px;">
                <button id="tern-error-tryagain" style="flex:1;padding:12px;border-radius:10px;background:rgba(255,120,0,0.2);border:1px solid #ffaa00;color:#ffaa00;font-weight:600;cursor:pointer;">Try Again</button>
                <button id="tern-error-dismiss" style="flex:1;padding:12px;border-radius:10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-weight:600;cursor:pointer;">Dismiss</button>
              </div>
            </div>
          `);

          const tryAgain = document.getElementById('tern-error-tryagain');
          if (tryAgain) {
            tryAgain.onclick = () => {
              closeModal();
              submitBtn.click();
            };
          }
          const dismiss = document.getElementById('tern-error-dismiss');
          if (dismiss) dismiss.onclick = closeModal;

          showToast('Server Error', 'Server error: please try again later.', 'error');
        }, 1400);
      };
    }
  }

  // --- BOOTSTRAP DISPATCHER ---
  function init() {
    injectCoreStyles();
    wireWalletButtons();
    startMarketPricesPolling();
    ensureTopBarLinks();
    wireMobileNavigationDrawer();

    const p = window.location.pathname;

    if (p.startsWith('/trade')) {
      const parts = p.split('/').filter(Boolean);
      const symbolFromUrl = (parts[1] || 'ETH').toUpperCase();
      const m = MARKETS_DEF.find(x => x.symbol === symbolFromUrl) || MARKETS_DEF[0];
      state.activeMarket = m.symbol;

      const titleMark = document.querySelector('.trade_titleMark__cxmeg img');
      if (titleMark) {
        titleMark.src = m.logo;
        titleMark.alt = m.symbol;
      }

      loadTradingViewChart(m);
      initLiveTicker(m.symbol);
      initMarketsSidebar();
      wireMarketsDrawer();
      initOrderPanel();
      initBottomTabs();
      checkTernTour();
    } else if (p.startsWith('/recharge')) {
      initRechargePage();
    } else if (p.startsWith('/radar')) {
      initRadarPage();
    } else if (p.startsWith('/yield')) {
      initYieldPage();
    } else if (p.startsWith('/theses')) {
      initThesesPage();
    } else if (p.startsWith('/portfolio')) {
      initPortfolioPage();
    } else if (p.startsWith('/launch')) {
      initLaunchPage();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also rerun on popstate or delayed hydration
  window.addEventListener('popstate', init);
  setTimeout(init, 300);
  setTimeout(init, 1000);

  // Global exposure
  window.startTernTour = startTernTour;
  window.TernApp = {
    state,
    showToast,
    openModal,
    closeModal,
    selectMarket,
    setMarketFilter,
    startTour: startTernTour
  };

})();
