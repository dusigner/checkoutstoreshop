const version = '0.3.242';

const hostname = window.location.hostname;
const pathname = window.location.pathname;
const needsBRPrefix = hostname === 'shop.samsung.com' && pathname.startsWith('/br');

const prefixPath = (path) => needsBRPrefix ? `/br${path}` : path;

const data = {
  checkout: {
    onepage: {
      js: {
        url: prefixPath(`/_v/private/assets/v1/linked/samsungbr.store-checkout@${version}/public/checkout/onepage/script.js`),
        id: 'checkoutNovoScript',
      },
      css: {
        url: prefixPath(`/_v/private/assets/v1/linked/samsungbr.store-checkout@${version}/public/checkout/onepage/style.css`)
      }
    },
    standard: {
      js: {
        url: prefixPath(`/_v/private/assets/v1/linked/samsungbr.store-checkout@${version}/public/checkout/standard/script.js`),
        id: 'checkoutAtualScript',
      },
      css: {
        url: prefixPath(`/_v/private/assets/v1/linked/samsungbr.store-checkout@${version}/public/checkout/standard/style.css`)
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
