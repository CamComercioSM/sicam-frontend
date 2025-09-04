# SICAM Frontend (Laravel 12.x + ThemeSelection)

Frontend oficial de SICAM para la Cámara de Comercio de Santa Marta.

## Stack
- Laravel 12.x (PHP 8.3+)
- Vite (JS/Assets)
- Bootstrap (ThemeSelection)

## Requisitos
- PHP 8.3+, Composer 2.7+
- Node 20+, npm/pnpm
- Extensiones PHP típicas de Laravel habilitadas

## Desarrollo
```bash
cp .env.example .env
php artisan key:generate

composer install
npm install

php artisan serve
npm run dev
