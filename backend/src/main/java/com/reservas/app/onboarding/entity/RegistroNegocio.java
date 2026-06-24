package com.reservas.app.onboarding.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "registro_negocio")
public class RegistroNegocio extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "paso_actual", nullable = false)
    private Integer pasoActual = 1;

    @Column(columnDefinition = "TEXT")
    private String datos;

    @Column(nullable = false)
    private Boolean completado = false;
}
