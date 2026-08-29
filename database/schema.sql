-- =========================================================
-- SISTEMA DE ASISTENCIA PARA MAESTROS
-- Base de datos: MySQL 8+
-- =========================================================

CREATE DATABASE IF NOT EXISTS asistencia_maestros
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE asistencia_maestros;


-- =========================================================
-- 1. USUARIOS
-- =========================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    rol ENUM(
        'admin',
        'responsable',
        'maestro'
    ) NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =========================================================
-- 2. MAESTROS
-- =========================================================

CREATE TABLE maestros (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL UNIQUE,
    numero_empleado VARCHAR(50) NOT NULL UNIQUE,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_maestro_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- =========================================================
-- 3. MATERIAS
-- =========================================================

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,
    clave VARCHAR(20) NOT NULL UNIQUE,

    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;


-- =========================================================
-- 4. AULAS
-- =========================================================

CREATE TABLE aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    -- UUID que identifica al aula mediante el QR.
    -- El valor permanece fijo mientras el aula exista.
    qr_token CHAR(36) NOT NULL UNIQUE,

    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;


-- =========================================================
-- 5. HORARIOS
-- =========================================================

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    maestro_id INT NOT NULL,
    materia_id INT NOT NULL,
    aula_id INT NOT NULL,

    dia_semana ENUM(
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado'
    ) NOT NULL,

    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_horario_maestro
        FOREIGN KEY (maestro_id)
        REFERENCES maestros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_horario_materia
        FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_horario_aula
        FOREIGN KEY (aula_id)
        REFERENCES aulas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Evita que un maestro tenga dos horarios
    -- comenzando exactamente a la misma hora
    -- el mismo día.
    CONSTRAINT uq_horario_maestro_dia_hora
        UNIQUE (maestro_id, dia_semana, hora_inicio),

    -- La hora de finalización debe ser posterior
    -- a la hora de inicio.
    CONSTRAINT chk_horario_horas
        CHECK (hora_fin > hora_inicio)

) ENGINE=InnoDB;


-- =========================================================
-- 6. ASISTENCIAS
-- =========================================================

CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,

    horario_id INT NOT NULL,
    aula_id INT NOT NULL,

    fecha DATE NOT NULL,

    -- NULL cuando la asistencia es una FALTA
    -- generada automáticamente por el sistema.
    hora_registro DATETIME NULL,

    estado ENUM(
        'PRESENTE',
        'RETARDO',
        'FALTA'
    ) NOT NULL,

    tipo_registro ENUM(
        'QR',
        'MANUAL',
        'AUTOMATICO'
    ) NOT NULL,

    motivo VARCHAR(255) NULL,

    -- Usuario responsable de registrar manualmente.
    responsable_id INT NULL,

    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asistencia_horario
        FOREIGN KEY (horario_id)
        REFERENCES horarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_asistencia_aula
        FOREIGN KEY (aula_id)
        REFERENCES aulas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_asistencia_responsable
        FOREIGN KEY (responsable_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Una clase solo puede tener una asistencia
    -- por día.
    CONSTRAINT uq_asistencia_horario_fecha
        UNIQUE (horario_id, fecha)

) ENGINE=InnoDB;


-- =========================================================
-- 7. CONFIGURACIÓN
-- =========================================================

CREATE TABLE configuracion (
    clave VARCHAR(100) PRIMARY KEY,

    valor VARCHAR(255) NOT NULL,

    descripcion VARCHAR(255) NULL
) ENGINE=InnoDB;


-- =========================================================
-- 8. ÍNDICES
-- =========================================================

CREATE INDEX idx_horarios_maestro
    ON horarios(maestro_id);

CREATE INDEX idx_horarios_aula
    ON horarios(aula_id);

CREATE INDEX idx_horarios_materia
    ON horarios(materia_id);

CREATE INDEX idx_asistencias_fecha
    ON asistencias(fecha);

CREATE INDEX idx_asistencias_aula
    ON asistencias(aula_id);

CREATE INDEX idx_asistencias_responsable
    ON asistencias(responsable_id);