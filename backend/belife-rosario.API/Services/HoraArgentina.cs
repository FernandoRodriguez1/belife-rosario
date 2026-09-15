namespace Belife.API.Services;

public static class HoraArgentina
{
    public static DateTime Ahora()
    {
        var zona = TimeZoneInfo.FindSystemTimeZoneById(
            "America/Argentina/Buenos_Aires"
        );

        return DateTime.SpecifyKind(
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zona),
            DateTimeKind.Unspecified
        );
    }
}