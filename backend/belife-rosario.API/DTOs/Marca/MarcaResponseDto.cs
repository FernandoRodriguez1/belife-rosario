namespace Belife.API.DTOs.Marca;

public class MarcaResponseDto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public int CantidadProductos { get; set; }
}