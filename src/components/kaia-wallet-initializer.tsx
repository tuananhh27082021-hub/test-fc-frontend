export function KaiaWalletInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var KAIA_ICON_URL = '/assets/icons/kaia-wallet.png';
            var STORE_URL = 'https://www.kaiawallet.io/';
            
            var getRealProvider = function() {
              // Try known properties
              var p = window.klaytn || window.kaia || window.kaikas || (window.ethereum && !window.ethereum._isDecoy ? window.ethereum : null) || window.caver;
              if (p && typeof p.request === 'function' && !p._isPolyfill) return p;

              // Fallback deep scan
              try {
                for (var key in window) {
                   if (key.toLowerCase().indexOf('klaytn') !== -1 || key.toLowerCase().indexOf('kaikas') !== -1) {
                      var found = window[key];
                      if (found && typeof found.request === 'function' && !found._isPolyfill) return found;
                   }
                }
              } catch(e) {}
              return null;
            };

            // Listen for late injection events
            var lateProvider = null;
            window.addEventListener('klaytn#initialized', function() { lateProvider = window.klaytn; });
            window.addEventListener('ethereum#initialized', function() { lateProvider = window.ethereum; });


            var announceKaia = function() {
              var ua = navigator.userAgent || '';
              var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.maxTouchPoints > 0);
              var isKaiaApp = /KaiaWallet|Kaikas/i.test(ua);
              var isWalletBrowser = isKaiaApp || (window.klaytn || (window.ethereum && !window.ethereum._isDecoy));

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
                        if (currentReal) return currentReal.request(args);
                        
                        if (method === 'eth_requestAccounts') {
                          if (isMobile || isWalletBrowser) {
                            return new Promise(function(resolve, reject) {
                               if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                                 alert('SECURITY BLOCK: Kaia Wallet (and most mobile wallets) will NOT inject providers on non-HTTPS (http://) sites. If you are testing locally on mobile, please use Ngrok or test via your HTTPS Netlify link.');
                                 return reject({ code: -32603, message: 'Insecure HTTP protocol blocked provider injection.' });
                               }

                               var count = 0;
                               var check = setInterval(function() {
                                  var retryReal = getRealProvider() || lateProvider;
                                  if (retryReal) {
                                    clearInterval(check);
                                    resolve(retryReal.request(args));
                                  } else if (++count > 20) { // 14 seconds
                                    clearInterval(check);
                                    
                                    // FORCE NATIVE DEEP LINK as a last resort instead of failing
                                    console.warn('Provider completely missing. Forcing Deep Link essentially to wake up the app.');
                                    var currentUrl = encodeURIComponent(window.location.href);
                                    var isIOSObj = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                    
                                    if (isIOSObj) {
                                      window.location.href = 'kaiawallet://browse?url=' + currentUrl;
                                    } else {
                                      window.location.href = 'intent://browse?url=' + currentUrl + '#Intent;scheme=kaiawallet;package=io.kaiawallet;end;';
                                    }
                                    
                                    // Reject the promise just to avoid UI hanging
                                    reject({ code: 4001, message: 'Forced native deep link fired to wake up wallet.' });
                                  }
                               }, 700);
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
                            }, 3000);
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
