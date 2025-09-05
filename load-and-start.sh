
#!/bin/bash
set -e

echo "Загружаем Docker-образ из архива:"
docker load -i water-delivery-app.tar

echo "Запускаем docker compose..."
docker compose up -d

echo "✅ Готово! Приложение запущено."
