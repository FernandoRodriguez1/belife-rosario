namespace Belife.API.Models;

public class HistorialPrecio
{
    public int Id { get; set; }

    public int ProductoId { get; set; }

    public decimal PrecioAnterior { get; set; }

    public decimal PrecioNuevo { get; set; }

    public DateTime Fecha { get; set; }

    public int AdministradorId { get; set; }

    // Relaciones
    public Producto Producto { get; set; } = null!;

    public Administrador Administrador { get; set; } = null!;
}