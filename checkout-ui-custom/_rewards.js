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
})({"components/rewards/_layout.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLayoutElementTotalPoints = createLayoutElementTotalPoints;
exports.createLayoutGroupCalcRewards = createLayoutGroupCalcRewards;
exports.createLayoutMessageObs = createLayoutMessageObs;
exports.createLayoutRewardsTotalDiscount = createLayoutRewardsTotalDiscount;
var _require = require('../_utils'),
  formatNumberBRL = _require.formatNumberBRL;
function createLayoutGroupCalcRewards(_ref) {
  var totalPointsUser = _ref.totalPointsUser;
  return "\n  <div id=\"group-all-rewards\" style=\"display: none; grid-area: rewards-calc\">\n        <div\n          id=\"group-calc-rewards\"\n          style=\"width: auto; margin: 15px 0; padding: 25px 15px 10px 20px; background: #F5F7FE; font-family: SamsungOne; color: #000; font-size: 14px; font-weight: 400; border-radius: 12px;\"\n        >\n          <div\n            id=\"calc-header-rewards\"\n            style=\"display: flex; justify-content: flex-start; align-items: center; flex-wrap: wrap; border-bottom: 1px solid #d6d6d6; padding-bottom: 15px\"\n          >\n            <span\n              id=\"calc-header-title\"\n              style=\"margin-right: 0.5vw; font-size: 20px; font-weight: 700\"\n            >\n              Samsung Rewards:\n            </span>\n            <span\n              id=\"calc-header-points\"\n              style=\" color: #006BEA; font-size: 20px; font-weight: 700;\"\n            >\n              Voc\xEA tem ".concat(formatNumberBRL(totalPointsUser), " pontos\n            </span>\n          </div>\n          <div\n            id=\"calc-content-rewards\"\n            style=\"margin-top: 10px\"\n          >\n            <div\n              id=\"calc-content-first-column\"\n              style=\"display: grid; grid-template-columns: 1fr;\"\n            >\n            <div class=\"container-switch-rewards\">\n              <label class=\"switch-rewards\">\n                <input type=\"checkbox\">\n                <span class=\"slider\"></span>\n              </label>\n              <span class=\"text-switch-rewards\"></span>\n            </div>\n            <p style=\"color: #000000; font-size: 14px; font-weight: 400; padding-bottom: 10px; text-align: justify;\">\n              Troque seus pontos por at\xE9 50% de desconto. *Essa transa\xE7\xE3o poder\xE1 utilizar todos os seus pontos.\n            </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    ");
}
function createLayoutElementTotalPoints(_ref2) {
  var totalPointsCurrentOrder = _ref2.totalPointsCurrentOrder;
  var _component = "\n        <tbody id=\"total-details-rewards\" style=\"border-top: 1px solid #cbcbcb;\">\n          <tr style=\"display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;\">\n            <td id=\"td-text-rewards-total\" style=\"font-size: 14px; color: #000; font-weight: 400\">\n              Pontos Rewards gerados para sua pr\xF3xima compra*\n            </td>\n            <td id=\"total-points-value\" style=\"font-size: 14px; color: #2189FF; font-weight: 800; text-align: right !important\">".concat(formatNumberBRL(totalPointsCurrentOrder), " Pontos</td>\n          </tr>\n        </tbody>\n      ");
  var _componentVtexId = "\n      <tbody id=\"total-details-rewards\" style=\"border-top: 1px solid #cbcbcb;\">\n        <tr style=\"display: flex; justify-content: space-between; font-family: 'SamsungOne'; gap: 10%;\">\n          <td id=\"td-text-rewards-total\" style=\"font-size: 14px; color: #000; font-weight: 400\">\n            *Pontos Rewards (Gerados apenas quando utilizado Samsung Account)\n          </td>\n          <td id=\"total-points-value\" style=\"font-size: 14px; color: #2189FF; font-weight: 800; text-align: right !important\">".concat(formatNumberBRL(totalPointsCurrentOrder), " Pontos</td>\n        </tr>\n      </tbody>\n      ");
  return {
    _component: _component,
    _componentVtexId: _componentVtexId
  };
}
function createLayoutMessageObs(saguid) {
  var _component = '';
  if (saguid) {
    _component = "\n      <div id=\"text-details-rewards\" style=\"max-width: 376px; width: 100%; margin-top: 15px; color: #000; font-size: 12px; font-family: 'SamsungOne'; float: right; text-align: justify;\">\n        <p>\n          **Pontos Samsung Rewards s\xE3o gerados somente em compras realizadas por meio de uma Samsung Account participante do programa. Pontos Samsung Rewards pendentes ser\xE3o creditados 14 dias ap\xF3s a entrega do pedido. Caso seu pedido seja cancelado ou o pagamento n\xE3o seja aprovado, os pontos n\xE3o ser\xE3o creditados. Ao utilizar seus pontos j\xE1 existentes do Samsung Rewards as promo\xE7\xF5es de meios de pagamento vigentes n\xE3o ser\xE3o aplicadas.\n        </p>\n      </div>\n    ";
  } else {
    _component = "\n    <div id=\"text-details-rewards\" style=\"max-width: 376px; width: 100%; margin-top: 15px; color: #000; font-size: 12px; font-family: 'SamsungOne'; float: right; text-align: justify;\">\n      <p>\n      \u201CFa\xE7a seu login ou cadastre uma conta Samsung e ganhe Pontos Samsung Rewards ao realizar a sua compra.\n      Junte pontos e troque por at\xE9 50% de desconto em compras futuras em nossa Loja Online\u201D.\n      </p>\n    </div>\n  ";
  }
  return {
    _component: _component
  };
}
function createLayoutRewardsTotalDiscount(_ref3) {
  var discount = _ref3.discount;
  var _component = "\n  <tr class=\"rewards-total-discount\">\n    <td class=\"info\">Rewards</td>\n    <td class=\"space\"></td>\n    <td class=\"monetary\" style=\"color: #000\">- ".concat(discount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }), "</td>\n    <td class=\"empty\">\n      <a id=\"rewards-remove-discount\" style=\"text-decoration: none; color #000; margin-left: 10px\">\n        <svg id=\"Icon_-_Bold_-_Action_-_Cancel\" data-name=\"Icon - Bold - Action - Cancel\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\">\n          <rect id=\"Container\" width=\"16\" height=\"16\" fill=\"none\"/>\n          <path id=\"Icon_Bold_Action_Cancel\" data-name=\"Icon / Bold / Action / Cancel\" d=\"M7.583,15.167h0a7.583,7.583,0,1,1,7.584-7.583A7.533,7.533,0,0,1,7.582,15.167ZM7.466,8.29h0l2.651,2.652.825-.825L8.29,7.465l2.652-2.652-.825-.825L7.466,6.64,4.814,3.988l-.825.825L6.641,7.465,3.989,10.117l.825.825L7.465,8.29Z\" transform=\"translate(0.417 0.417)\"/>\n        </svg>\n      </a>\n    </td>\n  </tr>\n");
  return {
    _component: _component
  };
}
},{"../_utils":"components/_utils.js"}],"components/rewards/constants/_payloadRequest.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PAYLOAD_REWARDS_DEFAULT = void 0;
var PAYLOAD_REWARDS_DEFAULT = {
  Timestamp: new Date().toISOString().split('Z')[0],
  RequestType: 'R'
};
exports.PAYLOAD_REWARDS_DEFAULT = PAYLOAD_REWARDS_DEFAULT;
},{}],"components/rewards/_rewards.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bootstrapRewards = bootstrapRewards;
exports.default = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/defineProperty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/esm/createClass"));
var _layout = require("./_layout");
var _rootPath = require("../utils/_rootPath");
var _payloadRequest = require("./constants/_payloadRequest");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function bootstrapRewards() {
  var bootstrapRewards = new Rewards();
  return bootstrapRewards;
}
var Rewards = /*#__PURE__*/function () {
  function Rewards() {
    (0, _classCallCheck2.default)(this, Rewards);
    this.userAcceptedRewards = false;
    this.emailUserRewards = '';
    this.userSaGuid = '';
    this.totalPointsCurrentOrder = 0;
    this.totalPointsUser = 0;
    this.totalCurrencyUser = 0;
    this.pricePerPoint = 0;
    this.chosenDiscount = 0;
  }
  (0, _createClass2.default)(Rewards, [{
    key: "getRewardsData",
    value: function getRewardsData(docId) {
      var _this = this;
      if (this.emailUserRewards !== docId || !this.userAcceptedRewards) {
        $.ajax({
          url: "".concat((0, _rootPath.rootPath)(), "/_v/get/client/").concat(docId),
          headers: {
            Accept: 'application/vnd.vtex.ds.v10+json',
            'Content-Type': 'application/json'
          },
          crossDomain: true,
          cache: false,
          type: 'GET',
          success: function success(res) {
            if (_this.emailUserRewards !== docId) {
              window.localStorage.setItem('saGuid', '5dwesu2glk' || '');
              if (window._satellite) {
                window._satellite.setVar('GUID', '5dwesu2glk' || '');
              }
              _this.userSaGuid = '5dwesu2glk';
              _this.emailUserRewards = docId;
            }
            if (!res[0].isRewardsAccepted && res[0].saGuid) {
              $('#RewardsBlock').show();
              $('#inputRewards').attr('checked', false);
              _this.userAcceptedRewards = false;
            } else if (res[0].isRewardsAccepted && res[0].saGuid) {
              $('#RewardsBlock').hide();
              $('#inputRewards').attr('checked', true);
              _this.userAcceptedRewards = true;
              if (window.location.hash === '#/payment') {
                _this.getPointsSearch();
                _this.showRewardsCalc();
              }
            }
          },
          error: function error(err) {
            return function () {
              console.error('get client rewards data error', err);
            };
          }
        });
      } else if (this.userSaGuid && this.userAcceptedRewards) {
        if (window.location.hash === '#/payment') {
          this.getPointsSearch();
          this.showRewardsCalc();
        }
      }
    }
  }, {
    key: "putRewardsOnCustomData",
    value: function putRewardsOnCustomData(orderFormId, points) {
      var rewardsAccepted = $('#inputRewards').is(':checked');
      var newData = {
        total_points_earned: points,
        terms_accepted: rewardsAccepted || this.userAcceptedRewards,
        saguid: this.userSaGuid || localStorage.getItem('saGuid') || '0',
        salesChannel: vtexjs.checkout.orderForm.salesChannel
      };
      $.ajax({
        url: "".concat((0, _rootPath.rootPath)(), "/v1/pub/putCheckoutCustomData/").concat(orderFormId, "/rewards"),
        type: 'PUT',
        crossDomain: true,
        accept: 'application/vnd.vtex.ds.v10+json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(newData)
      });
    }
  }, {
    key: "createElementTotalPoints",
    value: function createElementTotalPoints(points) {
      try {
        var _checkoutElem = $(".summary-totalizers .table");
        var _createLayoutElementT = (0, _layout.createLayoutElementTotalPoints)({
            totalPointsCurrentOrder: this.totalPointsCurrentOrder
          }),
          _component = _createLayoutElementT._component,
          _componentVtexId = _createLayoutElementT._componentVtexId;
        if (_checkoutElem.find('#total-details-rewards').length > 0) {
          _checkoutElem.find('#total-details-rewards').remove();
        }
        if (points > 0 && this.userSaGuid && this.userAcceptedRewards) {
          _checkoutElem.append(_component);
        } else if (points > 0 && (!this.userSaGuid || !this.userAcceptedRewards)) {
          _checkoutElem.append(_componentVtexId);
        }
      } catch (e) {
        console.error('createElementTotalPoints error:', e);
      }
    }
  }, {
    key: "showRewardsCalc",
    value: function showRewardsCalc() {
      var saGuid = localStorage.getItem('saGuid');
      if (!saGuid) return;
      $('#group-all-rewards').show();
    }
  }, {
    key: "createRewardsTotalDiscount",
    value: function createRewardsTotalDiscount(discount) {
      var _this2 = this;
      if ($('.rewards-total-discount').length === 0) {
        var _createLayoutRewardsT = (0, _layout.createLayoutRewardsTotalDiscount)({
            discount: discount
          }),
          _component = _createLayoutRewardsT._component;
        $('.totalizers-list').append(_component);
        $('body').on('click', '#rewards-remove-discount', function () {
          _this2.cancelRewardsDiscount();
        });
        return null;
      }
      return null;
    }
  }, {
    key: "showObsRewards",
    value: function showObsRewards() {
      try {
        var orderForm = window.vtexjs.checkout.orderForm;
        var saGuid = localStorage.getItem('saGuid');
        if (orderForm.items.length === 0 && $('#text-details-rewards').length > 0) {
          $('#text-details-rewards').remove();
        }
        if (orderForm.items.length === 0) return;
        if (orderForm.totalizers.length === 0) return;
        var _checkoutElem = $(".cart-fixed");
        var _cartElem = $(".summary-to-new-components");
        var _createLayoutMessageO = (0, _layout.createLayoutMessageObs)(saGuid),
          _component = _createLayoutMessageO._component;
        if (_checkoutElem.find('#text-details-rewards').length > 0 || _cartElem.find('#text-details-rewards').length > 0) {
          return;
        }
        _cartElem.append(_component);
        _checkoutElem.append(_component);
      } catch (e) {
        console.error('showObsRewards error:', e);
      }
    }
  }, {
    key: "createGroupCalcRewards",
    value: function createGroupCalcRewards() {
      var _this3 = this;
      if ($('#group-calc-rewards').length !== 0) return;
      $('.link-gift-card').after((0, _layout.createLayoutGroupCalcRewards)({
        totalPointsUser: this.totalPointsUser
      }));
      var orderForm = window.vtexjs.checkout.orderForm;
      if (orderForm.paymentData.giftCards) {
        var giftRewards = orderForm.paymentData.giftCards.filter(function (g) {
          return g.provider === 'SSG_REWARDS';
        });
        if (giftRewards.length && giftRewards[0].inUse && giftRewards[0].value > 0) {
          $('.switch-rewards input')[0].checked = true;
          $('#group-all-rewards').show();
        }
      }
      if ($('.switch-rewards input')[0].checked) {
        $('.text-switch-rewards').text('Utilizar os pontos nesta compra');
      } else {
        $('.text-switch-rewards').text('Não utilizar os meus pontos nessa compra');
      }
      $(document).on('change', '.switch-rewards input', function () {
        var inputChecked = $('.switch-rewards input')[0].checked;
        $('.switch-rewards input').prop('disabled', true);
        if (inputChecked) {
          $('.text-switch-rewards').text('Utilizar os pontos nesta compra');
          _this3.setRewardsDiscount();
        } else {
          $('.text-switch-rewards').text('Não utilizar os meus pontos nessa compra');
          _this3.cancelRewardsDiscount();
        }
      });
    }
  }, {
    key: "getPointsSearch",
    value: function getPointsSearch() {
      var _this4 = this;
      var orderForm = window.vtexjs.checkout.orderForm;
      var TotalShipping = 0;
      if (orderForm.totalizers.find(function (item) {
        return item.id === 'Shipping';
      })) {
        TotalShipping = orderForm.totalizers.find(function (item) {
          return item.id === 'Shipping';
        }).value;
      }
      if (orderForm.orderFormId && this.userSaGuid && this.userAcceptedRewards) {
        var data = _objectSpread(_objectSpread({}, _payloadRequest.PAYLOAD_REWARDS_DEFAULT), {}, {
          Id: orderForm.orderFormId,
          SAGuid: this.userSaGuid,
          CountryDescription: 'BR'
        });
        $.ajax({
          url: "".concat((0, _rootPath.rootPath)(), "/rewards/points/search"),
          type: 'POST',
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json',
          success: function success(res) {
            _this4.totalPointsUser = res.PointBalance;
            _this4.totalCurrencyUser = res.ExchangedAmount;
            _this4.pricePerPoint = res.ExchangedAmount / res.PointBalance;
            _this4.chosenDiscount = Math.min(Math.max(res.ExchangedAmount, 0), (orderForm.value - TotalShipping) / 100 / 2);
            _this4.createGroupCalcRewards();
            if (_this4.totalPointsUser > 0) {
              $('#show-rewards-parent').css('display', 'block');
            }
          },
          error: function error() {
            console.error('points search error');
          }
        });
      }
    }
  }, {
    key: "setRewardsDiscount",
    value: function setRewardsDiscount() {
      var element = document.querySelector('.gift-card-provider-group-ssg_rewards .input-prepend input');
      var evt = new KeyboardEvent('keydown', {
        key: 'a'
      });
      element.value = this.chosenDiscount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      element.focus();
      element.dispatchEvent(evt);
      $('#show-rewards-parent').addClass('disabled');
    }
  }, {
    key: "cancelRewardsDiscount",
    value: function cancelRewardsDiscount() {
      var verify = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (window.vtexjs.checkout.orderForm.paymentData.giftCards) {
        var rewardsDiscount = window.vtexjs.checkout.orderForm.paymentData.giftCards.filter(function (g) {
          return g.provider === 'SSG_REWARDS';
        });
        if (!rewardsDiscount) return;
        if (!rewardsDiscount[0]) return;
        if (rewardsDiscount[0].value === 0) return;
      }
      var element = document.querySelector('.gift-card-provider-group-ssg_rewards .action a');
      var TotalShipping = 0;
      if (window.vtexjs.checkout.orderForm.totalizers.find(function (item) {
        return item.id === 'Shipping';
      })) {
        TotalShipping = window.vtexjs.checkout.orderForm.totalizers.find(function (item) {
          return item.id === 'Shipping';
        }).value;
      }
      if (!verify) {
        if ($('.switch-rewards input').length > 0) {
          $('.switch-rewards input')[0].checked = false;
        }
        if ($('.gift-card-provider-group-ssg_rewards .action a').length) {
          element.click();
        }
        return;
      }
      var rewardsOrder = window.vtexjs.checkout.orderForm.paymentData.giftCards[0].value;
      var totalOrder = window.vtexjs.checkout.orderForm.value;

      // verify if value of rewards is more than 50% of order's total
      if (verify && (totalOrder - TotalShipping) / 2 < rewardsOrder) {
        if ($('.switch-rewards input').length > 0) {
          $('.switch-rewards input')[0].checked = false;
        }
        if ($('.gift-card-provider-group-ssg_rewards .action a').length) {
          element.click();
        }
      }
    }
  }, {
    key: "showPointsSimulation",
    value: function showPointsSimulation() {
      var _this5 = this;
      var orderForm = window.vtexjs.checkout.orderForm;
      if (orderForm.loggedIn) {
        this.getRewardsData(orderForm.clientProfileData.email);
      }
      if (window.location.hash !== '#/payment') return;
      if (orderForm.items.length === 0) return;
      if (orderForm.totalizers.length === 0) return;
      var rewardsDiscountApplied = 0;
      if (orderForm.paymentData.giftCards) {
        var giftRewards = orderForm.paymentData.giftCards.filter(function (g) {
          return g.provider === 'SSG_REWARDS';
        });
        if (giftRewards.length && giftRewards[0].inUse && giftRewards[0].value > 0) {
          rewardsDiscountApplied = giftRewards[0].value / 100;
          this.createRewardsTotalDiscount(giftRewards[0].value / 100);
        } else {
          $('.rewards-total-discount').remove();
        }
      } else {
        $('.rewards-total-discount').remove();
      }
      if ($('.switch-rewards input').length > 0) {
        $('.switch-rewards input').prop('disabled', false);
      }
      var TotalItems = orderForm.totalizers.find(function (item) {
        return item.id === 'Items';
      }).value / 100;
      var TotalDisc = 0;
      if (orderForm.totalizers.find(function (item) {
        return item.id === 'Discounts';
      })) {
        TotalDisc = orderForm.totalizers.find(function (item) {
          return item.id === 'Discounts';
        }).value / 100;
      }
      var ProductItems = [];
      orderForm.items.map(function (item) {
        var MultProporcional = item.sellingPrice / 100 * item.quantity / (TotalItems + TotalDisc);
        var TotalRewardsDiscountCurrentItem = 0;
        if (rewardsDiscountApplied > 0) {
          TotalRewardsDiscountCurrentItem = MultProporcional * rewardsDiscountApplied;
        }
        ProductItems.push({
          ObjectType: 'ESTORE_BR',
          ObjectId: item.refId,
          Amount: (Math.round(item.sellingPrice * item.quantity) / 100 - TotalRewardsDiscountCurrentItem).toString(),
          Quantity: item.quantity.toString()
        });
        return '';
      });
      var data = {
        Id: orderForm.orderFormId,
        Timestamp: new Date().toISOString().split('Z')[0],
        ContactIdOrigin: 'ESTORE',
        SAGuid: this.userSaGuid || 'GUEST',
        CountryDescription: 'BR',
        ProductItems: ProductItems
      };
      $.ajax({
        url: "".concat((0, _rootPath.rootPath)(), "/rewards/points/simulation"),
        type: 'POST',
        cache: false,
        data: JSON.stringify(data),
        success: function success(res) {
          if (_this5.totalPointsCurrentOrder === res.TotalPointAmount) return;
          var saGuid = localStorage.getItem('saGuid');
          if (!saGuid) return;
          _this5.totalPointsCurrentOrder = res.TotalPointAmount;
          _this5.putRewardsOnCustomData(orderForm.orderFormId, res.TotalPointAmount);
          _this5.createElementTotalPoints(res.TotalPointAmount);
        },
        error: function error(err) {
          return function () {
            console.error('points simulation error', err);
          };
        }
      });
    }
  }]);
  return Rewards;
}();
exports.default = Rewards;
},{"@babel/runtime/helpers/esm/defineProperty":"../node_modules/@babel/runtime/helpers/esm/defineProperty.js","@babel/runtime/helpers/esm/classCallCheck":"../node_modules/@babel/runtime/helpers/esm/classCallCheck.js","@babel/runtime/helpers/esm/createClass":"../node_modules/@babel/runtime/helpers/esm/createClass.js","./_layout":"components/rewards/_layout.js","../utils/_rootPath":"components/utils/_rootPath.js","./constants/_payloadRequest":"components/rewards/constants/_payloadRequest.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
//# sourceMappingURL=/_rewards.js.map