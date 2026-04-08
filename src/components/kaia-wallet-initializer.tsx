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

            var announceKaia = function() {
              var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);
              var real = getRealProvider();
              
              window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
                detail: Object.freeze({
                  info: { 
                    uuid: 'ee9b1776-af3e-4fbc-81f7-efebd8b4a12c',
                    name: 'Kaia Wallet', 
                    icon: KAIA_ICON_URL, 
                    rdns: 'io.klutch.wallet' 
                  },
                  provider: real || {
                    _isPolyfill: true,
                    request: function(args) {
                      var method = (args && args.method) || '';
                      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
                        var lateReal = getRealProvider();
                        if (lateReal) return lateReal.request(args);
                        
                        if (method === 'eth_requestAccounts') {
                          if (isMobile) {
                            var currentUrl = encodeURIComponent(window.location.href);
                            
                            // BRAND NEW VERIFIED ID: io.kaiawallet
                             var intentUrl = 'intent://wallet/browser?url=' + currentUrl + '#Intent;scheme=kaiawallet;package=io.klutch.wallet;end;';
                            window.location.href = intentUrl;

                            // Universal Link Fallback
                            setTimeout(function() {
                              window.location.href = 'https://app.kaiawallet.io/u/' + currentUrl;
                            }, 1000);
                          } else {
                            window.open(STORE_URL, '_blank');
                          }
                        }
                        return Promise.reject({ code: 4001, message: 'Redirecting to Kaia Wallet...' });
                      }
                      return Promise.resolve(null);
                    },
                    on: function() { return this; }, removeListener: function() { return this; },
                    addListener: function() { return this; }, off: function() { return this; }
                  }
                })
              }));
            };

            var announceAttempts = 0;
            var announceTimer = setInterval(function() {
              announceKaia();
              if (++announceAttempts >= 20) clearInterval(announceTimer);
            }, 500);
            announceKaia();
            window.addEventListener('eip6963:requestProvider', announceKaia);

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
          })();
        `,
      }}
    />
  );
}
