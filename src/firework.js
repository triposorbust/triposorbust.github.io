if (!application) {
    var application = { };
}

application.createFirework = (function() {
/*
 * INITIALIZE with: persistence time,
 *                  initialization time,
 *                  location,
 *                  number of particles,
 *                  speed,
 *                  fireworks color,
 *                  randomization parameter,
 */

// ADD: mass, skew, twinkle

    return function(gl, pers, loc, N, speed, color, noise, mass, size, skew) {
        var app = this;

        var time0 = new Date().getTime()

        var setupBuffer = function(type, DataConstructor, data, itemSize) {
            var buffer = gl.createBuffer();

            gl.bindBuffer(type, buffer);
            gl.bufferData(type, new DataConstructor(data), gl.STATIC_DRAW);

            buffer.itemSize = itemSize;
            buffer.numberOfItems = data.length / itemSize;

            return buffer;
        };

        var snd = function() {
            var value = 0.0;
            for (var i=0; i<12; i++) {
                value += Math.random();
            }
            return value - 6.0;
        }


        /* initialize stuff here */
        var vertexPositions = null;
        var vertexColors = null;
        var vertexVelocities = [];
        for (var i=0; i<N; i++) {
            var dx=2*(Math.random() - 0.5),
                dy=2*(Math.random() - 0.5) - 0.5*Math.random(),
                dz=2*(Math.random() - 0.5);
            if (skew) {
                dx += skew[0];
                dy += skew[1];
                dz += skew[2];
            }
            var len = Math.sqrt(dx*dx + dy*dy + dz*dz);
            var fac = (1.0 + noise * snd()) * speed / len;
            vertexVelocities.push(dx*fac);
            vertexVelocities.push(dy*fac);
            vertexVelocities.push(dz*fac);
        }

        var vertexVelocityBuffer = setupBuffer(gl.ARRAY_BUFFER, Float32Array,
                                               vertexVelocities, 3);


        var disableAndAssign = function(attr, func) {
            gl.disableVertexAttribArray(attr);
            func(attr);
        };


        return {
            isExpiredAtTime : function(t) {
                return (t-time0 >= pers);
            },
            getLocation : function() {
                return loc;
            },
            renderAtTime : function(t) {

            disableAndAssign(app.fShaderProgram.vertexPositionAttribute,
                             function(i) { gl.vertexAttrib3f(i, 0.0, 0.0, 0.0) });

            disableAndAssign(app.fShaderProgram.vertexColorAttribute,
                             function(i) { gl.vertexAttrib4fv(i, color) });

            disableAndAssign(app.fShaderProgram.vertexAgeAttribute,
                             function(i) { gl.vertexAttrib1f(i, t-time0) });

            disableAndAssign(app.fShaderProgram.vertexLifetimeAttribute,
                             function(i) { gl.vertexAttrib1f(i, pers) } );

            disableAndAssign(app.fShaderProgram.vertexMassAttribute,
                             function(i) { gl.vertexAttrib1f(i, mass) } );

            disableAndAssign(app.fShaderProgram.vertexSizeAttribute,
                             function(i) { gl.vertexAttrib1f(i, size) } );

            gl.enableVertexAttribArray(app.fShaderProgram.vertexVelocityAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexVelocityBuffer);
            gl.vertexAttribPointer(app.fShaderProgram.vertexVelocityAttribute,
                                   vertexVelocityBuffer.itemSize,
                                   gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.POINTS, 0, vertexVelocityBuffer.numberOfItems);

            },
            dealloc : function( ) {
                return;
            }
        }
    }
}())
