export default class FidelidadeCustomizations {
  init() {
    try {
      this.validateHeaderPartnerLogo()
    } catch (e) {
      console.error('EPPColaboradores error', e)
    }
  }

  validateHeaderPartnerLogo() {
    if (
      window.vtex &&
      (window.vtex.accountName == 'samsungbrtestsfidelidade' ||
        window.vtex.accountName == 'samsungbrshopfidelidade')
    ) {
      const partnerLogo = window.localStorage.getItem('partnerLogo') || ''

      if (!partnerLogo) {
        //shows samsung logo
        $('.main-header .container a img').css('display', 'block')
        return
      }

      //shows samsung and partner logo
      $('.main-header .container #partnerPlaceholder').css(
        'backgroundImage',
        `url(${partnerLogo})`
      )
      $('.main-header .container a').attr('href', '/')
      $('.main-header .container #logoSpacerBar').css('display', 'block')
      $('.main-header .container a img').css('display', 'block')
    }
  }
}
