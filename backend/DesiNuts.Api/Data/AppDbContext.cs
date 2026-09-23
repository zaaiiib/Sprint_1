using DesiNuts.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DesiNuts.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "Cashew Nuts (Kaju) Medium Sized",
                    ImageUrl = "assets/item1img.png",
                    Price100g = 130,
                    Price250g = 310,
                    Price500g = 590,
                    Price1000g = 1120,
                    Price2000g = 2180,
                    Price5000g = 5250
                },
                new Product
                {
                    Id = 2,
                    Name = "Premium Jumbo Almonds",
                    ImageUrl = "assets/item2img.png",
                    Price100g = 110,
                    Price250g = 260,
                    Price500g = 490,
                    Price1000g = 940,
                    Price2000g = 1820,
                    Price5000g = 4400
                },
                new Product
                {
                    Id = 3,
                    Name = "Premium Pistachios",
                    ImageUrl = "assets/item3img.png",
                    Price100g = 125,
                    Price250g = 295,
                    Price500g = 560,
                    Price1000g = 1080,
                    Price2000g = 2100,
                    Price5000g = 5100
                },
                new Product
                {
                    Id = 4,
                    Name = "Pistachio Kernels (Peeled)",
                    ImageUrl = "assets/item4img.png",
                    Price100g = 145,
                    Price250g = 340,
                    Price500g = 650,
                    Price1000g = 1250,
                    Price2000g = 2440,
                    Price5000g = 5950
                }
            );

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Nuts & Dryfruits", ImageUrl = "assets/p1.png" },
                new Category { Id = 2, Name = "Dates", ImageUrl = "assets/p2.png" },
                new Category { Id = 3, Name = "DesiNut's Exclusive", ImageUrl = "assets/p3.png" },
                new Category { Id = 4, Name = "Berries", ImageUrl = "assets/p4.png" },
                new Category { Id = 5, Name = "Seeds & More", ImageUrl = "assets/p5.png" },
                new Category { Id = 6, Name = "Gifts & More", ImageUrl = "assets/p6.png" }
            );
        }
    }
}
