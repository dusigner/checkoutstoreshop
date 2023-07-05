const { _locale } = require('../components/_locale-infos')

import { rootPath } from './utils/_rootPath'

/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */

export default class ShippingEstimateCustom {
  constructor() {
    this.fetched = false // to avoid duplicated requests

    this.lang = ''
    this.holidays = []
  }

  updateLang() {
    const clientLocale = 'pt-BR'
    const countryCode = 'BRA'

    this.lang =
      Object.values(_locale).find(country => country.locale === clientLocale) ||
      _locale[countryCode] ||
      findClosestLang(clientLocale, _locale) ||
      _locale.USA
  }

  getBusinessDays(days) {
    let currentDate = new Date()
    currentDate = new Date(currentDate.getTime())
    const weekday = currentDate.getDay() // weekday by index, which sunday is 0

    let businessDays = currentDate.getDate() + days + (weekday === 6 ? 2 : +!weekday) + Math.floor((days - 1 + (weekday % 6 || 1)) / 5) * 2

    return businessDays
  }

  getShippingEstimate(days) {
    const _this = this
    const currentDate = new Date()
    const shippingEstimate = new Date()

    shippingEstimate.setDate(this.getBusinessDays(days))

    const holidays = this.holidays.filter((holiday) => {
      const holidayStartDate = Date.parse(holiday.startDate);
      const holidayDate = new Date(holiday.startDate);

      const isWeekend = holidayDate.getDay() === 0 || holidayDate.getDay() === 6
  
      return holidayStartDate >= currentDate && holidayStartDate <= Date.parse(shippingEstimate) && !isWeekend
    })

    let daysWithHolidays = days + holidays.length
    let businessDays = this.getBusinessDays(daysWithHolidays)
    let aditionalDays = 0
    
    // recursive function
    function addOneMoreDayIfHoliday() {
      const d = new Date()
      d.setDate(businessDays)
        
      const isHoliday = _this.holidays.some(holiday => (
        new Date(holiday.startDate).toLocaleDateString() === d.toLocaleDateString()
      ))

      if (isHoliday) {
        aditionalDays++
        businessDays = _this.getBusinessDays(daysWithHolidays + aditionalDays)
        addOneMoreDayIfHoliday()
      }
    }

    addOneMoreDayIfHoliday()
    shippingEstimate.setDate(businessDays)

    return shippingEstimate
  }

  addBusinessDays(days, lang = window.i18n.options.lng) {
    const shippingEstimate = this.getShippingEstimate(days)
    
    if ((shippingEstimate.getDate() - new Date().getDate()) === 1) {
      return this.lang.tomorrowLabel || 'Amanhã'
    }

    const dateOptions = { weekday: 'short', day: '2-digit', month: 'short' }

    return shippingEstimate.toLocaleDateString(lang, dateOptions).replace(/\.|,|de /g, '')
  }

