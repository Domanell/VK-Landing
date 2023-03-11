$(document).ready(function () {
	const body = $('body');
	const header = $('.header');
	let countersOffset = $('.counters').offset().top;
	let counterIsRun = false;

	$(document).scroll(function () {
		if (!header.hasClass('fixed') && $(document).scrollTop() > 90) {
			header.addClass('fixed');
			body.addClass('scrolled');
		} else if (header.hasClass('fixed') && $(document).scrollTop() <= 90) {
			header.removeClass('fixed');
			body.removeClass('scrolled');
		}
	});

	function showMobileMenu(show) {
		if (show) {
			body.addClass('mobile-menu-open');
		} else {
			body.removeClass('mobile-menu-open');
		}
	}

	$('.burger-icon').click(function (e) {
		e.preventDefault();
		showMobileMenu(!body.hasClass('mobile-menu-open'));
	});

	$('.overlay').click(function (e) {
		showMobileMenu(false);
	});

	// Video
	$('.video .video__button').click(function (e) {
		e.preventDefault();
		const player = $(this).parent().children('.video__player');
		$(this).hide();
		player.show();
		player.children('video')[0].play();
	});

	// Counter
	function counter() {
		if (!counterIsRun && $(document).scrollTop() > countersOffset - $(window).height()) {
			counterIsRun = true;
			$('.counter .counter__number span').each(function () {
				$(this)
					.prop('Counter', 0)
					.animate(
						{
							Counter: $(this).text(),
						},
						{
							duration: 1700,
							easing: 'swing',
							step: function (now) {
								$(this).text(Math.ceil(now));
							},
						}
					);
			});
		}
	}

	counter();

	$(document).scroll(function () {
		counter();
	});

	// Slider
	const swiper = new Swiper('.testimonials-slider', {
		// Optional parameters
		loop: true,
		slidesPerView: 1.6,
		centeredSlides: true,
		spaceBetween: 30,
		grabCursor: true,
		// autoHeight: true,
		spaceBetween: 60,
		// If we need pagination
		pagination: {
			el: '.testimonials-slider__dots',
			clickable: true,
		},
		breakpoints: {
			300: {
				spaceBetween: 30,
				slidesPerView: 1.05,
			},
			992: {
				slidesPerView: 1.6,
				spaceBetween: 60,

			},
		},
	});
});
