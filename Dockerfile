FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json* ./
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrer l'application en mode développement
CMD ["npm", "run", "host"]