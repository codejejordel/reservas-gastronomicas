package com.reservas.app.listaespera.repository;

import com.reservas.app.listaespera.entity.EstadoListaEspera;
import com.reservas.app.listaespera.entity.ListaEspera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ListaEsperaRepository extends JpaRepository<ListaEspera, Long> {

    List<ListaEspera> findBySucursalIdOrderByPrioridadDescFechaCreacionAsc(Long sucursalId);

    List<ListaEspera> findBySucursalIdAndEstadoOrderByPrioridadDescFechaCreacionAsc(Long sucursalId, EstadoListaEspera estado);

    List<ListaEspera> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);

    @Query("""
            SELECT l FROM ListaEspera l
            WHERE l.sucursal.id = :sucursalId
              AND l.estado = 'EN_ESPERA'
              AND (l.fechaDeseada = :fecha
                   OR (l.flexibilidadFecha = 'MISMA_SEMANA'
                       AND l.fechaDeseada BETWEEN :inicioSemana AND :finSemana))
            ORDER BY l.prioridad DESC, l.fechaCreacion ASC
            """)
    List<ListaEspera> findActivosParaFecha(
            @Param("sucursalId") Long sucursalId,
            @Param("fecha") LocalDate fecha,
            @Param("inicioSemana") LocalDate inicioSemana,
            @Param("finSemana") LocalDate finSemana);

    boolean existsBySucursalIdAndClienteIdAndEstado(Long sucursalId, Long clienteId, EstadoListaEspera estado);
}
