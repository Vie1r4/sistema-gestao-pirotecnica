namespace Finalproj.Domain.Entities;

// Distância entre coordenadas (Haversine) e formatação para exibição
public static class GeoHelper
{
    private const double RaioTerraKm = 6371;

    public static double CalcularDistanciaKm(decimal lat1, decimal lng1, decimal lat2, decimal lng2)
    {
        var lat1Rad = GrausParaRadianos(lat1);
        var lat2Rad = GrausParaRadianos(lat2);
        var deltaLat = GrausParaRadianos(lat2 - lat1);
        var deltaLng = GrausParaRadianos(lng2 - lng1);
        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1Rad) * Math.Cos(lat2Rad) * Math.Sin(deltaLng / 2) * Math.Sin(deltaLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return RaioTerraKm * c;
    }

    private static double GrausParaRadianos(decimal graus)
    {
        return (double)graus * Math.PI / 180;
    }

    public static string FormatarDistancia(double distanciaKm)
    {
        if (distanciaKm < 1)
            return $"{(int)(distanciaKm * 1000)} m";
        return $"{distanciaKm:F1} km";
    }
}
