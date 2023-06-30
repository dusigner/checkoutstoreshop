# empty-project

Empty project.

## Building and running on localhost

First install dependencies:

```sh
npm install
```

To run in hot module reloading mode:

```sh
npm start
```

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

