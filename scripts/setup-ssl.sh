#!/bin/bash
# Generate Let's Encrypt certificates using certbot Docker image
DOMAIN=${DOMAIN:-training.lensa.biz}
EMAIL=${EMAIL:-admin@training.lensa.biz}

docker run --rm -it \
  -v $(pwd)/nginx/certs:/etc/letsencrypt \
  -v $(pwd)/nginx/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --agree-tos --no-eff-email \
    --email $EMAIL -d $DOMAIN

