using Belife.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(
        BelifeDbContext context,
        IConfiguration configuration,
        ILogger logger)
    {
        if (await context.Administradores.AnyAsync())
            return;

        var nombre = configuration["InitialAdmin:Nombre"];
        var password = configuration["InitialAdmin:Password"];

        if (string.IsNullOrWhiteSpace(nombre) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "No se creó el admin inicial: faltan las env vars InitialAdmin__Nombre y/o InitialAdmin__Password.");
            return;
        }

        var hasher = new PasswordHasher<Administrador>();
        context.Administradores.Add(new Administrador
        {
            Nombre = nombre,
            PasswordHash = hasher.HashPassword(null!, password),
            Activo = true
        });

        await context.SaveChangesAsync();
        logger.LogInformation("Admin inicial '{Nombre}' creado.", nombre);
    }
}