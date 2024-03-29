/* eslint new-cap: ["error", { "properties": false }] */

// Defaults
var defaultOptions = {
	format: 'image/png',
	quality: 0.92,
	width: undefined,
	height: undefined,
	Canvas: undefined
};

var createCanvas = function (options) { return options.Canvas ?
		new options.Canvas.Canvas() :
		window.document.createElement('canvas'); };

var createImage = function (options) { return options.Canvas ?
		options.Canvas.Image :
		window.Image; };

// Return Promise
var mergeImages = function (sources, options) {
	if ( sources === void 0 ) sources = [];
	if ( options === void 0 ) options = {};

	return new Promise(function (resolve) {
	options = Object.assign({}, defaultOptions, options);

	// Setup browser/Node.js specific variables
	var canvas = createCanvas(options);
	var Image = createImage(options);
	if (options.Canvas) {
		options.quality *= 100;
	}

	// Load sources
	var images = sources.map(function (source) { return new Promise(function (resolve, reject) {
		// Convert sources to objects
		if (source.constructor.name !== 'Object') {
			source = { src: source };
		}

    if (source.width && source.height) {
      var img = new Image(source.width, source.height);

      img.onerror = function () { return reject(new Error('Couldn\'t load image')); };
      img.onload = function () {
        var width = source.width;
        var height = source.height;
        var canvas = createCanvas(options);
        var ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Adjust source image width and height
        var resizeImg = new Image();
        resizeImg.onerror = function () { return reject(new Error('Couldn\'t load image')); };
        resizeImg.onload = function () { return resolve(Object.assign({}, source, { img: resizeImg })); };
        resizeImg.src = canvas.toDataURL();
      };
      img.src = source.src;
    } else {
      // Resolve source and img when loaded
      var img$1 = new Image();
      img$1.onerror = function () { return reject(new Error('Couldn\'t load image')); };
      img$1.onload = function () { return resolve(Object.assign({}, source, { img: img$1 })); };
      img$1.src = source.src;
    }
	}); });

	// Get canvas context
	var ctx = canvas.getContext('2d');

	// When sources have loaded
	resolve(Promise.all(images)
		.then(function (images) {
			// Set canvas dimensions
			var getSize = function (dim) { return options[dim] || Math.max.apply(Math, images.map(function (image) { return image.img[dim]; })); };
			canvas.width = getSize('width');
			canvas.height = getSize('height');

			// Draw images to canvas
			images.forEach(function (image) {
				ctx.globalAlpha = image.opacity ? image.opacity : 1;
				return ctx.drawImage(image.img, image.x || 0, image.y || 0);
			});

			if (options.Canvas && options.format === 'image/jpeg') {
				// Resolve data URI for node-canvas jpeg async
				return new Promise(function (resolve) {
					canvas.toDataURL(options.format, {
						quality: options.quality,
						progressive: false
					}, function (err, jpeg) {
						if (err) {
							throw err;
						}
						resolve(jpeg);
					});
				});
			}

			// Resolve all other data URIs sync
			// return canvas.toDataURL(options.format, options.quality);
			return new Promise((resolve, reject) => {
				const pngStream = canvas.createPNGStream({ resolution: 300 });
				resolve(pngStream);
			});
			
		}));
});
};

export default mergeImages;
//# sourceMappingURL=index.es2015.js.map
