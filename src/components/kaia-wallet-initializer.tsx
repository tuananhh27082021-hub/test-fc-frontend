export function KaiaWalletInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var KAIA_ICON_URL = '/assets/icons/kaia-wallet.png';
            var STORE_URL = 'https://www.kaiawallet.io/';
            
            var getRealProvider = function() {
              var p = window.klaytn || window.kaia || window.kaikas || window.ethereum || window.caver || (window.web3 && window.web3.currentProvider);
              if (p && (typeof p.request === 'function' || typeof p.enable === 'function')) return p;
              try {
                for (var key in window) {
                   if (key.toLowerCase().indexOf('klaytn') !== -1 || key.toLowerCase().indexOf('kaikas') !== -1 || key.toLowerCase().indexOf('kaia') === 0) {
                      var pot = window[key];
                      if (pot && (typeof pot.request === 'function' || typeof pot.enable === 'function')) return pot;
                   }
                }
              } catch(e) {}
              return null;
            };

            var lateProvider = null;
            window.addEventListener('klaytn#initialized', function() { lateProvider = window.klaytn; });
            window.addEventListener('ethereum#initialized', function() { lateProvider = window.ethereum; });

            var announceKaia = function() {
              var ua = navigator.userAgent || '';
              var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.maxTouchPoints > 0);
              var isKaiaApp = /KaiaWallet|Kaikas/i.test(ua);
              var isWalletBrowser = isKaiaApp || (window.klaytn || window.ethereum);

              var real = getRealProvider() || lateProvider;
              
              window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
                detail: Object.freeze({
                  info: { 
                    uuid: 'ee9b1776-af3e-4fbc-81f7-efebd8b4a12c',
                    name: 'Kaia Wallet', 
                    icon: KAIA_ICON_URL, 
                    rdns: 'io.kaiawallet' 
                  },
                  provider: real || {
                    _isPolyfill: true,
                    request: function(args) {
                      var method = (args && args.method) || '';
                      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
                        var currentReal = getRealProvider() || lateProvider;
                        if (currentReal) {
                          if (method === 'eth_requestAccounts' && typeof currentReal.enable === 'function') {
                            return currentReal.enable();
                          }
                          return currentReal.request(args);
                        }
                        
                        if (method === 'eth_requestAccounts') {
                          if (isMobile) {
                            if (isKaiaApp) {
                               // Silently fail in broken mobile apps to encourage WalletConnect use
                               console.warn('Native injection blocked by Kaia mobile app. Use WalletConnect fallback.');
                               return Promise.reject({ code: 4001, message: 'Please use WalletConnect to connect.' });
                            } else {
                               // Open App deep link if on normal Chrome/Safari mobile
                               var currentUrl = encodeURIComponent(window.location.href);
                               var isIOSObj = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                               if (isIOSObj) {
                                 window.location.href = 'kaiawallet://browse?url=' + currentUrl;
                               } else {
                                 window.location.href = 'https://kaiawallet.io/u/browse?url=' + currentUrl;
                               }
                               return Promise.reject({ code: 4001, message: 'Opening Kaia Wallet...' });
                            }
                          } else {
                            // On Desktop, redirect to download store
                            window.open(STORE_URL, '_blank');
                            return Promise.reject({ code: 4001, message: 'Redirecting to Kaia Wallet store...' });
                          }
                        }
                      }
                      return Promise.resolve(null);
                    },
                    on: function() { return this; }, removeListener: function() { return this; },
                    addListener: function() { return this; }, off: function() { return this; }
                  }
                })
              }));
            };

            var observer = null;
            var cleanupDone = false;

            var cleanup = function() {
              if (cleanupDone) return;
              try {
                var nodes = document.querySelectorAll('span, div');
                var found = false;

                for (var i = 0; i < nodes.length; i++) {
                  var node = nodes[i];
                  var text = node.textContent;

                  if (text === 'Browser Extension' && node.children.length === 0) {
                     var button = node.closest('button');
                     if (button) {
                        button.style.display = 'none';
                        button.style.visibility = 'hidden';
                        button.style.height = '0';
                        button.style.padding = '0';
                        button.style.margin = '0';
                        found = true;
                     }
                  }
                }

                if (found) {
                  cleanupDone = true;
                  if (observer) observer.disconnect();
                }
              } catch(e) {}
            };

            var setupObserver = function() {
              if (!document.body) return setTimeout(setupObserver, 50);
              observer = new MutationObserver(function() { requestAnimationFrame(cleanup); });
              observer.observe(document.body, { childList: true, subtree: true });
              cleanup();
            };
            setupObserver();

            window.addEventListener('load', function() { setTimeout(announceKaia, 1000); });

            setTimeout(function() {
              var announceAttempts = 0;
              var announceTimer = setInterval(function() {
                announceKaia();
                if (++announceAttempts >= 30) clearInterval(announceTimer);
              }, 500);
              announceKaia();
              window.addEventListener('eip6963:requestProvider', announceKaia);
            }, 1000);
          })();
        `,
      }}
    />
  );
}
