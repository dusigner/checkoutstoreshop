export const debounce = (func, wait) => {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const formatCurrencyBRL = (_value, _division = true) => {
  const price = (_value / (_division ? 100 : 1)).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return price
}

export const formatNegativeValue = _value => {
  let price = _value.replace('-', '')

  price = price.replace(' ', ' -')

  return price
}

export const formatNumberBRL = _value =>
  new Intl.NumberFormat('pt-BR').format(_value)

export function rootPath() {
  return window?.__RUNTIME__?.rootPath ? window?.__RUNTIME__?.rootPath : ''
}

export async function getSessionCookie() {
  try {
    const cookieSessao = await fetch(`${rootPath()}/api/sessions?items=*`)
      .then(response => response.json())
      .then(result => {
        return result;
      });

    return cookieSessao; 
  } catch (error) {
    console.error("Erro getSessionCookie:", error);
    throw error;
  }
}

export async function getClientProfileData() {
  const cookie = await getSessionCookie();
  const vtexSession = cookie?.namespaces?.cookie?.VtexIdclientAutCookie?.value
  return $.ajax({
    url: `${rootPath()}/_v/private/aem-masterdata/v1/get/clients/custom`,
    headers: {
      Accept: 'application/vnd.vtex.ds.v10+json',
      'Content-Type': 'application/json',
      "vtex-session": vtexSession
    },
    cache: false,
    crossDomain: true,
    type: 'GET',
  })
}

export async function insertClientPartial(body) {
  const cookie = await getSessionCookie();
  const vtexSession = cookie?.namespaces?.cookie?.VtexIdclientAutCookie?.value
  return await $.ajax({
    url: `${rootPath()}/_v/private/aem-masterdata/v1/insert/clients/custom`,
    type: 'POST',
    crossDomain: true,
    accept: 'application/vnd.vtex.ds.v10+json',
    contentType: 'application/json; charset=utf-8',
    headers: {
          "vtex-session": vtexSession
    },
    data: JSON.stringify(
      body,
    ),
    success(data) {
      window.localStorage.setItem('doc', data.DocumentId)
    },
  })
}

export async function getProductVariations(productId) {
  return $.get(`${rootPath()}/api/catalog_system/pub/products/search`, {
    fq: "productId:" + productId
  })
}

export function getCustomDataFields({ app }) {
  return vtexjs?.checkout?.orderForm?.customData?.customApps?.reduce((acc, customApp) => {
    if (customApp.id === app) {
      Object.entries(customApp.fields || {}).map(([key, value]) => {
        acc[key] = JSON.parse(value)
      })
    }
    return acc
  }, {}) ?? {}
}

export async function setCustomData({ app, fields }) {
  const orderFormId = vtexjs?.checkout?.orderFormId

  if (!orderFormId) return

  Object.entries(fields || {}).map(([key, value]) => {
    fields[key] = JSON.stringify(value)
  })
  
  return $.ajax({
    type: 'PUT',
    url: `${rootPath()}/v1/pub/putCheckoutCustomData/${orderFormId}/${app}`,
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(fields),
  })
};

export async function deleteCustomData({ app, fields }) {
  const orderFormId = vtexjs?.checkout?.orderFormId

  if (!orderFormId) return
  
  return Promise.all(
    Object.keys(fields ?? {}).map((field) => {
      return $.ajax({
        url: `${rootPath()}/v1/pub/deleteCheckoutCustomData/${orderFormId}/${app}/${field}`,
        type: 'POST',
      })
    })
  )
}

export async function getMaxInstallmentByPaymentSystem(paymentSystemId = '2') {    
  try {
      const data = await paymentData.getInstallmentsByPaymentSystem(paymentSystemId)

      return data.installments.reduce((acc, installment) => {
          return installment.count < (acc.count ?? 0) ? acc : installment
      }, {})
  } catch (error) {
      console.error(error)
  }
}