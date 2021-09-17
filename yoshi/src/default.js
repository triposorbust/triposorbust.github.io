if (!app) { var app = {}; }

app.initialize = function() {
    var cvs = document.getElementById('canvas');
    cvs.height = window.innerHeight;
    cvs.width = window.innerWidth;

    var ctx = cvs.getContext('2d');
    var yoshi = this.yoshi();
    yoshi.initialize(cvs.width, cvs.height);

    var last_time = new Date().getTime();
    var step = function() {
        var curr_time = new Date().getTime();
        if (curr_time - last_time >= 75) {
            ctx.clearRect(0,0,cvs.width,cvs.height);
            yoshi.step();
            yoshi.render(ctx);
            last_time = curr_time;
        }
        app.getRequestAnimationFrame()(step);
    };

    step();
};

app.getRequestAnimationFrame = function() {
    return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function (/* function */ callback) {
            window.setTimeout(callback, 1000/60);
        });
};

window.addEventListener('load', function() {
    window.addEventListener('resize', app.initialize, false);
    app.initialize();
}, false);
