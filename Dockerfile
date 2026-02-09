# Dockerfile para Jaguares Academia Deportiva
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json del servidor
COPY server/package*.json ./server/

# Instalar dependencias del servidor
RUN cd server && npm install --production

# Copiar todo el código
COPY . .

# Exponer puerto
EXPOSE 3002

# Variables de entorno por defecto (serán sobreescritas por Dokploy)
ENV PORT=3002
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "server/index.js"]
