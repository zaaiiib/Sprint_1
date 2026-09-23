namespace DesiNuts.Api.Models
{
    public class ContactMessage
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SentDate { get; set; } = DateTime.Now;
    }
}
