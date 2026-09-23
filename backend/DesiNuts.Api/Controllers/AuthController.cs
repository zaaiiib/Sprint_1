using DesiNuts.Api.Data;
using DesiNuts.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace DesiNuts.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register(User newUser)
        {
            if (string.IsNullOrWhiteSpace(newUser.FullName) ||
                string.IsNullOrWhiteSpace(newUser.Email) ||
                string.IsNullOrWhiteSpace(newUser.Password))
            {
                return BadRequest(new { message = "Full name, email and password are required" });
            }

            bool emailTaken = _context.Users.Any(u => u.Email == newUser.Email);
            if (emailTaken)
            {
                return BadRequest(new { message = "An account with this email already exists" });
            }

            _context.Users.Add(newUser);
            _context.SaveChanges();

            return Ok(new { message = "Account created successfully. You can now log in." });
        }

        [HttpPost("login")]
        public IActionResult Login(User loginUser)
        {
            var user = _context.Users.FirstOrDefault(u =>
                u.Email == loginUser.Email && u.Password == loginUser.Password);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid email or password" });
            }

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("FullName", user.FullName);

            return Ok(new { message = "Login successful", fullName = user.FullName });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "Logged out" });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Ok(new { loggedIn = false });
            }

            string? fullName = HttpContext.Session.GetString("FullName");
            return Ok(new { loggedIn = true, fullName });
        }
    }
}
