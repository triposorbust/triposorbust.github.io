if (!application) {
    var application = { };
}
application.initializeCity = function(gl) {
    var app = this;
    if (app.renderCity instanceof Function) {
        /* This is already initialized. Don't bother regenerating. */
        return;
    }


    var texture = (function() {
        var texture = gl.createTexture();

        var image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                          gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        image.src = "res/ISS007-E-16525.JPG";

        return texture;
    })();

    var vertexArray = [
           -45.0,-20.0,-45.0,  1.0, 1.0,
           -45.0,-20.0, 45.0,  0.0, 1.0,
            45.0,-20.0, 45.0,  0.0, 0.0,
            45.0,-20.0,-45.0,  1.0, 0.0
    ];

    var numberOfVertices = 4;
    var dataBuffer = new Float32Array(vertexArray);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dataBuffer, gl.STATIC_DRAW);
    vertexBuffer.positionSize = 3;
    vertexBuffer.coordinatesSize = 2;

    var elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                  new Uint16Array([0,1,2,2,3,0]),
                  gl.STATIC_DRAW);

    app.renderCity = function() {
        gl.enableVertexAttribArray(app.cShaderProgram.vertexPositionAttribute);
        gl.enableVertexAttribArray(app.cShaderProgram.vertexCoordinatesAttribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(app.cShaderProgram.vertexPositionAttribute,
                               vertexBuffer.positionSize,
                               gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(app.cShaderProgram.vertexCoordinatesAttribute,
                               vertexBuffer.coordinatesSize,
                               gl.FLOAT, true, 20, 12);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(app.cShaderProgram.uniformSampler, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
};
