#!/bin/sh
set -e

if [ -f /etc/ssl/certs/cert.pem ] && [ -f /etc/ssl/private/privkey.pem ]; then
  cp /etc/nginx/conf.d/default.https.conf /etc/nginx/conf.d/default.conf
else
  cp /etc/nginx/conf.d/default.http.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
