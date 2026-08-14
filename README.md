# Reservas Gastronómicas

Sistema SaaS de reservas para restaurantes con pago de seña vía Mercado Pago.

## Stack

- **Backend**: Java 17, Spring Boot 3.3, Maven, PostgreSQL 16, Flyway
- **Frontend**: (React)
- **Pagos**: Mercado Pago
- **Infra local**: Docker Compose

## Estructura del repo

```
reservas-gastronomicas/
├── backend/          # API REST en Spring Boot
├── frontend/         # SPA (REACT)
├── docs/             # UML, mockups, especificaciones
├── docker-compose.yml
└── README.md
```

## Cómo levantar el proyecto localmente

### Requisitos previos

- **JDK 17+** (`java -version` debe mostrar 17 o superior)
- **Docker Desktop** corriendo
- **Git**
- IDE recomendado: **IntelliJ IDEA Community**

### Paso 1 — Clonar y configurar variables

```bash
git clone <url-del-repo>
cd reservas-gastronomicas
cp .env.example .env
```

Editá `.env` si necesitás cambiar credenciales (los defaults sirven para desarrollo).

### Paso 2 — Levantar Postgres y pgAdmin

Desde la raíz del repo:

```bash
docker compose up -d
```

Esto levanta:
- **Postgres** en `localhost:5432` (DB: `reservas`, user: `reservas_user`, pass: ver `.env`)
- **pgAdmin** en `http://localhost:5050` (user: `admin@reservas.local`, pass: ver `.env`)

Verificar que ambos están corriendo:

```bash
docker compose ps
```

### Paso 3 — Levantar el backend

```bash
cd backend
./mvnw spring-boot:run
```

(En Windows: `mvnw.cmd spring-boot:run`)

Si todo va bien, vas a ver en los logs:
- Flyway aplicando las migraciones
- Tomcat arrancando en el puerto **8080**

Probá: `http://localhost:8080/api/health` debería responder `{"status":"UP"}`.

### Paso 4 — Verificar en pgAdmin

1. Entrar a `http://localhost:5050`
2. Login con las credenciales de `.env`
3. Agregar servidor: Host `postgres`, Port `5432`, DB `reservas`, user/pass de `.env`
4. Verificar que las tablas se crearon en el schema `public`

## Cómo correr los tests

```bash
cd backend
./mvnw test
```

## Próximos pasos

Ver `docs/` para los UML, flujos y mockups del sistema.

## Convenciones

- **Branch principal**: `main` (deploys)
- **Branch de desarrollo**: `develop`
- **Features**: `feature/<descripcion-corta>`
- **Bugfixes**: `fix/<descripcion-corta>`
- **Commits**: en español, modo imperativo. Ej: `agregar endpoint de búsqueda de restaurantes`
