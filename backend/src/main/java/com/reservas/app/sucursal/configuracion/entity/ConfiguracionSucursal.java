package com.reservas.app.sucursal.configuracion.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.sucursal.entity.Sucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "configuracion_sucursal")
public class ConfiguracionSucursal extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false, unique = true)
    private Sucursal sucursal;

    @Column(name = "cobrar_senia", nullable = false)
    private Boolean cobrarSenia = false;

    @Column(name = "monto_senia", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoSenia = BigDecimal.ZERO;

    @Column(name = "tolerancia_minutos", nullable = false)
    private Integer toleranciaMinutos = 15;

    @Column(name = "habilitar_lista_espera", nullable = false)
    private Boolean habilitarListaEspera = true;

    @Column(name = "confirmacion_automatica", nullable = false)
    private Boolean confirmacionAutomatica = true;

    @Column(name = "minutos_recordatorio", nullable = false)
    private Integer minutosRecordatorio = 180;

    @Column(name = "max_personas_por_reserva", nullable = false)
    private Integer maxPersonasPorReserva = 12;

    @Column(name = "min_personas_por_reserva", nullable = false)
    private Integer minPersonasPorReserva = 2;

    @Column(name = "dias_anticipacion_maxima", nullable = false)
    private Integer diasAnticipacionMaxima = 2;

    @Column(name = "duracion_almuerzo_minutos", nullable = false)
    private Integer duracionAlmuerzoMinutos = 90;

    @Column(name = "duracion_cena_minutos", nullable = false)
    private Integer duracionCenaMinutos = 120;

    @Column(name = "minutos_lock_pago", nullable = false)
    private Integer minutosLockPago = 10;

    @Column(name = "horas_cancelacion_libre", nullable = false)
    private Integer horasCancelacionLibre = 24;

    @Column(name = "umbral_no_shows_bloqueo", nullable = false)
    private Integer umbralNoShowsBloqueo = 3;
}