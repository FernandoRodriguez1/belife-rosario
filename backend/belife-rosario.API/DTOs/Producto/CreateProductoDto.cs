using Belife.API.Enums;

namespace Belife.API.DTOs.Producto;

public class CreateProductoDto
{
    public string? Codigo { get; set; }

    public string Nombre { get; set; } = null!;

    public int CategoriaId { get; set; }

    public int MarcaId { get; set; }

    public decimal PrecioActual { get; set; }

    public int Stock { get; set; }

    public bool Estado { get; set; } = true;

    public UnidadMedida UnidadMedida { get; set; }
}