package com.reservas.app.cliente.entity;

import com.reservas.app.common.CanalNotif;
import com.reservas.app.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cliente")
public class Cliente extends Usuario {

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_notif_preferido", length = 20)
    private CanalNotif canalNotifPreferido;

    @Column(name = "cant_no_shows", nullable = false)
    private Integer cantNoShows = 0;

    @Column(name = "cant_reservas", nullable = false)
    private Integer cantReservas = 0;

    @Column(nullable = false)
    private Boolean bloqueado = false;

    @Column(name = "fecha_desbloqueo")
    private LocalDateTime fechaDesbloqueo;
}