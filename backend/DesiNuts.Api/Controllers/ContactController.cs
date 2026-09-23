using DesiNuts.Api.Data;
using DesiNuts.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace DesiNuts.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult SendMessage(ContactMessage message)
        {
            if (string.IsNullOrWhiteSpace(message.Name) ||
                string.IsNullOrWhiteSpace(message.Email) ||
                string.IsNullOrWhiteSpace(message.Message))
            {
                return BadRequest(new { message = "Name, email and message are required" });
            }

            _context.ContactMessages.Add(message);
            _context.SaveChanges();

            return Ok(new { message = "Thank you! Your message has been sent to Desi Nuts." });
        }
    }
}
