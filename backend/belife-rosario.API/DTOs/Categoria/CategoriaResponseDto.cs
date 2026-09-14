namespace Belife.API.DTOs.Categoria;

public class CategoriaResponseDto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public int CantidadProductos { get; set; }
}