package com.reservas.app.operador.service;

import com.reservas.app.common.ImagenStorageService;
import com.reservas.app.operador.dto.CreateOperadorRequestDto;
import com.reservas.app.operador.dto.OperadorResponseDto;
import com.reservas.app.operador.dto.TurnoOperadorRequestDto;
import com.reservas.app.operador.dto.TurnoOperadorResponseDto;
import com.reservas.app.operador.dto.UpdateOperadorRequestDto;
import com.reservas.app.operador.entity.HorarioOperador;
import com.reservas.app.operador.entity.Operador;
import com.reservas.app.operador.repository.HorarioOperadorRepository;
import com.reservas.app.operador.repository.OperadorRepository;
import com.reservas.app.restaurante.repository.RestauranteRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.horario.entity.DiaSemana;
import com.reservas.app.sucursal.repository.SucursalRepository;
import com.reservas.app.sucursal.usuario.entity.UsuarioSucursal;
import com.reservas.app.sucursal.usuario.repository.UsuarioSucursalRepository;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OperadorService {

    private final OperadorRepository operadorRepository;
    private final HorarioOperadorRepository horarioOperadorRepository;
    private final UsuarioSucursalRepository usuarioSucursalRepository;
    private final SucursalRepository sucursalRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImagenStorageService imagenStorageService;

    @Transactional
    public OperadorResponseDto create(Usuario admin, CreateOperadorRequestDto request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        if (request.getDni() != null && usuarioRepository.existsByDni(request.getDni())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El DNI ya está registrado");
        }

        Sucursal sucursal = findSucursalOrThrow(request.getSucursalId());
        checkOwnership(admin, sucursal);
        validarTurnos(request.getTurnos());

        Operador operador = new Operador();
        operador.setNombreCompleto(request.getNombre().trim() + " " + request.getApellido().trim());
        operador.setEmail(request.getEmail());
        operador.setPassword(passwordEncoder.encode(request.getPassword()));
        operador.setTelefono(request.getTelefono());
        operador.setDni(request.getDni());
        operador.setRol(RolUsuario.EMPLEADO_SUCURSAL);
        operador.setActivo(true);
        operador = operadorRepository.save(operador);

        UsuarioSucursal asignacion = new UsuarioSucursal();
        asignacion.setUsuario(operador);
        asignacion.setSucursal(sucursal);
        asignacion.setActivo(true);
        usuarioSucursalRepository.save(asignacion);

        guardarTurnos(operador, request.getTurnos());

        return toDto(operador, sucursal);
    }

    @Transactional
    public OperadorResponseDto update(Usuario admin, Long id, UpdateOperadorRequestDto request) {
        Operador operador = findOperadorOrThrow(id);
        Sucursal sucursalActual = findSucursalActualOrThrow(operador.getId());
        checkOwnership(admin, sucursalActual);

        if (request.getDni() != null && !request.getDni().equals(operador.getDni())
                && usuarioRepository.existsByDni(request.getDni())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El DNI ya está registrado");
        }

        String nombre = request.getNombre() != null ? request.getNombre().trim() : null;
        String apellido = request.getApellido() != null ? request.getApellido().trim() : null;
        if (nombre != null || apellido != null) {
            String[] actual = operador.getNombreCompleto().split(" ", 2);
            String nombreFinal = nombre != null ? nombre : (actual.length > 0 ? actual[0] : "");
            String apellidoFinal = apellido != null ? apellido : (actual.length > 1 ? actual[1] : "");
            operador.setNombreCompleto((nombreFinal + " " + apellidoFinal).trim());
        }
        if (request.getTelefono() != null) operador.setTelefono(request.getTelefono());
        if (request.getDni() != null) operador.setDni(request.getDni());
        operador = operadorRepository.save(operador);

        Sucursal sucursalFinal = sucursalActual;
        if (request.getSucursalId() != null && !request.getSucursalId().equals(sucursalActual.getId())) {
            Sucursal nuevaSucursal = findSucursalOrThrow(request.getSucursalId());
            checkOwnership(admin, nuevaSucursal);

            usuarioSucursalRepository.findByUsuarioIdAndActivoTrue(operador.getId())
                    .ifPresent(vieja -> {
                        vieja.setActivo(false);
                        usuarioSucursalRepository.save(vieja);
                    });

            UsuarioSucursal nuevaAsignacion = new UsuarioSucursal();
            nuevaAsignacion.setUsuario(operador);
            nuevaAsignacion.setSucursal(nuevaSucursal);
            nuevaAsignacion.setActivo(true);
            usuarioSucursalRepository.save(nuevaAsignacion);
            sucursalFinal = nuevaSucursal;
        }

        if (request.getTurnos() != null) {
            validarTurnos(request.getTurnos());
            horarioOperadorRepository.deleteByOperadorId(operador.getId());
            guardarTurnos(operador, request.getTurnos());
        }

        return toDto(operador, sucursalFinal);
    }

    public OperadorResponseDto getById(Usuario admin, Long id) {
        Operador operador = findOperadorOrThrow(id);
        Sucursal sucursal = findSucursalActualOrThrow(operador.getId());
        checkOwnership(admin, sucursal);
        return toDto(operador, sucursal);
    }

    public List<OperadorResponseDto> listBySucursal(Usuario admin, Long sucursalId) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);
        checkOwnership(admin, sucursal);
        return operadorRepository.findBySucursalIdActivo(sucursalId).stream()
                .map(o -> toDto(o, sucursal))
                .toList();
    }

    @Transactional
    public OperadorResponseDto setActivo(Usuario admin, Long id, boolean activo) {
        Operador operador = findOperadorOrThrow(id);
        Sucursal sucursal = findSucursalActualOrThrow(operador.getId());
        checkOwnership(admin, sucursal);
        operador.setActivo(activo);
        return toDto(operadorRepository.save(operador), sucursal);
    }

    @Transactional
    public OperadorResponseDto subirFoto(Usuario admin, Long id, MultipartFile archivo) {
        Operador operador = findOperadorOrThrow(id);
        Sucursal sucursal = findSucursalActualOrThrow(operador.getId());
        checkOwnership(admin, sucursal);

        if (operador.getFotoPerfilUrl() != null) {
            imagenStorageService.eliminar(operador.getFotoPerfilUrl());
        }
        String url = imagenStorageService.guardar(archivo, "img/operador/" + operador.getId());
        operador.setFotoPerfilUrl(url);

        return toDto(operadorRepository.save(operador), sucursal);
    }

    public OperadorResponseDto getPropioPerfil(Usuario usuario) {
        Operador operador = findOperadorOrThrow(usuario.getId());
        Sucursal sucursal = findSucursalActualOrThrow(operador.getId());
        return toDto(operador, sucursal);
    }

    private void checkOwnership(Usuario admin, Sucursal sucursal) {
        if (admin.getRol() == RolUsuario.SUPER_ADMIN) return;
        Long restauranteId = sucursal.getRestaurante().getId();
        if (!restauranteRepository.existsByIdAndUsuarioAdminId(restauranteId, admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No tenés permisos sobre esta sucursal");
        }
    }

    private void validarTurnos(List<TurnoOperadorRequestDto> turnos) {
        if (turnos == null || turnos.isEmpty()) return;

        Set<String> claves = new HashSet<>();
        for (TurnoOperadorRequestDto t : turnos) {
            if (t.getHoraInicio().equals(t.getHoraFin())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "horaInicio y horaFin no pueden ser iguales");
            }
            String clave = t.getDiaSemana() + "-" + t.getOrdenTurno();
            if (!claves.add(clave)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Turno duplicado para " + t.getDiaSemana() + " orden " + t.getOrdenTurno());
            }
        }
    }

    private void guardarTurnos(Operador operador, List<TurnoOperadorRequestDto> turnos) {
        if (turnos == null) return;
        for (TurnoOperadorRequestDto t : turnos) {
            HorarioOperador horario = new HorarioOperador();
            horario.setOperador(operador);
            horario.setDiaSemana(t.getDiaSemana());
            horario.setOrdenTurno(t.getOrdenTurno() != null ? t.getOrdenTurno() : 1);
            horario.setHoraInicio(t.getHoraInicio());
            horario.setHoraFin(t.getHoraFin());
            horario.setActivo(true);
            horarioOperadorRepository.save(horario);
        }
    }

    private boolean estaEnTurnoAhora(List<HorarioOperador> turnos) {
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        DiaSemana diaHoy = mapDia(hoy.getDayOfWeek());
        DiaSemana diaAyer = mapDia(hoy.minusDays(1).getDayOfWeek());

        for (HorarioOperador t : turnos) {
            if (!Boolean.TRUE.equals(t.getActivo())) continue;

            if (t.getDiaSemana() == diaHoy) {
                if (!t.cruzaMedianoche()) {
                    if (!ahora.isBefore(t.getHoraInicio()) && ahora.isBefore(t.getHoraFin())) return true;
                } else if (!ahora.isBefore(t.getHoraInicio())) {
                    return true;
                }
            }
            if (t.getDiaSemana() == diaAyer && t.cruzaMedianoche() && ahora.isBefore(t.getHoraFin())) {
                return true;
            }
        }
        return false;
    }

    private DiaSemana mapDia(DayOfWeek dia) {
        return DiaSemana.valueOf(dia.name());
    }

    private Operador findOperadorOrThrow(Long id) {
        return operadorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Operador no encontrado"));
    }

    private Sucursal findSucursalOrThrow(Long id) {
        return sucursalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private Sucursal findSucursalActualOrThrow(Long operadorId) {
        UsuarioSucursal asignacion = usuarioSucursalRepository.findByUsuarioIdAndActivoTrue(operadorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "El operador no tiene una sucursal asignada"));
        return asignacion.getSucursal();
    }

    private OperadorResponseDto toDto(Operador o, Sucursal sucursal) {
        List<HorarioOperador> turnos = horarioOperadorRepository
                .findByOperadorIdAndActivoTrueOrderByDiaSemanaAscOrdenTurnoAsc(o.getId());

        List<TurnoOperadorResponseDto> turnosDto = turnos.stream()
                .map(t -> new TurnoOperadorResponseDto(
                        t.getId(), t.getDiaSemana(), t.getOrdenTurno(),
                        t.getHoraInicio(), t.getHoraFin(), t.cruzaMedianoche()))
                .toList();

        return new OperadorResponseDto(
                o.getId(),
                o.getNombreCompleto(),
                o.getEmail(),
                o.getTelefono(),
                o.getDni(),
                o.getFotoPerfilUrl(),
                sucursal.getId(),
                sucursal.getNombre(),
                o.getActivo(),
                estaEnTurnoAhora(turnos),
                turnosDto
        );
    }
}
