namespace Belife.API.Models;

public class Administrador
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public bool Activo { get; set; } = true;

    // Relación 1:N con HistorialPrecio
    public ICollection<HistorialPrecio> HistorialPrecios { get; set; }
        = new List<HistorialPrecio>();
}
