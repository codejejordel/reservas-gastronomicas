package com.reservas.app.sucursal.usuario.entity;

import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "usuario_sucursal")
@EntityListeners(AuditingEntityListener.class)
public class UsuarioSucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @CreatedDate
    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;

    @Column(nullable = false)
    private Boolean activo = true;
}
