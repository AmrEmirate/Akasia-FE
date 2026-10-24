# Stage 1: Build static Next.js assets
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass build args for client-side environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AKASIA_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://akasia-api.vimtk.cloud/api}
ENV NEXT_PUBLIC_AKASIA_API_URL=${NEXT_PUBLIC_AKASIA_API_URL:-https://akasia-api.vimtk.cloud/api}

RUN npm run build

# Stage 2: Serve using lightweight Nginx
FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
