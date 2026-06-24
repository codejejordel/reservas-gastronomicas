package com.reservas.app.onboarding.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.app.onboarding.dto.OnboardingStatusResponseDto;
import com.reservas.app.onboarding.dto.OnboardingUpdateRequestDto;
import com.reservas.app.onboarding.entity.RegistroNegocio;
import com.reservas.app.onboarding.repository.RegistroNegocioRepository;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final RegistroNegocioRepository registroNegocioRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public OnboardingStatusResponseDto getStatus(Long usuarioId) {
        return registroNegocioRepository.findByUsuarioId(usuarioId)
                .map(this::toDto)
                .orElseGet(() -> OnboardingStatusResponseDto.builder()
                        .usuarioId(usuarioId)
                        .pasoActual(1)
                        .completado(false)
                        .datos(objectMapper.createObjectNode())
                        .build());
    }

    @Transactional
    public OnboardingStatusResponseDto saveOrUpdate(Long usuarioId, OnboardingUpdateRequestDto request) {
        RegistroNegocio registro = registroNegocioRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Usuario usuario = usuarioRepository.findById(usuarioId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
                    RegistroNegocio nuevo = new RegistroNegocio();
                    nuevo.setUsuario(usuario);
                    return nuevo;
                });

        if (Boolean.TRUE.equals(registro.getCompletado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El onboarding ya fue completado");
        }

        registro.setPasoActual(request.getPasoActual());
        registro.setDatos(serializeDatos(request.getDatos()));

        RegistroNegocio saved = registroNegocioRepository.save(registro);
        return toDto(saved);
    }

    private OnboardingStatusResponseDto toDto(RegistroNegocio registro) {
        return OnboardingStatusResponseDto.builder()
                .usuarioId(registro.getUsuario().getId())
                .pasoActual(registro.getPasoActual())
                .completado(registro.getCompletado())
                .datos(parseDatos(registro.getDatos()))
                .build();
    }

    private String serializeDatos(Object datos) {
        if (datos == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(datos);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de datos inválido");
        }
    }

    private JsonNode parseDatos(String json) {
        if (json == null || json.isBlank()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            return objectMapper.createObjectNode();
        }
    }
}
