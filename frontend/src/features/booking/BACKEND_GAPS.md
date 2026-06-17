# Backend Gaps — Flujo de Reserva Pública

Este documento lista los endpoints y funcionalidades que el backend necesita implementar para que el flujo de reserva pública funcione completamente.

## 🔴 Críticos (bloqueantes)

### 1. Endpoint público de restaurante por slug
**Necesidad:** El frontend necesita obtener los datos del restaurante y sus sucursales activas usando el slug de la URL.

**Endpoint sugerido:**
```
GET /api/public/restaurante/:slug
```

**Response esperado:**
```json
{
  "id": 1,
  "nombrePublico": "Parrilla del Tano",
  "slug": "parrilla-del-tano",
  "ciudadPrincipal": "Buenos Aires",
  "fotoLocalUrl": "https://...",
  "colorPrimario": "#005759",
  "colorAcento": "#07A7A9",
  "descripcion": "...",
  "slogan": "...",
  "sucursales": [
    {
      "id": 1,
      "nombre": "Parrilla del Tano - Palermo",
      "slug": "palermo",
      "direccion": "Av. Corrientes 1234",
      "ciudad": "Buenos Aires",
      "telefono": "+54 11 1234-5678"
    }
  ]
}
```

### 2. Endpoint de disponibilidad
**Necesidad:** Calcular qué días y horarios tienen disponibilidad según capacidad de mesas, reservas existentes y configuración de horarios.

**Endpoint sugerido:**
```
GET /api/public/sucursal/:id/disponibilidad?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&personas=N
```

**Response esperado:**
```json
{
  "dias": [
    {
      "fecha": "2024-10-03",
      "estado": "available" | "few-left" | "full"
    }
  ],
  "horarios": {
    "2024-10-03": [
      { "hora": "12:00", "disponible": true },
      { "hora": "12:30", "disponible": false }
    ]
  }
}
```

### 3. Endpoint de reserva pública (sin login)
**Necesidad:** Crear una reserva desde el flujo público. El cliente no está logueado, por lo que necesitamos upsertear el cliente inline.

**Problema actual:** `POST /reserva` requiere `clienteId` (NotNull), pero el cliente no existe aún.

**Solución sugerida:** Crear endpoint público que acepte datos del cliente inline:

```
POST /api/public/reserva
```

**Request body:**
```json
{
  "sucursalId": 1,
  "fechaReserva": "2024-10-03",
  "horaReserva": "21:30",
  "cantPersonas": 2,
  "observaciones": "Alergia al maní",
  "canalNotif": "WHATSAPP",
  "cliente": {
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+54 11 1234-5678"
  }
}
```

**Lógica del backend:**
1. Buscar cliente por email
2. Si existe, actualizar datos (nombre, teléfono)
3. Si no existe, crear nuevo cliente
4. Crear reserva con el `clienteId` resuelto
5. Enviar notificación según `canalNotif`

**Response:**
```json
{
  "id": 123,
  "codigo": "ABC123",
  "estado": "PENDIENTE_CONFIRMACION",
  "fechaReserva": "2024-10-03",
  "horaReserva": "21:30",
  "cantPersonas": 2,
  "cliente": { ... },
  "sucursal": { ... }
}
```

## ⚠️ Opcionales (mejoras)

### 4. Endpoint de lookup de reserva por código
**Necesidad:** Permitir al cliente consultar su reserva usando el código (sin login).

```
GET /api/public/reserva/:codigo
```

### 5. Endpoint de cancelación pública
**Necesidad:** Permitir al cliente cancelar su reserva usando el código + email.

```
POST /api/public/reserva/:codigo/cancelar
Body: { "email": "juan@ejemplo.com", "motivo": "..." }
```

## 📝 Notas de implementación

- Todos los endpoints públicos deben tener rate limiting para prevenir abuse.
- El upsert de cliente debe validar formato de email y teléfono.
- La disponibilidad debe considerar: horarios configurados, capacidad de mesas, reservas existentes, bloqueos.
- El cálculo de disponibilidad puede ser costoso → considerar caché con TTL corto (1-5 min).
- Las notificaciones (email/WhatsApp) deben ser asíncronas (queue).

## 🔧 Estado actual del frontend

El frontend está **completamente implementado** con datos mockeados:
- `mockAvailability.ts` simula disponibilidad
- `BookingWizard.tsx` tiene datos hardcodeados del restaurante
- `Step3CustomerDataPage.tsx` simula el submit con setTimeout

Una vez que el backend implemente estos endpoints, solo hay que:
1. Reemplazar los mocks en `mockAvailability.ts` con llamadas a `/disponibilidad`
2. Reemplazar el fetch hardcodeado en `BookingWizard.tsx` con llamada a `/restaurante/:slug`
3. Reemplazar el setTimeout en `Step3CustomerDataPage.tsx` con llamada a `POST /reserva`
