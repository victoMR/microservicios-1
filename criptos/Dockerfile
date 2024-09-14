# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de la aplicación al directorio de trabajo
COPY . .

# Instala las dependencias de la aplicación
RUN npm install

# Expone el puerto en el que la aplicación se ejecuta
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
