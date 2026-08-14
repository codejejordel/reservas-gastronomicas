package com.reservas.app.restaurante.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.usuario.entity.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "restaurante")
public class Restaurante extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_admin_id")
    private Usuario usuarioAdmin;

    @Column(name = "nombre_publico", nullable = false, length = 150)
    private String nombrePublico;

    @Column(name = "razon_social", length = 200)
    private String razonSocial;

    @Column(length = 20)
    private String cuit;

    @Column(length = 200)
    private String slogan;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tipo_cocina", length = 100)
    private String tipoCocina;

    @Column(name = "ciudad_principal", length = 100)
    private String ciudadPrincipal;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "foto_local_url", length = 500)
    private String fotoLocalUrl;

    @Column(name = "color_primario", nullable = false, length = 9)
    private String colorPrimario = "#005759";

    @Column(name = "color_acento", nullable = false, length = 9)
    private String colorAcento = "#07A7A9";

    @Enumerated(EnumType.STRING)
    @Column(name = "tipografia_titulos", nullable = false, length = 50)
    private TipografiaFont tipografiaTitulos = TipografiaFont.PLAYFAIR;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipografia_cuerpo", nullable = false, length = 50)
    private TipografiaFont tipografiaCuerpo = TipografiaFont.INTER;

    @Enumerated(EnumType.STRING)
    @Column(name = "estilo_bordes", nullable = false, length = 20)
    private EstiloBordes estiloBordes = EstiloBordes.SUAVE;

    @Column(name = "slug_publico", nullable = false, unique = true, length = 100)
    private String slugPublico;

    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;

    @Column(name = "facebook_url", length = 255)
    private String facebookUrl;

    @Column(name = "sitio_web", length = 255)
    private String sitioWeb;

    @Column(name = "email_comercial", length = 255)
    private String emailComercial;

    @Column(name = "mp_access_token", length = 500)
    private String mpAccessToken;

    @Column(name = "mp_user_id", length = 100)
    private String mpUserId;

    @Column(name = "mp_conectado", nullable = false)
    private Boolean mpConectado = false;

    @Column(name = "rating_promedio_global", nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingPromedioGlobal = BigDecimal.ZERO;

    @Column(name = "cant_resenias_global", nullable = false)
    private Integer cantReseniasGlobal = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false)
    private Boolean publicado = false;
}