// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"components/utils/adobe/getIsSCPlus.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._isSCPlus = _isSCPlus;
function _isSCPlus(item) {
  var filter = Object.values(item.productCategories).map(function (el) {
    return el.toLowerCase();
  }).filter(function (el) {
    return el.match('samsung care');
  });
  return filter.length > 0;
}
},{}],"components/utils/adobe/paymentMethod.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPaymentMethod = getPaymentMethod;
/* eslint-disable prettier/prettier */
function getPaymentMethod() {
  var paymentMethodSelected = document.querySelector('.payment-group-item.active');
  var paymentMethod = 'pix';
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-bankInvoicePaymentGroup') {
    paymentMethod = 'pix';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-bankInvoicePaymentGroup') {
    paymentMethod = 'bank slip';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-payPalPaymentGroup') {
    paymentMethod = 'paypal';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-debitCardPaymentGroup') {
    paymentMethod = 'debit card';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-MercadoPagoPaymentGroup') {
    paymentMethod = 'mercado pago';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-creditCardPaymentGroup') {
    paymentMethod = 'credit card';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-customPrivate_501PaymentGroup') {
    paymentMethod = 'Samsung itaucard';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-picPayPaymentGroup') {
    paymentMethod = 'picpay';
  }
  if (paymentMethodSelected && paymentMethodSelected.id === 'payment-group-SamsungPayPaymentGroup') {
    paymentMethod = 'Samsung pay';
  }
  return {
    paymentMethod: paymentMethod
  };
}
},{}],"components/utils/adobe/siteCodeString.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SITE_CODE_STRING = void 0;
var SITE_CODE_STRING = 'var siteCode="",pageURL=" ",digitalData={page:{pageInfo:{siteCode:"",siteSection:"shop",pageName:"" },pathIndicator:{depth_2:"",depth_3:"",depth_4:"",depth_5:""},offerId:""},user:{loginStatus:false},product:{modelVariant:"",model_name:"",displayName:"",productDivision:"",productFamily:"",pimSubType:"",listPrice:""},orderdetails:{listPrice:"",productsOrdered:"",modelVariant:"",deliveryOption:"",paymentMethod:"",orderId:"",productDivision:"",productFamily:"",pimSubType:"",displayName:"",addService:"",oldDevice:""}},depth=window.location.href.split("/").length,depth_last=window.location.href.split("/")[depth-1];""!==depth_last&&"?"!==depth_last.charAt(0)||(depth-=1),""===digitalData.page.pathIndicator.depth_2&&(depth>=5&&(digitalData.page.pathIndicator.depth_2=pageURL.split("/")[4]),depth>=6&&(digitalData.page.pathIndicator.depth_3=pageURL.split("/")[5]),depth>=7&&(digitalData.page.pathIndicator.depth_4=pageURL.split("/")[6]),depth>=8&&(digitalData.page.pathIndicator.depth_5=pageURL.split("/")[7]));var pageName=siteCode+":shop";""!=digitalData.page.pathIndicator.depth_2&&(pageName+=":"+digitalData.page.pathIndicator.depth_2),""!=digitalData.page.pathIndicator.depth_3&&(pageName+=":"+digitalData.page.pathIndicator.depth_3),""!=digitalData.page.pathIndicator.depth_4&&(pageName+=":"+digitalData.page.pathIndicator.depth_4),""!=digitalData.page.pathIndicator.depth_5&&(pageName+=":"+digitalData.page.pathIndicator.depth_5),digitalData.page.pageInfo.pageName=pageName;';
exports.SITE_CODE_STRING = SITE_CODE_STRING;
},{}],"components/_adobeLaunchPixel.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adobeLaunchInit = adobeLaunchInit;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/typeof"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/createClass"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _getIsSCPlus = require("./utils/adobe/getIsSCPlus");
var _paymentMethod = require("./utils/adobe/paymentMethod");
var _siteCodeString = require("./utils/adobe/siteCodeString");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable radix */
/* eslint-disable padding-line-between-statements */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
/* eslint-disable max-params */

