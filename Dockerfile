# Imagen de produccion del frontend web. Se construye desde la raiz del repositorio:
#   docker build -t energy-monitor-frontend .
# La usan infra/docker-compose.yml (pila local) e infra/docker-compose.prod.yml (servidor).
#
# Vite incrusta las variables VITE_* en el bundle en tiempo de build, por eso llegan
# como build-args y no como variables de entorno del contenedor.

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vacío = rutas relativas "/api/v1" y nginx las reenvía a backend:8080 (mismo origen, sin CORS).
ARG VITE_API_BASE_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
