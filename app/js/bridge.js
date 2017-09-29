(function() {

  function setupNewIosBridge(callback) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0);
  }

  function Bridge() {
    var self = this;
    self.queue = [];

    if(window.WebViewJavascriptBridge) {
        self.bridge = window.WebViewJavascriptBridge;
        self.next();
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', function() {
        self.bridge = WebViewJavascriptBridge;
        self.next();
      }, false);
    }

    setupNewIosBridge(function(bridge) {
      self.bridge = bridge;
      self.next();
    });
  }

  Bridge.prototype.next = function() {
    var self = this;
    if( self.queue.length > 0 && self.bridge){
        var msg = self.queue.shift();
        self.send( msg.obj, msg.callback );
        setTimeout(function(){
            self.next();
        }, 1);
    }
  }


  Bridge.prototype.send = function(obj, callback) {
    console.log(obj);
    if (this.bridge) {
      this.bridge.callHandler('MZNativeHandler', obj, function(resData) {
        callback && callback(resData);
      });
    } else {
      this.queue.push({obj: obj, callback: callback});
   
    }
  };

  Bridge.prototype.openNativePage  = function(options) {
      if (!this.bridge) {
        return;
      }
      var link = "mzjf://" + options.target + '_' + options.action + "/";
      var count = 0;
      for (var key in options.search) {
        if (count++ === 0) {
          link += "?";
        } else {
          link += "&";
        }
        link += key + '=' + encodeURIComponent(options.search[key]);
      }

      this.send('pageRoute', {
        link: link
      }, function(msg) {
        if (options.callback) { options.callback(msg); }
      });
    }

    window.bridge =  Bridge;

})();






