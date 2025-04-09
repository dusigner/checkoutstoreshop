#!/bin/bash

# Parâmetros
STEP=$1
REPOSITORY=$2
ACCOUNT=${3:-""}  # Se não passar um valor para ACCOUNT, será uma string vazia
APP=$4
VERSION=${5:-""}  # Se não passar um valor para VERSION, será uma string vazia

# Validação de parâmetros obrigatórios
if [ -z "$STEP" ]; then
  echo "Error: STEP parameter is required"
  exit 1
fi

if [ -z "$REPOSITORY" ]; then
  echo "Error: REPOSITORY parameter is required"
  exit 1
fi

if [ -z "$APP" ]; then
  echo "Error: APP parameter is required"
  exit 1
fi

# Verificar se variáveis de ambiente necessárias estão definidas
if [ -z "$ELASTIC_API_HOST" ] || [ -z "$ELASTIC_ENCODED_KEY_PIPELINE_LOGS" ]; then
  echo "Error: Environment variables ELASTIC_API_HOST and ELASTIC_ENCODED_KEY_PIPELINE_LOGS are required"
  exit 1
fi

# Dados a serem enviados
json_data=$'\n {
  "step": "'$STEP'",
  "repository": "'$REPOSITORY'",
  "account": "'$ACCOUNT'",
  "app": "'$APP'",
  "version": "'$VERSION'"
}'
json_data+=$'\n'
echo "$json_data"
curl -X POST "$ELASTIC_API_HOST/idx_bitbucket_pipeline/_doc" \
  -H "Content-Type: application/json" \
  -H "Authorization: ApiKey ${ELASTIC_ENCODED_KEY_PIPELINE_LOGS}" \
  -d "$json_data" \
  -v