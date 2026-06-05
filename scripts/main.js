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

/**
 * Quản lý các tương tác của thanh điều hướng Navbar (Menu di động, Dropdown di động, Active Link)
 */
function initNavbar() {
  const $mobileMenuBtn = $("#mobile-menu-btn");
  const $navbarLinks = $("#navbar-links");
  
  // Điều khiển đóng/mở thanh trượt menu ngăn kéo khi chạm nút Hamburger trên di động
  if ($mobileMenuBtn.length && $navbarLinks.length) {
    $mobileMenuBtn.on("click", function(e) {
      e.stopPropagation(); // Ngăn sự kiện nổi bọt gây kích hoạt cơ chế tự đóng của document
      $mobileMenuBtn.toggleClass("open");
      $navbarLinks.toggleClass("open");
    });

    // Nhấp chuột bên ngoài menu di động sẽ tự động đóng lại để tăng trải nghiệm tiện ích
    $(document).on("click", function(e) {
      if ($navbarLinks.hasClass("open") && !$navbarLinks.is(e.target) && $navbarLinks.has(e.target).length === 0 && !$mobileMenuBtn.is(e.target)) {
        $mobileMenuBtn.removeClass("open");
        $navbarLinks.removeClass("open");
      }
    });
  }

  // Điều khiển mở rộng/thu gọn menu cấp 2 (Dropdown) khi chạm trên màn hình di động (dưới 1024px)
  $(".dropdown-toggle").on("click", function(e) {
    if (window.innerWidth <= 1024) {
      e.preventDefault(); // Chặn chuyển trang ngay khi chạm mở danh sách con
      $(this).closest(".dropdown").toggleClass("active");
    }
  });

  // Tự động tìm và gán class 'active' cho nút liên kết tương ứng với đường dẫn trang hiện tại
  const currentPath = window.location.pathname;
  $(".nav-link").each(function() {
    const pageAttr = $(this).attr("data-page");
    if (currentPath.includes("gioi-thieu.html") && pageAttr === "about") {
      $(this).addClass("active");
    } else if ((currentPath === "/" || currentPath === "/index.html" || currentPath === "") && pageAttr === "home") {
      $(this).addClass("active");
    }
  });
}

/**
 * Xác thực và kiểm tra form đăng ký nhận email bản tin ở Footer
 */
function initNewsletterForm() {
  const $form = $("#newsletter-form");
  const $emailInput = $("#newsletter-email");

  if ($form.length) {
    $form.on("submit", function(e) {
      e.preventDefault(); // Ngăn hành động gửi form truyền thống làm tải lại trang
      
      const emailValue = $emailInput.val().trim();
      if (validateEmail(emailValue)) {
        showSuccessNotification(`Cảm ơn bạn! Bản tin HVG Education sẽ được gửi đến email: ${emailValue}`);
        $form[0].reset(); // Làm sạch ô nhập sau khi gửi thành công
      } else {
        alert("Vui lòng nhập một địa chỉ email hợp lệ!");
      }
    });
  }
}

/**
 * Xác thực thông tin biểu mẫu nhận tư vấn lộ trình học tại trang chủ
 */
function initContactForm() {
  const $form = $("#contact-form");
  
  if ($form.length) {
    $form.on("submit", function(e) {
      e.preventDefault();
      
      const name = $("#contact-name").val().trim();
      const email = $("#contact-email").val().trim();
      const phone = $("#contact-phone").val().trim();
      
      // Kiểm tra tính hợp lệ của dữ liệu đầu vào và hiện thông báo lỗi cục bộ
      if (!name) {
        alert("Vui lòng nhập họ và tên của bạn!");
        return;
      }
      if (!validateEmail(email)) {
        alert("Vui lòng nhập địa chỉ email hợp lệ!");
        return;
      }
      if (!validatePhone(phone)) {
        alert("Vui lòng nhập số điện thoại hợp lệ (từ 10 đến 11 chữ số)!");
        return;
      }

      // Hiện hộp thoại thông báo thành công có giao diện đẹp mắt
      showSuccessNotification(`Đăng ký tư vấn thành công! Chào mừng ${name}. HVG Education sẽ liên hệ với bạn trong thời gian sớm nhất qua số điện thoại: ${phone}.`);
      $form[0].reset();
    });
  }
}

/**
 * Điều khiển đóng/mở mượt mà cho phần Accordion câu hỏi thường gặp
 */
function initFaqAccordion() {
  $(".faq-header").on("click", function() {
    const $item = $(this).parent();
    const $body = $item.find(".faq-body");
    const isAlreadyActive = $item.hasClass("active");

    // Đóng toàn bộ các mục câu hỏi khác để giữ giao diện luôn tinh gọn gọn gàng
    $(".faq-item").removeClass("active");
    $(".faq-body").css("max-height", "");

    // Nếu mục vừa nhấn chưa hoạt động, thực hiện mở rộng chiều cao bằng thuộc tính scrollHeight
    if (!isAlreadyActive) {
      $item.addClass("active");
      $body.css("max-height", $body[0].scrollHeight + "px"); // Gán chiều cao chính xác để CSS tạo hiệu ứng mượt
    }
  });
}

/**
 * Hiển thị một thông báo Modal popup đẹp mắt trên màn hình khi thao tác thành công
 * @param {string} message - Chuỗi thông điệp hiển thị
 */
function showSuccessNotification(message) {
  const modalHTML = `
    <div class="success-modal">
      <div class="success-modal-content">
        <span class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <h3 class="success-title">Thành công!</h3>
        <p class="success-message">${message}</p>
        <button class="btn btn-primary success-close-btn">Đóng</button>
      </div>
    </div>
  `;

  const $modal = $(modalHTML);
  $("body").append($modal);

  // Đăng ký sự kiện click đóng modal
  $modal.find(".success-close-btn").on("click", closeModal);
  $modal.on("click", function(e) {
    if (e.target === this) {
      closeModal();
    }
  });

  // Tạo hiệu ứng mờ nhạt và xóa thẻ modal ra khỏi DOM
  function closeModal() {
    $modal.addClass("fade-out");
    setTimeout(function() {
      $modal.remove();
    }, 300);
  }
}

/**
 * Kiểm tra cấu trúc Email hợp lệ bằng biểu thức chính quy Regex
 */
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Kiểm tra số điện thoại Việt Nam (loại bỏ khoảng cách và kiểm tra từ 9 đến 11 số)
 */
function validatePhone(phone) {
  const re = /^[0-9]{9,11}$/;
  return re.test(phone.replace(/[\s.-]/g, ""));
}
