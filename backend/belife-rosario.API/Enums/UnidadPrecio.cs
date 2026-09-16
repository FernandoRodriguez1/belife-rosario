using System.Text.Json;
using System.Text.Json.Serialization;

namespace Belife.API.Enums;

[JsonConverter(typeof(UnidadPrecioJsonConverter))]
public enum UnidadPrecio
{
    PorKilo,
    Por100Gramos
}

public class UnidadPrecioJsonConverter : JsonConverter<UnidadPrecio>
{
    private static readonly Dictionary<UnidadPrecio, string> Map = new()
    {
        [UnidadPrecio.PorKilo] = "Por-Kilo",
        [UnidadPrecio.Por100Gramos] = "Por-100-Gramos"
    };

    public override UnidadPrecio Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        var valor = reader.GetString();

        foreach (var entrada in Map)
        {
            if (entrada.Value == valor)
                return entrada.Key;
        }

        throw new JsonException($"Valor inválido para UnidadPrecio: '{valor}'.");
    }

    public override void Write(
        Utf8JsonWriter writer,
        UnidadPrecio value,
        JsonSerializerOptions options)
    {
        writer.WriteStringValue(Map[value]);
    }
}