package com.reservas.app.reserva.spec;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.JoinType;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Locale;

public class ReservaSpecs {

    public static Specification<Reserva> conSucursal(Long sucursalId) {
        return (root, query, cb) ->
                sucursalId == null ? null : cb.equal(root.get("sucursal").get("id"), sucursalId);
    }

    public static Specification<Reserva> conCliente(Long clienteId) {
        return (root, query, cb) ->
                clienteId == null ? null : cb.equal(root.get("cliente").get("id"), clienteId);
    }

    public static Specification<Reserva> conFecha(LocalDate fecha) {
        return (root, query, cb) ->
                fecha == null ? null : cb.equal(root.get("fechaReserva"), fecha);
    }

    public static Specification<Reserva> conEstado(EstadoReserva estado) {
        return (root, query, cb) ->
                estado == null ? null : cb.equal(root.get("estado"), estado);
    }

    public static Specification<Reserva> entreFehas(LocalDate desde, LocalDate hasta) {
        return (root, query, cb) -> {
            if (desde == null && hasta == null) return null;
            if (desde == null) return cb.lessThanOrEqualTo(root.get("fechaReserva"), hasta);
            if (hasta == null) return cb.greaterThanOrEqualTo(root.get("fechaReserva"), desde);
            return cb.between(root.get("fechaReserva"), desde, hasta);
        };
    }

    public static Specification<Reserva> conEstados(Collection<EstadoReserva> estados) {
        return (root, query, cb) ->
                estados == null || estados.isEmpty() ? null : root.get("estado").in(estados);
    }

    public static Specification<Reserva> conBusqueda(String busqueda) {
        return (root, query, cb) -> {
            if (busqueda == null || busqueda.isBlank()) return null;

            String patron = "%" + busqueda.trim().toLowerCase(Locale.ROOT) + "%";
            var cliente = root.join("cliente", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("codigoReserva")), patron),
                    cb.like(cb.lower(root.get("nombreInvitado")), patron),
                    cb.like(cb.lower(root.get("emailInvitado")), patron),
                    cb.like(cb.lower(root.get("telefonoInvitado")), patron),
                    cb.like(cb.lower(cliente.get("nombreCompleto")), patron),
                    cb.like(cb.lower(cliente.get("email")), patron),
                    cb.like(cb.lower(cliente.get("telefono")), patron)
            );
        };
    }
}
