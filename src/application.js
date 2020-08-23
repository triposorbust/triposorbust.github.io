if (!application) {
    var application = { };
} application.initialize = function(gl) {
    var self = this;

    gl.clearColor(0.0, 0.0, 0.15, 1.0);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var fetchFromShader = function(shader, id) {
        var returner;
        switch(id[0])
        {
        case "u":
            returner = gl.getUniformLocation(shader, id);
            break;
        case "a":
            returner = gl.getAttribLocation(shader, id);
            break;
        default:
            console.log("Not all who wander are lost...?");
        }
        return returner;
    };


    self.cShaderProgram = (function() {
        var vertexShader = self.loadShaderFromDOM(gl, "city-shader-vs");
        var fragmentShader = self.loadShaderFromDOM(gl, "city-shader-fs");

        var cShaderProgram = gl.createProgram();
        gl.attachShader(cShaderProgram, vertexShader);
        gl.attachShader(cShaderProgram, fragmentShader);
        gl.linkProgram(cShaderProgram);

        if (!gl.getProgramParameter(cShaderProgram, gl.LINK_STATUS)) {
            console.log("Failed to setup city shaders.");
        }

        var shaderVariables = ["aVertexPosition",
                               "aTextureCoordinates",
                               "uMVMatrix",
                               "uPMatrix",
                               "uSampler"];
        var dictionaryNames = ["vertexPositionAttribute",
                               "vertexCoordinatesAttribute",
                               "uniformMVMatrix",
                               "uniformProjMatrix",
                               "uniformSampler"];

        for (var i=0; i<shaderVariables.length; i++) {
            cShaderProgram[dictionaryNames[i]] =
                fetchFromShader(cShaderProgram, shaderVariables[i]);
        }

        return cShaderProgram;
    })();


    self.fShaderProgram = (function() {
        var vertexShader = self.loadShaderFromDOM(gl, "fireworks-shader-vs");
        var fragmentShader = self.loadShaderFromDOM(gl, "fireworks-shader-fs");

        var fShaderProgram = gl.createProgram();
        gl.attachShader(fShaderProgram, vertexShader);
        gl.attachShader(fShaderProgram, fragmentShader);
        gl.linkProgram(fShaderProgram);

        if (!gl.getProgramParameter(fShaderProgram, gl.LINK_STATUS)) {
            console.log("Failed to setup fireworks shaders.");
        }

        var shaderVariables = ["aVertexPosition",
                               "aVertexColor",
                               "aVertexVelocity",
                               "uMVMatrix",
                               "uPMatrix",
                               "aVertexAge",
                               "aVertexLifetime",
                               "aVertexMass",
                               "aVertexSize"];
        var dictionaryNames = ["vertexPositionAttribute",
                               "vertexColorAttribute",
                               "vertexVelocityAttribute",
                               "uniformMVMatrix",
                               "uniformProjMatrix",
                               "vertexAgeAttribute",
                               "vertexLifetimeAttribute",
                               "vertexMassAttribute",
                               "vertexSizeAttribute"];

        for (var i=0; i<shaderVariables.length; i++) {
            fShaderProgram[dictionaryNames[i]] =
                fetchFromShader(fShaderProgram, shaderVariables[i]);
        }

        return fShaderProgram;
    })();

    
    var enterRenderLoop = (function() {

        /* Initializes the rendering loop. */
        var fireworks = [];


        /* Required context-specific city generation. */
        self.initializeCity(gl);


        /* start with "The Big One." */

        var makeRandomFirework = function() {
            var duration = 250 + Math.random()*2000;
            var location = [2*(Math.random()-0.5) * 30,
                            3 + 2*(Math.random()-0.5) * 10,
                            2*(Math.random()-0.5) * 30];
            var particles = 100 + Math.random()*1000;
            var speed = 1.0 / (75.0 + Math.random()*925);
            var color = [0.2 + 0.8 * Math.random(),
                         0.2 + 0.8 * Math.random(),
                         0.2 + 0.8 * Math.random(),
                         0.25 + 0.5 * Math.random()];
            var noise = 0.5 * Math.random();
            var mass = Math.random() * 2;
            var size = Math.round(2.4 * Math.random()) || 1.0;
            var skew = null;
            if (Math.random() < 0.15) {
                skew = [2*(Math.random()-0.5),
                        -1*(Math.random()-0.15),
                        2*(Math.random()-0.5)];
                var len = Math.sqrt(skew[0]*skew[0] +
                                    skew[1]*skew[1] + 
                                    skew[2]*skew[2]);
                var fac = Math.random() * 3.0 / len;
                skew = [skew[0] * fac,
                        skew[1] * fac,
                        skew[2] * fac];
            }

            return self.createFirework(gl, duration, location, particles,
                                       speed, color, noise, mass, size, skew);
        };
        for (var i=0; i<100; i++) {
            fireworks.push(makeRandomFirework());
        }


        var projectionMatrix = mat4.create();
        mat4.perspective(60, gl.viewportWidth / gl.viewportHeight,
                         0.1, 250.0, projectionMatrix);

        var modelViewMatrix = mat4.create();
        mat4.identity(modelViewMatrix);
        mat4.lookAt([50,7,0],[0,0,0],[0,1,0],modelViewMatrix);


        /* memoized time to do rotation state */
        var lastTime = new Date().getTime();


        var render = function render() {
            var time = new Date().getTime();
            var dTime = time - lastTime;
            lastTime = time;

            modelViewMatrix = mat4.rotate(modelViewMatrix,
                                          2 * Math.PI * dTime / 100000,
                                          [0,1,0],
                                          modelViewMatrix);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.enable(gl.DEPTH_TEST);
            gl.depthMask(true);
            gl.disable(gl.BLEND);

            gl.useProgram(self.cShaderProgram);
            gl.uniformMatrix4fv(self.cShaderProgram.uniformProjMatrix,
                                false,
                                projectionMatrix);
            gl.uniformMatrix4fv(self.cShaderProgram.uniformMVMatrix,
                                false,
                                modelViewMatrix);
            self.renderCity();


            gl.depthMask(false);
            gl.enable(gl.BLEND);

            gl.useProgram(self.fShaderProgram);

            gl.uniformMatrix4fv(self.fShaderProgram.uniformProjMatrix,
                                false,
                                projectionMatrix);

            for (var i=0; i<fireworks.length; i++) {
                self.pushModelViewMatrix(modelViewMatrix);

                mat4.translate(modelViewMatrix,
                               fireworks[i].getLocation(),
                               modelViewMatrix);
                gl.uniformMatrix4fv(self.fShaderProgram.uniformMVMatrix,
                                    false,
                                    modelViewMatrix);

                fireworks[i].renderAtTime(time);

                modelViewMatrix = self.popModelViewMatrix();
            }

            for (var i=fireworks.length-1; i>=0; i--) {
                if (fireworks[i].isExpiredAtTime(time)) {
                    fireworks[i].dealloc();
                    fireworks.splice(i, 1);
                }
            }
            while (fireworks.length < 100) {
                fireworks.push(makeRandomFirework());
            }

            self.getRequestAnimationFrame()(render);
        };

        return render;
    })();
    enterRenderLoop();
};
