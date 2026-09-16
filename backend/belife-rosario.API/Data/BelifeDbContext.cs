using Belife.API.Models;
using Belife.API.Services;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Data;

public class BelifeDbContext : DbContext
{
    public BelifeDbContext(DbContextOptions<BelifeDbContext> options)
        : base(options)
    {
    }

    public DbSet<Administrador> Administradores { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Marca> Marcas { get; set; }
    public DbSet<Producto> Productos { get; set; }
    public DbSet<HistorialPrecio> HistorialPrecios { get; set; }
    public DbSet<Venta> Ventas { get; set; }
    public DbSet<DetalleVenta> DetallesVenta { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================================================
        // ADMINISTRADOR
        // =========================================================

        modelBuilder.Entity<Administrador>(entity =>
        {
            entity.ToTable("administrador");

            entity.HasKey(a => a.Id);

            entity.Property(a => a.Id)
                .HasColumnName("id");

            entity.HasIndex(a => a.Nombre)
                .IsUnique();

            entity.Property(a => a.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(a => a.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(a => a.Activo)
                .HasColumnName("activo")
                .HasDefaultValue(true)
                .IsRequired();
        });


        // =========================================================
        // CATEGORIA
        // =========================================================

        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.ToTable("categoria");

            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id)
                .HasColumnName("id");

            entity.Property(c => c.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.HasIndex(c => c.Nombre)
                .IsUnique();
        });


        // =========================================================
        // MARCA
        // =========================================================

        modelBuilder.Entity<Marca>(entity =>
        {
            entity.ToTable("marca");

            entity.HasKey(m => m.Id);

            entity.Property(m => m.Id)
                .HasColumnName("id");

            entity.Property(m => m.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.HasIndex(m => m.Nombre)
                .IsUnique();
        });


        // =========================================================
        // PRODUCTO
        // =========================================================

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("producto", table =>
            {
                table.HasCheckConstraint(
                    "ck_producto_precio_actual",
                    "precio_actual >= 0");

                table.HasCheckConstraint(
                    "ck_producto_stock",
                    "stock >= 0");

                table.HasCheckConstraint(
                    "ck_producto_unidad_precio",
                    "unidad_precio IS NULL OR unidad_precio IN ('PorKilo', 'Por100Gramos')");
            });

            entity.HasKey(p => p.Id);

            entity.Property(p => p.Id)
                .HasColumnName("id");

            entity.Property(p => p.Codigo)
                .HasColumnName("codigo")
                .HasMaxLength(50);

            entity.HasIndex(p => p.Codigo)
                .IsUnique();

            entity.Property(p => p.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(150)
                .IsRequired();

            entity.HasIndex(p => new { p.Nombre, p.MarcaId })
                .IsUnique()
                .HasDatabaseName("ix_producto_nombre_marca");

            entity.Property(p => p.CategoriaId)
                .HasColumnName("categoria_id")
                .IsRequired();

            entity.Property(p => p.MarcaId)
                .HasColumnName("marca_id")
                .IsRequired();

            entity.Property(p => p.PrecioActual)
                .HasColumnName("precio_actual")
                .HasPrecision(12, 2)
                .IsRequired();

            entity.Property(p => p.Stock)
                .HasColumnName("stock")
                .HasDefaultValue(0)
                .IsRequired();

            entity.Property(p => p.Estado)
                .HasColumnName("estado")
                .HasDefaultValue(true)
                .IsRequired();

            entity.Property(p => p.UnidadMedida)
                .HasColumnName("unidad_medida")
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(p => p.UnidadPrecio)
                .HasColumnName("unidad_precio")
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(p => p.FechaCreacion)
                .HasColumnName("fecha_creacion")
                .HasColumnType("timestamp without time zone")
                 .HasDefaultValueSql(
        "CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires'"
    )
                .IsRequired();

            entity.Property(p => p.FechaUltimaModificacion)
                .HasColumnName("fecha_ultima_modificacion")
                .HasColumnType("timestamp without time zone")
                 .HasDefaultValueSql(
        "CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires'"
    )
                .IsRequired();


            // Producto → Categoria

            entity.HasOne(p => p.Categoria)
                .WithMany(c => c.Productos)
                .HasForeignKey(p => p.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);


            // Producto → Marca

            entity.HasOne(p => p.Marca)
                .WithMany(m => m.Productos)
                .HasForeignKey(p => p.MarcaId)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // =========================================================
        // HISTORIAL PRECIO
        // =========================================================

        modelBuilder.Entity<HistorialPrecio>(entity =>
        {
            entity.ToTable("historial_precio");

            entity.HasKey(h => h.Id);

            entity.Property(h => h.Id)
                .HasColumnName("id");

            entity.Property(h => h.ProductoId)
                .HasColumnName("producto_id")
                .IsRequired();

            entity.Property(h => h.PrecioAnterior)
                .HasColumnName("precio_anterior")
                .HasPrecision(12, 2)
                .IsRequired();

            entity.Property(h => h.PrecioNuevo)
                .HasColumnName("precio_nuevo")
                .HasPrecision(12, 2)
                .IsRequired();

            entity.Property(h => h.Fecha)
                .HasColumnName("fecha")
                .HasColumnType("timestamp without time zone")
                 .HasDefaultValueSql(
        "CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires'"
    )
                .IsRequired();



            entity.Property(h => h.AdministradorId)
                .HasColumnName("administrador_id")
                .IsRequired();


            // HistorialPrecio → Producto

            entity.HasOne(h => h.Producto)
                .WithMany(p => p.HistorialPrecios)
                .HasForeignKey(h => h.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);


            // HistorialPrecio → Administrador

            entity.HasOne(h => h.Administrador)
                .WithMany(a => a.HistorialPrecios)
                .HasForeignKey(h => h.AdministradorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================
        // VENTAS
        // =========================================================
        modelBuilder.Entity<Venta>(entity =>
        {
            entity.ToTable("venta", table =>
            {
                table.HasCheckConstraint(
                    "ck_venta_monto",
                    "monto >= 0");
            });

            entity.HasKey(v => v.Id);

            entity.Property(v => v.Id)
                .HasColumnName("id");

            entity.Property(v => v.Monto)
                .HasColumnName("monto")
                .HasPrecision(12, 2)
                .IsRequired();

            entity.Property(v => v.FormaPago)
                .HasColumnName("forma_pago")
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired(false);

            entity.Property(v => v.FechaHora)
                .HasColumnName("fecha_hora")
                .HasColumnType("timestamp without time zone")
                 .HasDefaultValueSql(
        "CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires'"
    )
                .IsRequired();



            entity.HasIndex(v => v.FechaHora)
                .HasDatabaseName("ix_venta_fecha_hora");
        });

        // =========================================================
        // DETALLE VENTA
        // =========================================================

        modelBuilder.Entity<DetalleVenta>(entity =>
        {
            entity.ToTable("detalle_venta", table =>
            {
                table.HasCheckConstraint(
                    "ck_detalle_venta_cantidad",
                    "cantidad > 0");

                table.HasCheckConstraint(
                    "ck_detalle_venta_precio_unitario",
                    "precio_unitario >= 0");

                table.HasCheckConstraint(
                    "ck_detalle_venta_subtotal",
                    "subtotal >= 0");
            });

            entity.HasKey(d => d.Id);

            entity.Property(d => d.Id)
                .HasColumnName("id");

            entity.Property(d => d.VentaId)
                .HasColumnName("venta_id")
                .IsRequired();

            entity.Property(d => d.ProductoId)
                .HasColumnName("producto_id")
                .IsRequired();

            entity.Property(d => d.Cantidad)
                .HasColumnName("cantidad")
                .IsRequired();

            entity.Property(d => d.PrecioUnitario)
                .HasColumnName("precio_unitario")
                .HasPrecision(12, 2)
                .IsRequired();

            entity.Property(d => d.Subtotal)
                .HasColumnName("subtotal")
                .HasPrecision(12, 2)
                .IsRequired();

            entity.HasIndex(d => d.VentaId)
                .HasDatabaseName("ix_detalle_venta_venta_id");

            entity.HasIndex(d => d.ProductoId)
                .HasDatabaseName("ix_detalle_venta_producto_id");

            entity.HasOne(d => d.Venta)
                .WithMany(v => v.Detalles)
                .HasForeignKey(d => d.VentaId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Producto)
                .WithMany(p => p.DetallesVenta)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }


    // =========================================================
    // ACTUALIZACIÓN AUTOMÁTICA DE FECHAS
    // =========================================================

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ActualizarFechasProductos();

        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ActualizarFechasProductos();

        return base.SaveChangesAsync(
            acceptAllChangesOnSuccess,
            cancellationToken);
    }

    private void ActualizarFechasProductos()
    {
        var ahora = HoraArgentina.Ahora();

        foreach (var entry in ChangeTracker.Entries<Producto>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.FechaCreacion = ahora;
                entry.Entity.FechaUltimaModificacion = ahora;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.FechaUltimaModificacion = ahora;
            }
        }
    }


}