# 1. Instalación de dependencias
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Construcción de la aplicación
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Lo convertimos en una variable de entorno interna para el proceso de build
ENV NEXT_PUBLIC_BACKEND_URL="https://dondesiempre.azurewebsites.net"

# Obligatorio: Next.js generará la carpeta standalone
RUN npm run build

# 3. Imagen final de ejecución
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production


# Copiamos solo lo estrictamente necesario de la etapa builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"



# Ejecutamos el servidor de node directamente, no npm run dev
CMD ["node", "server.js"]