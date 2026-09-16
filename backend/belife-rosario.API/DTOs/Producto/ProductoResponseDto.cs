using Belife.API.Enums;

namespace Belife.API.DTOs.Producto;

public class ProductoResponseDto
{
    public int Id { get; set; }

    public string? Codigo { get; set; }

    public string Nombre { get; set; } = null!;

    public int CategoriaId { get; set; }

    public string CategoriaNombre { get; set; } = null!;

    public int MarcaId { get; set; }

    public string MarcaNombre { get; set; } = null!;

    public decimal PrecioActual { get; set; }

    public int Stock { get; set; }

    public bool Estado { get; set; }

    public UnidadMedida UnidadMedida { get; set; }

    public DateTime FechaCreacion { get; set; }

    public DateTime FechaUltimaModificacion { get; set; }
}