using Belife.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Data;

public class BelifeDbContext : DbContext
{
    public BelifeDbContext(DbContextOptions<BelifeDbContext> options)
        : base(options)
    {
    }

    public DbSet<Administrador> Administradores => Set<Administrador>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Marca> Marcas => Set<Marca>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<HistorialPrecio> HistorialPrecios => Set<HistorialPrecio>();

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
            entity.ToTable("producto");

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

            entity.Property(p => p.FechaCreacion)
                .HasColumnName("fecha_creacion")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .IsRequired();

            entity.Property(p => p.FechaUltimaModificacion)
                .HasColumnName("fecha_ultima_modificacion")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
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
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
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
    }
}