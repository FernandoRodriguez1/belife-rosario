using Belife.API.Enums;

namespace Belife.API.DTOs.Venta;

public class UpdateVentaDto
{
    public int Id { get; set; }

    public FormaPago? FormaPago { get; set; }
}