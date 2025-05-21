# Training Calendar

This project contains a Vue 3 front-end powered by Vite and a Spring Boot back-end.

## Docker setup

Build and run the application using Docker Compose:

```bash
docker-compose build
docker-compose up -d
```

The front-end is served via Nginx on ports `80` and `443` and proxies API requests to the back-end running on port `8080`.

### TLS certificates

Use the helper script to generate free Let's Encrypt certificates (requires the domain `training.lensa.biz` to resolve to your server):

```bash
scripts/setup-ssl.sh
```

Certificates are stored in `nginx/certs` and automatically mounted into the Nginx container.
