package com.reservas.app.operador.repository;

import com.reservas.app.operador.entity.Operador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OperadorRepository extends JpaRepository<Operador, Long> {

    @Query("SELECT o FROM Operador o JOIN UsuarioSucursal us ON us.usuario.id = o.id " +
           "WHERE us.sucursal.id = :sucursalId AND us.activo = true")
    List<Operador> findBySucursalIdActivo(@Param("sucursalId") Long sucursalId);
}
