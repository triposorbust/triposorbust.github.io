(function() {
    window.addEventListener("load", function() {
        var createGL = function(canvas) {
            var names = ["webgl", "experimental-webgl",
                         "moz-webgl", "webkit-3d"];

            var context = null;
            for (var i=0; i<names.length; i++) {
                try {
                    context = canvas.getContext(names[i]);
                } catch (e) {}
                if (context) {
                    break;
                }
            }
            if (context) {

                var resize_canvas = function() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    context.viewportHeight = canvas.height;
                    context.viewportWidth = canvas.width;

                    context.viewport(0, 0, canvas.width, canvas.height);
                };
                resize_canvas();
                window.onresize = resize_canvas;

            } else {
                console.log("Failed to create WebGL context.");
            }
            return context;
        };

        var cvs = document.getElementById('canvas');
        var gl = createGL(cvs);
        if (application && gl) {
            application.initialize(gl);
        }
        return 0;
    }, false);
})();
