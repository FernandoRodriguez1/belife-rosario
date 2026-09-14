using Belife.API.DTOs.DetalleVenta;
using Belife.API.Enums;

namespace Belife.API.DTOs.Venta;

public class VentaResponseDto
{
    public int Id { get; set; }

    public decimal Monto { get; set; }

    public FormaPago? FormaPago { get; set; }

    public DateTime FechaHora { get; set; }

    public int CantidadDetalles { get; set; }

    public List<DetalleVentaResponseDto> Detalles { get; set; } = new();
}