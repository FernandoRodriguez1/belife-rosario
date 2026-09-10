CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    precio_actual NUMERIC(12, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE historial_precios (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    precio_anterior NUMERIC(12, 2) NOT NULL,
    precio_nuevo NUMERIC(12, 2) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    administrador_id INTEGER NOT NULL,

    CONSTRAINT fk_historial_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id),

    CONSTRAINT fk_historial_administrador
        FOREIGN KEY (administrador_id)
        REFERENCES administradores(id)
);


CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

ALTER TABLE productos
DROP COLUMN categoria,
DROP COLUMN marca;

ALTER TABLE productos
ADD COLUMN categoria_id INTEGER NOT NULL,
ADD COLUMN marca_id INTEGER NOT NULL;


ALTER TABLE productos
ADD CONSTRAINT fk_producto_categoria
    FOREIGN KEY (categoria_id)
    REFERENCES categorias(id);

ALTER TABLE productos
ADD CONSTRAINT fk_producto_marca
    FOREIGN KEY (marca_id)
    REFERENCES marcas(id);

	ALTER TABLE administradores RENAME TO administrador;
ALTER TABLE productos RENAME TO producto;
ALTER TABLE categorias RENAME TO categoria;
ALTER TABLE marcas RENAME TO marca;
ALTER TABLE historial_precios RENAME TO historial_precio;