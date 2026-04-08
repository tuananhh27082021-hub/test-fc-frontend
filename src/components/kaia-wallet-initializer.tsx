export function KaiaWalletInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var KAIA_ICON_URL = '/assets/icons/kaia-wallet.png';
            var STORE_URL = 'https://www.kaiawallet.io/';
            
            var getRealProvider = function() {
              return (window.klaytn && !window.klaytn._isPolyfill) ? window.klaytn : (window.kaia && !window.kaia._isPolyfill ? window.kaia : null);
            };

            // 1. Check if we're already in a wallet browser
            var real = getRealProvider();
            if (real) {
              if (!window.ethereum || window.ethereum._isDecoy) {
                window.ethereum = real;
              }
              var announceNative = function() {
                window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
                  detail: Object.freeze({
                    info: { uuid: 'native-kaia', name: 'Kaia Wallet', icon: KAIA_ICON_URL, rdns: 'io.klutch.wallet' },
                    provider: real
                  })
                }));
              };
              announceNative();
              window.addEventListener('eip6963:requestProvider', announceNative);
              return; 
            }

            // 2. Setup decoy if missing
            if (!window.ethereum) {
              window.ethereum = {
                _isDecoy: true,
                request: function(args) {
                  var method = (args && args.method) || '';
                  if (method === 'eth_accounts') return Promise.resolve([]);
                  if (method === 'eth_chainId') return Promise.resolve('0x1');
                  return Promise.reject({ code: 4001 });
                },
                on: function() { return this; }, removeListener: function() { return this; },
                addListener: function() { return this; }, off: function() { return this; }
              };
            }

            // 3. Setup polyfill for discovery/redirection
            var announceKaia = function() {
              var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);
              
              window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
                detail: Object.freeze({
                  info: { 
                    uuid: 'ee9b1776-af3e-4fbc-81f7-efebd8b4a12c',
                    name: 'Kaia Wallet', 
                    icon: KAIA_ICON_URL, 
                    rdns: 'io.klutch.wallet' 
                  },
                  provider: {
                    _isPolyfill: true,
                    request: function(args) {
                      var method = (args && args.method) || '';
                      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
                        var lateReal = getRealProvider();
                        if (lateReal) return lateReal.request(args);
                        
                        var isAlreadyRedirected = window.location.search.indexOf('connect=true') !== -1;
                        if (isMobile && !isAlreadyRedirected) {
                          var currentUrl = window.location.href;
                          var targetUrl = currentUrl + (currentUrl.indexOf('?') === -1 ? '?' : '&') + 'connect=true';
                          var encodedTarget = encodeURIComponent(targetUrl);
                          
                          // Correct Android Intent format
                          var intentUrl = 'intent://wallet/browser?url=' + encodedTarget + '#Intent;scheme=kaiawallet;package=io.klutch.wallet;end;';
                          
                          // iOS Universal Link format
                          var universalLink = 'https://app.kaiawallet.io/u/' + targetUrl;

                          // Execute redirection
                          window.location.href = intentUrl;
                          setTimeout(function() {
                             if (!document.hidden && !document.webkitHidden) {
                               window.location.href = universalLink;
                             }
                          }, 1500);

                          return Promise.reject({ code: 4001, message: 'Opening Kaia Wallet app...' });
                        }

                        if (!isMobile) {
                          window.open(STORE_URL, '_blank');
                          return Promise.reject({ code: 4001, message: 'Please install Kaia Wallet' });
                        }
                      }
                      return (real || window.ethereum).request(args);
                    },
                    on: function(ev, cb) { if (real) real.on(ev, cb); return this; }, 
                    removeListener: function(ev, cb) { if (real) real.removeListener(ev, cb); return this; },
                    addListener: function(ev, cb) { if (real) real.addListener(ev, cb); return this; }, 
                    off: function(ev, cb) { if (real) real.off(ev, cb); return this; }
                  }
                })
              }));
            };

            var announceAttempts = 0;
            var announceTimer = setInterval(function() {
              announceKaia();
              if (++announceAttempts >= 10) clearInterval(announceTimer);
            }, 1000);
            announceKaia();
            window.addEventListener('eip6963:requestProvider', announceKaia);
          })();
        `,
      }}
    />
  );
}
