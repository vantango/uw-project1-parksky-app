$(document).ready(function() {
	// gallery
	$(".fotorama").fotorama({
		data: [
			{img: 'https://picsum.photos/seed/rabbit/600/400', thumb: 'https://picsum.photos/seed/rabbit/600/400', caption: 'Rabbit'},
			{img: 'https://picsum.photos/seed/bear/600/400', thumb: 'https://picsum.photos/seed/bear/600/400', caption: "Bear"},
			{img: 'https://picsum.photos/seed/cougar/600/400', thumb: 'https://picsum.photos/seed/cougar/600/400', caption: "Cougar"},
			{img: 'https://picsum.photos/seed/rattlesnake/600/400', thumb: 'https://picsum.photos/seed/rattlesnake/600/400', caption: "Rattlesnake"},
		],
		nav: "thumbs",
		loop: true
	});
});