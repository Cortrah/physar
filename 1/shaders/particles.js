let particlesVert = `

attribute vec2 aDataPos;

uniform sampler2D uParticlesPosDir;
uniform float uTexelSize;

varying vec2 vUv;
varying vec2 vDirection;
varying vec2 vPosition;
varying vec2 vParticleIndex;

void main() {
    vec2 uv = aDataPos * uTexelSize + uTexelSize * 0.5;
    vParticleIndex = aDataPos;
    vPosition  = texture2D(uParticlesPosDir, uv).xy;
    vDirection = texture2D(uParticlesPosDir, uv).zw;
    gl_PointSize = 1.0;
    gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
}`;

let particlesFrag = `

uniform sampler2D uTrailMap;
uniform float uTexelSize;
uniform vec2 uScreenSize;

varying vec2 vDirection;
varying vec2 vPosition;
varying vec2 vParticleIndex;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
	return m * v;
}

vec2 clampSensorPosition(vec2 sensor) {
    float limit = 0.0;
    float limit2 = limit * 2.0;

    if(sensor.x < limit)         
        sensor.x += uScreenSize.x - limit2;
        
    if(sensor.x > (uScreenSize.x - limit))
        sensor.x -= uScreenSize.x - limit2;

    if(sensor.y < limit)           
        sensor.y += uScreenSize.y - limit2;

    if(sensor.y > (uScreenSize.y - limit)) 
        sensor.y -= uScreenSize.y - limit2;

    return sensor;
}

void main() {
    float senseLength = 30.7;
    float moveStep    = 1.5 + sin(vParticleIndex.x * 0.333) * 0.35;  
    float senseAngle  = 0.5 + sin(vParticleIndex.x) * 0.5;  // radians

    vec2 cDir = normalize(  vDirection  );
    vec2 lDir = normalize(  rotate(cDir, +senseAngle)  );
    vec2 rDir = normalize(  rotate(cDir, -senseAngle)  );

    vec2 centralSensorPosition = clampSensorPosition(vPosition + cDir * senseLength);
    vec2 leftSensorPosition    = clampSensorPosition(vPosition + lDir * senseLength);
    vec2 rightSensorPosition   = clampSensorPosition(vPosition + rDir * senseLength);
    
    vec2 invScreenSize = 1.0 / uScreenSize;
    float cTrailValue = texture2D(uTrailMap, centralSensorPosition.xy * invScreenSize).x;   
    float lTrailValue = texture2D(uTrailMap, leftSensorPosition.xy    * invScreenSize).x;   
    float rTrailValue = texture2D(uTrailMap, rightSensorPosition.xy   * invScreenSize).x;   

    // ********* finding the new direction & position *********
    float highestValue = cTrailValue;
    vec2 newDir = cDir;

    if(lTrailValue > cTrailValue) {
        newDir = lDir;
        highestValue = lTrailValue;
    }
    if(rTrailValue > highestValue) {
        newDir = rDir;
    }

    if(rTrailValue == lTrailValue) {
        // pick randomly ?
        // pick randomly ?
        // pick randomly ?
    }
    vec2 newPos = clampSensorPosition(vPosition + newDir * moveStep);
    // ********* finding the new direction & position - END *********

    gl_FragColor = vec4(newPos, newDir);
}`;


