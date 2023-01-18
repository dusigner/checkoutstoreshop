/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
export default class CustomProfileData {
  rootPath() {
    return window.__RUNTIME__.rootPath ? window.__RUNTIME__.rootPath : ''
  }

  calculateAge(yyyy, mm, dd) {
    const d = new Date()
    const currentYear = d.getFullYear()
    const currentMonth = d.getMonth() + 1
    const currentDay = d.getDate()
    const year = +yyyy
    const month = +mm
    const day = +dd

    let getAge = currentYear - year

    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      getAge--
    }

    const age = getAge < 0 ? 0 : getAge

    return age >= 18 && age <= 120
  }

  insertPartialNewProfileData() {
    const _this = this

    const formattedDate = $('#client-birth-date')
      .val()
      .split('/')
      .reverse()
      .join('-')

    const finalDate = new Date(formattedDate)

    const newData = {
      email: $('.email').text(),
      birthDate: finalDate,
      acceptTermsAndPrivacyPolicy: $('#inputTermAndPolicies').is(':checked'),
      isNewsletterOptIn: $('#opt-in-newsletter').is(':checked'),
      isWhatsAppOptIn: $('#inputWhatsapp').is(':checked'),
      whatsappPhoneNumber: $('#inputWhatsapp').is(':checked')
        ? $('.whatsapp_phone').val()
        : '',
      isRewardsAccepted: $('#inputRewards').is(':checked'),
    }

    $.ajax({
      url: `${_this.rootPath()}/_v/insert/client/partial`,
      type: 'POST',
      crossDomain: true,
      accept: 'application/vnd.vtex.ds.v10+json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(newData),
      success(data) {
        window.localStorage.setItem('doc', data.DocumentId)
      },
    })

    const saGuid = localStorage.getItem('saGuid')
    const rewardsAccepted = $('#inputRewards').is(':checked')

    if (saGuid && rewardsAccepted) {
      $.ajax({
        url: `${_this.rootPath()}/rewards/accept-terms/${saGuid}`,
        type: 'POST',
        crossDomain: true,
      })
    }
  }

  removePj() {
    $('.box-client-info-pj').remove()
  }

  saveProfileData() {
    this.insertPartialNewProfileData()
  }

  validateAge(dataUser) {
    $('#error-client-date-birth, #error-client-date-birth-required').hide()
    let isValid
    const timezoneOffset = new Date().getTimezoneOffset()

    const formattedDate = dataUser.split('/')

    if (!!formattedDate[0] && !!formattedDate[1] && !!formattedDate[2]) {
      formattedDate.reverse()
      const dataRecebida = new Date(formattedDate.join('-'))

      dataRecebida.setUTCHours(0, timezoneOffset, 0, 0)
      isValid = !!this.calculateAge(
        dataRecebida.getFullYear(),
        dataRecebida.getMonth() + 1,
        dataRecebida.getDate()
      )
    } else {
      isValid = false
    }

    const inputDateVal = dataUser.trim()

    if (inputDateVal.length === 0) {
      $('#error-client-date-birth-required').show()
      $('#client-birth-date').addClass('error').removeClass('success')
    } else if (inputDateVal.length > 0 && inputDateVal.length < 10) {
      $('#client-birth-date').removeClass('error success')
    } else if (inputDateVal.length >= 10 && isValid) {
      $('#client-birth-date').addClass('success').removeClass('error')
    } else {
      $('#error-client-date-birth').show()
      $('#client-birth-date').addClass('error').removeClass('success')
    }
  }

  mphone(v) {
    let r = v.replace(/\D/g, '')

    r = r.replace(/^0/, '')
    if (r.length > 10) {
      r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (r.length > 5) {
      r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (r.length > 2) {
      r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2')
    } else {
      r = r.replace(/^(\d*)/, '($1')
    }

    return r
  }

  mdata(v) {
    let r = v.trim()

    if (v.match(/^\d{2}$/) !== null) {
      r += '/'
    } else if (v.match(/^\d{2}\/\d{2}$/) !== null) {
      r += '/'
    }

    return r
  }

  addDateBirthField() {
    if ($('p.client-date-birth').length) return

    const $dateBirthField = `<p class="client-date-birth input text required">
      <label for="client-date-birth">Data de Nascimento</label>
      <input type="text" maxlength="10" placeholder="DD/MM/AAAA" id="client-birth-date" class="input-small">
      <span id="error-client-date-birth-required" class="help error" style="display:none">Campo obrigatório.</span>
      <span id="error-client-date-birth" class="help error" style="display:none;">
        Menores de 18 anos não estão autorizados a efetuar o cadastro em nosso site. Em caso de dúvidas, acesse shop.samsung.com/br/faq.
      </span>
    </p>`

    $('.client-document').first().after($dateBirthField)
  }

  addWhatsAppField() {
    if ($('p.client-whatsapp').length) return

    const $field = `<p class="client-whatsapp input pull-left text">
      <label for="client-whatsapp">Celular/WhatsApp</label>
      <input type="text" id="client-whatasapp" placeholder="(00) 00000-0000" class="whatsapp_phone input-small success" oninvalid="this.setCustomValidity('Preencha este campo.')" maxlength="15" onchange="this.setCustomValidity('')">
      <span id="error-client-whatsapp-required" class="help error" style="display:none">Campo obrigatório.</span>
    </p>`

    $('.client-phone').first().before($field)
  }

  addPJInformation() {
    if ($('.pj-information').length) return

    const $information = `<div class="pj-information">
      <h3>Aviso: Compras para Pessoa Jurídica</h3>
      <p>
        A partir de 24/07/2022 as compras com dados de Pessoa Jurídica (CNPJ) deverão ser realizadas
        <a href="https://empresas.samsung.com.br" target="_blank">neste portal</a>. Caso
        queira comprar utilizando seu CPF ou consultar a posição de compras já efetuadas, continue por aqui na Loja
        Online Samsung.
      </p>
    </div>`

    $('#client-profile-data p.save-data').after($information)
  }

  addNewsletterOptIn() {
    if ($('.newsletter-optin').length) return
    if ($('.newsletter-optin').find('.newsletter-text').length) return

    const $field = `<div class="newsletter-optin">
      <h3>Newsletter e Promoções (opcional)</h3>
      <label class="inputOptIn __newsletter" />
    </div>`

    $('#client-profile-data p.save-data').after($field)

    // moves emails and offers into this context
    $('.newsletter-text').before('<span class="custom-checkbox-icon"></span>')
    // troca texto do newsletter
    $('.newsletter-label').append('<span class="newsletter-text-correct">Desejo receber comunicações, ofertas e novidades sobre a Samsung.</span>');
    const $infoEmail = $('.box-client-info .newsletter').detach()
    $('.box-client-info .__newsletter').after($($infoEmail))

  }

  addTermsAndPolicies() {
    if ($('.terms-and-policies').length) return

    const $field = `<div class="terms-and-policies">
      <h3>Privacidade (obrigatório)</h3>
      <label class="inputOptIn checkbox-inline">
        <input type="checkbox" id="inputTermAndPolicies" />
        <span class="custom-checkbox-icon"></span>
        <span>
          Aceito os
          <a href="https://www.samsung.com/br/shop/terms_and_conditions_of_sale/" target="_blank">termos e condições</a> e
          <a href="https://www.samsung.com/br/shop/privacy-policy/" target="_blank">política de privacidade</a>
        </span>
      </label>
    </div>`

    $('.newsletter-optin').after($field)
  }

  checkTerms() {
    if (!$('#inputTermAndPolicies').is(':checked')) {
      $('#inputTermAndPolicies').closest('.checkbox-inline').addClass('error')
    }
  }

  addRewardsBlock() {
    // rewards
    $('.box-client-info .newsletter').after(
      `<div id="RewardsBlock" style="display: none">
        <h3 style="color:black;font-size:15px;">Samsung Rewards</h3>
        <label class="inputOptIn __rewards">
          <input type="checkbox" id="inputRewards" checked />
          <span class="custom-checkbox-icon"></span>
          <span>
            Participar do programa Samsung Rewards para ganhar pontos com este pedido.
          </span>
        </label>
      </div>`
    )
  }

  addTerms(orderForm) {
    const _this = this

    if ($('#inputTermAndPolicies').length !== 0) return false

    _this.addNewsletterOptIn()
    _this.addTermsAndPolicies()
    _this.addRewardsBlock()

    if (
      orderForm.loggedIn ||
      window.loggedIn ||
      (orderForm.clientProfileData !== null &&
        orderForm.clientProfileData.profileCompleteOnLoading)
    ) {
      $('#inputTermAndPolicies').prop('checked', true)
    }
  }

  toggleGoToShippingDisabled() {
    const $context = $('#client-profile-data')

    const $allVisibleInputs = $context.find('p.input input:visible')
    const $validInputs = $context.find('p.input input.success:visible')

    const hasInvalidInputs = $validInputs.length < $allVisibleInputs.length

    const isTermsChecked = $('#inputTermAndPolicies').is(':checked')
    const disabled = !hasInvalidInputs && isTermsChecked

    $context.find('#go-to-shipping, #go-to-payment').prop('disabled', !disabled)
  }

  bindEvents() {
    const _this = this

    $('body').on(
      'input',
      'input#client-first-name, input#client-last-name, input#ship-receiverName',
      function () {
        const regexp = /[^A-Za-zÀ-ú\s]+$/

        if ($(this).val().match(regexp)) {
          $(this).val($(this).val().replace(regexp, ''))
        }
      }
    )

    $('body').on('keypress', '#client-phone', function (e) {
      setTimeout(() => {
        const v = _this.mphone(e.target.value)

        if (v !== e.target.value) {
          e.target.value = v
        }
      }, 1)
    })

    $('body').on('keyup', '#client-birth-date', function (e) {
      const v = _this.mdata(e.target.value)

      if (v !== e.target.value) {
        e.target.value = v
      }

      _this.validateAge(e.target.value)
    })

    $('body').on('blur', '#client-birth-date', function (e) {
      if (e.target.value.length < 10) {
        $('#error-client-date-birth').hide()
        $('#error-client-date-birth-required').show()
        $('#client-birth-date').addClass('error').removeClass('success')
      }
    })

    $('body').on('keypress', '#client-whatasapp', function (e) {
      setTimeout(() => {
        const v = _this.mphone(e.target.value)

        if (v !== e.target.value) {
          e.target.value = v
        }
      }, 1)
    })

    $('body').on(
      'input',
      'input#ship-number',
      function () {
        const regexp = /[^0-9\s]+$/

        if ($(this).val().match(regexp)) {
          $(this).val($(this).val().replace(regexp, ''))
        }
      }
    )


    $('body').on(
      'input',
      'input#ship-street, input#ship-complement, input#ship-neighborhood',
      function () {
        const regexp = /[^a-z0-9\s]+$/

        if ($(this).val().match(regexp)) {
          $(this).val($(this).val().replace(regexp, ''))
        }
      }
    )

    $('body').on('input', '#client-whatasapp', function () {
      const $this = $(this)
      const isInvalidNumber = $this.val().length > 0 && $this.val().length < 15

      $('#error-client-whatsapp-required').hide()

      if (isInvalidNumber) {
        $this.removeClass('success')
      } else {
        $this.removeClass('error').addClass('success')
      }

      if ($(this).is(':required') && !$this.val().length) {
        $this.removeClass('success').addClass('error')
        $('#error-client-whatsapp-required').show()
      } else {
        $this.removeClass('error')
      }
    })

    $('body').on('blur', '#client-whatasapp', function () {
      const $this = $(this)

      const isEmpty = $this.val().length === 0
      const isInvalidNumber = !isEmpty && $this.val().length < 15
      const isRequired = $this.is(':required')

      function setError() {
        $this.removeClass('success').addClass('error')
      }

      function setSuccess() {
        $this.removeClass('error').addClass('success')
      }

      if (isInvalidNumber) {
        setError()
      } else {
        setSuccess()
      }

      if (isEmpty && !isRequired) {
        setSuccess()
      }

      if (isEmpty && isRequired) {
        setError()
        $('#error-client-whatsapp-required').show()
      }
    })

    $('body').on('change', '.checkbox-inline input:checkbox', function () {
      if ($(this).is(':checked')) {
        $(this).closest('.checkbox-inline').removeClass('error')
      } else {
        $(this).closest('.checkbox-inline').addClass('error')
      }

      _this.checkTerms()
    })

    $('body').on('change', '#inputWhatsapp', function () {
      const isChecked = $(this).is(':checked')
      const $whatsAppInput = $('#client-whatasapp')

      $whatsAppInput.attr('required', isChecked)
      $('#error-client-whatsapp-required').hide()

      if (isChecked) {
        $('p.client-whatsapp').addClass('required')
        if (!$whatsAppInput.val().length) {
          $whatsAppInput.removeClass('success').addClass('error')
          $('#error-client-whatsapp-required').show()
        }
      } else {
        $whatsAppInput.closest('p.client-whatsapp').removeClass('required')
        $whatsAppInput.removeClass('error').addClass('success').val('')
      }
    })

    $('body').on(
      'input blur keyup keypress',
      '#client-profile-data p.input input:visible',
      function () {
        setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
      }
    )

    $('body').on(
      'change',
      '#client-profile-data input[type="checkbox"]',
      function () {
        setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
      }
    )

    $('body').on('click', '#edit-profile-data', function () {
      setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
    })

    $('body').on(
      'click',
      '#go-to-shipping, #client-profile-data #go-to-payment',
      function () {
        _this.saveProfileData()
      }
    )
  }

  addMsgPhone() {
    if ($('small.textMsgPhone').length) return

    const $textMsgPhone = `<small class="textMsgPhone">O número correto garante que possamos entrar em contato em caso de algum problema na entrega.</small>`

    $('p.client-phone').first().after($textMsgPhone)
  }

  addFieldsProfile(orderForm) {
    const _this = this
    const documentCpf = orderForm.clientProfileData.document

    const $documentCpfField = `<p id="documentCpfField" class="client-profile-summary cpf-field">
          <span class="name-label" style="">CPF:</span>
          <span class="name">${documentCpf}</span>
          <br>
          </p>`

    $('#documentCpfField').empty()
    $('.client-profile-summary').first().after($documentCpfField)

    $.ajax({
      url: `${_this.rootPath()}/_v/get/client/${
        orderForm.clientProfileData.email
      }`,
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
      },
      crossDomain: true,
      type: 'GET',
      success(data) {
        const dataBirthDate = data[0].birthDate

        if (data[0].birthDate) {
          const clientDateBirth = new Date(dataBirthDate).toLocaleDateString(
            'pt-BR',
            { timeZone: 'UTC' }
          )

          const $dateBirthField = `<p id='dateBirthField' class="client-profile-summary date-birth-field">
                <span class="name-label" style="">Data de Nascimento:</span>
                <span class="name">${clientDateBirth}</span>
                <br>
                </p>`

          $('#dateBirthField').empty()
          $('.client-profile-summary.cpf-field').first().after($dateBirthField)
        }
      },
    })
  }
}
