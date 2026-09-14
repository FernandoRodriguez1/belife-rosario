namespace Belife.API.DTOs.HistorialPrecio;

public class UpdateHistorialPrecioDto
{
    public int Id { get; set; }

    public int ProductoId { get; set; }

    public decimal PrecioNuevo { get; set; }

    public int AdministradorId { get; set; }
}