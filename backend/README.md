# Backend - Reservas Gastronómicas

API REST en Spring Boot 3.3 con Java 17.

## Estructura de packages

```
com.reservas.app/
├── config/          # Configuraciones de Spring (Security, CORS, etc.)
├── common/          # Clases utilitarias compartidas (BaseEntity, exceptions, etc.)
├── usuario/         # Módulo: usuarios del sistema (admins/empleados)
├── restaurante/     # Módulo: restaurantes, mesas, horarios, bloqueos, configuración
├── cliente/         # Módulo: clientes finales (consumidores)
├── reserva/         # Módulo: reservas y asignación de mesas
├── pago/            # Módulo: pagos e integración con Mercado Pago
├── notificacion/    # Módulo: envío de notificaciones (email, WhatsApp, SMS)
├── listaespera/     # Módulo: lista de espera
└── resena/          # Módulo: reseñas post-visita
```

Cada módulo es autocontenido: tiene su entity, repository, service, controller, dto y mapper.

## Comandos útiles

```bash
# Levantar el backend
./mvnw spring-boot:run

# Compilar
./mvnw clean package

# Correr tests
./mvnw test

# Saltar tests al compilar
./mvnw clean package -DskipTests
```

## Migraciones (Flyway)

Las migraciones están en `src/main/resources/db/migration/`. Se ejecutan automáticamente al levantar la app.

**Convención de nombres**: `V<numero>__<descripcion>.sql`
Ejemplos:
- `V1__initial_schema.sql`
- `V2__agregar_columna_X_a_reserva.sql`

**Regla de oro**: una vez que una migración se commiteó, NO se modifica. Si hay que cambiar algo, se crea una migración nueva.

## Endpoints disponibles

Con la app corriendo:
- Health propio: http://localhost:8080/api/health
- Health Actuator: http://localhost:8080/api/actuator/health
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/v3/api-docs
