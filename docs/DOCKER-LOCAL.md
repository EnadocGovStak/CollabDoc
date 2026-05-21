# Local Docker Run

Run the app locally in Docker with a dedicated bridge network:

```bash
docker compose -f docker-compose.local.yml up --build
```

This creates the `collabdoc-local` Docker network and starts:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Backend health check: http://localhost:5000/health

Stop and remove the containers with:

```bash
docker compose -f docker-compose.local.yml down
```

Remove the local images if needed:

```bash
docker image rm collabdoc-frontend:local collabdoc-backend:local
```