using DesiNuts.Api.Data;
using DesiNuts.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DesiNuts.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult PlaceOrder(Order order)
        {
            if (string.IsNullOrWhiteSpace(order.CustomerName) ||
                string.IsNullOrWhiteSpace(order.Phone) ||
                string.IsNullOrWhiteSpace(order.Address))
            {
                return BadRequest(new { message = "Name, phone and address are required" });
            }

            if (order.Items == null || order.Items.Count == 0)
            {
                return BadRequest(new { message = "Cart is empty" });
            }

            decimal total = 0;

            foreach (var item in order.Items)
            {
                var product = _context.Products.Find(item.ProductId);
                if (product == null)
                {
                    return BadRequest(new { message = $"Product {item.ProductId} not found" });
                }

                item.ProductName = product.Name;
                item.Price = GetPriceForWeight(product, item.WeightGrams);
                total += item.Price * item.Quantity;
            }

            order.TotalAmount = total;

            _context.Orders.Add(order);
            _context.SaveChanges();

            return Ok(order);
        }

        [HttpGet]
        public IActionResult GetOrders()
        {
            var orders = _context.Orders.Include(o => o.Items).ToList();
            return Ok(orders);
        }

        private decimal GetPriceForWeight(Product product, int weightGrams)
        {
            if (weightGrams == 100) return product.Price100g;
            if (weightGrams == 250) return product.Price250g;
            if (weightGrams == 500) return product.Price500g;
            if (weightGrams == 1000) return product.Price1000g;
            if (weightGrams == 2000) return product.Price2000g;
            if (weightGrams == 5000) return product.Price5000g;
            return 0;
        }
    }
}
