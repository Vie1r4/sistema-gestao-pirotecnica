# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Stage 2: SDK image for restoring and building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files for NuGet restore
COPY ["src/Finalproj.Api/Finalproj.Api.csproj", "src/Finalproj.Api/"]
COPY ["src/Finalproj.Application/Finalproj.Application.csproj", "src/Finalproj.Application/"]
COPY ["src/Finalproj.Domain/Finalproj.Domain.csproj", "src/Finalproj.Domain/"]
COPY ["src/Finalproj.Infrastructure/Finalproj.Infrastructure.csproj", "src/Finalproj.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/Finalproj.Api/Finalproj.Api.csproj"

# Copy all source files
COPY src/ src/

# Publish the API
WORKDIR "/src/src/Finalproj.Api"
RUN dotnet publish "Finalproj.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Final execution image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Ensure data directories exist for backups and uploads
RUN mkdir -p /app/PirofafeData/Uploads /app/PirofafeData/Backups

ENTRYPOINT ["dotnet", "Finalproj.Api.dll"]
