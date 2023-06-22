# Checkout-UI

###  Building and running on localhost

```sh
cd checkout-ui-custom
```

First install dependencies:

```sh
npm install
```

To run in hot module reloading mode:

```sh
npm run start
```

Proxy configuration for files

<a href="/docs/proxy/readme.md">Fiddler Proxy</a>


### Build Prod

To create a production build:

```sh
npm run build-prod
```

## Running

```sh
node dist/bundle.js
```

## Config in node_modules

modify "node_modules/parcel-bundler/src/Bundle.js"

// Add the content hash and extension.
return name + '.' + hash + ext;

For

// Add the content hash and extension.
return name + ext;

OBS: Map files ./dist with files checkout web 




