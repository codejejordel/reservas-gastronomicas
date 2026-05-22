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
    private Boolean cobrarSenia;

    @Column(name = "monto_senia", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoSenia;

    @Column(name = "tolerancia_minutos", nullable = false)
    private Integer toleranciaMinutos;

    @Column(name = "habilitar_lista_espera", nullable = false)
    private Boolean habilitarListaEspera;

    @Column(name = "confirmacion_automatica", nullable = false)
    private Boolean confirmacionAutomatica;

    @Column(name = "minutos_recordatorio", nullable = false)
    private Integer minutosRecordatorio;

    @Column(name = "max_personas_por_reserva", nullable = false)
    private Integer maxPersonasPorReserva;

    @Column(name = "min_personas_por_reserva", nullable = false)
    private Integer minPersonasPorReserva;

    @Column(name = "dias_anticipacion_maxima", nullable = false)
    private Integer diasAnticipacionMaxima;

    @Column(name = "duracion_almuerzo_minutos", nullable = false)
    private Integer duracionAlmuerzoMinutos;

    @Column(name = "duracion_cena_minutos", nullable = false)
    private Integer duracionCenaMinutos;

    @Column(name = "minutos_lock_pago", nullable = false)
    private Integer minutosLockPago;

    @Column(name = "horas_cancelacion_libre", nullable = false)
    private Integer horasCancelacionLibre;

    @Column(name = "umbral_no_shows_bloqueo", nullable = false)
    private Integer umbralNoShowsBloqueo;
}