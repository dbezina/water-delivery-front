# Берем официальный nginx
FROM nginx:alpine

# Копируем файлы приложения в директорию nginx
COPY ./frontend /usr/share/nginx/html

# Копируем свой конфиг nginx, если нужен
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Порт по умолчанию
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
