# Checkout-UI

## Dependências

- [Node.js 20.x](https://nodejs.org/en/download/)
- [Yarn classic >= 1.22.x & < 2.x](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
- [VTEX Toolbelt >= 4.x ](https://vtex.io/docs/recipes/installation/)

###  Building and running on localhost

```sh
npm run install:checkout
```

Abra um novo terminal e execute esse comando para que qualquer alteração feita ocorra o preocesso de re-build:

```sh
npm run start:checkout
```

Após isso em um novo terminal execute esse comando para linkar as alterações com a sua WS:
```sh
vtex link
```


## Build Prod

> AVISO IMPORTANTE ⚠️: Antes de rodar o comando para compilar os arquivos para deploy, será necessario mudar a versão do manifest para os arquivos serem compilados na versão correta.

Abra um novo terminal e execute o comando para criar o build de prod:

```sh
npm run build:checkout
```

### Script

Temos um script que facilita o de publicação de novas versões, 

```
node ./scripts/publish_new_version.mjs
```
