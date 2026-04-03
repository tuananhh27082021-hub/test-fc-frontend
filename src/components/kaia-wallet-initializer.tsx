export function KaiaWalletInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var KAIA_ICON_URL = '/assets/icons/kaia-wallet.png';
            var STORE_URL = 'https://www.kaiawallet.io/';
            
            var getRealProvider = function() {
              if (window.klaytn && !window.klaytn._isPolyfill) return window.klaytn;
              if (window.kaia && !window.kaia._isPolyfill) return window.kaia;
              // On mobile, if ethereum is not our decoy, it's likely a real wallet provider.
              if (window.ethereum && !window.ethereum._isDecoy) return window.ethereum;
              return null;
            };


            var announceKaia = function() {
              var ua = navigator.userAgent || '';
              var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.maxTouchPoints > 0);
              var isKaiaApp = /KaiaWallet|Kaikas/i.test(ua);
              var isWalletBrowser = isKaiaApp || (window.klaytn && !window.klaytn._isPolyfill) || (window.ethereum && !window.ethereum._isDecoy);

              var real = getRealProvider();
              
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
                        var lateReal = getRealProvider();
                        if (lateReal) return lateReal.request(args);
                        
                        if (method === 'eth_requestAccounts') {
                          // Try retrying a few times if we are in a wallet environment
                          if (isWalletBrowser) {
                            return new Promise(function(resolve, reject) {
                               var count = 0;
                               var check = setInterval(function() {
                                  var retryReal = getRealProvider();
                                  if (retryReal) {
                                    clearInterval(check);
                                    resolve(retryReal.request(args));
                                  } else if (++count > 10) { // 6 seconds total
                                    clearInterval(check);
                                    alert('Kaia Wallet provider not detected yet. Please ensure you are logged into your wallet and refresh the page inside the app.');
                                    reject({ code: -32603, message: 'Provider missing' });
                                  }
                               }, 600);
                            });
                          }

                          if (isMobile) {
                            var currentUrl = encodeURIComponent(window.location.href);
                            var isIOS = /iPhone|iPad|iPod/i.test(ua);
                            if (isIOS) {
                              window.location.href = 'kaiawallet://browse?url=' + currentUrl;
                            } else {
                              window.location.href = 'intent://browse?url=' + currentUrl + '#Intent;scheme=kaiawallet;package=io.kaiawallet;end;';
                            }
                            setTimeout(function() {
                              if (document.visibilityState === 'visible') {
                                window.location.href = 'https://kaiawallet.io/u/browse?url=' + currentUrl;
                              }
                            }, 2000);
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
              if (++announceAttempts >= 40) clearInterval(announceTimer);
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

            // Wait 1.5s before starting announcements to avoid clashing with injection
            setTimeout(function() {
              var announceAttempts = 0;
              var announceTimer = setInterval(function() {
                announceKaia();
                if (++announceAttempts >= 60) clearInterval(announceTimer); // 30 seconds total
              }, 500);
              announceKaia();
              window.addEventListener('eip6963:requestProvider', announceKaia);
            }, 1500);
          })();
        `,
      }}
    />
  );
}
