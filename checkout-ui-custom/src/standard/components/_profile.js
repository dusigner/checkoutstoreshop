/* eslint-disable no-prototype-builtins */
/* eslint-disable vtex/prefer-early-return */
/* eslint-disable func-names */
import { getSessionCookie, getClientProfileData, insertClientPartial } from '../components/_utils'
import ToastMessages from './_toastMessage'

const toast = new ToastMessages()

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

  async insertPartialNewProfileData() {
    const _this = this

    try {
      const rewardsOptinIsVisible = $('#RewardsBlock').is(':visible')
      const saGuid = localStorage.getItem('saGuid')
      const rewardsAccepted = $('#inputRewards').is(':checked')
      let sendOptinToMasterdata = false

      if (
        saGuid &&
        rewardsAccepted &&
        rewardsOptinIsVisible &&
        window.location.hash === '#/profile'
      ) {
        await $.ajax({
          url: `${_this.rootPath()}/rewards/accept-terms/${saGuid}`,
          type: 'POST',
          crossDomain: true,
          success: (sendOptinToMasterdata = true),
          fail: (sendOptinToMasterdata = false),
        })
      }

      const formattedDate = $('#client-birth-date').val().split('/').reverse().join('-')

      const finalDate = new Date(formattedDate)

      const isWhatsAppPromotionOptIn = $('#checkboxWhatsAppPromotionOptIn').is(':checked') ||
        $('input[name="radioWhatsAppPromotionOptIn"]:checked').val() === 'yes' || 
        $('input[name="unifiedRadios"]:checked').val() === 'yes'

      const newData = {
        email: $('.email').text(),
        birthDate: finalDate,
        acceptTermsAndPrivacyPolicy: $('#inputTermAndPolicies').is(':checked'),
        isNewsletterOptIn: $('#opt-in-newsletter').is(':checked'),
        isWhatsAppPromotionOptIn,
      }

      const newDataWithOptin = {
        ...newData,
        isRewardsAccepted: true,
      }

      await insertClientPartial(sendOptinToMasterdata ? newDataWithOptin : newData)

    } catch (e) {
      console.error(e)
      throw new Error()
    }
  }

  convertDateToLocaleDateString(birthDate) {
    return new Date(birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  fillClientProfileData({
    birthDate,
    isNewsletterOptIn,
    acceptTermsAndPrivacyPolicy,
    isWhatsAppOptIn,
    isWhatsAppPromotionOptIn
  }) {
    try {
      const clientDateBirth = birthDate?.split('T')?.[0]?.split('-')?.reverse()?.join('/')

      $('#client-birth-date').addClass('success').val(clientDateBirth)
      $('#opt-in-newsletter').prop('checked', isNewsletterOptIn)
      $('#inputTermAndPolicies').prop('checked', acceptTermsAndPrivacyPolicy)

      const hasRadioWhatsAppOptIn = $('input[name="radioWhatsAppOptIn"]').length > 0
      const hasRadioWhatsAppPromotionOptIn = $('input[name="radioWhatsAppPromotionOptIn"]').length > 0
      const hasUnifiedRadios = $('input[name="unifiedRadios"]').length > 0

      if( hasRadioWhatsAppOptIn || hasRadioWhatsAppPromotionOptIn || hasUnifiedRadios) {
        const $whatsContainer = $('.whatsapp-optin');
        const isWhatsMandatory = $whatsContainer.data('mandatory') === true;

        if (hasRadioWhatsAppOptIn && !isWhatsMandatory) {
          $(`input[name="radioWhatsAppOptIn"][value="${isWhatsAppOptIn ? 'yes' : 'no'}"]`).prop('checked', true)
        }
        if (hasRadioWhatsAppOptIn && isWhatsMandatory) {
          if (isWhatsAppOptIn) {
            $(`input[name="radioWhatsAppOptIn"][value="yes"]`).prop('checked', true)
          }
        }

        if (hasRadioWhatsAppPromotionOptIn && !isWhatsMandatory) {
          $(`input[name="radioWhatsAppPromotionOptIn"][value="${isWhatsAppPromotionOptIn ? 'yes' : 'no'}"]`).prop('checked', true)
        }
        if (hasRadioWhatsAppPromotionOptIn && isWhatsMandatory) {
          if (isWhatsAppPromotionOptIn) {
            $(`input[name="radioWhatsAppPromotionOptIn"][value="yes"]`).prop('checked', true)
          }
        }

        if (hasUnifiedRadios && !isWhatsMandatory) {
          const unifiedValue = isWhatsAppOptIn && isWhatsAppPromotionOptIn
          $(`input[name="unifiedRadios"][value="${unifiedValue ? 'yes' : 'no'}"]`).prop('checked', true)
        }
        if (hasUnifiedRadios && isWhatsMandatory) {
          if (isWhatsAppOptIn && isWhatsAppPromotionOptIn) {
            $(`input[name="unifiedRadios"][value="yes"]`).prop('checked', true)
          }
        }
      } else {
        $('#checkboxWhatsAppOptIn').prop('checked', isWhatsAppOptIn)
        $('#checkboxWhatsAppPromotionOptIn').prop('checked', isWhatsAppPromotionOptIn)
      }

      this.toggleGoToShippingDisabled()
    } catch (err) {
      console.error(`Erro ao preencher dados de perfil de usuário: ${err}`)
    }
  }

  async persistClientProfileData() {
    const _this = this
    const cookieSession = await getSessionCookie()
    const account = __RUNTIME__.account;
    const vtexAuth = cookieSession.namespaces.cookie[`VtexIdclientAutCookie_${account}`]?.value || cookieSession.namespaces.cookie[`VtexIdclientAutCookie`]?.value;
    const url = account === 'samsungbrshopeppnubank' ? 'https://samsungbrshop.myvtex.com' : _this.rootPath()
    try {
      const { email } = window.vtexjs.checkout.orderForm.clientProfileData
      const whatsAppResponse = await fetch(`${url}/_v/private/conversation/v1/frontend`, {
          method: 'POST',
          headers: {
          vtexAuth
          },
          body: JSON.stringify({
            action: '2a7e3',
            params:{
              account
            }
        })
      })
      const whatsAppConsent = await whatsAppResponse.json()
      getClientProfileData(email).then(function (data) {
        try {
          const profileDataToPersist = {
            birthDate: data[0].birthDate,
            acceptTermsAndPrivacyPolicy: data[0].acceptTermsAndPrivacyPolicy,
            isNewsletterOptIn: data[0].isNewsletterOptIn,
            isWhatsAppOptIn: vtexjs.checkout.orderForm.clientProfileData !== null ? whatsAppConsent.verification : true,
            isWhatsAppPromotionOptIn: data[0].isWhatsAppPromotionOptIn,
          }
          _this.fillClientProfileData(profileDataToPersist)
          setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
        } catch (err) {
          console.error(`Erro ao recuperar dados de perfil de usuário: ${err}`)
          setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
        }
      })
    } catch (err) {
      console.error(`Erro ao recuperar dados de perfil de usuário: ${err}`)
      setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
    }
  }

  removePj() {
    $('.box-client-info-pj').remove()
  }

  updateBirthDateOnSummary() {
    const birthDateInputVal = $('#client-birth-date').val()

    if (birthDateInputVal) {
      $('#dateBirthField span.name').text(birthDateInputVal)
    }
  }

  async saveProfileData() {
    try {
      await this.insertPartialNewProfileData()
      this.updateBirthDateOnSummary()
    } catch (e) {
      throw new Error()
    }
  }

  validateAge(dataUser) {
    $('#error-client-date-birth, #error-client-date-birth-required, #error-client-invalid-date-birth').hide()
    let isValid = false
    let isValidDate = true
    const timezoneOffset = new Date().getTimezoneOffset()

    const formattedDate = dataUser.split('/')

    if (!!formattedDate[0] && !!formattedDate[1] && !!formattedDate[2]) {
      const dataRecebida = new Date(formattedDate.reverse().join('-'))

      dataRecebida.setUTCHours(0, timezoneOffset, 0, 0)
      isValid = !!this.calculateAge(
        dataRecebida.getFullYear(),
        dataRecebida.getMonth() + 1,
        dataRecebida.getDate()
      )

    } else {
      isValidDate = false
    }

    const inputDateVal = dataUser.trim()

    if (inputDateVal.length === 0) {
      $('#error-client-date-birth-required').show()
      $('#client-birth-date').addClass('error').removeClass('success')
    } else if (inputDateVal.length > 0 && inputDateVal.length < 10) {
      $('#client-birth-date').removeClass('error success')
    } else if (inputDateVal.length >= 10 && isValid) {
      $('#client-birth-date').addClass('success').removeClass('error')
    } else if (!isValid && isValidDate) {
      $('#error-client-date-birth').show()
      $('#client-birth-date').addClass('error').removeClass('success')
    } else {
      $('#error-client-invalid-date-birth').show()
      $('#client-birth-date').addClass('error').removeClass('success')
    }
  }

  mphone(v) {
    let r = v.replace(/\D/g, '')

    r = r.replace(/^0/, '')
    r = r.substring(0, 11);
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

  addDateBirthField() {
    if ($('p.client-date-birth').length) return

    const $dateBirthField = `<p class="client-date-birth input text required">
      <label for="client-date-birth">Data de Nascimento</label>
      <input type="text" id="client-birth-date" class="input-small" placeholder="dd/mm/aaaa" inputmode="numeric">
      <span id="error-client-date-birth-required" class="help error" style="display:none">Campo obrigatório.</span>
      <span id="error-client-date-birth" class="help error" style="display:none;">
        Menores de 18 anos não estão autorizados a efetuar o cadastro em nosso site. Em caso de dúvidas, acesse shop.samsung.com/br/faq.
      </span>
      <span id="error-client-invalid-date-birth" class="help error" style="display:none;">
        Data inválida, por favor verifique a data inserida
      </span>
    </p>`

    $('.client-document').first().after($dateBirthField)

    $('#client-birth-date').on('input change', function (e) {
      let value = this.value;
      const isBackspace = e?.originalEvent?.inputType === 'deleteContentBackward';

      if (!isBackspace) {
        value = value.replace(/\D/g, '');
  
        if (value.length >= 2) {
          value = value.substring(0, 2) + '/' + value.substring(2);
        }
  
        if (value.length >= 5) {
          value = value.substring(0, 5) + '/' + value.substring(5);
        }
  
        if (value.length > 10) {
          value = value.substring(0, 10);
        }
      }

      this.value = value;
    })

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

  async addWhatsappOptIn() {
    if ($('.whatsapp-optin').length) return

    const isShop = window.vtex.accountName === 'samsungbrshop' || window.vtex.accountName === 'samsungbrtests'

    const $field = `<div class="whatsapp-optin">
      <h3>Whatsapp (opcional)</h3>
      <label class="inputOptInWhats checkbox-inline">
        <input type="checkbox" id="checkboxWhatsAppOptIn" />
        <span class="custom-checkbox-icon"></span>
        <span>
          Desejo receber notificações do status do pedido por WhatsApp 
        </span>
      </label>
      <label style="margin-top: 16px">
        <input type="checkbox" id="checkboxWhatsAppPromotionOptIn"/>
        <span class="custom-checkbox-icon"></span>
        <span>
          Desejo receber comunicações, ofertas e novidades sobre a Samsung por WhatsApp. 
        </span>
      </label>
    </div>`

    if (!isShop) {
      return $('.newsletter-optin').before($field)
    }

    const solution1 =
      sessionStorage.getItem('codigoTesteWhatsOptinSolution1') !== null
    const solution2 =
      sessionStorage.getItem('codigoTesteWhatsOptinSolution2') !== null
    const solution3 =
      sessionStorage.getItem('codigoTesteWhatsOptinSolution3') !== null
    const solution4 =
      sessionStorage.getItem('codigoTesteWhatsOptinSolution4') !== null

    const hasSolution = solution1 || solution2 || solution3 || solution4

    if (!hasSolution) {
      return $('.newsletter-optin').before($field)
    }

    let version = null
    if (solution1) version = 1
    else if (solution2) version = 2
    else if (solution3) version = 3
    else if (solution4) version = 4

    function createRadios(nameAttr) {
      return `
      <div class="whatsapp-optin__radios" style="display: flex; gap: 30px; margin-top: 16px;">
      <label class="whatsapp-optin__label">
        <input type="radio" name="${nameAttr}" value="yes" class="custom-checkbox-icon" />
        <span>Sim</span>
      </label>
      <label class="whatsapp-optin__label">
        <input type="radio" name="${nameAttr}" value="no" class="custom-checkbox-icon"/>
        <span>Não</span>
      </label>
      </div>
    `
    }

    const isMandatory = version === 1 || version === 2

    const titleHtml = `<h3>WhatsApp (${isMandatory ? 'obrigatório' : 'opcional'})</h3>`;

    let questionsHtml = ''
    switch (version) {
      case 1:
      case 4:
        questionsHtml = `
      <div class="whatsapp-optin__question">
        <span>Deseja receber notificações do status do pedido por WhatsApp?</span>
        ${createRadios('radioWhatsAppOptIn')}
      </div>
      <div class="whatsapp-optin__question" style="margin-top: 16px;">
        <span>Deseja receber comunicações, ofertas e novidades sobre a Samsung por WhatsApp?</span>
        ${createRadios('radioWhatsAppPromotionOptIn')}
      </div>
    `
        break

      case 2:
      case 3:
        questionsHtml = `
      <div class="whatsapp-optin__question">
        <span>Aceito receber informações sobre meu pedido, bem como comunicações de marketing da Samsung via WhatsApp.</span>
        ${createRadios('unifiedRadios')}
      </div>
    `
        break
    }

    const $container = $(`
    <div class="whatsapp-optin" data-mandatory="${isMandatory}">
      ${titleHtml}
      ${questionsHtml}
    </div>
  `);

    $('.newsletter-optin').before($container)
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
    $('.newsletter-label').append(
      '<span class="newsletter-text-correct">Desejo receber comunicações, ofertas e novidades sobre a Samsung.</span>'
    )
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
      `<div id="RewardsBlock" style="margin-top: 35px; display: none">
        <h3 style="color:black;font-size:12px;">Samsung Rewards</h3>
        <label class="inputOptIn __rewards">
          <input type="checkbox" id="inputRewards" />
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
    const account = __RUNTIME__.account;

    if ($('#inputTermAndPolicies').length !== 0) return false

    _this.addNewsletterOptIn()
    _this.addWhatsappOptIn()
    _this.addTermsAndPolicies()

    if (account !== "samsungbrshopfidelidade"){
      _this.addRewardsBlock()
    }

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
    const _this = this
    const $context = $('#client-profile-data')
  
    const $allVisibleInputs = $context.find('p.input input:visible')
    const $validInputs = $context.find('p.input input.success:visible')

    const hasInvalidInputs = $validInputs.length < $allVisibleInputs.length

    const isTermsChecked = $('#inputTermAndPolicies').is(':checked')

    const $whatsContainer = $('.whatsapp-optin');
    const isWhatsMandatory = $whatsContainer.data('mandatory') === true;

    let areRadiosValid = true;

    if(hasInvalidInputs) {
      _this.doubleCheckInputBirthDate()
    }

    if (isWhatsMandatory) { 
      const radioWhatsAppOptIn = $('input[name="radioWhatsAppOptIn"]').length;
      const radioWhatsAppPromotionOptIn = $('input[name="radioWhatsAppPromotionOptIn"]').length;
      const unifiedRadios = $('input[name="unifiedRadios"]').length;

      if (radioWhatsAppOptIn) {
        const invalid = $('input[name="radioWhatsAppOptIn"]:checked').length === 0
        if (invalid) {
          areRadiosValid = false
        }
      }

      if (radioWhatsAppPromotionOptIn) {
        const invalid = $('input[name="radioWhatsAppPromotionOptIn"]:checked').length === 0;
        if (invalid) {
          areRadiosValid = false
        }
      }

      if (unifiedRadios) {
        const invalid = $('input[name="unifiedRadios"]:checked').length === 0;
        if (invalid) {
          areRadiosValid = false
        }
      }
    }

    const disabled = !hasInvalidInputs && isTermsChecked && (!isWhatsMandatory || areRadiosValid)

    $context.find('#go-to-shipping, #go-to-payment').prop('disabled', !disabled)
  }

  updateSubmitButtons() {
    setTimeout(() => {
      const hasPhoneErrors = $('.input-phone-error').length > 0;
      $('#go-to-shipping, #go-to-payment').prop('disabled', hasPhoneErrors);
    }, 50);
  };

  setErrorPhone(input, message) {
    const _this = this
    let errorElement = input.next('.phone-error-message');

    if (!errorElement.length) {
      errorElement = $('<span class="phone-error-message" style="display:none; color:red; font-size:12px; margin-top:5px;"></span>');
      input.after(errorElement);
    }

    input.addClass('input-phone-error error');
    errorElement.text(message).show();
    _this.updateSubmitButtons(); 
  };

  clearErrorPhone(input) {
    const _this = this
    input.removeClass('input-phone-error error');
    input.closest('.client-phone').removeClass('has-error');

    const errorElement = input.next('.phone-error-message');
    if (errorElement.length) {
      errorElement.hide();
    }

    _this.updateSubmitButtons();
  };

  bindEvents() {
    const _this = this

    $('body').on(
      'input',
      'input#client-first-name, input#client-last-name, input#ship-receiverName',
      function () {
        const regexp = /[^A-Za-zÀ-ú\s]+/
        if ($(this).val().match(regexp)) {
          $(this).val($(this).val().replace(regexp, ''))
        }
      }
    )

    $('body').on('input', '#client-phone', function () {
      if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) return

      const phoneInput = $(this);
      let rawValue = phoneInput.val().replace(/\D/g, '');

      const formattedValue = phoneInput.val();
      const isCelular = /^\(\d{2}\) [6-9]/.test(formattedValue);

      const maxLength = isCelular ? 11 : 10;

      if (rawValue.length > maxLength) {
        rawValue = rawValue.substring(0, maxLength); 
      }

      let formatted = '';
      if (rawValue.length <= 10) {
        // Fixo
        formatted = rawValue.replace(/^(\d{0,2})(\d{0,4})(\d{0,4})$/, function(_, ddd, part1, part2) {
          return (ddd ? `(${ddd}) ` : '') + (part1 || '') + (part2 ? `-${part2}` : '');
        });
      } else {
        // Celular
        formatted = rawValue.replace(/^(\d{0,2})(\d{0,5})(\d{0,4})$/, function(_, ddd, part1, part2) {
          return (ddd ? `(${ddd}) ` : '') + (part1 || '') + (part2 ? `-${part2}` : '');
        });
      }

      phoneInput.val(formatted);
    });

    $('body').on('keypress blur', '#client-phone', function (e) {
      if(!navigator.userAgent.match(/iPhone|iPad|iPod/i)) return

      setTimeout(() => {
        const v = _this.mphone(e.target.value)

        if (v !== e.target.value) {
          e.target.value = v
        }
      }, 1)
    })

    $('body').on('input keyup keypress blur', '#client-phone', function(e) {
      try {
        const phoneInput = $(this);
        const phoneValue = phoneInput.val().replace(/\D/g, '');
        const formattedValue = phoneInput.val();

        _this.clearErrorPhone(phoneInput);

        // Verifica se é celular (começa com 6,7,8,9 após o DDD)
        const isCelular = /^\(\d{2}\) [6-9]/.test(formattedValue) || /^\d{2}[6-9]/.test(formattedValue);

        if (phoneValue.length > 0) {
          if (isCelular) {
            // Validação para celular (11 dígitos)
            if (phoneValue.length !== 11) {
              _this.setErrorPhone(phoneInput, "Número de celular deve ter 11 dígitos (DDD + número)");
              return;
            }
          } else {
            // Validação para telefone fixo (10 dígitos)
            if (phoneValue.length !== 10) {
              _this.setErrorPhone(phoneInput, "Número de telefone fixo deve ter 10 dígitos (DDD + número)");
              return;
            }
          }
        }

        _this.updateSubmitButtons();

      } catch (err) {
        console.error('Erro na validação do telefone:', err);
      }
    });

    $('body').on('change input blur keyup keypress', '#client-birth-date', function (e) {
      _this.validateAge(e.target.value)
    })

    $('body').on('input blur keyup keypress', '#client-birth-date', function (e) {
      if (e.target.value.length < 10) {
        $('#error-client-date-birth').hide()
        $('#error-client-invalid-date-birth').hide()
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

    $('body').on('input', 'input#ship-number', function () {
      const regexp = /[^0-9\s]+$/

      if ($(this).val().match(regexp)) {
        $(this).val($(this).val().replace(regexp, ''))
      }
    })

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

    
    function getWhatsAppConsentStatus() {
      const defaultCheckbox = $('#checkboxWhatsAppOptIn')
      if (defaultCheckbox.length) {
        return defaultCheckbox.prop('checked')
      }

      const statusRadio = $('input[name="radioWhatsAppOptIn"]:checked')
      if (statusRadio.length) {
        return statusRadio.val() === 'yes'
      }

      const unifiedRadio = $('input[name="unifiedRadios"]:checked')
      if (unifiedRadio.length) {
        return unifiedRadio.val() === 'yes'
      }

      return false
    }

    async function updateWhatsappConsent(isChecked) {
      const cookieSession = await getSessionCookie();
      const account = __RUNTIME__.account;

      const vtexAuth = cookieSession.namespaces.cookie[`VtexIdclientAutCookie_${account}`]?.value || cookieSession.namespaces.cookie[`VtexIdclientAutCookie`]?.value
      const whatsappNumber = $('#client-phone').val()
      const phoneNumber = '55'+ whatsappNumber.replace(/\D/g, "");
      const consent = isChecked
      const url = account === 'samsungbrshopeppnubank' ? 'https://samsungbrshop.myvtex.com' : _this.rootPath()

      try {
        await fetch(`${url}/_v/private/conversation/v1/frontend`, {
          method: 'POST',
          headers: {
            vtexAuth
          },
          body: JSON.stringify({
            action: '10a1',
            account,
              params:{
              account,
              phoneNumber,
                  consent
              }
          })
        })
        
      } catch (err) {
          console.error(`Erro ao fazer consentimento de usuário: ${err}`);
      }
    }
  

    $('body').on('click', '#go-to-shipping', function () {
      const isChecked = getWhatsAppConsentStatus()
      updateWhatsappConsent(isChecked);
    });

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

    $('#client-profile-data input').on(
      'input blur keyup keypress, change',
      function () {
        setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
      }
    )

    $('body').on(
      'change',
      '#client-profile-data input[type="checkbox"], #client-profile-data input[type="radio"], #client-profile-data input[type="text"]',
      function () {
        setTimeout(() => _this.toggleGoToShippingDisabled(), 1)
      }
    )

    $('body').on(
      'click',
      '#edit-profile-data, #cart-to-orderform, #btn-client-pre-email, .checkout-steps_item_identification',
      function () {
          if(vtexjs.checkout.orderForm.clientProfileData !== null) {
          _this.persistClientProfileData()
        }
      }
    )

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

  addFieldsProfileToSummary(orderForm) {
    const _this = this;
    const { clientProfileData } = orderForm;

    if (!clientProfileData) return;

    const documentCpf = clientProfileData.document;

    // Adicionar CPF ao resumo do perfil
    let $documentCpfField = $('#documentCpfField');

    if (!$documentCpfField.length) {
      $documentCpfField = $(`
        <p id="documentCpfField" class="client-profile-summary cpf-field">
          <span class="name-label">CPF:</span>
          <span class="name">${documentCpf}</span>
          <br>
        </p>
      `);
      $('.client-profile-summary').first().after($documentCpfField);
    } else {
      $documentCpfField.find('.name').text(documentCpf);
    }

    // Criar ou atualizar o campo de Data de Nascimento
    let $dateBirthField = $('#dateBirthField');

    if (!$dateBirthField.length) {
      $dateBirthField = $(`
        <p id="dateBirthField" class="client-profile-summary date-birth-field">
          <span class="name-label">Data de Nascimento:</span>
          <span class="name"></span>
          <br>
        </p>
      `);
      $documentCpfField.after($dateBirthField);
    }

    const $birthDateFieldValue = $dateBirthField.find('.name');

    // Fazer a requisição para buscar a data de nascimento
    getClientProfileData().then(function (data) {
        if (!data || !data[0].birthDate) {
        $birthDateFieldValue.text('Não informado');
        return;
        }

      const clientDateBirth = _this.convertDateToLocaleDateString(data[0].birthDate);
      $birthDateFieldValue.text(clientDateBirth);
    }).catch(() => {
      $birthDateFieldValue.text('Erro ao carregar');
    });
  }

  doubleCheckInputBirthDate() {
    if ($('#client-birth-date').hasClass('error')) {
      setTimeout(() => {
        const $context = $('#client-profile-data')
        $context.find('#go-to-shipping, #go-to-payment').prop('disabled', true)
      }, 100)
    }
  }

  redirectProfileNotBirthDate(orderForm) {
    const email = orderForm.clientProfileData.email

    getClientProfileData(email).then(function (data) {
      try {
        if (!data || !data[0].birthDate) {
          toast.notifyMissingBirthDate()
          window.location.href = '/checkout/#/profile'
          return;
        }
        
      } catch (err) {
        console.error(`Erro ao recuperar dados de perfil de usuário: ${err}`)
      }
    })
  }
  
}