using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Finalproj.Application.Common.Json;

/// <summary>
/// Aceita "HH:mm" (input HTML time) e "HH:mm:ss" na deserialização JSON de TimeSpan.
/// </summary>
public sealed class FlexibleTimeSpanJsonConverter : JsonConverter<TimeSpan?>
{
    private static readonly Regex HhMm = new(@"^\d{1,2}:\d{2}$", RegexOptions.CultureInvariant);

    public override TimeSpan? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;

        var s = reader.GetString();
        if (string.IsNullOrWhiteSpace(s))
            return null;

        if (TimeSpan.TryParse(s, out var ts))
            return ts;

        if (HhMm.IsMatch(s) && TimeSpan.TryParse($"{s}:00", out ts))
            return ts;

        throw new JsonException($"Formato de hora inválido: «{s}». Use HH:mm ou HH:mm:ss.");
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan? value, JsonSerializerOptions options)
    {
        if (!value.HasValue)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStringValue(value.Value.ToString(@"hh\:mm\:ss"));
    }
}
