namespace Belife.API.DTOs.HistorialPrecio;

public class HistorialPrecioResponseDto
{
    public int Id { get; set; }

    public int ProductoId { get; set; }

    public string ProductoNombre { get; set; } = null!;

    public decimal PrecioAnterior { get; set; }

    public decimal PrecioNuevo { get; set; }

    public DateTime Fecha { get; set; }

    public int AdministradorId { get; set; }

    public string AdministradorNombre { get; set; } = null!;
}