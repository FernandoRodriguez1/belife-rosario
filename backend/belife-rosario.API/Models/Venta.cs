using Belife.API.Enums;

namespace Belife.API.Models;

public class Venta
{
    public int Id { get; set; }

    // Importe total de la venta
    public decimal Monto { get; set; }

    public FormaPago? FormaPago { get; set; }

    public DateTime FechaHora { get; set; }

    public ICollection<DetalleVenta> Detalles { get; set; }
        = new List<DetalleVenta>();
}