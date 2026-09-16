

using Belife.API.Enums;

namespace Belife.API.Models;

public class Producto
{
    public int Id { get; set; }

    public string? Codigo { get; set; }

    public string Nombre { get; set; } = null!;

    public int CategoriaId { get; set; }

    public int MarcaId { get; set; }

    public decimal PrecioActual { get; set; }

    public int Stock { get; set; }

    public bool Estado { get; set; } = true;

    public UnidadMedida UnidadMedida { get; set; }

    public UnidadPrecio? UnidadPrecio { get; set; }

    public DateTime FechaCreacion { get; set; }

    public DateTime FechaUltimaModificacion { get; set; }

    // Relaciones
    public Categoria Categoria { get; set; } = null!;

    public Marca Marca { get; set; } = null!;

    // Relación 1:N con HistorialPrecio
    public ICollection<HistorialPrecio> HistorialPrecios { get; set; }
        = new List<HistorialPrecio>();

    public ICollection<DetalleVenta> DetallesVenta { get; set; }
    = new List<DetalleVenta>();
}