export function KaiaWalletInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var KAIA_ICON_URL = '/assets/icons/kaia-wallet.png';
            var STORE_URL = 'https://www.kaiawallet.io/';
            
            var getRealProvider = function() {
              var p = (window.klaytn && !window.klaytn._isPolyfill) ? window.klaytn : (window.kaia && !window.kaia._isPolyfill ? window.kaia : null);
              return p;
            };

            var real = getRealProvider();
            
            // If we're already in a wallet browser, alias window.ethereum and STOP
            if (real) {
              if (!window.ethereum || window.ethereum._isDecoy) {
                window.ethereum = real;
              }
              // Still announce for EIP-6963 discovery
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
                        
                        // ONLY redirect if we are on mobile and NOT already in a wallet browser
                        if (isMobile && !isInWalletBrowser()) {
                          var currentUrl = window.location.href;
                          var targetUrl = currentUrl + (currentUrl.indexOf('?') === -1 ? '?' : '&') + 'connect=true';
                          var encodedTarget = encodeURIComponent(targetUrl);
                          
                          var intentUrl = 'intent://wallet/browser?url=' + encodedTarget + '#Intent;scheme=kaiawallet;package=io.klutch.wallet;end;';
                          window.location.href = intentUrl;

                          setTimeout(function() {
                            // Safe Universal Link fallback
                            window.location.href = 'https://app.kaiawallet.io/u/' + targetUrl;
                          }, 1000);
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
              if (++announceAttempts >= 10) clearInterval(announceTimer);
            }, 1000);
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
