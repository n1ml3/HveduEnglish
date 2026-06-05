/**
 * Tập tin Script chính - Sử dụng thư viện jQuery để nạp động các thành phần giao diện,
 * điều khiển hoạt ảnh mở/đóng menu di động, câu hỏi thường gặp (FAQ) và xác thực biểu mẫu.
 * Các bình luận giải thích chi tiết mục đích và cơ sở kỹ thuật bằng tiếng Việt.
 */

$(document).ready(function() {
  
  // 1. Nạp động Navbar và gán sự kiện điều hướng sau khi nạp xong để tránh lỗi phần tử chưa tồn tại
  $("#navbar-placeholder").load("/compoments/navbar.html", function() {
    initNavbar();
  });

  // 2. Nạp động Footer và gán sự kiện nhận bản tin sau khi nạp thành công
  $("#footer-placeholder").load("/compoments/footer.html", function() {
    initNewsletterForm();
  });

  // 3. Nếu tìm thấy biểu mẫu tư vấn trên trang (index.html), khởi tạo xác thực
  if ($("#contact-form").length) {
    initContactForm();
  }

  // 4. Nếu tìm thấy khung câu hỏi thường gặp (gioi-thieu.html), khởi tạo accordion tương tác
  if ($(".faq-accordion").length) {
    initFaqAccordion();
  }
});