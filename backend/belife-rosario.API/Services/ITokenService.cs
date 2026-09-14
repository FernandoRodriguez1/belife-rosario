using Belife.API.Models;

namespace Belife.API.Services;

public interface ITokenService
{
    string GenerarToken(Administrador administrador);
}