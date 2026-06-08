/**
 * Tập tin Script chính - Sử dụng thư viện jQuery để nạp động các thành phần giao diện,
 * điều khiển hoạt ảnh mở/đóng menu di động, câu hỏi thường gặp (FAQ) và xác thực biểu mẫu.
 * Các bình luận giải thích chi tiết mục đích và cơ sở kỹ thuật bằng tiếng Việt.
 */

$(document).ready(function() {
  // Tự động xác định tiền tố đường dẫn tương đối (prefix) dựa trên vị trí trang hiện tại
  let prefix = '';
  if (window.location.pathname.indexOf('/pages/') !== -1 || window.location.href.indexOf('/pages/') !== -1) {
    prefix = '../';
  } else {
    prefix = './';
  }
  
  // 1. Nạp động Navbar và gán sự kiện điều hướng sau khi nạp xong để tránh lỗi phần tử chưa tồn tại
  $("#navbar-placeholder").load(prefix + "compoments/navbar.html", function() {
    adjustLoadedPaths("#navbar-placeholder", prefix);
    initNavbar();
  });

  // 2. Nạp động Footer và gán sự kiện nhận bản tin sau khi nạp thành công
  $("#footer-placeholder").load(prefix + "compoments/footer.html", function() {
    adjustLoadedPaths("#footer-placeholder", prefix);
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

  // 5. Khởi tạo tính năng kéo trượt chuột (drag scroll) cho khối cảm nhận nếu tồn tại
  if ($("#testimonialsSlider").length) {
    initTestimonialsSlider();
  }

  // 6. Khởi tạo tính năng chuyển đổi tab danh mục khóa học nếu tồn tại
  if ($(".course-tab").length) {
    initCourseTabs();
  }
});

/**
 * Khởi tạo tính năng kéo trượt slider (drag scroll) bằng chuột cho phần cảm nhận ý kiến.
 * Hỗ trợ người dùng nhấn giữ chuột và kéo ngang tương tự thao tác vuốt trên di động.
 */
function initTestimonialsSlider() {
  const slider = document.getElementById('testimonialsSlider');
  let isDown = false;
  let startX;
  let scrollLeft;

  // Bắt đầu nhấn giữ chuột xuống slider
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    slider.style.scrollBehavior = 'auto'; // Tắt smooth scroll để phản hồi kéo tức thời theo con trỏ
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  // Khi chuột rời khỏi vùng slider
  slider.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      slider.classList.remove('active');
      slider.style.scrollBehavior = 'smooth'; // Khôi phục smooth scroll khi dừng kéo
    }
  });

  // Khi nhả chuột
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
    slider.style.scrollBehavior = 'smooth'; // Khôi phục smooth scroll khi nhả chuột
  });

  // Khi di chuyển chuột để kéo trượt slider
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // Tỷ lệ nhân tốc độ kéo cuộn
    slider.scrollLeft = scrollLeft - walk;
  });
}

/**
 * Khởi tạo tính năng câu hỏi thường gặp (FAQ) Accordion.
 * Điều khiển việc đóng/mở câu trả lời một cách mượt mà và chuyển đổi các trạng thái active.
 * Giải thích chi tiết bằng tiếng Việt theo yêu cầu của dự án.
 */
function initFaqAccordion() {
  const $faqItems = $('.faq-item');

  $faqItems.find('.faq-header').on('click', function() {
    const $currentItem = $(this).closest('.faq-item');
    const $currentWrapper = $currentItem.find('.faq-answer-wrapper');
    const isActive = $currentItem.hasClass('active');

    // 1. Đóng toàn bộ các câu hỏi khác đang mở để giữ bố cục gọn gàng
    $faqItems.each(function() {
      const $item = $(this);
      if (!$item.is($currentItem) && $item.hasClass('active')) {
        $item.removeClass('active');
        $item.find('.faq-answer-wrapper').css({
          'max-height': '0',
          'opacity': '0'
        });
      }
    });

    // 2. Chuyển đổi trạng thái đóng/mở của câu hỏi hiện tại
    if (isActive) {
      $currentItem.removeClass('active');
      $currentWrapper.css({
        'max-height': '0',
        'opacity': '0'
      });
    } else {
      $currentItem.addClass('active');
      // Đo chiều cao thực tế của phần tử con để thiết lập max-height động
      const contentHeight = $currentItem.find('.faq-answer').outerHeight();
      $currentWrapper.css({
        'max-height': contentHeight + 'px',
        'opacity': '1'
      });
    }
  });
}

/**
 * Khởi tạo tính năng chuyển đổi các tab bộ lọc danh mục khóa học.
 * Thêm lớp 'active' cho tab được chọn và gỡ bỏ khỏi các tab khác để cập nhật giao diện.
 */
function initCourseTabs() {
  $('.course-tab').on('click', function() {
    $('.course-tab').removeClass('active');
    $(this).addClass('active');
  });
}

/**
 * Khởi tạo thanh điều hướng Navbar.
 * Tự động tìm đường dẫn URL hiện tại để thêm lớp 'active' cho liên kết tương ứng trên thanh điều hướng.
 */
function initNavbar() {
  const currentPath = window.location.pathname;
  $('.nav-link').each(function() {
    const page = $(this).attr('data-page');
    if (page) {
      if (currentPath.includes(page) || 
          (page === 'home' && (currentPath === '/' || currentPath === '' || currentPath.endsWith('index.html')))) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    }
  });
}

/**
 * Điều chỉnh động các đường dẫn tuyệt đối bắt đầu bằng '/' thành đường dẫn tương đối phù hợp với cấp thư mục.
 * Giúp website hoạt động không lỗi khi đẩy lên hosting tĩnh ở thư mục con (ví dụ GitHub Pages).
 */
function adjustLoadedPaths(placeholderId, prefix) {
  // 1. Cập nhật href cho các thẻ a bắt đầu bằng '/'
  $(placeholderId + ' a').each(function() {
    const href = $(this).attr('href');
    if (href && href.startsWith('/')) {
      $(this).attr('href', prefix + href.substring(1));
    }
  });

  // 2. Cập nhật src cho các thẻ img bắt đầu bằng '/'
  $(placeholderId + ' img').each(function() {
    const src = $(this).attr('src');
    if (src && src.startsWith('/')) {
      $(this).attr('src', prefix + src.substring(1));
    }
  });
}