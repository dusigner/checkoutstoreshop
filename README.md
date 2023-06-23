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
npm run watch
```

Link In WS VTEX in another terminal
```sh
vtex link
```


### Build Prod

To create a production build:

```sh
npm run build
```


The build will generate several additional files in addition to ``checkout6-custom``, these files must be copied and pasted into the VTEX platform.

Through the link https://checkoutyuri--samsungbrshop.myvtex.com/admin/portal/#/sites/default/code/files/ you will have access to the files, just copy the content and paste it in its respective name.

It is worth mentioning that the files generated in ``npm run build`` are minified and should be placed like this on the platform

## Running

```sh
node dist/checkout6-custom.js
```

## Config in node_modules

modify "node_modules/parcel-bundler/src/Bundle.js"

// Add the content hash and extension.
return name + '.' + hash + ext;

For

// Add the content hash and extension.
return name + ext;

OBS: Map files ./dist with files checkout web 




