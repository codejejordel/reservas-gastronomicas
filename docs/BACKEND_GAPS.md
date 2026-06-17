# Backend Gaps — Setup Wizard

## Estrategia actual (Opción B — Persist by Step)

El frontend persiste los datos al backend al finalizar cada step del wizard:

| Step | Endpoint(s) llamado(s) |
|------|------------------------|
| 0    | `POST /restaurante` (o `PUT /restaurante/{id}` si ya existe) |
| 1    | `POST /sucursal` × N venues |
| 2    | `POST /sucursal/{id}/horario` × N horarios por sucursal |
| 3    | `POST /mesa` × N mesas por sucursal |
| 4    | `PUT /restaurante/{id}` (branding) |
| 5    | Solo limpia localStorage, navega a dashboard |

Los IDs creados se guardan en `localStorage` (`setup-wizard-progress`) para permitir
reanudar el wizard si la ventana se cierra.

---

## TODO: Opción C — Endpoint atómico de setup

### Motivación
La Opción B requiere múltiples round-trips y manejo de estado distribuido entre pasos.
Una alternativa superior es un endpoint único que reciba toda la configuración del wizard
y ejecute la creación de forma transaccional en el backend.

### Endpoint propuesto
```
POST /restaurante/setup-completo
```

### Body esperado
```json
{
  "usuarioAdminId": 1,
  "restaurante": {
    "nombrePublico": "La Parrilla de Roberto",
    "slugPublico": "la-parrilla-de-roberto",
    "razonSocial": "Roberto SRL",
    "cuit": "30-12345678-9",
    "tipoCocina": "Parrilla",
    "ciudadPrincipal": "Buenos Aires",
    "slogan": "...",
    "emailComercial": "...",
    "colorPrimario": "#005759",
    "colorAcento": "#07a7a9",
    "tipografiaTitulos": "PLAYFAIR",
    "tipografiaCuerpo": "INTER",
    "estiloBordes": "SOFT"
  },
  "sucursales": [
    {
      "nombre": "Local Centro",
      "slug": "local-centro",
      "direccion": "Av. Corrientes 1234",
      "telefono": "...",
      "horarios": [
        { "diaSemana": "LUNES", "ordenTurno": 1, "horaApertura": "09:00", "horaCierre": "23:00" }
      ],
      "mesas": [
        { "nombre": "Mesa 1", "capacidad": 4 },
        { "nombre": "Mesa 2", "capacidad": 2 }
      ]
    }
  ]
}
```

### Respuesta esperada
```json
{
  "restauranteId": 42,
  "sucursales": [
    {
      "sucursalId": 10,
      "nombre": "Local Centro",
      "horarioIds": [101, 102, 103],
      "mesaIds": [201, 202]
    }
  ]
}
```

### Ventajas
- Transaccional: si falla cualquier parte, no queda data parcial en la DB.
- Un solo round-trip desde el frontend (más rápido, menos código).
- Elimina la necesidad de `localStorage` para recuperación entre steps.
- Simplifica el frontend: el wizard puede funcionar en modo "draft local" y
  solo persistir al confirmar en Step 5.

### Implementación backend (Spring Boot)
1. Crear `SetupCompletoRequestDto` con los campos anidados.
2. Crear `SetupCompletoService` con `@Transactional`.
3. Reusar `RestauranteService`, `SucursalService`, `HorarioService`, `MesaService`
   desde el servicio orquestador.
4. Exponer en `RestauranteController` o en un `SetupController` dedicado.

### Prioridad: Media — refactor futuro una vez que el wizard esté estable en Opción B.
