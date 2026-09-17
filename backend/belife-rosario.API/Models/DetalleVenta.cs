namespace Belife.API.Models;

public class DetalleVenta
{
    public int Id { get; set; }

    public int VentaId { get; set; }

    public int? ProductoId { get; set; }

    public int Cantidad { get; set; }

    // Precio del producto al momento de la venta
    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }

    // Snapshot del nombre del producto al momento de la venta
    public string? ProductoNombre { get; set; }

    public Venta Venta { get; set; } = null!;

    public Producto? Producto { get; set; }
}