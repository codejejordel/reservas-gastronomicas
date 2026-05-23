package com.reservas.app.cliente.repository;

import com.reservas.app.cliente.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByEmail(String email);

    Optional<Cliente> findByDni(String dni);

    boolean existsByEmail(String email);

    boolean existsByDni(String dni);
}