using Belife.API.Enums;

namespace Belife.API.DTOs.DetalleVenta;

public class DetalleVentaResponseDto
{
    public int Id { get; set; }

    public int VentaId { get; set; }

    public int? ProductoId { get; set; }

    public string? ProductoNombre { get; set; }

    public UnidadMedida? UnidadMedida { get; set; }

    public UnidadPrecio? UnidadPrecio { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }
}