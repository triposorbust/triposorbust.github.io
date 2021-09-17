if (!app) { var app = { }; }

app.yoshi = function() {
    var spritesheet = null;
    var scale = 8;

    (function() {
        var img = new Image();
        img.src = "res/yoshis.gif";
        img.onload = function() { spritesheet = this; };
    })();

    var count = 0;
    var frame = 0;
    var fdir  = -1;
    var ready = false;

    var make_cycler = function(max_frame, period) {
        return function(f) {
            count++;
            if (count >= period) {
                ready = true;
                count = 0;
                return (frame+1) % (max_frame+1);
            }
            return frame;
        };
    };

    var make_reverser = function(max_frame, period) {
        return function(f) {
            count++;
            if (count >= period) {
                ready = true;
                count = 0;
                if (frame % max_frame == 0) fdir *= -1;
                return (frame + fdir);
            } else {
                return frame;
            }
        };
    };

    var behaviours = {
        "walking"   : { "ox":0,  "oy":144, "sx":32, "sy":40, "dx":12,
                        "fstep": make_cycler(9, 1) },
        "dancing"   : { "ox":0,  "oy":0, "sx":32, "sy":40, "dx":0,
                        "fstep": make_reverser(4, 1) },
        "looking"   : { "ox":297,  "oy":0, "sx":27, "sy":40, "dx":0,
                        "fstep": make_reverser(3, 3) },
        "balancing" : { "ox":0,  "oy":95, "sx":31, "sy":40, "dx":0,
                        "fstep": make_reverser(2, 4) },
    };
    var current = null;
    var ox,oy,sx,sy,dx,xscaled,yscaled,fstep;

    var set_behaviour = function(name) {
        frame = 0;
        current = name;

        var spec = behaviours[name];
        ox = spec.ox;
        oy = spec.oy;
        sx = spec.sx;
        sy = spec.sy;
        dx = spec.dx;

        xscaled = scale * sx;
        yscaled = scale * sy;

        fstep = spec.fstep;

        ready = (current == "walking") ? true : false;
    };

    var px = 0;
    var py = 0;
    var xmax = 0;
    var ymax = 0;

    var transition = function() {
        if (frame != 0 || !ready) return;

        var roll = Math.random();
        switch(current)
        {
        case "walking":
            roll = roll - 2*Math.abs(px - xmax/2)/xmax;
            if (roll >= 0.75)
                set_behaviour("balancing");
            else if (roll >= 0.5)
                set_behaviour("looking");
            break;
        case "dancing":
            if (roll < 0.05)
                set_behaviour("walking");
            break;
        case "looking":
        case "balancing":
            if (roll <= 0.3)
                set_behaviour("dancing");
            else
                set_behaviour("walking");
        default:
            break;
        }
    };

    return {
        initialize: function(axmax, aymax) {
            xmax = axmax;
            ymax = aymax;
            set_behaviour("walking");
            px = -1 * xscaled;
            py = ymax/2 - yscaled/2;
        },
        behaviour: function(name) {
            set_behaviour(name);
        },
        render: function(ctx) {
            if (spritesheet == null) return;
            ctx.drawImage(spritesheet,
                          frame*sx + ox, oy, sx, sy,
                          px, py, xscaled, yscaled);
        },
        step: function() {
            transition();
            px += dx;
            px = (dx > 0) && (px > xmax) ? -1*xscaled : px;
            px = (dx < 0) && (px < -1*xscaled) ? xmax : px;
            frame = fstep(frame);
        }
    }
};