  changeShippingTimeInfo() {
    const _this = this

    $('body').addClass('v-custom-changeShippingTimeInfo')
    const mainSTIelems = [
      '.shp-summary-package-time > span',
      'p.vtex-omnishipping-1-x-sla.sla',
      '.vtex-omnishipping-1-x-leanShippingTextLabelSingle > span',
      'span.shipping-date',
      '.shp-option-text-time',
      '.pkpmodal-pickup-point-sla',
      '.shp-option-text-package',
      '.srp-delivery-current-many__sla',
      '.shipping-estimate-date:eq(0)',
      '.srp-shipping-current-single__sla',
    ]

    try {
      $(`
        .vtex-omnishipping-1-x-summaryPackage.shp-summary-package:not(.v-changeShippingTimeInfo-active),
        .vtex-omnishipping-1-x-leanShippingOption,
        .vtex-omnishipping-1-x-packageItem:not(.v-changeShippingTimeInfo-active),
        .orderform-template .cart-template.mini-cart .item,
        .vtex-pickup-points-modal-3-x-pickupPointSlaAvailability,
        .srp-delivery-current-many,
        td.shipping-date,
        .srp-shipping-current-single
      `).each(function () {
        const [logisticsInfo] =
          window.vtexjs.checkout.orderForm.shippingData.logisticsInfo

        const availableSlas = logisticsInfo.slas

        const { selectedSla } = logisticsInfo

        const selectedSlaDays = availableSlas.find(e => e.name === selectedSla)
          ? availableSlas.find(e => e.name === selectedSla).shippingEstimate
          : false

        const txtselectin = $(this)
          .find(
            mainSTIelems
              .map(elem => `${elem}:not(.v-changeShippingTimeInfo-elem-active)`)
              .join(', ')
          )
          .text()

        let days

        if (!$(this).hasClass('srp-delivery-current-many')) {
          if (txtselectin !== '' && txtselectin.match(/(day)|(dia)|(día)/gm)) {
            days = parseInt(txtselectin.match(/\d+/), 10)
          }
        } else if (selectedSlaDays) {
          days = parseInt(selectedSlaDays.match(/\d+/), 10)
        }

        if (days) {
          let _delivtext = _this.lang.deliveryDateText

          if (
            $(this)
              .find(mainSTIelems.join(', '))
              .text()
              .toLowerCase()
              .match(/(ready in up)|(pronto)|(a partir de)|(hasta)/gm)
          ) {
            _delivtext = _this.lang.PickupDateText
          } // check if is pickup. OBS: none of others solutions worked, needs constantly update

          const shippingEstimateText = `<strong style="text-transform: capitalize">
            ${_this.addBusinessDays(days)}
          </strong>`

          $(this)
            .find(mainSTIelems.join(', '))
            .html(
              `${_delivtext} ${shippingEstimateText}`
            )
            .addClass('v-changeShippingTimeInfo-elem-active')
        }

        $(this).addClass('v-changeShippingTimeInfo-active')
      })

      // temporaly
      const shippingPreviewPackges = $(
        '.srp-delivery-info .srp-packages:not(.v-changeShippingTimeInfo-elem-active)'
      )

      $('.js-shippingPreviewPackges').remove()
      if (shippingPreviewPackges.length) {
        const a = shippingPreviewPackges
          .text()
          .split(':')[1]
          .split(/,| and | e | y /)

        const deliveryDates = []

        $.each(a, function (i) {
          const txtselectin = a[i]

          if (txtselectin !== '' && txtselectin.match(/(day)|(dia)|(día)/gm)) {
            const days = parseInt(txtselectin.match(/\d+/), 10)

            if (days) {
              let _delivtext = _this.lang.deliveryDateText

              if (
                txtselectin
                  .toLowerCase()
                  .match(/(ready in up)|(pronto)|(A partir de)|(hasta)/gm)
              ) {
                _delivtext = _this.lang.PickupDateText
              } // check if is pickup. OBS: none of others solutions worked, needs constantly update

              deliveryDates.push(
                `${_delivtext} <strong>${_this.addBusinessDays(days)}</strong>`
              )
            }
          }
        })
        shippingPreviewPackges
          .hide()
          .after(
            `<p class="black-50 mt3 mb0 js-shippingPreviewPackges">${
              shippingPreviewPackges.text().split(':')[0]
            }: ${deliveryDates.join('; ')}</p>`
          )
          .addClass('v-changeShippingTimeInfo-active')
      }
    } catch (e) {
      console.error('changeShippingTimeInfo Error:', e)
    }
  }

  init() {
    const _this = this

    if (!this.lang) {
      this.updateLang()
    }

    if (!this.lang) {
      return
    }

    if (this.holidays.length) {
      this.changeShippingTimeInfo()
      return
    }

    if (!this.fetched) {
      this.fetched = true // to avoid duplicated requests
      
      $.ajax(`${rootPath()}/_v/get/holidays`).done(function (response) {
        _this.holidays = response
  
        _this.changeShippingTimeInfo()
      })
    }
  }
}
  