export default function fixProfileForm() {
  try {
    if (!window.clientProfileData) {
      return;
    }

    if (window.profileDataHasBeenModified) {
      return;
    }

    window.clientProfileData.parseOrderFormResponse = function (orderForm) {
      window.profileDataHasBeenModified = true;
      $('#client-profile-data').addClass('ready');

      let clientProfileData, _ref;

      clientProfileData = null != (_ref = _.clone(orderForm.clientProfileData)) ? _ref : {}

      const { firstName, lastName, document, phone } = clientProfileData ?? {}
      const isAllRequiredFieldsFilled = firstName && lastName && document && phone

      "BRA" === window.checkout.countryCode() && clientProfileData.document && "cpf" === clientProfileData.documentType && (clientProfileData.document = _.maskString(clientProfileData.document, vtex.validation.masks.cpf))

      this.loading(false)
      isAllRequiredFieldsFilled && this.update(clientProfileData)
      isAllRequiredFieldsFilled && this.postUpdate(clientProfileData)

      return this.validate({
        dontChangeDOM: true
      })
    }
  } catch (err) {
    $('#client-profile-data').addClass('ready')
    console.error('fixProfileForm')
  }
}