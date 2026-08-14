# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Turnify** — SaaS restaurant reservation platform (multi-tenant by `restaurante`). Backend: Spring Boot 3.3.5 / Java 17 / PostgreSQL 16. Frontend (React 18 + TypeScript + Vite) is **not yet initialized**.

---

## Commands

All backend commands run from the `backend/` directory unless noted.

```bash
# Start infrastructure (run from repo root)
docker compose up -d

# Run the application
mvnw.cmd spring-boot:run                          # Windows
./mvnw spring-boot:run                            # Linux/Mac

# Build
mvnw.cmd clean package
mvnw.cmd clean package -DskipTests

# Run all tests
mvnw.cmd test

# Run a single test class
mvnw.cmd test -Dtest=ReservaServiceTest

# Run a single test method
mvnw.cmd test -Dtest=ReservaServiceTest#shouldConfirmReserva
```

**Useful URLs once running:**
- API base: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
- Health: `http://localhost:8080/api/actuator/health`
- pgAdmin: `http://localhost:5050`

**Environment:** Copy `.env.example` to `.env` in the repo root before running Docker Compose. Spring Boot picks up env vars defined there via `application.yml` property placeholders.

> **DB URL mismatch:** `application.yml` hardcodes `jdbc:postgresql://localhost:5432/reservas_v0` — this does **not** read `POSTGRES_DB` from `.env`. If you change the DB name, update `application.yml` directly.

---

## Architecture

### Layer Structure

Each domain feature lives in its own package under `com.reservas.app` and is self-contained:

```
<feature>/
  entity/        ← JPA entity (extends BaseEntity)
  repository/    ← Spring Data JPA repo
  service/       ← Business logic
  controller/    ← REST controller
  dto/           ← Request/Response DTOs
  mapper/        ← MapStruct mapper (entity ↔ DTO)
```

`common/BaseEntity` provides auto-audited `fechaCreacion` / `fechaActualizacion` via `@EnableJpaAuditing` (must be present on a `@Configuration` class). All entities extend it.

### Domain Hierarchy

```
Restaurante (brand/tenant)
  └── Sucursal (physical location)
        ├── ConfiguracionSucursal   ← operational rules (deposits, cancellation windows, capacity)
        ├── Horario                 ← multi-shift opening hours per day (multiple rows per day via orden_turno)
        ├── BloqueoSucursal         ← blackout periods (holidays, private events)
        ├── Mesa                    ← tables with state machine
        ├── Reserva                 ← core booking (state machine + optimistic lock via @Version)
        │     ├── AsignacionMesa
        │     └── Pago              ← Mercado Pago deposit ("seña")
        ├── ListaEspera
        ├── Notificacion            ← audit log (EMAIL / SMS / WHATSAPP / PUSH)
        ├── Resena                  ← post-visit reviews with moderation
        └── FotoSucursal
```

**Usuario** exists outside this hierarchy — roles are `SUPER_ADMIN`, `ADMIN_RESTAURANTE`, `EMPLEADO_SUCURSAL`, `CLIENTE`. Employee-to-location mapping is in `usuario_sucursal`.

**Cliente** is an end-customer (separate from `Usuario`) with no-show tracking (`cant_no_shows`) and a `bloqueado` flag.

### Key Patterns

- **State machines**:
  - `Reserva`: 7 states — `PENDIENTE_PAGO`, `PENDIENTE_CONFIRMACION`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`, `NO_SHOW`, `EXPIRADA`. `PENDIENTE_CONFIRMACION` is used when no deposit is required but admin approval is needed.
  - `Pago`: `PENDIENTE → APROBADO → REEMBOLSADO` (also `RECHAZADO`, `EXPIRADO`).
  - `Mesa`: `DISPONIBLE`, `OCUPADA`, `RESERVADA`, `FUERA_DE_SERVICIO`.
- **Optimistic locking**: `Reserva` has a `version` field — always handle `OptimisticLockingFailureException` in reservation write paths.
- **Multi-tenancy**: Tenant isolation is at `Restaurante` level, enforced by role checks in services (not row-level security).
- **Database migrations**: Flyway manages schema. Add new migrations as `V<N>__description.sql` in `backend/src/main/resources/db/migration/`. Hibernate is set to `validate` — never use `ddl-auto: update/create`.
- **DTO mapping**: Use MapStruct (`@Mapper`). Never expose entities directly from controllers. Lombok must appear **before** MapStruct in the `annotationProcessorPaths` in `pom.xml` (already configured correctly).
- **`codigo_reserva`**: A unique `VARCHAR(20)` on `Reserva` that must be generated in service code — it is not auto-incremented.

### Payments

Mercado Pago credentials exist at **two levels**:
1. **Env vars** (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`) — used as global fallback.
2. **Database** — `restaurante.mp_access_token` / `restaurante.mp_conectado`, with per-sucursal override (`sucursal.mp_access_token`). If `sucursal.mp_access_token` is null, the service should fall back to `restaurante.mp_access_token`.

The webhook endpoint and signature verification (`MP_WEBHOOK_SECRET`) are **not yet implemented**.

### Notifications

`spring-boot-starter-mail` is on the classpath. Email/SMS/WhatsApp/Push channels are modelled in `Notificacion` but **sending is not yet implemented**. WhatsApp provider and token come from `WHATSAPP_PROVIDER` / `WHATSAPP_TOKEN` env vars.

### Configuration

- `application.yml` — base config (DB pool, Flyway, Jackson UTC, context path `/api`, CORS). **Note:** `show-sql: true` is set here (not just in dev profile).
- `application-dev.yml` — all DEBUG, SQL logging
- `application-prod.yml` — SQL logging off, WARN level, actuator hides details

Active profile is set via `SPRING_PROFILES_ACTIVE` env var (default: `dev`).

### Security

Spring Security is configured but **all routes are currently open** (`permitAll`) for development. JWT infrastructure (JJWT 0.12.6) is on the classpath but the filter is not yet implemented. When adding auth, the filter goes in `config/SecurityConfig.java`.

### Testing

JUnit 5 + TestContainers (PostgreSQL). No tests exist yet — the `src/test/` directory is empty. New tests should use `@SpringBootTest` + TestContainers rather than H2 or mocks, to keep close to production behavior.