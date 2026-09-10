

namespace Belife.API.Models;

public class Marca
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    // Relación 1:N con Producto
    public ICollection<Producto> Productos { get; set; }
        = new List<Producto>();
}