using System.Text.Json.Serialization;

namespace Belife.API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UnidadMedida
{
    Gramos,
    Unidad
}