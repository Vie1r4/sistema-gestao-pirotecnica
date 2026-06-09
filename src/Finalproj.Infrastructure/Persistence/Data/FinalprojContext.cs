using Finalproj.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Persistence.Data;

// DbContext principal: Identity + Paióis, Produtos, Encomendas, Serviços, Log. Configurações de precisão e cascatas em OnModelCreating.
public class FinalprojContext : IdentityDbContext<Microsoft.AspNetCore.Identity.IdentityUser>
{
    public FinalprojContext(DbContextOptions<FinalprojContext> options)
        : base(options)
    {
    }

    public DbSet<Paiol> Paiol => Set<Paiol>();
        public DbSet<PaiolDocumentoExtra> PaiolDocumentoExtras => Set<PaiolDocumentoExtra>();
        public DbSet<Perfil> Perfis => Set<Perfil>();
        public DbSet<Funcionario> Funcionarios => Set<Funcionario>();
        public DbSet<FuncionarioDocumentoExtra> FuncionarioDocumentoExtras => Set<FuncionarioDocumentoExtra>();
        public DbSet<Cliente> Clientes => Set<Cliente>();
        public DbSet<ClienteDocumentoExtra> ClienteDocumentoExtras => Set<ClienteDocumentoExtra>();
        public DbSet<Produto> Produtos => Set<Produto>();
        public DbSet<Compilado> Compilados => Set<Compilado>();
        public DbSet<CompiladoItem> CompiladoItens => Set<CompiladoItem>();
        public DbSet<EntradaPaiol> EntradasPaiol => Set<EntradaPaiol>();
        public DbSet<PaiolAcesso> PaiolAcessos => Set<PaiolAcesso>();
        public DbSet<SaidaPaiol> SaidasPaiol => Set<SaidaPaiol>();
        public DbSet<Encomenda> Encomendas => Set<Encomenda>();
        public DbSet<EncomendaItem> EncomendaItems => Set<EncomendaItem>();
        public DbSet<Reserva> Reservas => Set<Reserva>();
        public DbSet<Servico> Servicos => Set<Servico>();
        public DbSet<ServicoDocumentoExtra> ServicoDocumentoExtras => Set<ServicoDocumentoExtra>();
        public DbSet<ServicoEquipa> ServicoEquipas => Set<ServicoEquipa>();
        public DbSet<ServicoLicenca> ServicoLicencas => Set<ServicoLicenca>();
        public DbSet<ServicoDistanciaSeguranca> ServicoDistanciasSeguranca => Set<ServicoDistanciaSeguranca>();
        public DbSet<ServicoZonaLancamento> ServicoZonasLancamento => Set<ServicoZonaLancamento>();
        public DbSet<ServicoZonaLinha> ServicoZonaLinhas => Set<ServicoZonaLinha>();
        public DbSet<ServicoZonaDistanciaSeguranca> ServicoZonaDistanciasSeguranca => Set<ServicoZonaDistanciaSeguranca>();
        public DbSet<LogSistema> LogSistema => Set<LogSistema>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Precisão decimal e relações
            modelBuilder.Entity<Paiol>()
                .Property(p => p.LimiteMLE)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PaiolDocumentoExtra>()
                .HasOne(d => d.Paiol)
                .WithMany(p => p.DocumentosExtras)
                .HasForeignKey(d => d.PaiolId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Produto>()
                .Property(p => p.NEMPorUnidade)
                .HasPrecision(18, 4);

            modelBuilder.Entity<Compilado>()
                .HasIndex(c => c.Nome);

            modelBuilder.Entity<CompiladoItem>()
                .Property(i => i.QuantidadePorUnidade)
                .HasPrecision(18, 4);

            modelBuilder.Entity<CompiladoItem>()
                .HasOne(i => i.Compilado)
                .WithMany(c => c.Itens)
                .HasForeignKey(i => i.CompiladoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CompiladoItem>()
                .HasOne(i => i.Produto)
                .WithMany()
                .HasForeignKey(i => i.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CompiladoItem>()
                .HasIndex(i => new { i.CompiladoId, i.ProdutoId })
                .IsUnique();

            modelBuilder.Entity<EntradaPaiol>()
                .Property(e => e.Quantidade)
                .HasPrecision(18, 4);

            modelBuilder.Entity<EntradaPaiol>()
                .HasOne(e => e.Paiol)
                .WithMany()
                .HasForeignKey(e => e.PaiolId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EntradaPaiol>()
                .HasOne(e => e.Produto)
                .WithMany()
                .HasForeignKey(e => e.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PaiolAcesso>()
                .HasOne(a => a.Paiol)
                .WithMany()
                .HasForeignKey(a => a.PaiolId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SaidaPaiol>()
                .Property(s => s.Quantidade)
                .HasPrecision(18, 4);

            modelBuilder.Entity<SaidaPaiol>()
                .HasOne(s => s.Paiol)
                .WithMany()
                .HasForeignKey(s => s.PaiolId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SaidaPaiol>()
                .HasOne(s => s.Produto)
                .WithMany()
                .HasForeignKey(s => s.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Encomenda>()
                .HasOne(e => e.Cliente)
                .WithMany()
                .HasForeignKey(e => e.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Encomenda>()
                .HasOne(e => e.CoordenadorPirotecnico)
                .WithMany()
                .HasForeignKey(e => e.CoordenadorPirotecnicoId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<EncomendaItem>()
                .HasOne(i => i.Encomenda)
                .WithMany(e => e.Itens)
                .HasForeignKey(i => i.EncomendaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EncomendaItem>()
                .HasOne(i => i.Produto)
                .WithMany()
                .HasForeignKey(i => i.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Encomenda)
                .WithMany()
                .HasForeignKey(r => r.EncomendaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Servico>()
                .HasOne(s => s.Encomenda)
                .WithMany(e => e.Servicos)
                .HasForeignKey(s => s.EncomendaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Servico>()
                .HasIndex(s => s.EncomendaId)
                .IsUnique();

            modelBuilder.Entity<Servico>()
                .Property(s => s.CoordenadasLat)
                .HasPrecision(18, 9);
            modelBuilder.Entity<Servico>()
                .Property(s => s.CoordenadasLng)
                .HasPrecision(18, 9);

            modelBuilder.Entity<Servico>()
                .HasOne(s => s.Cliente)
                .WithMany()
                .HasForeignKey(s => s.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Servico>()
                .HasOne(s => s.ResponsavelTecnico)
                .WithMany()
                .HasForeignKey(s => s.ResponsavelTecnicoId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Servico>()
                .HasOne(s => s.CoordenadorPirotecnico)
                .WithMany()
                .HasForeignKey(s => s.CoordenadorPirotecnicoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServicoDocumentoExtra>()
                .HasOne(d => d.Servico)
                .WithMany(s => s.DocumentosExtras)
                .HasForeignKey(d => d.ServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServicoEquipa>()
                .HasOne(se => se.Servico)
                .WithMany(s => s.Equipa)
                .HasForeignKey(se => se.ServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServicoEquipa>()
                .HasOne(se => se.Funcionario)
                .WithMany()
                .HasForeignKey(se => se.FuncionarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServicoEquipa>()
                .HasIndex(se => new { se.ServicoId, se.FuncionarioId })
                .IsUnique();

            modelBuilder.Entity<ServicoLicenca>()
                .HasOne(l => l.Servico)
                .WithMany(s => s.Licencas)
                .HasForeignKey(l => l.ServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServicoDistanciaSeguranca>()
                .HasOne(d => d.Servico)
                .WithMany(s => s.DistanciasSeguranca)
                .HasForeignKey(d => d.ServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServicoZonaLancamento>()
                .HasOne(z => z.Servico)
                .WithMany(s => s.ZonasLancamento)
                .HasForeignKey(z => z.ServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServicoZonaLancamento>()
                .HasOne(z => z.ResponsavelPirotecnico)
                .WithMany()
                .HasForeignKey(z => z.ResponsavelPirotecnicoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServicoZonaLancamento>()
                .Property(z => z.CoordenadasLat)
                .HasPrecision(18, 9);
            modelBuilder.Entity<ServicoZonaLancamento>()
                .Property(z => z.CoordenadasLng)
                .HasPrecision(18, 9);

            modelBuilder.Entity<ServicoZonaLinha>()
                .HasOne(l => l.Zona)
                .WithMany(z => z.Linhas)
                .HasForeignKey(l => l.ZonaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServicoZonaLinha>()
                .HasOne(l => l.Produto)
                .WithMany()
                .HasForeignKey(l => l.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServicoZonaLinha>()
                .Property(l => l.Quantidade)
                .HasPrecision(18, 4);

            modelBuilder.Entity<ServicoZonaDistanciaSeguranca>()
                .HasOne(d => d.Zona)
                .WithMany(z => z.DistanciasSeguranca)
                .HasForeignKey(d => d.ZonaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Paiol>()
                .Property(p => p.CoordenadasLat)
                .HasPrecision(18, 14);
            modelBuilder.Entity<Paiol>()
                .Property(p => p.CoordenadasLng)
                .HasPrecision(18, 14);

            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Produto)
                .WithMany()
                .HasForeignKey(r => r.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reserva>()
                .HasIndex(r => new { r.EncomendaId, r.ProdutoId })
                .IsUnique();

            modelBuilder.Entity<EncomendaItem>()
                .Property(i => i.QuantidadePedida)
                .HasPrecision(18, 4);

            modelBuilder.Entity<Reserva>()
                .Property(r => r.Quantidade)
                .HasPrecision(18, 4);

            modelBuilder.Entity<SaidaPaiol>()
                .HasOne(s => s.EntradaPaiol)
                .WithMany()
                .HasForeignKey(s => s.EntradaPaiolId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FuncionarioDocumentoExtra>()
                .HasOne(d => d.Funcionario)
                .WithMany(f => f.DocumentosExtras)
                .HasForeignKey(d => d.FuncionarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ClienteDocumentoExtra>()
                .HasOne(d => d.Cliente)
                .WithMany(c => c.DocumentosExtras)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(r => r.TokenHash);
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(r => new { r.UserId, r.RevokedAtUtc });
        }
    }
