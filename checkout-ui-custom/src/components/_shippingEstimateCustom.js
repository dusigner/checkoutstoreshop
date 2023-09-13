import { _locale } from '../components/_locale-infos'
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

  _capitalizeText(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
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
  
      return holidayStartDate >= Date.parse(currentDate) && holidayStartDate <= Date.parse(shippingEstimate) && !isWeekend
    })

    let daysWithHolidays = days + holidays.length
    let businessDaysWithHolidays = this.getBusinessDays(daysWithHolidays)
    let aditionalDays = 0
    
    // recursive function
    function addOneMoreDayIfHoliday() {
      const d = new Date()
      d.setDate(businessDaysWithHolidays)
        
      const isHoliday = _this.holidays.some(holiday => (
        new Date(holiday.startDate).toLocaleDateString() === d.toLocaleDateString()
      ))

      if (isHoliday) {
        aditionalDays++
        businessDaysWithHolidays = this.getBusinessDays(daysWithHolidays + aditionalDays)
        addOneMoreDayIfHoliday()
      }
    }

    addOneMoreDayIfHoliday()
    if (holidays.length || aditionalDays) {
      const shippingEstimateWithHolidays = new Date()
      shippingEstimateWithHolidays.setDate(businessDaysWithHolidays)
      
      return shippingEstimateWithHolidays
    }

    return shippingEstimate
  }

  addBusinessDays(days, lang = window.i18n.options.lng) {
    const currentDate = new Date()
    const shippingEstimate = this.getShippingEstimate(days)

    const isSameYear = shippingEstimate.getFullYear() === currentDate.getFullYear()
    const isSameMonth = isSameYear && shippingEstimate.getMonth() === currentDate.getMonth()
    
    if (isSameMonth && (shippingEstimate.getDate() - currentDate.getDate()) === 1) {
      return this.lang.tomorrowLabel || 'Amanhã'
    }

    const dateOptions = { weekday: 'short', day: '2-digit', month: 'short' }
    const formattedShippingEstimate = shippingEstimate.toLocaleDateString(lang, dateOptions).replace(/\.|,|de /g, '')

    return this._capitalizeText(formattedShippingEstimate)
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
      '[id^="sla-option"]',
      '.srp-delivery-current-many__sla',
      '.shipping-estimate-date:eq(0)',
      '.srp-shipping-current-single__sla',
      '.shipping-data'
    ]

    try {
      $(`
        .vtex-omnishipping-1-x-summaryPackage.shp-summary-package:not(.v-changeShippingTimeInfo-active),
        .vtex-omnishipping-1-x-leanShippingOption,
        .vtex-omnishipping-1-x-packageItem:not(.v-changeShippingTimeInfo-active),
        .orderform-template .cart-template.mini-cart .item,
        .vtex-pickup-points-modal-3-x-pickupPointSlaAvailability,
        .srp-delivery-current-many,
        .srp-delivery-select optgroup,
        td.shipping-date,
        .srp-shipping-current-single
      `).each(function () {
        const orderForm = window.vtexjs.checkout.orderForm
        const shippingData = orderForm.shippingData

        if (!shippingData) {
          return
        }

        if (!shippingData.logisticsInfo.length) {
          return
        }

        const [logisticsInfo] = shippingData.logisticsInfo

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
 
        if (typeof days !== 'undefined') {
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

          $(this)
            .find(mainSTIelems.join(', '))
            .text(function (i, text) {
              let newText

              if (days) {
                newText = `${_delivtext} ${_this.addBusinessDays(days)} - Após aprovação do pagamento`
              } else {
                newText = `Disponível no mesmo dia`
              }

              if ($(this).is('[id^="sla-option"]')) {
                const price = text.split('-').pop()
                return `${newText} - ${price}`
              }

              return newText
            })
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

            if (typeof days !== 'undefined') {
              let _delivtext = _this.lang.deliveryDateText

              if (
                txtselectin
                  .toLowerCase()
                  .match(/(ready in up)|(pronto)|(A partir de)|(hasta)/gm)
              ) {
                _delivtext = _this.lang.PickupDateText
              } // check if is pickup. OBS: none of others solutions worked, needs constantly update

              let newText

              if (days) {
                newText = `${_delivtext} ${_this.addBusinessDays(days)} - Após aprovação do pagamento`
              } else {
                newText = `Disponível no mesmo dia`
              }

              deliveryDates.push(newText)
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

  bindEvents() {
    $('body').on('change', '.srp-delivery-select', function() {
      const textToUpdate = $(this).find(`option#sla-option-${$(this).val()}`).text().split('-')
      textToUpdate.pop()
      $('.srp-delivery-current-many__sla').text(textToUpdate.join('-'))
    })
  }

  init() {
    const _this = this

    try {
      if (!this.lang) {
        this.updateLang()
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
    } catch (err) {
      console.error('changeShippingTimeInfo Error:', err)
    }
  }
}