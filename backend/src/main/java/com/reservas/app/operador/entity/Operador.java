package com.reservas.app.operador.entity;

import com.reservas.app.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "operador")
public class Operador extends Usuario {

    @Column(name = "foto_perfil_url", length = 500, nullable=true)
    private String fotoPerfilUrl;
}
