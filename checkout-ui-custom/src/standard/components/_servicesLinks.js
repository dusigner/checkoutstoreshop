import { rootPath } from "./utils/_rootPath"

const CHECK_SERVICES = {
  ['samsungCare']: (refId, orderForm) => {
    return orderForm.items.some(item => {
      const { attachments } = item

      return attachments.some(attachment => {
        return attachment.content.refId === refId
      })
    })
  },
  ['installation']: function (refId, orderForm) {
    return orderForm.items.some(item => {
      const { attachments } = item

      return attachments.some(attachment => {
        return attachment.content.refId === refId
      })
    })
  },
  ['instantVoucher']: function (refId, orderForm) {
    const currentItem = orderForm.items.find(item => item.refId === refId)
    const { priceTags } = currentItem

    return priceTags.some(priceTag => {
      const { identifier } = priceTag
      const { ratesAndBenefitsData } = orderForm

      if (!ratesAndBenefitsData) {
        return false
      }

      const { rateAndBenefitsIdentifiers } = ratesAndBenefitsData

      const isInstantVoucherApplied = rateAndBenefitsIdentifiers.some(item => (
        item.id === identifier && item.name.toLowerCase().includes('instant')
      ))

      return isInstantVoucherApplied
    })
  },
  ['addon']: function (refId, orderForm) {
    return orderForm.items.some(item => {
      const { attachments } = item

      return attachments.some(attachment => {
        return attachment.content.refId === refId
      })
    })
  }
}

export class ServicesLinks {
  constructor() {
    this.serviceLinks = JSON.parse(localStorage.getItem('servicesLinks') || '[]')
  }

  _renderLink({ serviceId, skuId, linkText, linkUrl, showLink } = {}) {
    const $item = $(`tr.product-item[data-sku="${skuId}"]`)
    const alreadyRendered = $item.find(`#${serviceId}-${skuId}`).length

    if (alreadyRendered) {
      return
    }

    if (showLink) {
      return $item.find('td.quantity').after(`
        <td class="empty-gap"></td>
        <td class="empty-gap"></td>
        <td class="service-links-wrapper" id="${serviceId}-${skuId}" >
          <a class="service-link" href="${linkUrl}" data-sku-id=${skuId} data-service-id=${serviceId}>
            ${linkText}
          </a>
        </td>
      `)
    }
  }

  
  _priorizeInstantVoucherLink() {
    const serviceIds = ['instantVoucher', 'addon'];
    const prioritizedLinks = [];
    const otherServices = [];
   
    this.serviceLinks.forEach(service => {
      if (serviceIds.includes(service.serviceId)) {
        prioritizedLinks.push(service);
      } else {
        otherServices.push(service);
      }
    });
   
    this.serviceLinks = [...prioritizedLinks, ...otherServices];
   }

  init(orderForm) {
    try {
      this._addSSGCareTrigger()
      this._priorizeInstantVoucherLink()
      
      if (!orderForm.items) {
        return
      }

      if (!orderForm.items.length) {
        return
      }

      this.serviceLinks.forEach(({ serviceId, skuId, refId, linkText }) => {
        const currentItem = orderForm.items.find(item => item.id === skuId)
        const checkServicesFunction = CHECK_SERVICES[serviceId]
        const skipInstantVoucherLink = (serviceId === 'instantVoucher') && ['5', '11', '12'].includes(orderForm.salesChannel)

        if (!currentItem || !checkServicesFunction || skipInstantVoucherLink) {
          return
        }

        const isInstantVoucher = serviceId === 'instantVoucher'
        const isAddon = serviceId === 'addon'
        const productUrl = `${currentItem.detailUrl}?skuId=${skuId}&scroll=${serviceId}`
        const instantVoucherUrl = `${currentItem.detailUrl.split('/p')[0]}/instant-voucher?skuId=${skuId}`
        const addonUrl = `${currentItem.detailUrl.split('/p')[0]}/always-add-on?skuId=${skuId}`
        const linkUrl = isInstantVoucher ? instantVoucherUrl : isAddon ? addonUrl : productUrl;
        const hasServiceInCart = checkServicesFunction(refId, orderForm)

        this._renderLink({
          serviceId,
          skuId,
          linkText,
          linkUrl,
          showLink: !hasServiceInCart
        })
      })
    } catch (err) {
      console.error(`Ocorreu um erro ao adicionar links de serviços: ${err}`)
    }
  }

  _addSSGCareTrigger() {
    const isTestAB = window.sessionStorage.getItem('codigoTesteABCheckoutSamsungCare');
    if(isTestAB && isTestAB === '56') {
    const _this = this;
      $(document).off('click', '.service-link').on('click', '.service-link', function (event) {
        event.preventDefault();
        const target = event.target.closest('.service-link');
        if (target) {
          const skuId = target.dataset.skuId;
          const serviceId = target.dataset.serviceId
          if(serviceId !== 'samsungCare') return 
  
          if (!document.getElementById('ssg-care-script')) {
            const script = document.createElement('script');
            script.src =  `${rootPath()}/_v/${__VISIBILITY__}/assets/v1/${__BUILD_STATE__}/${__CHECKOUT_VENDOR__}.${__CHECKOUT_NAME__}@${__CHECKOUT_VERSION__}/public/scPlus/js/samsungCare.js`;
            script.id = 'ssg-care-script';
            script.type = 'module';
            script.onload = () => {
              _this.dispatchSsgCareEvent(skuId, serviceId);
            };
            document.body.appendChild(script);
        
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.type = 'text/css';
            linkElement.id = 'ssg-care-style';
            linkElement.href =  `${rootPath()}/_v/${__VISIBILITY__}/assets/v1/${__BUILD_STATE__}/${__CHECKOUT_VENDOR__}.${__CHECKOUT_NAME__}@${__CHECKOUT_VERSION__}/public/scPlus/css/samsung-care.css`;
            document.head.appendChild(linkElement);
          }else {
            _this.dispatchSsgCareEvent(skuId, serviceId);
          }
        }
      });  
    }
  }

  dispatchSsgCareEvent(skuId, serviceId) {
    const event = new CustomEvent('ssg-care', {
      detail: {
        message: 'modal opened',
        serviceId,
        skuId
      }
    });
    window.dispatchEvent(event);
  }
}