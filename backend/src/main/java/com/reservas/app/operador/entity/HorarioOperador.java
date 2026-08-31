package com.reservas.app.operador.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.sucursal.horario.entity.DiaSemana;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "horario_operador")
public class HorarioOperador extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id", nullable = false)
    private Operador operador;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 20)
    private DiaSemana diaSemana;

    @Column(name = "orden_turno", nullable = false)
    private Integer ordenTurno = 1;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false)
    private Boolean activo = true;

    /** Un turno cruza medianoche cuando termina antes de la hora en que empieza (ej. 19:00 a 01:00). */
    public boolean cruzaMedianoche() {
        return horaFin.isBefore(horaInicio);
    }
}
