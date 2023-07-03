/* eslint-disable radix */
/* eslint-disable padding-line-between-statements */
/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
/* eslint-disable max-params */

import { _isSCPlus } from './utils/adobe/getIsSCPlus'
import { getPaymentMethod } from './utils/adobe/paymentMethod'
import { SITE_CODE_STRING } from './utils/adobe/siteCodeString'


export function adobeLaunchInit() {
  const settingsAdobe = new AdobeLaunchPixel()

  settingsAdobe.init()
}

class AdobeLaunchPixel {
  constructor() {
    /* List of pages where the DTM transformation is enabled */
    this.dtmWatchPages = { checkout: 'main-header' }

    /* ATTENTION: THOSE FILES ARE RELATED TO STAGING ENVIRONMENT OF ADOBE DTM, EACH ONE OF THESE ARE RELATED TO ONE SPECIFIC COUNTRY/REGION */
    this.scriptFiles = {
      br:
        '//assets.adobedtm.com/72afb75f5516/901a9e1a98ec/launch-a82080575b1a.min.js',
      br_staging:
        '//assets.adobedtm.com/72afb75f5516/901a9e1a98ec/launch-c78d04fd7f6b-staging.min.js'
    }

    this.version2 = ['br']
    this.countryCodes = ['br']
    this.pageType = false
    this.observer = null
    this.pageInterval = null
    this.codesCache = []
    this.productsOrdered = ''
    this.pagesWithMutation = ['checkout']
    this.cacheKey = 'ssgDtmCache'
  }

  /* This part injects the jQuery (it's needed to adobe DTM), the window.digitalData variable (globally) */
  init() {
    const _this = this

    _this.loadCache()

    const dataLayerScript = document.createElement('script')

    dataLayerScript.type = 'text/javascript'
    dataLayerScript.innerText = SITE_CODE_STRING
    document.head.appendChild(dataLayerScript)

    _this.getPageType()
    _this._populateProductLayer()

    const adobeDtmScript = document.createElement('script')

    adobeDtmScript.type = 'text/javascript'

    let scriptIndex = _this._fetchSiteCode()
    const siteCode = _this._fetchSiteCode()

    if (!_this._isProduction()) scriptIndex += '_staging'

    const rand = Math.floor(Math.random() * 1000)

    adobeDtmScript.src = `${_this.scriptFiles[scriptIndex]}?v=${rand}`

    if (_this.version2.indexOf(siteCode) > -1) {
      adobeDtmScript.setAttribute('async', '')
    }

    document.head.appendChild(adobeDtmScript)

    adobeDtmScript.onload = function () {
      _this.waitForDataSend()
      const satelliteInterval = setInterval(function () {
        if (document.body) {
          if (document.getElementById('satelliteAA')) {
            clearInterval(satelliteInterval)

            return
          }

          if (_this.version2.indexOf(siteCode) === -1) {
            const satelliteEnd = document.createElement('script')

            satelliteEnd.id = 'satelliteAA'
            satelliteEnd.innerText = 'try{_satellite.pageBottom();}catch(e){}'
            satelliteEnd.type = 'text/javascript'
            document.body.appendChild(satelliteEnd)
          }
        }
      }, 100)

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
      _this._populateDataLayer()

      _this._trackLogin()

      _this._addProductToDigitalDataV2()

      _this._pageTrack()
    }
  }

