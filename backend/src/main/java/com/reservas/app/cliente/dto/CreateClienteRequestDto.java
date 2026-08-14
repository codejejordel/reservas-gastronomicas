package com.reservas.app.cliente.dto;

import com.reservas.app.common.CanalNotif;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClienteRequestDto {

    @NotBlank
    @Size(max = 200)
    private String nombreCompleto;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    @Size(max = 50)
    private String telefono;

    @Size(max = 20)
    private String dni;

    private CanalNotif canalNotifPreferido;
}