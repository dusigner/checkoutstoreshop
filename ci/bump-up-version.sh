#!/bin/bash

VERSION_TYPE=$1  # O usuário deve passar o tipo de versão como argumento

if [[ -z "$VERSION_TYPE" || ! "$VERSION_TYPE" =~ ^(minor|patch)$ ]]; then
  echo "Erro: O tipo de versão deve ser 'minor' ou 'patch'."
  exit 1
fi

CURRENT_VERSION=$(echo "let p=$(<manifest.json);console.log(p.version)" | node)

# Extrai os números da versão (x.y.z)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
# Incrementa a versão dependendo do tipo especificado (minor ou patch)

if [[ "$VERSION_TYPE" == "patch" ]]; then
  PATCH=$((PATCH + 1))  # Incrementa PATCH
elif [[ "$VERSION_TYPE" == "minor" ]]; then
  MINOR=$((MINOR + 1))  # Incrementa MINOR
  PATCH=0               # Reset PATCH para 0
fi

# Gera a nova versão
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "Current version: $CURRENT_VERSION, next version: $NEW_VERSION"
mv manifest.json manifest.json.bkp
echo "let p=$(<manifest.json.bkp);p.version='$NEW_VERSION';console.log(JSON.stringify(p,null,2))" | node >> manifest.json
echo "Versão atualizada para: $NEW_VERSION"