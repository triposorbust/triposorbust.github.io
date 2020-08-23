if (!application) {
    var application = { };
}

application.loadShaderFromDOM = function(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

(function() {
    /* Hides access to the matrix stack. */
    var modelViewMatrixStack = [];

    application.pushModelViewMatrix = function(mvm) {
        var copyToPush = mat4.create(mvm);
        modelViewMatrixStack.push(copyToPush);
    };

    application.popModelViewMatrix = function() {
        if (modelViewMatrixStack.length == 0) {
            throw "Error popModelViewMatrix(): Stack was empty.";
        }
        return modelViewMatrixStack.pop();
    };

})();

application.getRequestAnimationFrame = function() {
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
