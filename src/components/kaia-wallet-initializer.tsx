export function KaiaWalletInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var KAIA_ICON_URL = '/assets/icons/kaia-wallet.png';
            var STORE_URL = 'https://www.kaiawallet.io/';
            
            var getRealProvider = function() {
              // Priority 1: Direct known properties (Trust all, no more filtering)
              var p = window.klaytn || window.kaia || window.kaikas || window.ethereum || window.caver || (window.web3 && window.web3.currentProvider);
              if (p && (typeof p.request === 'function' || typeof p.enable === 'function')) return p;

              // Priority 2: Deep scan for anything that looks like a crypto wallet
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

            // Listen for late injection events
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
                          // Try .enable() first for mobile compatibility if it's the requested method
                          if (method === 'eth_requestAccounts' && typeof currentReal.enable === 'function') {
                            return currentReal.enable();
                          }
                          return currentReal.request(args);
                        }
                        
                        if (method === 'eth_requestAccounts') {
                          if (isMobile || isWalletBrowser) {
                            return new Promise(function(resolve, reject) {
                               if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                                 alert('SECURITY BLOCK: Kaia Wallet sẽ KHÔNG nạp Web3 trên http://. Vui lòng dùng đường link HTTPS (Netlify/Ngrok) để test trên mobile!');
                                 return reject({ code: -32603, message: 'Insecure protocol' });
                               }

                               var count = 0;
                               var check = setInterval(function() {
                                  var retryReal = getRealProvider() || lateProvider;
                                  if (retryReal) {
                                    clearInterval(check);
                                    if (typeof retryReal.enable === 'function') {
                                       resolve(retryReal.enable());
                                    } else {
                                       resolve(retryReal.request(args));
                                    }
                                  } else if (++count > 25) { // 20 seconds approx
                                    clearInterval(check);
                                    
                                    // NẾU BẠN ĐANG Ở TRONG APP KAIA RỒI: Tuyệt đối KHÔNG chạy Deep Link (gây văng ra Google Play)
                                    if (isKaiaApp) {
                                        alert('[LỖI KAIA APP] Trình duyệt ẩn trong App Kaia hiện tại của bạn không hỗ trợ/không nạp Web3 Provider. Đề xuất: Thoát ra dùng trình duyệt Chrome/Safari và kết nối thông qua tính năng WalletConnect!');
                                        return reject({ code: 4001, message: 'App lacks injection functionality.' });
                                    }

                                    // Chỉ chạy Deep Link nếu ở Chrome/Safari để bật app Kaia Wallet lên
                                    console.warn('Forcing Native Deep Link to wake up wallet from browser.');
                                    var currentUrl = encodeURIComponent(window.location.href);
                                    var isIOSObj = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                                    
                                    if (isIOSObj) {
                                      window.location.href = 'kaiawallet://browse?url=' + currentUrl;
                                    } else {
                                      window.location.href = 'intent://browse?url=' + currentUrl + '#Intent;scheme=kaiawallet;package=io.kaiawallet;end;';
                                    }
                                    
                                    reject({ code: 4001, message: 'Fired native deep link.' });
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
