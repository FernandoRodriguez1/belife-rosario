namespace Belife.API.DTOs.DetalleVenta;

public class CreateDetalleVentaDto
{
    public int ProductoId { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }
}