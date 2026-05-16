package com.reservas.app.common;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ping")
public class PingController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping
    public Map<String, Object> ping() {
        return Map.of(
                "mensaje", "pong",
                "timestamp", LocalDateTime.now().toString()
        );
    }

    @GetMapping("/saludo/{nombre}")
    public Map<String, String> saludar(@PathVariable String nombre) {
        return Map.of(
                "saludo", "Hola, " + nombre + "!",
                "longitud", String.valueOf(nombre.length())
        );
    }

    @GetMapping("/db")
    public Map<String, Object> verificarDb() {
        @SuppressWarnings("unchecked")
        List<String> tablas = entityManager.createNativeQuery(
                "SELECT table_name FROM information_schema.tables " +
                        "WHERE table_schema = 'public' " +
                        "ORDER BY table_name"
        ).getResultList();

        return Map.of(
                "conectado", true,
                "cantidadTablas", tablas.size(),
                "tablas", tablas
        );
    }
}