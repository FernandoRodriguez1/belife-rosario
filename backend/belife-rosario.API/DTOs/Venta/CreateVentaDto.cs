using Belife.API.DTOs.DetalleVenta;
using Belife.API.Enums;

namespace Belife.API.DTOs.Venta;

public class CreateVentaDto
{
    public FormaPago? FormaPago { get; set; }

    public List<CreateDetalleVentaDto> Detalles { get; set; } = new();
}