const version = '0.3.262';
const buildState = 'published'; // 'linked' ou 'published'
const assetVisibility = 'public'; // 'private' ou 'public'

const hostname = window.location.hostname;
const pathname = window.location.pathname;
const needsBRPrefix = hostname === 'shop.samsung.com' && pathname.startsWith('/br');

const prefixPath = (path) => needsBRPrefix ? `/br${path}` : path;

const urlBase = `/_v/${assetVisibility}/assets/v1/${buildState}/samsungbr.store-checkout@${version}`;
const urlOnepage = '/public/checkout/onepage';
const urlStandard = '/public/checkout/standard';

const data = {
  checkout: {
    onepage: {
      js: {
        url: prefixPath(`${urlBase}${urlOnepage}/script.js`),
        id: 'checkoutNovoScript',
      },
      css: {
        url: prefixPath(`${urlBase}${urlOnepage}/style.css`)
      }
    },
    standard: {
      js: {
        url: prefixPath(`${urlBase}${urlStandard}/script.js`),
        id: 'checkoutAtualScript',
      },
      css: {
        url: prefixPath(`${urlBase}${urlStandard}/style.css`)
      }
    }
  }
};

document.body.style.visibility = 'hidden';

const isOnePageCheckout = sessionStorage.getItem('codigoTesteABCheckoutOnePage') === '59';
const selectedCheckout = isOnePageCheckout ? data.checkout.onepage : data.checkout.standard;

const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = selectedCheckout.css.url;
document.head.appendChild(linkElement);

linkElement.onload = () => {
  document.body.style.visibility = 'visible';
};

const script = document.createElement('script');
script.src = selectedCheckout.js.url;
script.id = selectedCheckout.js.id;
document.body.appendChild(script);
