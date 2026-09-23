namespace DesiNuts.Api.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        public decimal Price100g { get; set; }
        public decimal Price250g { get; set; }
        public decimal Price500g { get; set; }
        public decimal Price1000g { get; set; }
        public decimal Price2000g { get; set; }
        public decimal Price5000g { get; set; }
    }
}
