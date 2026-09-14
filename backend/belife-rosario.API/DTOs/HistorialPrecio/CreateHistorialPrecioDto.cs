namespace Belife.API.DTOs.HistorialPrecio;

public class CreateHistorialPrecioDto
{
    public int ProductoId { get; set; }

    public decimal PrecioNuevo { get; set; }

    public int AdministradorId { get; set; }
}