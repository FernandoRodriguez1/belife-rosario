namespace Belife.API.DTOs.Administrador;

public class AdministradorResponseDto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Activo { get; set; }
}