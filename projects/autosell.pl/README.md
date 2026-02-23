# autosell.pl

Podział projektu na czytelne sekcje:

- `frontend/` – kod aplikacji webowej (UI).
- `backend/` – kod API, middleware, modele i admin panel.

## Backend (przykładowe moduły)

- `backend/src/app.js` – konfiguracja Express i middleware.
- `backend/src/middleware/rateLimiting.js` – bezpieczne rate limitery.
- `backend/src/services/socketService.js` – serwis Socket.IO.
- `backend/src/controllers/v1/auth/passwordResetController.js` – reset hasła.
- `backend/src/admin/routes/index.js` – routing panelu admin.
- `backend/src/models/ad/Ad.js` – model ogłoszeń.
