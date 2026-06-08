package com.reservas.app.restaurante.repository;

import com.reservas.app.restaurante.entity.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestauranteRepository extends JpaRepository<Restaurante, Long> {

    //Validar si existe por Slug
    boolean existsBySlugPublico(String slugPublico);
    //Validar si existe Slug en una edicion, por eso le pasamos id, para descartar el registro actual
    boolean existsBySlugPublicoAndIdNot(String slugPublico, Long id);

    boolean existsByNombrePublico(String nombrePublico);
    boolean existsByNombrePublicoAndIdNot(String nombrePublico, Long id);

    boolean existsByCuit(String cuit);
    boolean existsByCuitAndIdNot(String cuit, Long id);

    Optional<Restaurante> findBySlugPublico(String slugPublico);

    List<Restaurante> findByActivoTrue();

    Optional<Restaurante> findByUsuarioAdminId(Long usuarioAdminId);
}