  setup() {
    const _this = this

    /* This is to avoid the injection of the script of DTM to the iframe page inside the cart page */
    if (window.location.href.indexOf('upselling') > -1) return

    /* If the page type is in the array list of DTM watched pages, don't proceed to do nothing */
    if (_this.pageType === false) return

    window.onhashchange = function () {
      _this._populateDataLayer()
      _this.waitForDataSend()
      _this._trackLogin()
      _this._pageTrack()
      if (window.location.hash === '#/cart') {
        _this._pageTrackCart()
      }
    }

    if (_this.observer === null) {
      if (_this.pagesWithMutation.indexOf(_this.pageType) === -1) {
        _this._populateProductLayer()
      } else {
        _this.observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (
              document.querySelector('.payment-unauthorized-modal') !== null &&
              document.querySelector('.payment-unauthorized-modal').style
                .display === 'block'
            ) {
              _this.pageType = 'order_failure'

              return
            }

            if (mutation.target.className === 'render-provider') {
              const newPageType = _this.getPageType()

              if (newPageType !== _this.pageType) {
                _this.pageType = false
                _this.setup()

                return
              }
            }

            const addedNodesCount = mutation.addedNodes.length

            if (addedNodesCount > 0) {
              for (let i = 0; i < addedNodesCount; i++) {
                const node = mutation.addedNodes[i]

                if (!(node instanceof HTMLElement)) return
                _this.inspectElement(node)
              }
            }

            if (_this.pageType === 'checkout') {
              $('.item-link-remove.data-omni-remove').on('click', function (
                event
              ) {
                const { target } = event
                const dataOmni = target.getAttribute('data-omni-variant')

                if (dataOmni) {
                  _this._removeFromDigitalData(dataOmni)
                } else {
                  _this._removeFromDigitalData(
                    target.parentElement.getAttribute('data-omni-variant')
                  )
                }
              })
            }
          })
        })

        _this.observer.observe(document.querySelector('html'), {
          childList: true,
          subtree: true,
        })
      }
    }
  }

  _removeFromDigitalData(dataOmniVariant) {
    const product = {
      modelVariant: window.digitalData.product.modelVariant.split(','),
      model_name: window.digitalData.product.model_name.split(','),
      displayName: window.digitalData.product.displayName.split(';'),
      productDivision: window.digitalData.product.productDivision.split(','),
      productFamily: window.digitalData.product.productFamily.split(','),
      pimSubType: window.digitalData.product.pimSubType.split(','),
      listPrice: window.digitalData.product.listPrice.split(','),
    }

    const productIndex = product.modelVariant.indexOf(dataOmniVariant)

    Object.keys(product).forEach(function (key) {
      let join = ','

      if (key === 'displayName') {
        join = ';'
      }

      product[key] = product[key]
        .filter(function (_, index) {
          return index !== productIndex
        })
        .join(join)
    })

    window.digitalData.product = product
  }

  /* Fetches the page type based on the class name */
  getPageType() {
    const _this = this

    if (_this.pageInterval !== null) return

    _this.pageInterval = setInterval(function () {
      if (document.body) {
        const rootDivs = document.querySelectorAll('body > div, body > header')

        for (let i = 0; i < rootDivs.length; i++) {
          Object.keys(_this.dtmWatchPages).forEach(function (page) {
            const pageClass = _this.dtmWatchPages[page]
            const classes = rootDivs[i].classList

            classes.forEach(function (item) {
              if (page === 'custom' && item.indexOf(pageClass) > -1) {
                _this.pageType = 'custom'

                return
              }

              if (item === pageClass) {
                _this.pageType = page
                if (
                  _this.pageType === 'department' ||
                  _this.pageType === 'subcategory'
                ) {
                  _this.pageType = 'category'
                }
              }
            })
          })
          if (_this.pageType !== false) {
            clearInterval(_this.pageInterval)
            _this.setup()
            break
          }
        }
      }
    }, 500)
  }

  /* Helper function to set the data omni attriutes */
  async setElementOmni(
    elem,
    className,
    attrs,
    fetchDataBy = null,
    callback = null
  ) {
    const _this = this

    if (elem === null) return

    elem.classList.add(className)
    if (fetchDataBy !== null) {
      const cachedInfo = _this._findCachedInfo(
        fetchDataBy.type,
        fetchDataBy.value,
        false
      )

      let modelName = ''
      let modelCode = ''

      if (cachedInfo) {
        if (!Array.isArray(cachedInfo)) {
          modelCode = cachedInfo.modelCode.toUpperCase()
          modelName = cachedInfo.modelName
        }

        if ('bundle' in cachedInfo) {
          modelName = ''
          if (cachedInfo.bundle === true) {
            const products = cachedInfo.modelCode.split('_')
            const models = []

            for (let i = 0; i < products.length; i++) {
              const p = _this._findCachedInfo('modelCode', products[i])

              if (p !== undefined) models.push(p.modelName)
            }

            if (models.length) modelName = `;${models.join('_').toLowerCase()}`
          }
        }

        elem.setAttribute('data-omni-variant', modelCode)
        elem.setAttribute('data-omni-base', `;${modelName}`)
        if (callback) callback()
      } else {
        await _this._fetchData(
          elem,
          fetchDataBy.type,
          fetchDataBy.value,
          callback
        )
      }
    }

    if (attrs !== null) {
      Object.keys(attrs).forEach(function (attr) {
        let attrName = 'data-omni'
        const value = attrs[attr]
        if (attr !== '') attrName += `-${attr}`
        elem.setAttribute(attrName, value)
      })
    }
  }

  /* Finds the product code/name in the codesCache variable to avoid unecessary API requests */
  _findCachedInfo(type, value, breakSku = true) {
    const _this = this

    let result = null

    if (_this.codesCache === null || _this.codesCache.length === 0) return false

    if (type === 'ean') type = 'modelCode'
    if (type === 'url') type = 'productUrl'
    if (type === 'url') {
      type = 'productUrl'
      if (!value.endsWith('/p')) {
        value += '/p'
      }
    }

    try {
      if (type === 'name') {
        return _this.codesCache.find(function (obj) {
          return obj[type] === value
        })
      }

      result = _this.codesCache.find(function (obj) {
        return obj[type] === value
      })
      if (!result) return
      if (breakSku === true && 'bundle' in result && result.bundle) {
        const products = result.modelCode.split('_')
        const results = []

        for (let i = 0; i < products.length; i++) {
          const r = _this._findCachedInfo(
            'modelCode',
            products[i],
            true,
            products[i]
          )

          if (r === undefined) {
            results.push(result)
          }

          results.push(r)
        }

        return results
      }

      return result
    } catch (err) {
      // console.error("[SAMSUNG AA DTM] Codes cache are corrupted:\n", typeof _this.codesCache, "\n", err);
      if (typeof _this.codesCache === 'string') {
        _this.codesCache = JSON.parse(_this.codesCache)
      }
      // return _this._findCachedInfo(type, value, breakSku);
    }
  }

  /* Just the API call used for other pourpuses */
  async _fetchData(node, fetchDataBy, value, callback = null) {
    const _this = this

    if (node === null) return
    if (
      node.hasAttribute('data-loaded') ||
      (node.hasAttribute('data-omni-variant') &&
        node.hasAttribute('data-omni-base'))
    ) {
      return
    }

    node.setAttribute('data-loaded', true)

    const targetUrl =
      'https://ssg-checkout.linkapi.com.br/v1/product?apiKey=78ca5fdbcadb437083408712375af24c'

    const data = {}

    data.type = fetchDataBy
    data.searchValue = value
    data.country = _this._fetchSiteCode()
    let displayName = ''
    let prodUrl = ''

    if (fetchDataBy === 'name') {
      displayName = value
    }

    if (fetchDataBy === 'url') {
      prodUrl = value
    }

    if (
      (data.type !== '' || data.searchValue !== '') &&
      _this.codesCache !== -1
    ) {
      const xhttp = new XMLHttpRequest()

      xhttp.addEventListener('load', function () {
        _this._callbackFetch(this, node, callback, displayName, prodUrl)
      })
      xhttp.open('POST', targetUrl, true)
      xhttp.setRequestHeader('Content-Type', 'application/json')
      // xhttp.send(JSON.stringify(data));
    }
  }

  /* The call back of the fetch and also call the custom callback passed as parameter */
  _callbackFetch(ajax, node, callback = null) {
    if (ajax.readyState === 4 && ajax.status === 200) {
      const resp = JSON.parse(ajax.response)

      if (resp.modelCode === undefined && resp.modelName === undefined) return

      node.setAttribute('data-omni-variant', resp.modelCode.toUpperCase())
      node.setAttribute('data-omni-base', `;${resp.modelName}`)

      if (callback) callback()
    }
  }

  /* Get the page type and call one of the methods designated to each part of the site */
  inspectElement(node) {
    const _this = this

    if (node === undefined || node.className === undefined) return

    const classes =
      typeof node.className !== 'string' ? '' : node.className.split(' ')

    if (_this.pageType === 'checkout') {
      _this.cart(classes, node)
    }

    _this._populateProductLayer()
  }

  /* Cart Page */
  cart(classes, node) {
    const _this = this

    _this._populateProductLayer()

    if (node.className.indexOf('product-item') > -1) {
      if (window.location.hash === '#/cart') {
        if (node.querySelector('td.product-name a') !== null) {
          const addItemButton = node.querySelector(
            'td.quantity a.item-quantity-change.item-quantity-change-increment'
          )
          const skuId = node.getAttribute('data-sku')
          if (addItemButton && skuId) {
            _this.setElementOmni(addItemButton, 'data-omni-buynow', {
              base: _this._mountDataBuyNow('base', skuId),
              variant: _this._mountDataBuyNow('variant', skuId),
            })
            $(
              `.product-item[data-sku="${skuId}"] #item-quantity-change-increment-${skuId}`
            ).on('click', function () {
              _this._populateDataLayer()
              _this.waitForDataSend()
              _this._pageTrack()
            })
          }
        }
      }

      const removeItemButton = node.querySelector('.item-link-remove')

      if (node.querySelector('td.product-name a') !== null) {
        _this.setElementOmni(removeItemButton, 'data-omni-remove', null, {
          type: 'url',
          value: _this._getLocation(
            node.querySelector('td.product-name a').href
          ),
        })
      }
    }

    const proceedCheckoutBtn = document.querySelector('#cart-to-orderform')

    if (proceedCheckoutBtn !== null) {
      _this.setElementOmni(proceedCheckoutBtn, 'data-omni-proceedtocheckout', {
        '': 'cart:proceed to checkout',
        base: window.digitalData.product.model_name,
        variant: window.digitalData.product.modelVariant,
      })
    }

    const backtocart = document.querySelector('#orderform-to-cart')

    if (backtocart !== null) {
      _this.setElementOmni(backtocart, 'data-omni-backtocart', {
        '': 'checkout:back to cart',
      })
    }

    const backtocart2 = document.querySelector('#go-to-cart-button-custom')

    if (backtocart2 !== null) {
      if (backtocart2.querySelector('#orderform-minicart-to-cart') !== null) {
        _this.setElementOmni(
          backtocart2.querySelector('#orderform-minicart-to-cart'),
          'data-omni-backtocart',
          {
            '': 'checkout:back to cart',
          }
        )
      }
    }

    const backToStore = document.querySelector('.checkout-header-back')

    if (backToStore !== null) {
      if (document.querySelector('.cart-active') === null) {
        _this.setElementOmni(
          backToStore.querySelector('a'),
          'data-omni-backtoshop',
          {
            '': 'checkout:continue shopping',
          }
        )
      } else {
        _this.setElementOmni(
          backToStore.querySelector('a'),
          'data-omni-backtoshop',
          {
            '': 'cart:continue shopping',
          }
        )
      }
    }

    const buyMoreProducts = document.querySelector('.choice-new-products a')

    if (buyMoreProducts !== null) {
      _this.setElementOmni(buyMoreProducts, 'data-omni-backtoshop', {
        '': 'cart:continue shopping',
      })
    }

    const proceedShipping = document.querySelector('#go-to-shipping')

    if (proceedShipping !== null) {
      _this.setElementOmni(proceedShipping, 'data-omni-continue', {
        '': 'checkout:order detail:next step',
      })
    }

    const proceedPayment = document.querySelector('#btn-go-to-payment')

    if (proceedPayment !== null) {
      _this.setElementOmni(proceedPayment, 'data-omni-continue', {
        '': 'checkout:delivery:next step',
      })
    }

    if (node.className.indexOf('hproduct') > -1) {
      if (node.querySelector('.url') !== undefined) {
        _this.setElementOmni(node, 'data-placeholder', null, {
          type: 'url',
          value: _this._getLocation(node.querySelector('.url').href),
        })
      }
    }

    let endCheckout = document.querySelectorAll('#payment-data-submit')

    if (endCheckout.length > 0) {
      endCheckout = endCheckout[1]

      if (document.querySelector('.payment-group-item') !== null) {
        const { paymentMethod } = getPaymentMethod()

        _this.setElementOmni(endCheckout, 'data-omni-checkout', {
          base: window.digitalData.product.model_name,
          variant: window.digitalData.product.modelVariant,
          '': `checkout:${paymentMethod}`,
        })
      }
    }

    const checkoutLoginForm = document.querySelector('.client-pre-email')
    const checkoutLogin = document.querySelector('#btn-client-pre-email')

    if (checkoutLogin !== null && checkoutLoginForm !== null) {
      _this.setElementOmni(checkoutLogin, 'data-omni-signin', {
        '': 'account:submit',
      })
      checkoutLoginForm.onsubmit = function (e) {
        e.preventDefault()
        let parameter = 'account:submit'

        if (!checkoutLoginForm.checkValidity()) parameter = 'account:submit'
        _this.setElementOmni(checkoutLogin, 'data-omni-signin', {
          '': parameter,
        })
      }
    }
  }

  /* This function triggers the Adobe Analytics window.digitalData server call */
  waitForDataSend() {
    const _this = this

    let intervalWait = setInterval(function () {
      if (!_this.pageType || window.digitalData.page.pageInfo.siteCode === '') {
        return
      }

      const { product } = window.digitalData

      if (!_this._checkProperties(product)) {
        const pageURL = _this._removeAccents(window.location.href)

        window.digitalData.page.pageInfo.pageURL = pageURL
        clearInterval(intervalWait)
        intervalWait = null
      }
    }, 50)
  }

  /* Populates the window.digitalData variable Page informations */
  _populateDataLayer() {
    if (window._satellite === undefined || window._satellite === null) {
      return null
    }

    const _this = this

    const siteCode = _this._fetchSiteCode()

    window.digitalData.page.pageInfo.siteCode = siteCode
    window.digitalData.page.pageInfo.siteSection = 'shop'
    const pathName = window.location.pathname.replace(`/${siteCode}`, '')

    if (_this.countryCodes.indexOf(pathName[0]) > -1) pathName.shift(0)
    window.digitalData.page.pageInfo.pageName = ' '
    window.digitalData.page.pageInfo.pageName = _this
      ._removeAccents(
        (
          window.digitalData.page.pageInfo.siteSection +
          pathName.replace(/\//gi, ':') +
          window.location.hash.replace(/\//gi, ':').trim(':')
        ).replace(/:$/gi, '')
      )
      .replace('#', '')

    if (document.body) {
      const rootDivs = document.querySelectorAll('body > div')

      for (let i = 0; i < rootDivs.length; i++) {
        Object.keys(_this.dtmWatchPages).forEach(function (page) {
          const pageClass = _this.dtmWatchPages[page]
          const classes = rootDivs[i].classList

          classes.forEach(function (item) {
            if (item === pageClass) {
              _this.pageType = page
            }
          })
        })
        if (_this.pageType !== false) break
      }
    }

    switch (_this.pageType) {
      case 'checkout':
        window.digitalData.page.pageInfo.pageTrack = 'shop checkout'
        if (window.location.hash === '#/cart') {
          window.digitalData.page.pageInfo.pageTrack = 'shop cart'
        }

        break

      case 'order_failure':
        window.digitalData.page.pageInfo.pageTrack = 'shop order failure'
        break

      case 'help':
        window.digitalData.page.pageInfo.pageTrack = 'shop help'
        break

      case 'error':
        window.digitalData.page.pageInfo.pageTrack = 'shop error'
        break

      default:
        break
    }

    let { pathname } = window.location

    pathname = _this._removeAccents(pathname).replace('/', '')
    const hashname = window.location.hash
      .replace('#/', '')
      .split('/')
      .filter(function (el) {
        return el !== ''
      })

    let pathnameArr = pathname
      .split('/')
      .filter(function (el) {
        return el !== ''
      })
      .concat(hashname)

    if (_this.countryCodes.indexOf(pathnameArr[0]) > -1) pathnameArr.shift()
    pathnameArr = pathnameArr.filter(function (value) {
      return value.trim() !== ''
    })
    for (let p = 0; p <= 3; p++) {
      const depthIndex = p + 2

      window.digitalData.page.pathIndicator[`depth_${depthIndex}`] =
        pathnameArr[p] === undefined
          ? ''
          : (window.digitalData.page.pathIndicator[`depth_${depthIndex}`] =
            pathnameArr[p])
    }
  }

  /* Gahters all the products informations inside the page to populate the product property */
  _populateProductLayer() {
    const _this = this
    const pagesWithProductLayer = ['checkout']
    if (pagesWithProductLayer.indexOf(_this.pageType) === -1) {
      window.digitalData.product.modelVariant = ''
      window.digitalData.product.model_name = ''
      window.digitalData.product.displayName = ''
      window.digitalData.product.productDivision = ''
      window.digitalData.product.productFamily = ''
      window.digitalData.product.pimSubType = ''
      window.digitalData.product.listPrice = ''

      return
    }

    if (!_this._checkProperties(window.digitalData.product)) return
    let searchType = 'ean'

    if (_this.pageType === 'checkout' || _this.pageType === 'cart') {
      if (
        typeof window.vtexjs !== 'undefined' &&
        typeof _this.codesCache !== 'undefined' &&
        window.vtexjs.checkout.orderForm !== undefined &&
        window.vtexjs.checkout.orderForm.items.length > 0
      ) {
        const { items } = window.vtexjs.checkout.orderForm

        if (typeof _this.codesCache === 'string') {
          _this.codesCache = JSON.parse(_this.codesCache)
        }

        const digitsDecimalPoint =
          window.vtexjs.checkout.orderForm.storePreferencesData
            .currencyFormatInfo.currencyDecimalDigits

        try {
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (_this.codesCache !== -1) {
              const index = _this.codesCache.findIndex(function (obj) {
                return item.refId === obj.modelCode
              })

              if (_this.codesCache[index]) {
                if (digitsDecimalPoint > 0) {
                  _this.codesCache[index].price = (
                    item.sellingPrice /
                    10 ** digitsDecimalPoint
                  ).toFixed(digitsDecimalPoint)
                } else {
                  _this.codesCache[index].price = item.sellingPrice
                }
              }
            }
          }
        } catch (e) {
          console.error(`_populateProductLayer: ${e}`)
        }

        const data = {}
        if (_this.codesCache !== -1) {
          _this.codesCache.lastUpdate = new Date()
          data[this._fetchSiteCode()] = _this.codesCache
          localStorage.setItem(_this.cacheKey, JSON.stringify(data))
        }
      }

      const productItems = document.querySelectorAll('tr.product-item')

      productItems.forEach(function (productItem) {
        if (productItem !== null) {
          if (
            productItem.getAttribute('data-loading') !== null &&
            productItem.querySelector('.total-selling-price') !== null
          ) {
            return
          }

          const productPriceNode = productItem.querySelector(
            '.total-selling-price'
          )

          if (productPriceNode === null) return

          let productPrice = productPriceNode.innerText

          productPrice = productPrice.replace(/[^\d]/g, '').trim()

          productItem.setAttribute('data-loading', true)
          searchType = 'sku'
          const productSKU = productItem.dataset.sku
          const cachedData = _this._findCachedInfo(
            searchType,
            productSKU,
            false
          )

          let apiData = {}

          if (cachedData) {
            apiData = cachedData
            apiData.listPrice = productPrice
          } else if (_this.codesCache === -1) {
            const xhttp = new XMLHttpRequest()
            const targetUrl =
              'https://ssg-checkout.linkapi.com.br/v1/product?apiKey=78ca5fdbcadb437083408712375af24c'

            const data = {}

            data.type = searchType
            data.searchValue = productSKU
            data.country = _this._fetchSiteCode()
            if (data.type === '' || data.searchValue === '') return
            if (productSKU === null) return

            xhttp.open('POST', targetUrl, true)
            xhttp.onreadystatechange = function () {
              if (this.readyState === 4 && this.status === 200) {
                apiData = JSON.parse(this.response)
                apiData.listPrice = productPrice
                  .replace(/\./g, '')
                  .replace(',', '')
                  .trim()
              }
            }

            xhttp.setRequestHeader('Content-Type', 'application/json')
            // xhttp.send(JSON.stringify(data));
          }
        }
      })
    }
  }

  _addProductToDigitalDataV2() {
    const _this = this

    const _modelName = []
    const _displayName = []
    const _modelVariant = []
    const _productDivision = []
    const _productFamily = []
    const _pimSubType = []
    const _listPrice = []
    const itemsQuantity = []

    const idInterval = setInterval(function () {
      try {
        if (
          window.vtexjs &&
          window.vtexjs.hasOwnProperty('checkout') &&
          window.vtexjs.checkout.hasOwnProperty('orderForm') &&
          window.vtexjs.checkout.orderForm.hasOwnProperty('items')
        ) {
          clearInterval(idInterval)

          const { items } = window.vtexjs.checkout.orderForm
          const customData =
            window.vtexjs.checkout.orderForm.customData || false
          const tradeInCustomData =
            customData &&
            customData.customApps.find(itemTrade => itemTrade.id === 'domain')

          const transportCustomData =
            tradeInCustomData &&
            tradeInCustomData.fields.trade_in_option_selected
          items.forEach(async item => {
            if (transportCustomData && _modelName.indexOf(';trade-in') < 0) {
              const tradeIn = _this._getTradeInData(item)

              _modelName.push(`;${tradeIn.model_name}`)
              _displayName.push(tradeIn.displayName)
              _modelVariant.push(tradeIn.modelVariant)
              _productDivision.push(tradeIn.productDivision)
              _productFamily.push(tradeIn.productFamily)
              _pimSubType.push(tradeIn.pimSubType)
              _listPrice.push(tradeIn.listPrice)
              itemsQuantity.push(1)
            }

            if (_isSCPlus(item)) {
              const scplus = _this._getMobileCareData(item)

              _modelName.push(`;${scplus.model_name}`)
              _displayName.push(scplus.displayName)
              _modelVariant.push(scplus.modelVariant)
              _productDivision.push(scplus.productDivision)
              _productFamily.push(scplus.productFamily)
              _pimSubType.push(scplus.pimSubType)

              if (
                window.__RUNTIME__.account === 'samsungbr' ||
                window.__RUNTIME__.account === 'samsungbrshop'
              ) {
                _listPrice.push(Number(scplus.listPrice).toFixed(2))
              } else {
                _listPrice.push(Number(scplus.listPrice))
              }
              itemsQuantity.push(1)
            } else {
              const model = await _this._getModel(item)
              _modelName.push(`;${model.modelName}`)
              _displayName.push(item.name ? item.name : '')
              _modelVariant.push(item.refId)
              _productDivision.push(
                model.productDivision !== undefined ? model.productDivision : ''
              )
              _productFamily.push(
                model.productFamily !== undefined ? model.productFamily : ''
              )
              _pimSubType.push(
                model.pimSubType !== undefined ? model.pimSubType : ''
              )

              if (
                window.__RUNTIME__.account.indexOf('samsungbr') > -1 ||
                window.__RUNTIME__.account.indexOf('samsungbrshop') > -1 ||
                window.__RUNTIME__.account.indexOf('samsungmx') > -1
              ) {
                _listPrice.push(Number(item.price / 100).toFixed(2))
              } else {
                _listPrice.push(Number(item.price))
              }
              itemsQuantity.push(1)
            }

            window.digitalData.product = {
              model_name: _modelName.join(','),
              modelVariant: _modelVariant.join(','),
              displayName: _displayName.join(','),
              productDivision: _productDivision.join(','),
              productFamily: _productFamily.join(','),
              pimSubType: _pimSubType.join(','),
              listPrice: _listPrice.join(','),
            }
            if (items.length === itemsQuantity.length && window.location.hash === '#/cart') {
              _this._pageTrackCart()
            }
          })
        }
      } catch (e) {
        console.error(e)
      }
    }, 100)
  }

  /* helper to check if a object is empty or not */
  _checkProperties(obj) {
    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== '') return false
    }

    return true
  }

  /* helper to remove accentuation (pretty obivous) */
  _removeAccents(str) {
    if (str.indexOf('%') > -1) str = decodeURI(str)
    const accents =
      'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž'

    const accentsOut =
      'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz'

    str = str.split('')
    const strLen = str.length
    let i
    let x

    for (i = 0; i < strLen; i++) {
      if ((x = accents.indexOf(str[i])) !== -1) {
        str[i] = accentsOut[x]
      }
    }

    return str.join('')
  }

  /* Populate the site code according to the URL or first depth of the path */
  _fetchSiteCode() {
    const _this = this

    const hostArr = window.location.host.split('.')

    if (hostArr[0].includes('samsungbrtest')) return 'br'
    const tldCode = hostArr[hostArr.length - 1]

    if (_this.countryCodes.indexOf(tldCode) > -1) return tldCode

    const pathNameArr = window.location.pathname.replace('/', '').split('/')

    if (_this.countryCodes.indexOf(pathNameArr[0]) > -1) return pathNameArr[0]

    /* If the country code is not in query param or domain, then get the subdomain last two chars: samsungXX */
    return hostArr[0].substr(-2)
  }

  _isProduction() {
    const productionSites = ['shop.samsung.com/br', 'shop.samsung.com.br']

    for (let i = 0; i < productionSites.length; i++) {
      if (window.location.href.indexOf(productionSites[i]) > -1) {
        return true
      }
    }

    return false
  }

  _getLocation(href) {
    const l = document.createElement('a')

    l.href = href

    return l.pathname
  }

  loadCache() {
    const _this = this

    const apiKey = '78ca5fdbcadb437083408712375af24c'

    const country = _this._fetchSiteCode()

    let cache = null

    try {
      if (localStorage) {
        cache = localStorage.getItem(_this.cacheKey)
        if (typeof cache === 'string') {
          cache = JSON.parse(cache)
        }
      }
    } catch (err) {
      console.error(
        '[SAMSUNG AA DTM] Error during the read of the localStorage data',
        err
      )
      cache = null
    } finally {
      const HALF_HOUR = (60 * 60 * 1000) / 2

      if (
        cache === null ||
        typeof cache !== 'object' ||
        !(country in cache) ||
        !('lastUpdate' in cache) ||
        new Date() - new Date(cache.lastUpdate) >= HALF_HOUR
      ) {
        let body = {}
        const skuIds = window.vtexjs.checkout.orderForm.items.map(item => {
          return Number(item.id)
        })

        if (skuIds.length > 0) {
          body = {
            skuIds,
          }
        } else {
          body = {}
        }

        const xhttp = new XMLHttpRequest()
        const targetUrl = `https://ssg-checkout.linkapi.com.br/v1/products?apiKey=${apiKey}`

        xhttp.open('POST', targetUrl, true)
        _this.codesCache = -1
        xhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            const newCache = {}

            newCache[country] = this.response
            newCache.lastUpdate = new Date()
            if (localStorage) {
              localStorage.setItem(_this.cacheKey, JSON.stringify(newCache))
            }

            _this.codesCache = this.response
          } else {
            _this.codesCache = []
          }
        }

        xhttp.setRequestHeader('Content-Type', 'application/json')
        xhttp.send(JSON.stringify(body))
      }

      if (cache !== null && cache !== undefined) {
        _this.codesCache = cache[country]
      }
    }
  }

  _pageTrack() {
    try {
      if (
        window._satellite !== undefined &&
        window._satellite !== null &&
        'track' in window._satellite &&
        (window.location.hash === '#/email' ||
          window.location.hash === '#/shipping' ||
          window.location.hash === '#/payment' ||
          window.location.hash === '#/profile')
      ) {
        if (window.digitalData.product) {
          window._satellite.track('page_view')
        }
      }
    } catch (e) {
      console.error('[DTM]: Error window._satellite.track')
    }
  }
  _trackLogin() {
    const { orderForm } = window.vtexjs.checkout
    const customerLogged = orderForm.clientProfileData
    try {
      if (
        window._satellite !== undefined &&
        window._satellite !== null &&
        'track' in window._satellite
      ) {
        if (window.location.hash === '#/shipping' ||
          window.location.hash === '#/payment' ||
          window.location.hash === '#/profile') {
          window.digitalData.user.loginStatus = true
        } 
        if (window.location.hash === '#/cart' ||
          window.location.hash === '#/email') {
          if (customerLogged !== null) {
            window.digitalData.user.loginStatus = true
          } else {
            window.digitalData.user.loginStatus = false
          }
        }
      }
    } catch (e) {
      console.error('[DTM]: Error window._satellite.track')
    }
  }

  _pageTrackCart() {
    try {
      if (
        window._satellite !== undefined &&
        window._satellite !== null &&
        'track' in window._satellite) {
        if (window.digitalData.product) {
          setTimeout(() => { window._satellite.track('page_view') }, 1000)
        }
      }
    } catch (e) {
      console.error('[DTM]: Error window._satellite.track')
    }
  }

  _getTradeInData() {
    return {
      model_name: 'trade-in',
      modelVariant: 'trade-in',
      displayName: 'trade-in',
      listPrice: 0,
      unit: 0,
      productDivision: 'shop program',
      productFamily: 'trade-in',
      pimSubType: 'trade-in',
    }
  }

  _getMobileCareData(product) {
    return {
      model_name: 'samsung care',
      modelVariant: product.refId.toUpperCase(),
      displayName: product.name,
      listPrice: product.listPrice / 100,
      productDivision: 'shop program',
      productFamily: 'samsung care',
      pimSubType: 'insurance',
    }
  }

  _isTradeIn(item) {
    const filter = Object.values(item.productCategories)
      .map(el => el.toLowerCase())
      .filter(el => el.match('trade'))

    return filter.length > 0
  }

  _mountDataBuyNow(dataOmni, skuId) {
    const _this = this
    let data = ''
    const findItem = window.vtexjs.checkout.orderForm.items.find(function (
      item
    ) {
      return item.id === skuId
    })
    if (!findItem) return ''

    const findItemFinal = parseInt(findItem.id)

    try {
      const findItemCache = _this.codesCache.find(function (obj) {
        return obj.sku === findItemFinal
      })
      if (findItemCache) {
        // modelName
        if (dataOmni === 'base') {
          data =
            findItemCache.modelName !== ''
              ? findItemCache.modelName
              : findItem.productRefId
        }

        // modelCode
        if (dataOmni === 'variant') {
          data =
            findItemCache.modelCode !== ''
              ? findItemCache.modelCode
              : findItem.refId
        }
      } else {
        data = dataOmni === 'base' ? findItem.productRefId : findItem.refId
      }
    } catch (e) {
      console.error(`_mountDataBuyNow: ${e}`)
    }

    const value = dataOmni === 'base' ? `;${data}` : data

    return value
  }

  async _getModel(product) {
    const skuId = product.refId
    const account = window.__RUNTIME__.account
      .replace('samsung', '')
      .split('test')
      .shift()
    const accountBRShop = account.replace('shop', '')

    // const rootPath = window.__RUNTIME__.rootPath;
    let productDivision = ''
    let productFamily = ''
    let allCategories = ''
    let pimSubType = ''
    const currentPath = window.__RUNTIME__.rootPath
      ? window.__RUNTIME__.rootPath
      : ''

    const uri = `${currentPath}/pvt/getModel?siteCode=${accountBRShop}&modelCode=${skuId}`
    const myHeaders = new Headers({ 'Content-Type': 'application/json' })

    return fetch(uri, { method: 'GET', headers: myHeaders })
      .then(res => res.json())
      .then(response => {
        productDivision =
          response.more.resultData.Products.Product.BasicInfo[0].PviCategories
            .ProductTypeName
        productFamily =
          response.more.resultData.Products.Product.BasicInfo[0].PviCategories
            .ProductSubTypeName
        allCategories = response.more.resultData.Products.Product.BasicInfo[0].Categories.Category[0].CategoryEnglishNamePath.split(
          '|'
        )
        pimSubType = allCategories.length > 2 ? allCategories[2] : ''

        return {
          modelCode: response.ModelCode,
          modelName: response.ModelName,
          productDivision: productDivision || 'N/A',
          productFamily: productFamily || 'N/A',
          pimSubType: pimSubType || 'N/A',
        }
      })
      .catch(() => {
        const categories = Object.values(product.productCategories)

        return {
          modelCode: skuId || '',
          modelName: skuId || '',
          productDivision: categories[0] || 'N/A',
          productFamily: categories.length > 1 ? categories[1] : 'N/A',
          pimSubType: categories[categories.length - 1] || 'N/A',
        }
      })
  }
}