function adobeLaunchInit() {
  var settingsAdobe = new AdobeLaunchPixel();
  settingsAdobe.init();
}
var AdobeLaunchPixel = /*#__PURE__*/function () {
  function AdobeLaunchPixel() {
    (0, _classCallCheck2.default)(this, AdobeLaunchPixel);
    /* List of pages where the DTM transformation is enabled */
    this.dtmWatchPages = {
      checkout: 'main-header'
    };

    /* ATTENTION: THOSE FILES ARE RELATED TO STAGING ENVIRONMENT OF ADOBE DTM, EACH ONE OF THESE ARE RELATED TO ONE SPECIFIC COUNTRY/REGION */
    this.scriptFiles = {
      br: '//assets.adobedtm.com/72afb75f5516/901a9e1a98ec/launch-a82080575b1a.min.js',
      br_staging: '//assets.adobedtm.com/72afb75f5516/901a9e1a98ec/launch-c78d04fd7f6b-staging.min.js'
    };
    this.version2 = ['br'];
    this.countryCodes = ['br'];
    this.pageType = false;
    this.observer = null;
    this.pageInterval = null;
    this.codesCache = [];
    this.cacheProducts = [];
    this.productsOrdered = '';
    this.pagesWithMutation = ['checkout'];
    this.cacheKey = 'ssgDtmCache';
  }

  /* This part injects the jQuery (it's needed to adobe DTM), the window.digitalData variable (globally) */
  (0, _createClass2.default)(AdobeLaunchPixel, [{
    key: "init",
    value: function init() {
      var _this = this;
      _this.loadCache();
      var dataLayerScript = document.createElement('script');
      dataLayerScript.type = 'text/javascript';
      dataLayerScript.innerText = _siteCodeString.SITE_CODE_STRING;
      document.head.appendChild(dataLayerScript);
      _this.getPageType();
      _this._populateProductLayer();
      var adobeDtmScript = document.createElement('script');
      adobeDtmScript.type = 'text/javascript';
      var scriptIndex = _this._fetchSiteCode();
      var siteCode = _this._fetchSiteCode();
      if (!_this._isProduction()) scriptIndex += '_staging';
      var rand = Math.floor(Math.random() * 1000);
      adobeDtmScript.src = "".concat(_this.scriptFiles[scriptIndex], "?v=").concat(rand);
      if (_this.version2.indexOf(siteCode) > -1) {
        adobeDtmScript.setAttribute('async', '');
      }
      document.head.appendChild(adobeDtmScript);
      adobeDtmScript.onload = function () {
        _this.waitForDataSend();
        var satelliteInterval = setInterval(function () {
          if (document.body) {
            if (document.getElementById('satelliteAA')) {
              clearInterval(satelliteInterval);
              return;
            }
            if (_this.version2.indexOf(siteCode) === -1) {
              var satelliteEnd = document.createElement('script');
              satelliteEnd.id = 'satelliteAA';
              satelliteEnd.innerText = 'try{_satellite.pageBottom();}catch(e){}';
              satelliteEnd.type = 'text/javascript';
              document.body.appendChild(satelliteEnd);
            }
          }
        }, 100);

        // var realPushState = history.pushState;
        // history.pushState = function () {
        // 	var currentContainer = document.querySelector('.render-container').className;
        // 	var currentTitle = document.querySelector('head title');
        // 	var checkPageChange = setInterval(function () {
        // 		var newClassName = document.querySelector('.render-container').className;
        // 		var newTitle = document.querySelector('head title');
        // 		if (currentTitle === null || newTitle === null)
        // 			return;

        // 		if (currentContainer !== newClassName || currentTitle.text !== newTitle.text) {
        // 			_this._populateDataLayer();
        // 			clearInterval(checkPageChange);
        // 		}
        // 	}, 500);

        // 	return realPushState.apply(history, arguments);
        // };
        _this._populateDataLayer();
        _this._trackLogin();
        _this._addProductToDigitalDataV2();
      };
    }
  }, {
    key: "setup",
    value: function setup() {
      var _this = this;

      /* This is to avoid the injection of the script of DTM to the iframe page inside the cart page */
      if (window.location.href.indexOf('upselling') > -1) return;
      /* If the page type is in the array list of DTM watched pages, don't proceed to do nothing */
      if (_this.pageType === false) return;
      window.onhashchange = function () {
        _this._populateDataLayer();
        _this.waitForDataSend();
        _this._trackLogin();
        _this._pageTrack();
      };
      if (_this.observer === null) {
        if (_this.pagesWithMutation.indexOf(_this.pageType) === -1) {
          _this._populateProductLayer();
        } else {
          _this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              if (document.querySelector('.payment-unauthorized-modal') !== null && document.querySelector('.payment-unauthorized-modal').style.display === 'block') {
                _this.pageType = 'order_failure';
                return;
              }
              if (mutation.target.className === 'render-provider') {
                var newPageType = _this.getPageType();
                if (newPageType !== _this.pageType) {
                  _this.pageType = false;
                  _this.setup();
                  return;
                }
              }
              var addedNodesCount = mutation.addedNodes.length;
              if (addedNodesCount > 0) {
                for (var i = 0; i < addedNodesCount; i++) {
                  var node = mutation.addedNodes[i];
                  if (!(node instanceof HTMLElement)) return;
                  _this.inspectElement(node);
                }
              }
              if (_this.pageType === 'checkout') {
                $('.item-link-remove.data-omni-remove').on('click', function (event) {
                  var target = event.target;
                  var dataOmni = target.getAttribute('data-omni-variant');
                  if (dataOmni) {
                    _this._removeFromDigitalData(dataOmni);
                  } else {
                    _this._removeFromDigitalData(target.parentElement.getAttribute('data-omni-variant'));
                  }
                });
              }
            });
          });
          _this.observer.observe(document.querySelector('html'), {
            childList: true,
            subtree: true
          });
        }
      }
    }
  }, {
    key: "_removeFromDigitalData",
    value: function _removeFromDigitalData(dataOmniVariant) {
      var product = {
        modelVariant: window.digitalData.product.modelVariant.split(','),
        model_name: window.digitalData.product.model_name.split(','),
        displayName: window.digitalData.product.displayName.split(';'),
        productDivision: window.digitalData.product.productDivision.split(','),
        productFamily: window.digitalData.product.productFamily.split(','),
        pimSubType: window.digitalData.product.pimSubType.split(','),
        listPrice: window.digitalData.product.listPrice.split(',')
      };
      var productIndex = product.modelVariant.indexOf(dataOmniVariant);
      Object.keys(product).forEach(function (key) {
        var join = ',';
        if (key === 'displayName') {
          join = ';';
        }
        product[key] = product[key].filter(function (_, index) {
          return index !== productIndex;
        }).join(join);
      });
      window.digitalData.product = product;
    }

    /* Fetches the page type based on the class name */
  }, {
    key: "getPageType",
    value: function getPageType() {
      var _this = this;
      if (_this.pageInterval !== null) return;
      _this.pageInterval = setInterval(function () {
        if (document.body) {
          var rootDivs = document.querySelectorAll('body > div, body > header');
          var _loop = function _loop(i) {
            Object.keys(_this.dtmWatchPages).forEach(function (page) {
              var pageClass = _this.dtmWatchPages[page];
              var classes = rootDivs[i].classList;
              classes.forEach(function (item) {
                if (page === 'custom' && item.indexOf(pageClass) > -1) {
                  _this.pageType = 'custom';
                  return;
                }
                if (item === pageClass) {
                  _this.pageType = page;
                  if (_this.pageType === 'department' || _this.pageType === 'subcategory') {
                    _this.pageType = 'category';
                  }
                }
              });
            });
            if (_this.pageType !== false) {
              clearInterval(_this.pageInterval);
              _this.setup();
              return "break";
            }
          };
          for (var i = 0; i < rootDivs.length; i++) {
            var _ret = _loop(i);
            if (_ret === "break") break;
          }
        }
      }, 500);
    }

    /* Helper function to set the data omni attriutes */
  }, {
    key: "setElementOmni",
    value: function () {
      var _setElementOmni = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(elem, className, attrs) {
        var fetchDataBy,
          callback,
          _this,
          cachedInfo,
          modelName,
          modelCode,
          products,
          models,
          i,
          p,
          _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              fetchDataBy = _args.length > 3 && _args[3] !== undefined ? _args[3] : null;
              callback = _args.length > 4 && _args[4] !== undefined ? _args[4] : null;
              _this = this;
              if (!(elem === null)) {
                _context.next = 5;
                break;
              }
              return _context.abrupt("return");
            case 5:
              elem.classList.add(className);
              if (!(fetchDataBy !== null)) {
                _context.next = 20;
                break;
              }
              cachedInfo = _this._findCachedInfo(fetchDataBy.type, fetchDataBy.value, false);
              modelName = '';
              modelCode = '';
              if (!cachedInfo) {
                _context.next = 18;
                break;
              }
              if (!Array.isArray(cachedInfo)) {
                modelCode = cachedInfo.modelCode.toUpperCase();
                modelName = cachedInfo.modelName;
              }
              if ('bundle' in cachedInfo) {
                modelName = '';
                if (cachedInfo.bundle === true) {
                  products = cachedInfo.modelCode.split('_');
                  models = [];
                  for (i = 0; i < products.length; i++) {
                    p = _this._findCachedInfo('modelCode', products[i]);
                    if (p !== undefined) models.push(p.modelName);
                  }
                  if (models.length) modelName = ";".concat(models.join('_').toLowerCase());
                }
              }
              elem.setAttribute('data-omni-variant', modelCode);
              elem.setAttribute('data-omni-base', ";".concat(modelName));
              if (callback) callback();
              _context.next = 20;
              break;
            case 18:
              _context.next = 20;
              return _this._fetchData(elem, fetchDataBy.type, fetchDataBy.value, callback);
            case 20:
              if (attrs !== null) {
                Object.keys(attrs).forEach(function (attr) {
                  var attrName = 'data-omni';
                  var value = attrs[attr];
                  if (attr !== '') attrName += "-".concat(attr);
                  elem.setAttribute(attrName, value);
                });
              }
            case 21:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function setElementOmni(_x, _x2, _x3) {
        return _setElementOmni.apply(this, arguments);
      }
      return setElementOmni;
    }() /* Finds the product code/name in the codesCache variable to avoid unecessary API requests */
  }, {
    key: "_findCachedInfo",
    value: function _findCachedInfo(type, value) {
      var breakSku = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var _this = this;
      var result = null;
      if (_this.codesCache === null || _this.codesCache.length === 0) return false;
      if (type === 'ean') type = 'modelCode';
      if (type === 'url') type = 'productUrl';
      if (type === 'url') {
        type = 'productUrl';
        if (!value.endsWith('/p')) {
          value += '/p';
        }
      }
      try {
        if (type === 'name') {
          return _this.codesCache.find(function (obj) {
            return obj[type] === value;
          });
        }
        result = _this.codesCache.find(function (obj) {
          return obj[type] === value;
        });
        if (!result) return;
        if (breakSku === true && 'bundle' in result && result.bundle) {
          var products = result.modelCode.split('_');
          var results = [];
          for (var i = 0; i < products.length; i++) {
            var r = _this._findCachedInfo('modelCode', products[i], true, products[i]);
            if (r === undefined) {
              results.push(result);
            }
            results.push(r);
          }
          return results;
        }
        return result;
      } catch (err) {
        // console.error("[SAMSUNG AA DTM] Codes cache are corrupted:\n", typeof _this.codesCache, "\n", err);
        if (typeof _this.codesCache === 'string') {
          _this.codesCache = JSON.parse(_this.codesCache);
        }
        // return _this._findCachedInfo(type, value, breakSku);
      }
    }

    /* Just the API call used for other pourpuses */
  }, {
    key: "_fetchData",
    value: function () {
      var _fetchData2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(node, fetchDataBy, value) {
        var callback,
          _this,
          targetUrl,
          data,
          displayName,
          prodUrl,
          xhttp,
          _args2 = arguments;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              callback = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : null;
              _this = this;
              if (!(node === null)) {
                _context2.next = 4;
                break;
              }
              return _context2.abrupt("return");
            case 4:
              if (!(node.hasAttribute('data-loaded') || node.hasAttribute('data-omni-variant') && node.hasAttribute('data-omni-base'))) {
                _context2.next = 6;
                break;
              }
              return _context2.abrupt("return");
            case 6:
              node.setAttribute('data-loaded', true);
              targetUrl = 'https://ssg-checkout.linkapi.com.br/v1/product?apiKey=78ca5fdbcadb437083408712375af24c';
              data = {};
              data.type = fetchDataBy;
              data.searchValue = value;
              data.country = _this._fetchSiteCode();
              displayName = '';
              prodUrl = '';
              if (fetchDataBy === 'name') {
                displayName = value;
              }
              if (fetchDataBy === 'url') {
                prodUrl = value;
              }
              if ((data.type !== '' || data.searchValue !== '') && _this.codesCache !== -1) {
                xhttp = new XMLHttpRequest();
                xhttp.addEventListener('load', function () {
                  _this._callbackFetch(this, node, callback, displayName, prodUrl);
                });
                xhttp.open('POST', targetUrl, true);
                xhttp.setRequestHeader('Content-Type', 'application/json');
                // xhttp.send(JSON.stringify(data));
              }
            case 17:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function _fetchData(_x4, _x5, _x6) {
        return _fetchData2.apply(this, arguments);
      }
      return _fetchData;
    }() /* The call back of the fetch and also call the custom callback passed as parameter */
  }, {
    key: "_callbackFetch",
    value: function _callbackFetch(ajax, node) {
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      if (ajax.readyState === 4 && ajax.status === 200) {
        var resp = JSON.parse(ajax.response);
        if (resp.modelCode === undefined && resp.modelName === undefined) return;
        node.setAttribute('data-omni-variant', resp.modelCode.toUpperCase());
        node.setAttribute('data-omni-base', ";".concat(resp.modelName));
        if (callback) callback();
      }
    }

    /* Get the page type and call one of the methods designated to each part of the site */
  }, {
    key: "inspectElement",
    value: function inspectElement(node) {
      var _this = this;
      if (node === undefined || node.className === undefined) return;
      var classes = typeof node.className !== 'string' ? '' : node.className.split(' ');
      if (_this.pageType === 'checkout') {
        _this.cart(classes, node);
      }
      _this._populateProductLayer();
    }

    /* Cart Page */
  }, {
    key: "cart",
    value: function cart(classes, node) {
      var _this = this;
      _this._populateProductLayer();
      if (node.className.indexOf('product-item') > -1) {
        if (window.location.hash === '#/cart') {
          if (node.querySelector('td.product-name a') !== null) {
            var addItemButton = node.querySelector('td.quantity a.item-quantity-change.item-quantity-change-increment');
            var skuId = node.getAttribute('data-sku');
            if (addItemButton && skuId) {
              _this.setElementOmni(addItemButton, 'data-omni-buynow', {
                base: _this._mountDataBuyNow('base', skuId),
                variant: _this._mountDataBuyNow('variant', skuId)
              });
              $(".product-item[data-sku=\"".concat(skuId, "\"] #item-quantity-change-increment-").concat(skuId)).on('click', function () {
                _this._populateDataLayer();
                _this.waitForDataSend();
                _this._pageTrack();
              });
            }
          }
        }
        var removeItemButton = node.querySelector('.item-link-remove');
        if (node.querySelector('td.product-name a') !== null) {
          _this.setElementOmni(removeItemButton, 'data-omni-remove', null, {
            type: 'url',
            value: _this._getLocation(node.querySelector('td.product-name a').href)
          });
        }
      }
      var proceedCheckoutBtn = document.querySelector('#cart-to-orderform');
      if (proceedCheckoutBtn !== null) {
        _this.setElementOmni(proceedCheckoutBtn, 'data-omni-proceedtocheckout', {
          '': 'cart:proceed to checkout',
          base: window.digitalData.product.model_name,
          variant: window.digitalData.product.modelVariant
        });
      }
      var backtocart = document.querySelector('#orderform-to-cart');
      if (backtocart !== null) {
        _this.setElementOmni(backtocart, 'data-omni-backtocart', {
          '': 'checkout:back to cart'
        });
      }
      var backtocart2 = document.querySelector('#go-to-cart-button-custom');
      if (backtocart2 !== null) {
        if (backtocart2.querySelector('#orderform-minicart-to-cart') !== null) {
          _this.setElementOmni(backtocart2.querySelector('#orderform-minicart-to-cart'), 'data-omni-backtocart', {
            '': 'checkout:back to cart'
          });
        }
      }
      var backToStore = document.querySelector('.checkout-header-back');
      if (backToStore !== null) {
        if (document.querySelector('.cart-active') === null) {
          _this.setElementOmni(backToStore.querySelector('a'), 'data-omni-backtoshop', {
            '': 'checkout:continue shopping'
          });
        } else {
          _this.setElementOmni(backToStore.querySelector('a'), 'data-omni-backtoshop', {
            '': 'cart:continue shopping'
          });
        }
      }
      var buyMoreProducts = document.querySelector('.choice-new-products a');
      if (buyMoreProducts !== null) {
        _this.setElementOmni(buyMoreProducts, 'data-omni-backtoshop', {
          '': 'cart:continue shopping'
        });
      }
      var proceedShipping = document.querySelector('#go-to-shipping');
      if (proceedShipping !== null) {
        _this.setElementOmni(proceedShipping, 'data-omni-continue', {
          '': 'checkout:order detail:next step'
        });
      }
      var proceedPayment = document.querySelector('#btn-go-to-payment');
      if (proceedPayment !== null) {
        _this.setElementOmni(proceedPayment, 'data-omni-continue', {
          '': 'checkout:delivery:next step'
        });
      }
      if (node.className.indexOf('hproduct') > -1) {
        if (node.querySelector('.url') !== undefined) {
          _this.setElementOmni(node, 'data-placeholder', null, {
            type: 'url',
            value: _this._getLocation(node.querySelector('.url').href)
          });
        }
      }
      var endCheckout = document.querySelectorAll('#payment-data-submit');
      if (endCheckout.length > 0) {
        endCheckout = endCheckout[1];
        if (document.querySelector('.payment-group-item') !== null) {
          var _getPaymentMethod = (0, _paymentMethod.getPaymentMethod)(),
            paymentMethod = _getPaymentMethod.paymentMethod;
          _this.setElementOmni(endCheckout, 'data-omni-checkout', {
            base: window.digitalData.product.model_name,
            variant: window.digitalData.product.modelVariant,
            '': "checkout:".concat(paymentMethod)
          });
        }
      }
      var checkoutLoginForm = document.querySelector('.client-pre-email');
      var checkoutLogin = document.querySelector('#btn-client-pre-email');
      if (checkoutLogin !== null && checkoutLoginForm !== null) {
        _this.setElementOmni(checkoutLogin, 'data-omni-signin', {
          '': 'account:submit'
        });
        checkoutLoginForm.onsubmit = function (e) {
          e.preventDefault();
          var parameter = 'account:submit';
          if (!checkoutLoginForm.checkValidity()) parameter = 'account:submit';
          _this.setElementOmni(checkoutLogin, 'data-omni-signin', {
            '': parameter
          });
        };
      }
    }

    /* This function triggers the Adobe Analytics window.digitalData server call */
  }, {
    key: "waitForDataSend",
    value: function waitForDataSend() {
      var _this = this;
      var intervalWait = setInterval(function () {
        if (!_this.pageType || window.digitalData.page.pageInfo.siteCode === '') {
          return;
        }
        var product = window.digitalData.product;
        if (!_this._checkProperties(product)) {
          var pageURL = _this._removeAccents(window.location.href);
          window.digitalData.page.pageInfo.pageURL = pageURL;
          clearInterval(intervalWait);
          intervalWait = null;
        }
      }, 50);
    }

    /* Populates the window.digitalData variable Page informations */
  }, {
    key: "_populateDataLayer",
    value: function _populateDataLayer() {
      if (window._satellite === undefined || window._satellite === null) {
        return null;
      }
      var _this = this;
      var siteCode = _this._fetchSiteCode();
      window.digitalData.page.pageInfo.siteCode = siteCode;
      window.digitalData.page.pageInfo.siteSection = 'shop';
      var pathName = window.location.pathname.replace("/".concat(siteCode), '');
      if (_this.countryCodes.indexOf(pathName[0]) > -1) pathName.shift(0);
      window.digitalData.page.pageInfo.pageName = ' ';
      window.digitalData.page.pageInfo.pageName = _this._removeAccents((window.digitalData.page.pageInfo.siteSection + pathName.replace(/\//gi, ':') + window.location.hash.replace(/\//gi, ':').trim(':')).replace(/:$/gi, '')).replace('#', '');
      if (document.body) {
        var rootDivs = document.querySelectorAll('body > div');
        var _loop2 = function _loop2(i) {
          Object.keys(_this.dtmWatchPages).forEach(function (page) {
            var pageClass = _this.dtmWatchPages[page];
            var classes = rootDivs[i].classList;
            classes.forEach(function (item) {
              if (item === pageClass) {
                _this.pageType = page;
              }
            });
          });
          if (_this.pageType !== false) return "break";
        };
        for (var i = 0; i < rootDivs.length; i++) {
          var _ret2 = _loop2(i);
          if (_ret2 === "break") break;
        }
      }
      switch (_this.pageType) {
        case 'checkout':
          if (window.location.hash === '#/cart') {
            window.digitalData.page.pageInfo.pageTrack = 'shop cart';
          } else {
            window.digitalData.page.pageInfo.pageTrack = 'shop checkout';
          }
          break;
        case 'order_failure':
          window.digitalData.page.pageInfo.pageTrack = 'shop order failure';
          break;
        case 'help':
          window.digitalData.page.pageInfo.pageTrack = 'shop help';
          break;
        case 'error':
          window.digitalData.page.pageInfo.pageTrack = 'shop error';
          break;
        default:
          if (window.location.hash === '#/cart') {
            window.digitalData.page.pageInfo.pageTrack = 'shop cart';
          } else {
            window.digitalData.page.pageInfo.pageTrack = 'shop checkout';
          }
          break;
      }
      var pathname = window.location.pathname;
      pathname = _this._removeAccents(pathname).replace('/', '');
      var hashname = window.location.hash.replace('#/', '').split('/').filter(function (el) {
        return el !== '';
      });
      var pathnameArr = pathname.split('/').filter(function (el) {
        return el !== '';
      }).concat(hashname);
      if (_this.countryCodes.indexOf(pathnameArr[0]) > -1) pathnameArr.shift();
      pathnameArr = pathnameArr.filter(function (value) {
        return value.trim() !== '';
      });
      for (var p = 0; p <= 3; p++) {
        var depthIndex = p + 2;
        window.digitalData.page.pathIndicator["depth_".concat(depthIndex)] = pathnameArr[p] === undefined ? '' : window.digitalData.page.pathIndicator["depth_".concat(depthIndex)] = pathnameArr[p];
      }
    }

    /* Gahters all the products informations inside the page to populate the product property */
  }, {
    key: "_populateProductLayer",
    value: function _populateProductLayer() {
      var _this = this;
      var pagesWithProductLayer = ['checkout'];
      if (pagesWithProductLayer.indexOf(_this.pageType) === -1) {
        window.digitalData.product.modelVariant = '';
        window.digitalData.product.model_name = '';
        window.digitalData.product.displayName = '';
        window.digitalData.product.productDivision = '';
        window.digitalData.product.productFamily = '';
        window.digitalData.product.pimSubType = '';
        window.digitalData.product.listPrice = '';
        return;
      }
      if (!_this._checkProperties(window.digitalData.product)) return;
      var searchType = 'ean';
      if (_this.pageType === 'checkout' || _this.pageType === 'cart') {
        if (typeof window.vtexjs !== 'undefined' && typeof _this.codesCache !== 'undefined' && window.vtexjs.checkout.orderForm !== undefined && window.vtexjs.checkout.orderForm.items.length > 0) {
          var items = window.vtexjs.checkout.orderForm.items;
          if (typeof _this.codesCache === 'string') {
            _this.codesCache = JSON.parse(_this.codesCache);
          }
          var digitsDecimalPoint = window.vtexjs.checkout.orderForm.storePreferencesData.currencyFormatInfo.currencyDecimalDigits;
          try {
            var _loop3 = function _loop3() {
              var item = items[i];
              if (_this.codesCache !== -1) {
                var index = _this.codesCache.findIndex(function (obj) {
                  return item.refId === obj.modelCode;
                });
                if (_this.codesCache[index]) {
                  if (digitsDecimalPoint > 0) {
                    _this.codesCache[index].price = (item.sellingPrice / Math.pow(10, digitsDecimalPoint)).toFixed(digitsDecimalPoint);
                  } else {
                    _this.codesCache[index].price = item.sellingPrice;
                  }
                }
              }
            };
            for (var i = 0; i < items.length; i++) {
              _loop3();
            }
          } catch (e) {
            console.error("_populateProductLayer: ".concat(e));
          }
          var data = {};
          if (_this.codesCache !== -1) {
            _this.codesCache.lastUpdate = new Date();
            data[this._fetchSiteCode()] = _this.codesCache;
            localStorage.setItem(_this.cacheKey, JSON.stringify(data));
          }
        }
        var productItems = document.querySelectorAll('tr.product-item');
        productItems.forEach(function (productItem) {
          if (productItem !== null) {
            if (productItem.getAttribute('data-loading') !== null && productItem.querySelector('.total-selling-price') !== null) {
              return;
            }
            var productPriceNode = productItem.querySelector('.total-selling-price');
            if (productPriceNode === null) return;
            var productPrice = productPriceNode.innerText;
            productPrice = productPrice.replace(/[^\d]/g, '').trim();
            productItem.setAttribute('data-loading', true);
            searchType = 'sku';
            var productSKU = productItem.dataset.sku;
            var cachedData = _this._findCachedInfo(searchType, productSKU, false);
            var apiData = {};
            if (cachedData) {
              apiData = cachedData;
              apiData.listPrice = productPrice;
            } else if (_this.codesCache === -1) {
              var xhttp = new XMLHttpRequest();
              var targetUrl = 'https://ssg-checkout.linkapi.com.br/v1/product?apiKey=78ca5fdbcadb437083408712375af24c';
              var _data = {};
              _data.type = searchType;
              _data.searchValue = productSKU;
              _data.country = _this._fetchSiteCode();
              if (_data.type === '' || _data.searchValue === '') return;
              if (productSKU === null) return;
              xhttp.open('POST', targetUrl, true);
              xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                  apiData = JSON.parse(this.response);
                  apiData.listPrice = productPrice.replace(/\./g, '').replace(',', '').trim();
                }
              };
              xhttp.setRequestHeader('Content-Type', 'application/json');
              // xhttp.send(JSON.stringify(data));
            }
          }
        });
      }
    }
  }, {
    key: "_addProductToDigitalDataV2",
    value: function _addProductToDigitalDataV2() {
      var _this = this;
      var _modelName = [];
      var _displayName = [];
      var _modelVariant = [];
      var _productDivision = [];
      var _productFamily = [];
      var _pimSubType = [];
      var _listPrice = [];
      var _skuIds = [];
      var itemsQuantity = [];
      var idInterval = setInterval(function () {
        try {
          if (window.vtexjs && window.vtexjs.hasOwnProperty('checkout') && window.vtexjs.checkout.hasOwnProperty('orderForm') && window.vtexjs.checkout.orderForm.hasOwnProperty('items')) {
            clearInterval(idInterval);
            var items = window.vtexjs.checkout.orderForm.items;
            var customData = window.vtexjs.checkout.orderForm.customData || false;
            var tradeInCustomData = customData && customData.customApps.find(function (itemTrade) {
              return itemTrade.id === 'domain';
            });
            var transportCustomData = tradeInCustomData && tradeInCustomData.fields.trade_in_option_selected;
            items.forEach( /*#__PURE__*/function () {
              var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(item) {
                var tradeIn, scplus, modelCacheSCPlus, model, modelCache;
                return _regenerator.default.wrap(function _callee3$(_context3) {
                  while (1) switch (_context3.prev = _context3.next) {
                    case 0:
                      if (transportCustomData && _modelName.indexOf(';trade-in') < 0) {
                        tradeIn = _this._getTradeInData(item);
                        _modelName.push(";".concat(tradeIn.model_name));
                        _displayName.push(tradeIn.displayName);
                        _modelVariant.push(tradeIn.modelVariant);
                        _productDivision.push(tradeIn.productDivision);
                        _productFamily.push(tradeIn.productFamily);
                        _pimSubType.push(tradeIn.pimSubType);
                        _listPrice.push(tradeIn.listPrice);
                        itemsQuantity.push(1);
                      }
                      if (!(0, _getIsSCPlus._isSCPlus)(item)) {
                        _context3.next = 16;
                        break;
                      }
                      scplus = _this._getMobileCareData(item);
                      _modelName.push(";".concat(scplus.model_name));
                      _displayName.push(scplus.displayName);
                      _modelVariant.push(scplus.modelVariant);
                      _productDivision.push(scplus.productDivision);
                      _productFamily.push(scplus.productFamily);
                      _pimSubType.push(scplus.pimSubType);
                      _skuIds.push(scplus.skuId);
                      modelCacheSCPlus = {
                        cacheModelName: "".concat(scplus.model_name),
                        cacheModelVariant: "".concat(scplus.modelVariant),
                        cacheSkuId: "".concat(scplus.skuId)
                      };
                      _this.cacheProducts.push(modelCacheSCPlus);
                      if (window.__RUNTIME__.account === 'samsungbr' || window.__RUNTIME__.account === 'samsungbrshop') {
                        _listPrice.push(Number(scplus.listPrice).toFixed(2));
                      } else {
                        _listPrice.push(Number(scplus.listPrice));
                      }
                      itemsQuantity.push(1);
                      _context3.next = 30;
                      break;
                    case 16:
                      _context3.next = 18;
                      return _this._getModel(item);
                    case 18:
                      model = _context3.sent;
                      _modelName.push(";".concat(model.modelName));
                      _displayName.push(item.name ? item.name : '');
                      _modelVariant.push(item.refId);
                      _productDivision.push(model.productDivision !== undefined ? model.productDivision : '');
                      _productFamily.push(model.productFamily !== undefined ? model.productFamily : '');
                      _pimSubType.push(model.pimSubType !== undefined ? model.pimSubType : '');
                      _skuIds.push(item.id);
                      modelCache = {
                        cacheModelName: "".concat(model.modelName),
                        cacheModelVariant: "".concat(item.refId),
                        cacheSkuId: "".concat(item.id)
                      };
                      _this.cacheProducts.push(modelCache);
                      if (window.__RUNTIME__.account.indexOf('samsungbr') > -1 || window.__RUNTIME__.account.indexOf('samsungbrshop') > -1 || window.__RUNTIME__.account.indexOf('samsungmx') > -1) {
                        _listPrice.push(Number(item.price / 100).toFixed(2));
                      } else {
                        _listPrice.push(Number(item.price));
                      }
                      itemsQuantity.push(1);
                    case 30:
                      window.digitalData.product = {
                        model_name: _modelName.join(','),
                        modelVariant: _modelVariant.join(','),
                        displayName: _displayName.join(','),
                        productDivision: _productDivision.join(','),
                        productFamily: _productFamily.join(','),
                        pimSubType: _pimSubType.join(','),
                        listPrice: _listPrice.join(',')
                      };
                      if (items.length === itemsQuantity.length) {
                        _this._pageTrackCart();
                      }
                    case 32:
                    case "end":
                      return _context3.stop();
                  }
                }, _callee3);
              }));
              return function (_x7) {
                return _ref.apply(this, arguments);
              };
            }());
          }
        } catch (e) {
          console.error(e);
        }
      }, 100);
    }

    /* helper to check if a object is empty or not */
  }, {
    key: "_checkProperties",
    value: function _checkProperties(obj) {
      for (var key in obj) {
        if (obj[key] !== null && obj[key] !== '') return false;
      }
      return true;
    }

    /* helper to remove accentuation (pretty obivous) */
  }, {
    key: "_removeAccents",
    value: function _removeAccents(str) {
      if (str.indexOf('%') > -1) str = decodeURI(str);
      var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
      var accentsOut = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
      str = str.split('');
      var strLen = str.length;
      var i;
      var x;
      for (i = 0; i < strLen; i++) {
        if ((x = accents.indexOf(str[i])) !== -1) {
          str[i] = accentsOut[x];
        }
      }
      return str.join('');
    }

    /* Populate the site code according to the URL or first depth of the path */
  }, {
    key: "_fetchSiteCode",
    value: function _fetchSiteCode() {
      var _this = this;
      var hostArr = window.location.host.split('.');
      if (hostArr[0].includes('samsungbrtest') || hostArr[0].indexOf("samsungbrshop")) return 'br';
      var tldCode = hostArr[hostArr.length - 1];
      if (_this.countryCodes.indexOf(tldCode) > -1) return tldCode;
      var pathNameArr = window.location.pathname.replace('/', '').split('/');
      if (_this.countryCodes.indexOf(pathNameArr[0]) > -1) return pathNameArr[0];
      /* If the country code is not in query param or domain, then get the subdomain last two chars: samsungXX */
      return hostArr[0].substr(-2);
    }
  }, {
    key: "_isProduction",
    value: function _isProduction() {
      var productionSites = ['shop.samsung.com/br', 'shop.samsung.com.br'];
      for (var i = 0; i < productionSites.length; i++) {
        if (window.location.href.indexOf(productionSites[i]) > -1) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: "_getLocation",
    value: function _getLocation(href) {
      var l = document.createElement('a');
      l.href = href;
      return l.pathname;
    }
  }, {
    key: "loadCache",
    value: function loadCache() {
      var _this = this;
      var apiKey = '78ca5fdbcadb437083408712375af24c';
      var country = _this._fetchSiteCode();
      var cache = null;
      try {
        if (localStorage) {
          cache = localStorage.getItem(_this.cacheKey);
          if (typeof cache === 'string') {
            cache = JSON.parse(cache);
          }
        }
      } catch (err) {
        console.error('[SAMSUNG AA DTM] Error during the read of the localStorage data', err);
        cache = null;
      } finally {
        var HALF_HOUR = 60 * 60 * 1000 / 2;
        if (cache === null || (0, _typeof2.default)(cache) !== 'object' || !(country in cache) || !('lastUpdate' in cache) || new Date() - new Date(cache.lastUpdate) >= HALF_HOUR) {
          var body = {};
          var skuIds = window.vtexjs.checkout.orderForm.items.map(function (item) {
            return Number(item.id);
          });
          if (skuIds.length > 0) {
            body = {
              skuIds: skuIds
            };
          } else {
            body = {};
          }
          var xhttp = new XMLHttpRequest();
          var targetUrl = "https://ssg-checkout.linkapi.com.br/v1/products?apiKey=".concat(apiKey);
          xhttp.open('POST', targetUrl, true);
          _this.codesCache = -1;
          xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
              var newCache = {};
              newCache[country] = this.response;
              newCache.lastUpdate = new Date();
              if (localStorage) {
                localStorage.setItem(_this.cacheKey, JSON.stringify(newCache));
              }
              _this.codesCache = this.response;
            } else {
              _this.codesCache = [];
            }
          };
          xhttp.setRequestHeader('Content-Type', 'application/json');
          xhttp.send(JSON.stringify(body));
        }
        if (cache !== null && cache !== undefined) {
          _this.codesCache = cache[country];
        }
      }
    }
  }, {
    key: "_pageTrack",
    value: function _pageTrack() {
      try {
        if (window._satellite !== undefined && window._satellite !== null && 'track' in window._satellite && (window.location.hash === '#/cart' || window.location.hash === '#/email' || window.location.hash === '#/shipping' || window.location.hash === '#/payment' || window.location.hash === '#/profile')) {
          if (window.digitalData.product) {
            setTimeout(function () {
              window._satellite.track('page_view');
            }, 1000);
          }
        }
      } catch (e) {
        console.error('[DTM]: Error window._satellite.track');
      }
    }
  }, {
    key: "_trackLogin",
    value: function _trackLogin() {
      var orderForm = window.vtexjs.checkout.orderForm;
      var customerLogged = orderForm.clientProfileData;
      var saGuid = localStorage.getItem('saGuid');
      var loginStatus = window.digitalData.user.loginStatus;
      try {
        if (window._satellite !== undefined && window._satellite !== null && 'track' in window._satellite) {
          if (window.location.hash === '#/shipping' || window.location.hash === '#/payment' || window.location.hash === '#/profile') {
            if (!loginStatus && saGuid) {
              window.digitalData.user.loginStatus = true;
              window._satellite.track('samsung_account_login');
            } else {
              window.digitalData.user.loginStatus = true;
            }
          }
          if (window.location.hash === '#/cart' || window.location.hash === '#/email') {
            if (customerLogged !== null) {
              window.digitalData.user.loginStatus = true;
            } else {
              if (saGuid) {
                localStorage.setItem('saGuid', '');
              }
              window.digitalData.user.loginStatus = false;
            }
          }
        }
      } catch (e) {
        console.error('[DTM]: Error window._satellite.track');
      }
    }
  }, {
    key: "_pageTrackCart",
    value: function _pageTrackCart() {
      try {
        if (window._satellite !== undefined && window._satellite !== null && 'track' in window._satellite) {
          if (window.digitalData.product) {
            setTimeout(function () {
              window._satellite.track('page_view');
            }, 1000);
          }
        }
      } catch (e) {
        console.error('[DTM]: Error window._satellite.track');
      }
    }
  }, {
    key: "_getTradeInData",
    value: function _getTradeInData() {
      return {
        model_name: 'trade-in',
        modelVariant: 'trade-in',
        displayName: 'trade-in',
        listPrice: 0,
        unit: 0,
        productDivision: 'shop program',
        productFamily: 'trade-in',
        pimSubType: 'trade-in'
      };
    }
  }, {
    key: "_getMobileCareData",
    value: function _getMobileCareData(product) {
      return {
        model_name: 'samsung care',
        modelVariant: product.refId.toUpperCase(),
        displayName: product.name,
        listPrice: product.listPrice / 100,
        productDivision: 'shop program',
        productFamily: 'samsung care',
        pimSubType: 'insurance',
        skuId: product.id
      };
    }
  }, {
    key: "_isTradeIn",
    value: function _isTradeIn(item) {
      var filter = Object.values(item.productCategories).map(function (el) {
        return el.toLowerCase();
      }).filter(function (el) {
        return el.match('trade');
      });
      return filter.length > 0;
    }
  }, {
    key: "_mountDataBuyNow",
    value: function _mountDataBuyNow(dataOmni, skuId) {
      var _this = this;
      var data = '';
      var findItem = window.vtexjs.checkout.orderForm.items.find(function (item) {
        return item.id === skuId;
      });
      if (!findItem) return '';
      try {
        var findItemCacheApi = _this.cacheProducts.find(function (objItem) {
          return objItem.cacheSkuId === findItem.id;
        });
        if (findItemCacheApi) {
          // modelName
          if (dataOmni === 'base') {
            data = findItemCacheApi.cacheModelName;
          }

          // modelCode
          if (dataOmni === 'variant') {
            data = findItemCacheApi.cacheModelVariant;
          }
        } else {
          data = dataOmni === 'base' ? findItemCacheApi.cacheModelName : findItemCacheApi.cacheModelVariant;
        }
      } catch (e) {
        console.error("_mountDataBuyNow: ".concat(e));
      }
      var value = dataOmni === 'base' ? ";".concat(data) : data;
      return value;
    }
  }, {
    key: "_getModel",
    value: function () {
      var _getModel2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(product) {
        var skuId, account, accountBRShop, productDivision, productFamily, allCategories, pimSubType, currentPath, uri, myHeaders;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              skuId = product.refId;
              account = window.__RUNTIME__.account.replace('samsung', '').split('test').shift();
              accountBRShop = account.replace('shop', '');
              productDivision = '';
              productFamily = '';
              allCategories = '';
              pimSubType = '';
              currentPath = window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : '';
              uri = "".concat(currentPath, "/pvt/getModel?siteCode=").concat(accountBRShop, "&modelCode=").concat(skuId);
              myHeaders = new Headers({
                'Content-Type': 'application/json'
              });
              return _context4.abrupt("return", fetch(uri, {
                method: 'GET',
                headers: myHeaders
              }).then(function (res) {
                return res.json();
              }).then(function (response) {
                productDivision = response.more.resultData.Products.Product.BasicInfo[0].PviCategories.ProductTypeName;
                productFamily = response.more.resultData.Products.Product.BasicInfo[0].PviCategories.ProductSubTypeName;
                allCategories = response.more.resultData.Products.Product.BasicInfo[0].Categories.Category[0].CategoryEnglishNamePath.split('|');
                pimSubType = allCategories.length > 2 ? allCategories[2] : '';
                return {
                  modelCode: response.ModelCode,
                  modelName: response.ModelName,
                  productDivision: productDivision || 'N/A',
                  productFamily: productFamily || 'N/A',
                  pimSubType: pimSubType || 'N/A'
                };
              }).catch(function () {
                var categories = Object.values(product.productCategories);
                return {
                  modelCode: skuId || '',
                  modelName: skuId || '',
                  productDivision: categories[0] || 'N/A',
                  productFamily: categories.length > 1 ? categories[1] : 'N/A',
                  pimSubType: categories[categories.length - 1] || 'N/A'
                };
              }));
            case 11:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function _getModel(_x8) {
        return _getModel2.apply(this, arguments);
      }
      return _getModel;
    }()
  }]);
  return AdobeLaunchPixel;
}();
},{"@babel/runtime/helpers/esm/typeof":"../node_modules/@babel/runtime/helpers/esm/typeof.js","@babel/runtime/helpers/esm/asyncToGenerator":"../node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js","@babel/runtime/helpers/esm/classCallCheck":"../node_modules/@babel/runtime/helpers/esm/classCallCheck.js","@babel/runtime/helpers/esm/createClass":"../node_modules/@babel/runtime/helpers/esm/createClass.js","@babel/runtime/regenerator":"../node_modules/@babel/runtime/regenerator/index.js","./utils/adobe/getIsSCPlus":"components/utils/adobe/getIsSCPlus.js","./utils/adobe/paymentMethod":"components/utils/adobe/paymentMethod.js","./utils/adobe/siteCodeString":"components/utils/adobe/siteCodeString.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "6782" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js"], null)
//# sourceMappingURL=/_adobeLaunchPixel.js.map