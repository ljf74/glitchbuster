function revertMatrix(s){
        return s.split(',').map(function(r){
            return r.split('').map(function(v){
                return parseInt(v);
            });
        });
    }

/**
* SfxrParams
*
* Copyright 2010 Thomas Vian
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* @author Thomas Vian
*/
/** @constructor */
function SfxrParams() {
    //--------------------------------------------------------------------------
    //
    //  Settings String Methods
    //
    //--------------------------------------------------------------------------

    /**
    * Parses a settings array into the parameters
    * @param array Array of the settings values, where elements 0 - 23 are
    *                a: waveType
    *                b: attackTime
    *                c: sustainTime
    *                d: sustainPunch
    *                e: decayTime
    *                f: startFrequency
    *                g: minFrequency
    *                h: slide
    *                i: deltaSlide
    *                j: vibratoDepth
    *                k: vibratoSpeed
    *                l: changeAmount
    *                m: changeSpeed
    *                n: squareDuty
    *                o: dutySweep
    *                p: repeatSpeed
    *                q: phaserOffset
    *                r: phaserSweep
    *                s: lpFilterCutoff
    *                t: lpFilterCutoffSweep
    *                u: lpFilterResonance
    *                v: hpFilterCutoff
    *                w: hpFilterCutoffSweep
    *                x: masterVolume
    * @return If the string successfully parsed
    */
    this.setSettings = function(values){
        for(var i = 0 ; i < 24 ; i++){
            this[String.fromCharCode(97 + i)] = values[i] || 0;
        }

        // I moved this here from the reset(1) function
        if (this.c < 0.01) {
            this.c = 0.01;
        }

        var totalTime = this.b + this.c + this.e;
        if (totalTime < 0.18) {
            var multiplier = 0.18 / totalTime;
            this.b *= multiplier;
            this.c *= multiplier;
            this.e *= multiplier;
        }
    };
}

/**
* SfxrSynth
*
* Copyright 2010 Thomas Vian
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* @author Thomas Vian
*/
/** @constructor */
function SfxrSynth() {
    // All variables are kept alive through function closures

    //--------------------------------------------------------------------------
    //
    //  Sound Parameters
    //
    //--------------------------------------------------------------------------

    this._params = new SfxrParams();  // Params instance

    //--------------------------------------------------------------------------
    //
    //  Synth Variables
    //
    //--------------------------------------------------------------------------

    var _envelopeLength0, // Length of the attack stage
        _envelopeLength1, // Length of the sustain stage
        _envelopeLength2, // Length of the decay stage

        _period,          // Period of the wave
        _maxPeriod,       // Maximum period before sound stops (from minFrequency)

        _slide,           // Note slide
        _deltaSlide,      // Change in slide

        _changeAmount,    // Amount to change the note by
        _changeTime,      // Counter for the note change
        _changeLimit,     // Once the time reaches this limit, the note changes

        _squareDuty,      // Offset of center switching point in the square wave
        _dutySweep;       // Amount to change the duty by

    //--------------------------------------------------------------------------
    //
    //  Synth Methods
    //
    //--------------------------------------------------------------------------

    /**
    * Resets the runing variables from the params
    * Used once at the start (total reset) and for the repeat effect (partial reset)
    */
    this.resetManglable = function() {
        // Shorter reference
        var p = this._params;

        _period       = 100 / (p.f * p.f + 0.001);
        _maxPeriod    = 100 / (p.g   * p.g   + 0.001);

        _slide        = 1 - p.h * p.h * p.h * 0.01;
        _deltaSlide   = -p.i * p.i * p.i * 0.000001;

        if(!p.a){
            _squareDuty = 0.5 - p.n / 2;
            _dutySweep  = -p.o * 0.00005;
        }

        _changeAmount = 1 + p.l * p.l * (p.l > 0 ? -0.9 : 10);
        _changeTime   = 0;
        _changeLimit  = p.m == 1 ? 0 : (1 - p.m) * (1 - p.m) * 20000 + 32;
    };

    // I split the reset() function into two functions for better readability
    this.totalReset = function() {
        this.resetManglable();

        // Shorter reference
        var p = this._params;

        // Calculating the length is all that remained here, everything else moved somewhere
        _envelopeLength0 = p.b  * p.b  * 100000;
        _envelopeLength1 = p.c * p.c * 100000;
        _envelopeLength2 = p.e   * p.e   * 100000 + 12;
        // Full length of the volume envelop (and therefore sound)
        // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
        return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
    };

    /**
    * Writes the wave to the supplied buffer ByteArray
    * @param buffer A ByteArray to write the wave to
    * @return If the wave is finished
    */
    this.synthWave = function(buffer, length) {
        // Shorter reference
        var p = this._params;

        // If the filters are active
        var _filters = p.s != 1 || p.v,
            // Cutoff multiplier which adjusts the amount the wave position can move
            _hpFilterCutoff = p.v * p.v * 0.1,

            // Speed of the high-pass cutoff multiplier
            _hpFilterDeltaCutoff = 1 + p.w * 0.0003,

            // Cutoff multiplier which adjusts the amount the wave position can move
            _lpFilterCutoff = p.s * p.s * p.s * 0.1,

            // Speed of the low-pass cutoff multiplier
            _lpFilterDeltaCutoff = 1 + p.t * 0.0001,

            // If the low pass filter is active
            _lpFilterOn = p.s != 1,

            // masterVolume * masterVolume (for quick calculations)
            _masterVolume = p.x * p.x,

            // Minimum frequency before stopping
            _minFreqency = p.g,

            // If the phaser is active
            _phaser = p.q || p.r,

            // Change in phase offset
            _phaserDeltaOffset = p.r * p.r * p.r * 0.2,

            // Phase offset for phaser effect
            _phaserOffset = p.q * p.q * (p.q < 0 ? -1020 : 1020),

            // Once the time reaches this limit, some of the    iables are reset
            _repeatLimit = p.p ? ((1 - p.p) * (1 - p.p) * 20000 | 0) + 32 : 0,

            // The punch factor (louder at begining of sustain)
            _sustainPunch = p.d,

            // Amount to change the period of the wave by at the peak of the vibrato wave
            _vibratoAmplitude = p.j / 2,

            // Speed at which the vibrato phase moves
            _vibratoSpeed = p.k * p.k * 0.01,

            // The type of wave to generate
            _waveType = p.a;

        var _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
            _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
            _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
            _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

        // Damping muliplier which restricts how fast the wave position can move
        var _lpFilterDamping = 5 / (1 + p.u * p.u * 20) * (0.01 + _lpFilterCutoff);
        if (_lpFilterDamping > 0.8) {
            _lpFilterDamping = 0.8;
        }
        _lpFilterDamping = 1 - _lpFilterDamping;

        var _finished = 0,     // If the sound has finished
            _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
            _envelopeTime     = 0, // Current time through current enelope stage
            _envelopeVolume   = 0, // Current volume of the envelope
            _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
            _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
            _lpFilterOldPos,       // Previous low-pass wave position
            _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
            _periodTemp,           // Period modified by vibrato
            _phase            = 0, // Phase through the wave
            _phaserInt,            // Integer phaser offset, for bit maths
            _phaserPos        = 0, // Position through the phaser buffer
            _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
            _repeatTime       = 0, // Counter for the repeats
            _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
            _superSample,          // Actual sample writen to the wave
            _vibratoPhase     = 0; // Phase through the vibrato sine wave

        // Buffer of wave values used to create the out of phase second wave
        var _phaserBuffer = new Array(1024),

            // Buffer of random values used to generate noise
            _noiseBuffer  = new Array(32);

        for (var i = _phaserBuffer.length; i--; ) {
            _phaserBuffer[i] = 0;
        }
        for (i = _noiseBuffer.length; i--; ) {
            _noiseBuffer[i] = rand(-1, 1);
        }

        for (i = 0; i < length; i++) {
            if (_finished) {
                return i;
            }

            // Repeats every _repeatLimit times, partially resetting the sound parameters
            if (_repeatLimit) {
                if (++_repeatTime >= _repeatLimit) {
                    _repeatTime = 0;
                    this.resetManglable();
                }
            }

            // If _changeLimit is reached, shifts the pitch
            if (_changeLimit) {
                if (++_changeTime >= _changeLimit) {
                    _changeLimit = 0;
                    _period *= _changeAmount;
                }
            }

            // Acccelerate and apply slide
            _slide += _deltaSlide;
            _period *= _slide;

            // Checks for frequency getting too low, and stops the sound if a minFrequency was set
            if (_period > _maxPeriod) {
                _period = _maxPeriod;
                if (_minFreqency > 0) {
                    _finished = 1;
                }
            }

            _periodTemp = _period;

            // Applies the vibrato effect
            if (_vibratoAmplitude > 0) {
                _vibratoPhase += _vibratoSpeed;
                _periodTemp *= 1 + sin(_vibratoPhase) * _vibratoAmplitude;
            }

            _periodTemp |= 0;
            if (_periodTemp < 8) {
                _periodTemp = 8;
            }

            // Sweeps the square duty
            if (!_waveType) {
                _squareDuty += _dutySweep;
                if (_squareDuty < 0) {
                    _squareDuty = 0;
                } else if (_squareDuty > 0.5) {
                    _squareDuty = 0.5;
                }
            }

            // Moves through the different stages of the volume envelope
            if (++_envelopeTime > _envelopeLength) {
                _envelopeTime = 0;

                switch (++_envelopeStage)  {
                    case 1:
                        _envelopeLength = _envelopeLength1;
                        break;
                    case 2:
                        _envelopeLength = _envelopeLength2;
                }
            }

            // Sets the volume based on the position in the envelope
            switch (_envelopeStage) {
                case 0:
                    _envelopeVolume = _envelopeTime * _envelopeOverLength0;
                    break;
                case 1:
                    _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
                    break;
                case 2:
                    _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
                    break;
                case 3:
                    _envelopeVolume = 0;
                    _finished = 1;
            }

            // Moves the phaser offset
            if (_phaser) {
                _phaserOffset += _phaserDeltaOffset;
                _phaserInt = _phaserOffset | 0;
                if (_phaserInt < 0) {
                    _phaserInt = -_phaserInt;
                } else if (_phaserInt > 1023) {
                    _phaserInt = 1023;
                }
            }

            // Moves the high-pass filter cutoff
            if (_filters && _hpFilterDeltaCutoff) {
                _hpFilterCutoff *= _hpFilterDeltaCutoff;
                if (_hpFilterCutoff < 0.00001) {
                    _hpFilterCutoff = 0.00001;
                } else if (_hpFilterCutoff > 0.1) {
                    _hpFilterCutoff = 0.1;
                }
            }

            _superSample = 0;
            for (var j = 8; j--; ) {
                // Cycles through the period
                _phase++;
                if (_phase >= _periodTemp) {
                    _phase %= _periodTemp;

                    // Generates new random noise for this period
                    if (_waveType == 3) {
                        for (var n = _noiseBuffer.length; n--; ) {
                            _noiseBuffer[n] = rand(-1, 1);
                        }
                    }
                }

                // Gets the sample from the oscillator
                switch (_waveType) {
                    case 0: // Square wave
                        _sample = ((_phase / _periodTemp) < _squareDuty) ? 0.5 : -0.5;
                        break;
                    case 1: // Saw wave
                        _sample = 1 - _phase / _periodTemp * 2;
                        break;
                    case 2: // Sine wave (fast and accurate approx)
                        _pos = _phase / _periodTemp;
                        _pos = (_pos > 0.5 ? _pos - 1 : _pos) * 6.28318531;
                        _sample = 1.27323954 * _pos + 0.405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
                        _sample = 0.225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
                        break;
                    case 3: // Noise
                        _sample = _noiseBuffer[abs(_phase * 32 / _periodTemp | 0)];
                }

                // Applies the low and high pass filters
                if (_filters) {
                    _lpFilterOldPos = _lpFilterPos;
                    _lpFilterCutoff *= _lpFilterDeltaCutoff;
                    if (_lpFilterCutoff < 0) {
                        _lpFilterCutoff = 0;
                    } else if (_lpFilterCutoff > 0.1) {
                        _lpFilterCutoff = 0.1;
                    }

                    if (_lpFilterOn) {
                        _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
                        _lpFilterDeltaPos *= _lpFilterDamping;
                    } else {
                        _lpFilterPos = _sample;
                        _lpFilterDeltaPos = 0;
                    }

                    _lpFilterPos += _lpFilterDeltaPos;

                    _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
                    _hpFilterPos *= 1 - _hpFilterCutoff;
                    _sample = _hpFilterPos;
                }

                // Applies the phaser effect
                if (_phaser) {
                    _phaserBuffer[_phaserPos % 1024] = _sample;
                    _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
                    _phaserPos++;
                }

                _superSample += _sample;
            }

            // Averages out the super samples and applies volumes
            _superSample *= 0.125 * _envelopeVolume * _masterVolume;

            // Clipping if too loud
            buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
        }

        return length;
    };
}

// Adapted from http://codebase.es/riffwave/
var synth = new SfxrSynth();

// Export for the Closure Compiler
var jsfxr = function(settings) {
    // Initialize SfxrParams
    synth._params.setSettings(settings);

    // Synthesize Wave
    var envelopeFullLength = synth.totalReset();
    var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
    var used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
    var dv = new Uint32Array(data.buffer, 0, 44);

    // Initialize header
    dv[0] = 0x46464952; // "RIFF"
    dv[1] = used + 36;  // put total size here
    dv[2] = 0x45564157; // "WAVE"
    dv[3] = 0x20746D66; // "fmt "
    dv[4] = 0x00000010; // size of the following
    dv[5] = 0x00010001; // Mono: 1 channel, PCM format
    dv[6] = 0x0000AC44; // 44,100 samples per second
    dv[7] = 0x00015888; // byte rate: two bytes per sample
    dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
    dv[9] = 0x61746164; // "data"
    dv[10] = used;      // put number of samples here

    // Base64 encoding written by me, @maettig
    used += 44;
    var i = 0,
        base64Characters = /*nomangle*/'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'/*/nomangle*/,
        output = /*nomangle*/'data:audio/wav;base64,'/*/nomangle*/;
    for (; i < used; i += 3){
        var a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
        output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
    }

    var audio = new Audio();
    audio.src = output;
    return audio;
};

// Exposing all math functions to the global scope
Object.getOwnPropertyNames(Math).forEach(function(n){
    if(Math[n].call){
        this[n] = Math[n];
    }
});

function cache(w, h, f){
    var c = D.createElement('canvas');
    c.width = w;
    c.height = h;

    f(c.getContext('2d'), c);

    return c;
}

function cachePattern(w, h, f){
    var c = cache(w, h, f);
    return c.getContext('2d').createPattern(c, 'repeat');
}

function pad(m, n){
    var r = [];
    for(var row = 0 ; row < m.length + n * 2 ; row++){
        r.push([]);
        for(var col = 0 ; col < m[0].length + n * 2 ; col++){
            if(row < n || row >= m.length + n || col < n || col >= m[0].length + n){
                r[row][col] = 2;
            }else{
                r[row][col] = m[row - n][col - n];
            }
        }
    }
    return r;
}

function flatten(m){
    var flattened = [];
    m.forEach(function(row){
        flattened = flattened.concat(row);
    });
    return flattened;
}

function proto(o){
    var r = {};
    for(var i in o){
        if(o[i].call){
            r[i] = o[i].bind(o);
        }
    }
    return r;
}

var D = document,
    w = window,
    delayed = setTimeout,
    shittyMode, // undefined by default
    C, // canvas
    R, // canvas context
    W, // world
    P, // player
    V, // camera
    PI = Math.PI,
    mobile = navigator.userAgent.match(/*nomangle*//andro|ipho|ipa|ipo|windows ph/i/*/nomangle*/),
    CANVAS_WIDTH = mobile ? 640 : 920,
    CANVAS_HEIGHT = 920;

var jumpSound = jsfxr([0,,0.1434,,0.1212,0.4471,,0.2511,,,,,,0.0426,,,,,0.8862,,,,,0.5]),
    hitSound = jsfxr([1,,0.0713,,0.1467,0.5483,,-0.4465,,,,,,,,,,,1,,,0.0639,,0.5]),
    pickupSound = jsfxr([0,,0.0224,0.441,0.1886,0.6932,,,,,,,,,,,,,1,,,,,0.5]),
    spawnSound = jsfxr([2,0.28,0.45,,0.56,0.35,,0.4088,,,,,0.03,0.1557,,0.5565,-0.02,-0.02,1,,,,,0.5]),
    explosionSound = jsfxr([3,,0.244,0.6411,0.2242,0.7416,,-0.2717,,,,0.0171,0.0346,,,,-0.0305,0.0244,1,,,0.0275,-0.0076,0.5]),
    menuSound = jsfxr([0,,0.1394,,0.0864,0.48,,,,,,,,0.5326,,,,,1,,,0.1,,0.5]),
    saySound = jsfxr([2,0.03,0.1,0.14,0.25,0.54,0.3167,-0.02,0.3999,,0.05,,,0.1021,0.0684,,0.1287,-0.1816,1,,,,,0.46]),
    landSound = jsfxr([3,,0.0118,0.03,0.1681,0.565,,-0.2343,,,,0.26,0.6855,,,,,,1,,,,,0.2]),
    fixedSound = jsfxr([0,,0.2098,,0.4725,0.3665,,0.1895,,,,,,0.0067,,0.5437,,,1,,,,,0.45]);

function particle(s, c, as, numeric){
    var p, n = pick([0, 1]);

    // Add to the list of particles
    G.add(p = {
        s: s,
        c: c,
        render: function(){
            if(!V.contains(this.x, this.y, this.s)){
                return;
            }

            R.fillStyle = p.c;
            if(numeric){
                fillText(n.toString(), p.x, p.y);
            }else{
                fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
            }
        }
    }, 1);

    // Interpolations
    as.forEach(function(a, id){
        var args = [p].concat(a);

        // Add the remove callback
        if(!id){
            args[7] = function(){
                G.remove(p);
            };
        }

        // Apply the interpolation
        interp.apply(0, args);
    });
}

var noisePattern = cachePattern(400, 400, function(r){
    with(r){
        fillStyle = '#000';
        fillRect(0, 0, 400, 400);

        fillStyle = '#fff';

        for(var x = 0 ; x < 400 ; x += 4){
            for(var y = 0 ; y < 400 ; y += 4){
                globalAlpha = rand();
                fillRect(x, y, 4, 4);
            }
        }
    }
});

function halo(s, c1, c2){
    return cache(s, s, function(r){
        with(r){
            var g = createRadialGradient(
                s / 2, s / 2, 0,
                s / 2, s / 2, s / 2
            );

            g.addColorStop(0, c1);
            g.addColorStop(1, c2);

            fillStyle = g;
            fillRect(0, 0, s, s);
        }
    });
}

var whiteHalo = halo(160, 'rgba(255,255,255,.25)', 'rgba(255,255,255,0)'),
    redHalo = halo(160, 'rgba(255,0,0,.25)', 'rgba(255,0,0,0)'),
    darkHalo = halo(1000, 'rgba(0,0,0,0)', 'rgba(0,0,0,1)');

var
    rightArrow = cache(80, 80, function(r){
        with(r){
            fillStyle = '#fff';
            beginPath();
            moveTo(0, 0);
            lineTo(80, 80 / 2);
            lineTo(0, 80);
            fill();
        }
    }),
    leftArrow = cache(80, 80, function(r){
        with(r){
            translate(80, 0);
            scale(-1, 1);
            drawImage(rightArrow, 0, 0);
        }
    }),
    jumpArrow = cache(80, 80, function(r){
        with(r){
            translate(0, 80);
            rotate(-PI / 2);

            drawImage(rightArrow, 0, 0);
        }
    }),
    grenadeButton = cache(80, 80, function(r){
        with(r){
            fillStyle = '#fff';
            beginPath();
            arc(80 / 2, 80 / 2, 80 / 2, 0, PI * 2, 1);
            fill();
        }
    })
    ;

var defs = {
    /*nomangle*/a/*/nomangle*/: revertMatrix("111,101,111,101,101"),
    /*nomangle*/b/*/nomangle*/: revertMatrix("111,101,110,101,111"),
    /*nomangle*/c/*/nomangle*/: revertMatrix("111,100,100,100,111"),
    /*nomangle*/d/*/nomangle*/: revertMatrix("110,101,101,101,111"),
    /*nomangle*/e/*/nomangle*/: revertMatrix("111,100,110,100,111"),
    /*nomangle*/f/*/nomangle*/: revertMatrix("111,100,110,100,100"),
    /*nomangle*/g/*/nomangle*/: revertMatrix("111,100,100,101,111"),
    /*nomangle*/h/*/nomangle*/: revertMatrix("101,101,111,101,101"),
    /*nomangle*/i/*/nomangle*/: revertMatrix("111,010,010,010,111"),
    /*_j: [
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [1,0,1],
        [1,1,1]
    ],*/
    /*nomangle*/k/*/nomangle*/: revertMatrix("101,101,110,101,101"),
    /*nomangle*/l/*/nomangle*/: revertMatrix("100,100,100,100,111"),
    /*nomangle*/m/*/nomangle*/: revertMatrix("101,111,101,101,101"),
    /*nomangle*/n/*/nomangle*/: revertMatrix("111,101,101,101,101"),
    /*nomangle*/o/*/nomangle*/: revertMatrix("111,101,101,101,111"),
    /*nomangle*/p/*/nomangle*/: revertMatrix("111,101,111,100,100"),
    /*nomangle*/q/*/nomangle*/: revertMatrix("111,101,101,111,001"),
    /*nomangle*/r/*/nomangle*/: revertMatrix("111,101,110,101,101"),
    /*nomangle*/s/*/nomangle*/: revertMatrix("111,100,111,001,111"),
    /*nomangle*/t/*/nomangle*/: revertMatrix("111,010,010,010,010"),
    /*nomangle*/u/*/nomangle*/: revertMatrix("101,101,101,101,111"),
    /*nomangle*/v/*/nomangle*/: revertMatrix("101,101,101,101,010"),
    /*nomangle*/w/*/nomangle*/: revertMatrix("10101,10101,10101,10101,01010"),
    /*nomangle*/x/*/nomangle*/: revertMatrix("101,101,010,101,101"),
    /*nomangle*/y/*/nomangle*/: revertMatrix("101,101,111,010,010"),
    /*'\'': revertMatrix("1"),*/
    '.': revertMatrix("0,0,0,0,1"),
    ' ': revertMatrix("00,00,00,00,00"),
    '-': [
        [0,0],
        [0,0],
        [1,1],
        [0,0],
        [0,0]
    ],
    ':': revertMatrix("0,1,,1,"),
    '?': revertMatrix("111,111,111,111,111"),
    '!': revertMatrix("01010,11111,11111,01110,00100"),
    '/': revertMatrix("001,001,010,100,100"),
    '1': revertMatrix("110,010,010,010,111"),
    '2': revertMatrix("111,001,111,100,111"),
    '3': revertMatrix("111,001,011,001,111"),
    '4': revertMatrix("100,100,101,111,001"),
    '5': revertMatrix("111,100,110,001,110"),
    '6': revertMatrix("111,100,111,101,111"),
    '7': revertMatrix("111,001,010,010,010"),
    '8': revertMatrix("111,101,111,101,111"),
    '9': revertMatrix("111,101,111,001,111"),
    '0': revertMatrix("111,101,101,101,111"),
    '(': revertMatrix("01,1,1,1,01"),
    ')': revertMatrix("10,01,01,01,1")
};

if(true){
    (function(){
        used = {};
        for(var i in defs){
            used[i] = 0;
        }

        window.checkUsed = function(){
            var unused = [];
            for(var i in used){
                if(!used[i]){
                    unused.push(i);
                }
            }
            return unused.sort();
        };
    })();
}

function drawText(r, t, x, y, s, c){
    for(var i = 0 ; i < t.length ; i++){
        if(true){
            used[t.charAt(i)] = 1;
        }

        var cached = cachedCharacter(t.charAt(i), s, c);

        r.drawImage(cached, x, y);

        x += cached.width + s;
    }
}

var cachedTexts = {};
function drawCachedText(r, t, x, y, s, c){
    var key = t + s + c;
    if(!cachedTexts[key]){
        cachedTexts[key] = cache(s * requiredCells(t, s), s * 5, function(r){
            drawText(r, t, 0, 0, s, c);
        });
    }
    r.drawImage(cachedTexts[key], x, y);
}

function requiredCells(t, s){
    var r = 0;
    for(var i = 0 ; i < t.length ; i++){
        r += defs[t.charAt(i)][0].length + 1;
    }
    return r - 1;
}

var cachedChars = {};
function cachedCharacter(t, s, c){
    var key = t + s + c;
    if(!cachedChars[key]){
        var def = defs[t];
        cachedChars[key] = cache(def[0].length * s, def.length * s, function(r){
            r.fillStyle = c;
            for(var row = 0 ; row < def.length ; row++){
                for(var col = 0 ; col < def[row].length ; col++){
                    if(def[row][col]){
                        r.fillRect(col * s, row * s, s, s);
                    }
                }
            }
        });
    }
    return cachedChars[key];
}

function button(t, w){
    w = w || 440;
    return cache(w, 100, function(r){
        with(r){
            fillStyle = '#444';
            fillRect(0, 90, w, 10);

            fillStyle = '#fff';
            fillRect(0, 0, w, 90);

            drawText(r, '::' + t + '()', 100, 20, 10, '#000');

            fillStyle = '#000';
            beginPath();
            moveTo(40, 20);
            lineTo(80, 45);
            lineTo(40, 70);
            fill();
        }
    });
}

function SpawnAnimation(){
    this.alpha = 1;
    this.radius = 400;

    this.render = function(){
        R.globalAlpha = this.alpha;
        R.fillStyle = '#fff';
        beginPath();
        arc(P.x, P.y, this.radius, 0, PI * 2, 1);
        fill();
        R.globalAlpha = 1;
    };

    var a = this;

    interp(this, 'radius', 320, 0, 0.4, 1);
    interp(this, 'alpha', 0, 1, 0.4, 1, 0, function(){
        P.visible = 1;

        for(var i = 0 ; i < 50 ; i++){
            var t = rand(0.5, 1.5),
                a = rand(-PI, PI),
                l = rand(8, 80),
                x = cos(a) * l + P.x,
                y = sin(a) * l + P.y - 40;

            particle(4, '#fff', [
                ['x', x, x, t, 0, oscillate],
                ['y', y, y + rand(80, 240), t, 0],
                ['s', rand(8, 16), 0, t]
            ], 1);
        }
    });

    P.visible = P.controllable = 0;
    P.talking = 1;
    G.hideTiles = 1;

    var tUnlock = 500;
    if(!G.currentLevel){
        delayed(function(){
            P.say([
                /*nomangle*/'Hello there!'/*/nomangle*/,
                /*nomangle*/'This code is falling apart!'/*/nomangle*/,
                /*nomangle*/'Let\'s fix the glitches before it\'s too late!'/*/nomangle*/
            ]);
        }, 2000);
        tUnlock = 9000;
    }

    delayed(function(){
        spawnSound.play();
    }, 500);

    delayed(function(){
        P.talking = 0;
        P.controllable = 1;
        showTilesAnimation();
    }, tUnlock);
}

function surroudingTiles(f){
    var cameraRightX = V.x + CANVAS_WIDTH,
        cameraBottomY = V.y + CANVAS_HEIGHT;

    for(var row = ~~(V.y / 80) ; row <  ~~(cameraBottomY / 80) + 1 ; row++){
        for(var col = ~~(V.x / 80) ; col <  ~~(cameraRightX / 80) + 1 ; col++){
            if(W.tiles[row] && W.tiles[row][col]){
                f(W.tiles[row][col]);
            }
        }
    }
}

function showTilesAnimation(){
    G.hideTiles = 0;

    surroudingTiles(function(t){
        var r = dist(t.center, P);
        t.sizeScale = 0.5;
        interp(t, 'sizeScale', 0, 1, r / CANVAS_WIDTH, 0, easeOutBounce);
    });
}

function hideTilesAnimation(){
    G.hideTiles = 0;

    surroudingTiles(function(t){
        var r = dist(t.center, P);
        t.sizeScale = 0.5;
        interp(t, 'sizeScale', 1, 0, r / CANVAS_WIDTH, 0, easeOutBounce);
    });
}

var codePattern = cachePattern(400, 400, function(r){
    var lines = Character.toString().split(';').slice(0, 20),
        step = 400 / lines.length,
        y = step / 2;

    with(r){
        fillStyle = '#000';
        fillRect(0, 0, 400, 400);

        fillStyle = '#fff';
        globalAlpha = 0.1;
        font = '14pt Courier New';

        lines.forEach(function(l, i){
            fillText(l, 0, y);

            y += step;
        });
    }
});

var masks = [{
    "mask": revertMatrix("0000000000,1103113011,1100000011,1100000011,1110000111,0000000000,0030000300,1110110111,1110000111,1110000111"),
    "exits": 15
}, {
    "mask": revertMatrix("1111111111,1111111111,1111111111,0330000330,0000000000,0000000000,0330000330,1113003111,1110000111,1110000111"),
    "exits": 14
}, {
    "mask": revertMatrix("1001111001,1000000001,1111001111,1000000001,1000000001,1000000000,1001111000,1001111001,1001111001,1111111111"),
    "exits": 9
}, {
    "mask": revertMatrix("1111111111,1000000000,1000000000,1000000000,1001100300,1001100110,1001100110,1111111111,1111111111,1111111111"),
    "exits": 8
}, {
    "mask": revertMatrix("1110000001,1111000011,0011000011,0000000001,0003000001,0011000011,0011000011,1111301111,1000000001,1000000001"),
    "exits": 7
}, {
    "mask": revertMatrix("0000000000,0030000300,0111331110,0000000000,0000000000,0030000300,0111331110,0000000000,0000000000,0000000000"),
    "exits": 15
}, {
    "mask": revertMatrix("1100000011,1100000011,0000000000,0000330000,0000110000,0000110000,0011111100,0000330000,0000000000,0000000000"),
    "exits": 15
}, {
    "mask": revertMatrix("1000000001,1000000001,1000000001,1111001111,0000000000,0000000000,1110110111,1000000001,1000000001,1111111111"),
    "exits": 13
}, {
    "mask": revertMatrix("0000000000,0000000000,0000000000,0000000000,0000330000,0110110110,0110000110,0110000110,1111111111,1111111111"),
    "exits": 13
}, {
    "mask": revertMatrix("1300000011,1300000011,1000000011,1000000011,1100000011,1100000030,1100110000,1100110030,1100110011,1111111111"),
    "exits": 9
}, {
    "mask": revertMatrix("1111111111,1111111111,1111111111,0000110000,0000110000,0000000000,0000000000,1110000111,1110330111,1111111111"),
    "exits": 12
}, {
    "mask": revertMatrix("1111111111,0000000001,0000000001,0000000011,0000000001,0033000001,1111303111,1111000001,1111000001,1111000001"),
    "exits": 6
}, {
    "mask": revertMatrix("0000000001,0000311301,0000000001,0000000001,0000000001,1110000301,1110000111,1110000001,1113300001,1111111111"),
    "exits": 5
}, {
    "mask": revertMatrix("1111111111,0000000000,0000000000,0000110000,0000110000,0001111000,0000000000,0030000300,0110000110,1111111111"),
    "exits": 12
}, {
    "mask": revertMatrix("1111111111,1110000111,1110000111,0000000000,0000000000,0000110000,0300110030,1100110011,1100110011,1111111111"),
    "exits": 12
}, {
    "mask": revertMatrix("1111111111,1111111111,0000000000,0000000000,0000110000,0000000000,0110000110,0110000110,1110000111,1111111111"),
    "exits": 12
}, {
    "mask": revertMatrix("1111111111,0000000000,0000000000,0000000000,0000000110,0000000110,0001100113,0001100111,1001100111,1111111111"),
    "exits": 12
}, {
    "mask": revertMatrix("1111111111,0000000000,0000000000,1103113011,0000000000,0000000000,1103113011,0000000000,0000000000,1111111111"),
    "exits": 12
}, {
    "mask": revertMatrix("1000000001,1113111001,1000000001,1000000001,1001111111,1000000000,1000000000,1111311001,1000000001,1000000001"),
    "exits": 11
}, {
    "mask": revertMatrix("1111111111,1001111111,1000000000,1001000300,1111001110,1000001110,1000001111,1001111111,1001111111,1111111111"),
    "exits": 8
}, {
    "mask": revertMatrix("1111111111,1000000001,1000000001,1113300111,1000000000,1000000000,1110033111,1000000001,1000000001,1111111111"),
    "exits": 8
}, {
    "mask": revertMatrix("1110000111,1110000111,1110000111,0000000000,0030000300,0110000110,0110110110,1110000111,1110000111,1111111111"),
    "exits": 13
}, {
    "mask": revertMatrix("1111111111,0000000001,0000000001,0111111001,0100000001,1100000001,1100113111,1100000001,1100000001,1111111001"),
    "exits": 6
}, {
    "mask": revertMatrix("1100000011,0000110000,0000110000,0011111100,0011111100,0000110000,3300110033,0000000000,0000000000,1111111111"),
    "exits": 13
}];

var tutorialLevel = revertMatrix("11111111111111111111111111111111111111111111111111111111111111111111111111111111,11111111111111111111111111111000000000111111111111111111111111111111111111111111,11111111111111111111111111111000000000111111111111111111111111111111111111111111,10000000000000000000000001100000000000001100000000000000000000000000000000000001,10000000000000000000000001100000111000001100000000000000000000000000000000000001,10000000000000000000000006600000111000006600000000000000000000000000000000000001,10000000000000110000000000000111111111000000000111111100000000100000010000000001,10400000001100110011000000000111111111000000000111111100000000100000010000050001,11111111111177117711111111111111111111111111111111111111111111111111111111111111");

function rand(a, b){
    // ~~b -> 0
    return random() * ((a || 1) - ~~b) + ~~b;
}

// Actual distance
function dist(a, b){
    return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

onresize = function(){
    var mw = innerWidth,
        mh = innerHeight,

        ar = mw / mh, // available ratio
        br = CANVAS_WIDTH / CANVAS_HEIGHT, // base ratio
        w,
        h,
        s = D.querySelector('#cc').style;

    if(ar <= br){
        w = mw;
        h = w / br;
    }else{
        h = mh;
        w = h * br;
    }

    s.width = w + 'px';
    s.height = h + 'px';
};

function pick(choices, results, forceArray){
    choices = choices.slice(0);
    results = results || 1;

    var res = [];

    while(res.length < results){
        res = res.concat(
            choices.splice(~~(random() * choices.length), 1) // returns the array of deleted elements
        );
    }

    return results === 1 && !forceArray ? res[0] : res;
}

function between(a, b, c){
    if(b < a) return a;
    if(b > c ) return c;
    return b;
}

// Remove an element from an array
function remove(l, e){
    var i = l.indexOf(e);
    if(i >= 0) l.splice(i, 1);
}

function linear(t, b, c, d){
    return (t / d) * c + b;
}

function easeOutBack(t, b, c, d) {
    s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
}

function oscillate(t, b, c, d) {
    return sin((t / d) * PI * 4) * c + b;
}

function easeOutBounce(t, b, c, d) {
    if ((t /= d) < (1/2.75)) {
        return c * (7.5625 * t * t) + b;
    }
    if (t < (2/2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
    }
    if (t < (2.5/2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
    }
    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
}

function interp(o, p, a, b, d, l, f, e){
    var i = {
        o: o, // object
        p: p, // property
        a: a, // from
        b: b, // to
        d: d, // duration
        l: l || 0, // delay
        f: f || linear, // easing function
        e: e, // end callback
        t: 0,
        cycle: function(e){
            if(i.l > 0){
                i.l -= e;
                i.o[i.p] = i.a;
            }else{
                i.t = min(i.d, i.t + e);
                i.o[i.p] = i.f(i.t, i.a, i.b - i.a, i.d);
                if(i.t == i.d){
                    if(i.e){
                        i.e();
                    }
                    remove(G.cyclables, i);
                }
            }
        }
    };
    G.add(i, 2);
}

function addZeros(n, l){
    n = '' + n;
    while(n.length < l){
        n = '0' + n;
    }
    return n;
}

function formatTime(t, ms){
    var m = ~~(t / 60),
        s = ~~(t % 60);

    return addZeros(m, 2) + ':' + addZeros(s, 2) + (ms ? '.' + addZeros(~~(t % 1 * 100), 2) : '');
}

function Menu(){
    this.buttons = [];

    this.alpha = 1;

    this.button = function(d, x, y, a){
        this.buttons.push({
            d: d, // drawable
            x: x,
            y: y,
            a: a, // action
            o: 1 // opacity
        });
    };

    this.click = function(x, y){
        if(this.alpha == 1){
            this.buttons.forEach(function(b){
                if(x > b.x && y > b.y && x < b.x + b.d.width && y < b.y + b.d.height){
                    menuSound.play();
                    b.a.call(b);
                }
            });
        }
    };

    this.render = function(){
        R.globalAlpha = this.alpha;

        R.fillStyle = codePattern;
        fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        var a = this.alpha;
        this.buttons.forEach(function(b){
            R.globalAlpha = a * b.o;
            drawImage(b.d, b.x, b.y);
        });

        R.globalAlpha = 1;
    };

    this.animateButtons = function(){
        this.buttons.forEach(function(b, i){
            interp(b, 'x', -b.d.width, 0, 0.25, i * 0.25 + 0.5);
        });
    };
}

function GameOverMenu(reason){
    Menu.call(this);

    var ss = [
        [/*nomangle*/'critical'/*/nomangle*/, /*nomangle*/'mental health'/*/nomangle*/],
        [/*nomangle*/'time'/*/nomangle*/, /*nomangle*/'expired'/*/nomangle*/],
        [/*nomangle*/'code fixed'/*/nomangle*/, '!!!']
    ][reason];

    var t = formatTime(G.totalTime);

    this.button(button(/*nomangle*/'retry'/*/nomangle*/), 0, 420, G.newGame);
    this.button(button(/*nomangle*/'back'/*/nomangle*/), 0, 560, G.mainMenu);
    this.button(button(/*nomangle*/'share'/*/nomangle*/), 0, 700, function(){
        open(/*nomangle*/'//twitter.com/intent/tweet?'/*/nomangle*/ +
            /*nomangle*/'hashtags=js13k'/*/nomangle*/ +
            /*nomangle*/'&url='/*/nomangle*/ + encodeURIComponent(/*nomangle*/'http://js13kgames.com/entries/glitchbuster'/*/nomangle*/) +
            /*nomangle*/'&text='/*/nomangle*/ + encodeURIComponent(
                (reason == 2 ? /*nomangle*/'I fixed all glitches in '/*/nomangle*/ + t : /*nomangle*/'I fixed '/*/nomangle*/ + (G.currentLevel - 1) + /*nomangle*/'/13 glitches'/*/nomangle*/) + /*nomangle*/' on Glitchbuster!'/*/nomangle*/
            )
        );
    });

    /*var b;
    this.button(button(nomangleing('foo')), 0, 700, function(){
        this.d = button((b = !b) ? 'bar' : 'foo');
    });*/

    this.animateButtons();

    ss.push(reason == 2 ? /*nomangle*/'time: '/*/nomangle*/ + t : /*nomangle*/'fixed '/*/nomangle*/ + (G.currentLevel - 1) + '/13');

    var s1 = ss[0],
        t1 = 10,
        w1 = requiredCells(s1) * t1,
        s2 = ss[1],
        t2 = 10,
        w2 = requiredCells(s2) * t2,
        s3 = ss[2],
        t3 = 5,
        w3 = requiredCells(s3) * t3;

    this.button(cache(w1, t1 * 5 + 5, function(r){
    	drawText(r, s1, 0, 5, t1, '#444');
        drawText(r, s1, 0, 0, t1, '#fff');
    }), (CANVAS_WIDTH - w1) / 2, 120);

    this.button(cache(w2, t2 * 5 + 5, function(r){
        drawText(r, s2, 0, 5, t2, '#444');
        drawText(r, s2, 0, 0, t2, '#fff');
    }), (CANVAS_WIDTH - w2) / 2, 200);

    this.button(cache(w3, t3 * 5 + 5, function(r){
        drawText(r, s3, 0, 5, t3, '#444');
        drawText(r, s3, 0, 0, t3, '#fff');
    }), (CANVAS_WIDTH - w3) / 2, 280);
}

function MainMenu(){
    Menu.call(this);

    this.button(button(/*nomangle*/'learn'/*/nomangle*/), 0, 420, G.tutorial);
    this.button(button(/*nomangle*/'start'/*/nomangle*/), 0, 560, G.newGame);
    this.button(button(/*nomangle*/'whois'/*/nomangle*/), 0, 700, function(){
        open(/*nomangle*/'//goo.gl/QRxjGP'/*/nomangle*/);
    });

    this.animateButtons();

    var titleX = (CANVAS_WIDTH - 460) / 2;
    this.button(cache(460, 230, function(r){
    	drawText(r, 'glitch', 0, 10, 20, '#444');
    	drawText(r, 'glitch', 0, 0, 20, '#fff');

    	drawText(r, 'buster', 0, 130, 20, '#444');
    	drawText(r, 'buster', 0, 120, 20, '#fff');
    }), titleX, 90);

    interp(this.buttons[this.buttons.length - 1], 'o', 0, 1, 0.25, 0.5);
}

function ModeMenu(){
    Menu.call(this);

    this.button(button(/*nomangle*/'high'/*/nomangle*/, 500), 0, 420, function(){
        shittyMode = 0; // need to switch from undefined
        G.mainMenu();
    });
    this.button(button(/*nomangle*/'low'/*/nomangle*/, 500), 0, 560, function(){
        G.setResolution(0.5);
        shittyMode = 1;
        G.mainMenu();
    });

    this.animateButtons();

    var titleX = (CANVAS_WIDTH - 270) / 2;
    this.button(cache(270, 55, function(r){
        drawText(r, /*nomangle*/'quality'/*/nomangle*/, 0, 5, 10, '#444');
        drawText(r, /*nomangle*/'quality'/*/nomangle*/, 0, 0, 10, '#fff');
    }), titleX, titleX);
}

function Item(x, y, type){
    this.x = x;
    this.y = y;
    this.type = type;

    this.render = function(){
        if(!V.contains(this.x, this.y, 80)){
            return;
        }

        save();
        translate(x, y);

        if(!shittyMode){
            drawImage(whiteHalo, -80, -80);
        }

        var arrowOffsetY = sin(G.t * PI * 2 * 0.5) * 10 + -40;

        // Arrow
        R.fillStyle = '#fff';
        beginPath();
        moveTo(-20 / 2, -20 / 2 + arrowOffsetY);
        lineTo(20 / 2, -20 / 2 + arrowOffsetY);
        lineTo(0, arrowOffsetY);
        fill();

        this.renderItem(); // defined in subclasses

        restore();
    };

    this.cycle = function(){
        if(dist(this, P) < 40 && !this.pickedUp){
            G.remove(this);

            this.particles();

            this.pickedUp = 1;
            pickupSound.play();

            this.pickup(); // defined in subclasses
        }
    };

    this.particles = function(){
        for(var i = 0 ; i < 10 ; i++){
            var x = rand(this.x - 80 / 4, this.x + 80 / 4),
                y = rand(this.y - 80 / 4, this.y + 80 / 4),
                d = rand(0.2, 0.5);
            particle(3, '#fff', [
                ['x', x, x, 0.5],
                ['y', y, y - rand(40, 80), 0.5],
                ['s', 12, 0, 0.5]
            ]);
        }
    };
}

function GrenadeItem(x, y){
    Item.call(this, x, y, 2);

    this.renderItem = function(){
        R.fillStyle = 'red';
        rotate(PI / 4);
        fillRect(-8, -8, 16, 16);
    };

    this.pickup = function(){
        P.grenades++;

        P.say([pick([
            /*nomangle*/'Here\'s a breakpoint!'/*/nomangle*/,
            /*nomangle*/'You found a breakpoint!'/*/nomangle*/,
            /*nomangle*/'That\'s a breakpoint!'/*/nomangle*/
        ]), G.touch ? /*nomangle*/'Hold the circle button to throw it'/*/nomangle*/ : /*nomangle*/'Press SPACE to throw it'/*/nomangle*/]);
    };
}

function HealthItem(x, y){
    Item.call(this, x, y, 1);

    this.renderItem = function(){
        var o = -requiredCells('!', 5) * 5 / 2;
        drawText(R, '!', o, o, 5, '#f00');
    };

    this.pickup = function(){
        P.health++;
        P.say(/*nomangle*/'health++'/*/nomangle*/); // TODO more strings
    };
}

function mirrorMask(mask){
    var exits = mask.exits;
    if(mask.exits & 8){
        exits |= 4;
    }else{
        exits ^= 4;
    }
    if(mask.exits & 4){
        exits |= 8;
    }else{
        exits ^= 8;
    }

    return {
        'mask': mask.mask.map(function(r){
            return r.slice(0).reverse(); // reverse() modifies the array so we need to make a copy of it
        }),
        'exits': exits
    };
}

function pickMask(masks, requirements){
    return pick(masks.filter(function(m){
        return m.exits == requirements;
    }));
}


function generateWorld(id){
    if(!id){
        return pad(tutorialLevel, 5);
    }

    // Mirror all the masks to have more possibilities
    var usedMasks = masks.concat(masks.map(mirrorMask));

    var maskMapRows = id < 0 ? 4 : round((id - 1) * 0.4 + 2),
        maskMapCols = id < 0 ? 5 : round((id - 1) * 0.2 + 3),
        maskMap = [],
        col,
        row,
        downCols = [],
        cols = [];

    for(col = 0 ; col < maskMapCols ; col++){
        cols.push(col);
    }

    for(row = 0 ; row < maskMapRows ; row++){
        maskMap.push([]);

        for(col = 0 ; col < maskMapCols ; col++){
            maskMap[row][col] = 0;

            // The tile above was going down, need to ensure there's a to this one
            if(downCols.indexOf(col) >= 0){
                maskMap[row][col] |= 1;
            }

            // Need to connect left if we're not on the far left
            if(col > 0){
                maskMap[row][col] |= 4;
            }

            // Need to connect right if we're not on the far right
            if(col < maskMapCols - 1){
                maskMap[row][col] |= 8;
            }
        }

        // Generate the link to the lower row
        if(row < maskMapRows - 1){
            downCols = pick(cols, pick([1, 2, 3]), 1);
            downCols.forEach(function(col){
                maskMap[row][col] |= 2;
            });
        }
    }

    var matrix = [];
    for(row = 0 ; row < maskMapRows * 10 ; row++){
        matrix[row] = [];
    }

    function applyMask(matrix, mask, rowStart, colStart){
        for(var row = 0 ; row < 10 ; row++){
            for(var col = 0 ; col < 10 ; col++){
                matrix[row + rowStart][col + colStart] = mask[row][col];
            }
        }
    }

    for(row = 0 ; row < maskMapRows ; row++){
        for(col = 0 ; col < maskMapCols ; col++){

            var mask = pickMask(usedMasks, maskMap[row][col]).mask;

            // Apply mask
            applyMask(matrix, mask, row * 10, col * 10);
        }
    }

    var finalMatrix = [],
        floors = [],
        ceilings = [],
        floorsMap = [];

    for(row = 0 ; row < matrix.length ; row++){
        finalMatrix.push([]);
        floorsMap.push([]);

        matrix[row][col] = parseInt(matrix[row][col]);

        for(col = 0 ; col < matrix[row].length ; col++){
            finalMatrix[row].push(matrix[row][col]);

            // Probabilistic wall, let's decide now
            if(matrix[row][col] == 3){
                finalMatrix[row][col] = rand() < 0.5 ? 1 : 0;
            }

            // Detect floors and ceilings to add spikes, spawn and exit
            if(row > 0){
                if(finalMatrix[row][col] == 1 && finalMatrix[row - 1][col] == 0){
                    var f = [row, col];
                    floors.push(f);
                    floorsMap[row].push(f);
                }

                if(finalMatrix[row][col] == 0 && finalMatrix[row - 1][col] == 1){
                    ceilings.push([row - 1, col]);
                }
            }
        }
    }

    // Add a random spawn and a random exit
    var spawn = pick(flatten(floorsMap.slice(0, 10))),
        exit = pick(flatten(floorsMap.slice(finalMatrix.length - 10 * 0.6)));

    finalMatrix[spawn[0] - 1][spawn[1]] = 4;
    finalMatrix[exit[0] - 1][exit[1]] = 5;
    finalMatrix[exit[0]][exit[1]] = 2;

    // Add random spikes
    floors.forEach(function(f){
        if(f != exit && f != spawn && rand() < 0.05){
            finalMatrix[f[0]][f[1]] = 7;
        }
    });

    ceilings.forEach(function(c){
        if(c != exit && c != spawn && rand() < 0.05){
            finalMatrix[c[0]][c[1]] = 6;
        }
    });

    return pad(finalMatrix, 5);
}

function Grenade(x, y, angle, force, simulated){
    this.x = x;
    this.y = y;
    this.timer = 2;
    this.rotation = 0;

    this.vX = cos(angle) * force;
    this.vY = sin(angle) * force;

    this.cycle = function(e){
        var before = {
            x: this.x,
            y: this.y
        };

        if(!this.stuck || this.stuck.destroyed){
            this.stuck = 0;

            this.vY += e * 7500 * 0.5;

            this.x += this.vX * e;
            this.y += this.vY * e;

            this.rotation += PI * 4 * e;

            var after = {
                x: this.x,
                y: this.y
            };

            // Trail
            if(!shittyMode && !simulated){
                var t = {
                    alpha: 1,
                    render: function(){
                        R.strokeStyle = 'rgba(255, 0, 0, ' + this.alpha + ')';
                        R.lineWidth = 8;
                        beginPath();
                        moveTo(before.x, before.y);
                        lineTo(after.x, after.y);
                        stroke();
                    }
                };
                G.add(t, 1);

                interp(t, 'alpha', 1, 0, 0.3, 0, 0, function(){
                    G.remove(t);
                });
            }
        }

        // Explosion
        if(!simulated){
            this.timer -= e;
            if(this.timer <= 0){
                this.explode();
            }else{
                for(var i in G.killables){
                    if(G.killables[i] != P && dist(G.killables[i], this) < 40 / 2){
                        return this.explode(); // no need to do the rest
                    }
                }
            }
        }

        var tile = W.tileAt(this.x, this.y);
        if(tile && !this.stuck){
            this.vX *= 0.5;
            this.vY *= 0.5;

            var iterations = 0,
                adjustments;
            do{
                adjustments = tile.pushAway(this, 16, 16);

                if(simulated){
                    this.stuck |= adjustments;
                }

                if(adjustments & 1){
                    this.vY = -abs(this.vY);
                }
                if(adjustments & 2){
                    this.vY = abs(this.vY);
                }
                if(adjustments & 4){
                    this.vX = -abs(this.vX);
                }
                if(adjustments & 8){
                    this.vX = abs(this.vX);
                }

                if(max(abs(this.vX), abs(this.vY)) < 150){
                    this.stuck = tile;
                    this.vX = this.vY = 0;
                }else{
                    // Particle when bouncing
                    if(adjustments && !shittyMode && !simulated){
                        for(var i = 0 ; i < 2 ; i++){
                            var x = this.x + rand(-8, 8),
                                y = this.y + rand(-8, 8),
                                d = rand(0.2, 0.5);
                            particle(3, '#fff', [
                                ['x', x, x, d],
                                ['y', y, y - rand(40, 80), d],
                                ['s', 12, 0, d]
                            ]);
                        }
                    }
                }
            }while(adjustments && iterations++ < 5);
        }
    };

    this.explode = function(){
        if(this.exploded){
            return;
        }

        this.exploded = 1;

        [
            [this.x - 80, this.y + 80],
            [this.x, this.y + 80],
            [this.x + 80, this.y + 80],
            [this.x - 80, this.y],
            [this.x, this.y],
            [this.x + 80, this.y],
            [this.x - 80, this.y - 80],
            [this.x, this.y - 80],
            [this.x + 80, this.y - 80]
        ].forEach(function(p){
            W.destroyTileAt(p[0], p[1]);
        });

        for(var i = 0 ; i < 40 ; i++){
            var d = rand(0.5, 1.5),
                x = rand(-80, 80) + this.x,
                y = rand(-80, 80) + this.y;

            particle(3, pick([
                '#f00',
                '#f80',
                '#ff0'
            ]), [
                ['x', x, x + 8, d, 0, oscillate],
                ['y', y, y - rand(80, 240), d, 0],
                ['s', rand(24, 40), 0, d]
            ]);
        }

        for(i = G.killables.length ; --i >= 0 ;){
            if(dist(this, G.killables[i]) < 80 * 2){
                G.killables[i].hurt(this, 3);
            }
        }

        G.remove(this);

        var m = this;
        delayed(function(){
            if(V.targetted == m){
                V.targetted = 0;
            }
        }, 1000);

        explosionSound.play();
    };

    this.render = function(){
        save();
        translate(this.x, this.y);
        rotate(this.rotation);
        R.fillStyle = 'red';
        fillRect(-8, -8, 16, 16);
        restore();
    };
}

function World(matrix){
    this.tiles = [];
    this.matrix = matrix;

    this.rows = matrix.length;
    this.cols = matrix[0].length;

    for(var row = 0 ; row < matrix.length ; row++){
        this.tiles.push([]);
        for(var col = 0 ; col < matrix[row].length ; col++){
            this.tiles[row][col] = 0;
            if(matrix[row][col] > 0){
                this.tiles[row][col] = new Tile(row, col, matrix[row][col]);

                if(matrix[row][col] == 4){
                    this.spawn = this.tiles[row][col];
                }else if(matrix[row][col] == 5){
                    this.exit = this.tiles[row][col];
                }
            }
        }
    }

    this.tileAt = function(x, y){
        var row = ~~(y / 80);
        var t = this.tiles[row] && this.tiles[row][~~(x / 80)];
        return t && t.solid && t;
    };

    this.destroyTile = function(tile){
        if(tile && tile.type != 2){
            for(var i = 0 ; i < 50 ; i++){
                var d = rand(0.5, 2),
                    x = tile.x + rand(80);

                particle(4, '#fff', [
                    ['x', x, x, d],
                    ['y', tile.y + rand(80), this.firstYUnder(x, tile.center.y), d, 0, easeOutBounce],
                    ['s', 12, 0, d]
                ]);
            }

            tile.destroyed = 1;
            this.tiles[tile.row][tile.col] = 0;
        }
    };

    this.destroyTileAt = function(x, y){
        this.destroyTile(this.tileAt(x, y));
    };

    this.detectPaths = function(l){
        var colCount = 0,
            paths = [];
        for(var row = 0 ; row < this.rows - 1 ; row++){ // skip the last row
            colCount = 0;
            for(var col = 0 ; col < this.cols ; col++){
                var current = this.matrix[row][col] != 0;
                var below = this.matrix[row + 1][col] == 1 || this.matrix[row + 1][col] == 2;

                if(!below || current){
                    if(colCount >= l){
                        paths.push({
                            row: row,
                            colLeft: col - colCount,
                            colRight: col - 1
                        });
                    }
                    colCount = 0;
                }else{
                    colCount++;
                }
            }
        }
        return paths;
    };

    this.firstYUnder = function(x, y){
        do{
            y += 80;
        }while(y < this.rows * 80 && !this.tileAt(x, y));

        return ~~(y / 80) * 80;
    };

    this.render = function(){
        R.fillStyle = G.hideTiles || shittyMode ? '#000' : '#fff';
        fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        save();

        /*if(G.invert){
            translate(0, CANVAS_HEIGHT);
            scale(1, -1);
        }*/

        translate(-V.x, -V.y);

        R.fillStyle = shittyMode ? '#000' : codePattern;
        fillRect(0, 0, this.cols * 80, this.rows * 80);

        var cameraRightX = V.x + CANVAS_WIDTH,
            cameraBottomY = V.y + CANVAS_HEIGHT;

        for(var row = ~~(V.y / 80) ; row <  ~~(cameraBottomY / 80) + 1 ; row++){
            for(var col = ~~(V.x / 80) ; col <  ~~(cameraRightX / 80) + 1 ; col++){
                if(this.tiles[row] && this.tiles[row][col]){
                    this.tiles[row][col].render();
                }
            }
        }

        P.render();

        for(var i in G.renderables){
            G.renderables[i].render();
        }

        if(!shittyMode){
            var px = P.x,
                py = P.y + (P.lookingDown ? 200 : 0);

            px = V.x + CANVAS_WIDTH / 2;
            py = V.y + CANVAS_HEIGHT / 2;
            var haloX = ~~px - 500,
                haloY = ~~py - 500,
                haloX2 = haloX + 1000,
                haloY2 = haloY + 1000;

            R.fillStyle = '#000';
            if(haloX > V.x){
                fillRect(V.x, haloY, haloX - V.x, 1000);
            }
            if(haloX2 < cameraRightX){
                fillRect(haloX2, haloY, cameraRightX - haloX2, 1000);
            }
            if(haloY > V.y){
                fillRect(V.x, V.y, CANVAS_WIDTH, haloY - V.y);
            }
            if(haloY2 < cameraBottomY){
                fillRect(V.x, haloY2, CANVAS_WIDTH, cameraBottomY - haloY2);
            }

            drawImage(darkHalo, haloX, haloY);
        }

        restore();
    };
}

function Camera(){
    // Lazy init
    this.realX = this.realY = this.x = this.y = 0;

    // Position at which the camera would ideally be
    this.target = function(facing){
        var x, y;
        if(!this.targetted){
            x = P.x + (P.controllable && facing ? P.facing * 50 : 0);
            y = P.y + (P.controllable && P.lookingDown && facing ? 400 : 0);
        }else{
            x = this.targetted.x;
            y = this.targetted.y;
        }
        return {
            x: ~~(x - (CANVAS_WIDTH / 2)),
            y: ~~(y - (CANVAS_HEIGHT / 2))
        };
    };

    // Instantly moves the camera to the position where it's supposed to be
    this.forceCenter = function(e){
        var t = this.target();
        this.realX = this.x = t.x;
        this.realY = this.y = t.y;
    };

    this.contains = function(x, y, d){
        return x + d > this.x &&
            y + d > this.y &&
            x - d < this.x + CANVAS_WIDTH &&
            y - d < this.y + CANVAS_HEIGHT;
    };

    this.cycle = function(e){
        var target = this.target(1),
            d = dist(target, this),
            speed = max(1, d / 0.2),
            angle = atan2(target.y - this.realY, target.x - this.realX),
            appliedDist = min(speed * e, d);

        var px = 1 / G.resolution;

        if(d > px){
            this.realX += cos(angle) * appliedDist;
            this.realY += sin(angle) * appliedDist;
        }

        this.x = ~~(this.realX / px) * px;
        this.y = ~~(this.realY / px) * px;
    };
}

function Tile(row, col, type){
    this.x = (this.col = col) * 80;
    this.y = (this.row = row) * 80;
    this.solid = [4, 5].indexOf(type) < 0;
    this.type = type;

    this.alpha = 1;
    this.sizeScale = 1;

    this.center = {
        x: this.x + 80 / 2,
        y: this.y + 80 / 2
    };

    this.pushAway = function(character, w, h){
        var adjustments = [{
            x: this.x - (w || 40) / 2,
            y: character.y,
            type: 4
        }, {
            x: this.x + 80 + (w || 40) / 2,
            y: character.y,
            type: 8
        }, {
            x: character.x,
            y: this.y - (h || 52) / 2,
            type: 1
        }, {
            x: character.x,
            y: this.y + 80 + (h || 52) / 2,
            type: 2
        }];

        var closest,
            closestDist;

        adjustments.forEach(function(adj){
            var d = sqrt(
                pow(adj.x - character.x, 2) +
                pow(adj.y - character.y, 2)
            );
            if(!closest || d < closestDist){
                closest = adj;
                closestDist = d;
            }
        });

        character.x = closest.x;
        character.y = closest.y;

        return closest.type;
    };

    this.render = function(){
        if(!G.hideTiles && !this.hidden){
            R.fillStyle = '#fff';

            if(shittyMode){
                var colorChar = ~~(between(0, 1 - dist(this.center, P) / 800, 1) * 0xf);
                R.fillStyle = '#' + colorChar.toString(16) + colorChar.toString(16) + colorChar.toString(16);
            }

            save();
            translate(this.center.x, this.center.y);
            scale(this.sizeScale, this.sizeScale);
            translate(-40, -40);

            if(type == 1 || type == 2){
                fillRect(0, 0, 80, 80);
            }

            if(type == 7 || type == 6){
                if(type == 6){
                    translate(0, 80);
                    scale(1, -1);
                }

                fillRect(0, 24, 80, 56);

                beginPath();
                moveTo(0, 24);

                var step = 20;
                for(var x = step / 2 ; x < 80 ; x += step){
                    lineTo(x, 0);
                    lineTo(x + step / 2, 24);
                }
                lineTo(80, 24);
                fill();
            }

            if(type == 5){
                // Halo
                if(!shittyMode){
                    drawImage(whiteHalo, -40, -40);
                }

                if(this.alpha == 1){
                    // Bug ID
                    R.font = '14pt Courier New';

                    fillText(
                        'Bug #' + G.currentLevel,
                        40,
                        -40
                    );

                    // Arrow
                    beginPath();
                    moveTo(30, -20);
                    lineTo(50, -20);
                    lineTo(40, -10);
                    fill();
                }

                R.globalAlpha = this.alpha;

                R.fillStyle = noisePattern;

                var x = rand(400),
                    y = rand(400);

                translate(x, y);
                fillRect(-x, -y, 80, 80);
            }

            restore();
        }
    };

    this.landed = function(c){
        if(type === 7){
            c.hurt(this.center);
        }
    };

    this.tapped = function(c){
        if(type == 6){
            c.hurt(this.center);
        }
    };
}

function Character(){
    this.x = this.y = 0;
    this.direction = 0;
    this.facing = 1;

    this.visible = 1;

    this.offsetY = 0;
    this.bodyOffsetY = 0;
    this.bubbleTailLength = 0;
    this.saying = [];
    this.sayingTimeleft = 0;

    this.scaleFactorX = 1;
    this.scaleFactorY = 1;
    this.recoveryTime = 0;
    this.frictionFactor = 4;

    this.vX = 0;
    this.vY = 0;

    this.lastAdjustment = 0;

    var jumpCount = 0,
        previousFloorY;

    this.render = function(){
        if(this.recoveryTime > 0 && ~~((this.recoveryTime * 2 * 4) % 2) && !this.dead ||
            !this.visible ||
            !V.contains(this.x, this.y, 40 / 2)){
            return;
        }

        save();
        translate(~~this.x, ~~this.y + this.offsetY);

        // Halo
        if(!shittyMode && !this.dead){
            drawImage(this.halo, -80, -80);
        }

        // Dialog
        if(this.sayingTimeleft > 0 && this.saying.length){
            R.font = '16pt Arial';

            var t = this.saying[0],
                w = measureText(t).width + 8;
            R.fillStyle = '#000';
            R.globalAlpha = 0.5;
            fillRect(-w / 2, -68 - this.bubbleTailLength, w, 24);
            R.globalAlpha = 1;

            R.fillStyle = this.bodyColor;
            fillRect(-2, -40, 4, -this.bubbleTailLength);

            fillText(t, 0, -56 - this.bubbleTailLength);
        }

        // Facing left or right
        scale(this.facing * this.scaleFactorX, this.scaleFactorY);

        // Legs
        if(!this.dead){
            save();
            translate(-18, -26);

            var legAmplitude = 7,
                legPeriod = 0.3,
                legLength = (sin((G.t * PI * 2) / legPeriod) / 2) * legAmplitude + legAmplitude / 2;

            var leftLegLength = this.direction || jumpCount > 0 ? legLength : legAmplitude;
            var rightLegLength = this.direction || jumpCount > 0 ? legAmplitude - legLength : legAmplitude;

            R.fillStyle = this.legColor;
            fillRect(0, 45, 6, leftLegLength);
            fillRect(30, 45, 6, rightLegLength);
            restore();
        }

        // Let's bob a little
        var bodyRotationMaxAngle = PI / 16,
            bodyRotationPeriod = 0.5,
            bodyRotation = (sin((G.t * PI * 2) / bodyRotationPeriod) / 2) * bodyRotationMaxAngle;

        if(this.bodyRotation){
            bodyRotation = this.bodyRotation;
        }else if(!this.direction && !this.fixing){
            bodyRotation = 0;
        }

        translate(0, this.bodyOffsetY);
        rotate(bodyRotation);

        save();
        translate(-23, -26);

        // Body
        R.fillStyle = this.bodyColor;
        fillRect(0, 0, 46, 45);

        // Eyes
        var p = 4, // blink interval
            bt = 0.3, // blink time
            mt = G.t % p, // modulo-ed time
            mi = p - bt / 2, // middle of the blink
            s = min(1, max(-mt + mi, mt - mi) / (bt / 2)), // scale of the eyes
            h = s * 4;

        if(this.dead){
            h = 1;
        }

        var eyesY = this.lookingDown ? 24 : 10;

        if(!this.fixing){
            R.fillStyle = '#000';
            var offset = this.talking ? -10 : 0;
            fillRect(27 + offset, eyesY, 4, h);
            fillRect(37 + offset, eyesY, 4, h);
        }
        restore();

        restore();
    };

    this.cycle = function(e){
        var before = {
            x: this.x,
            y: this.y
        };

        this.recoveryTime -= e;

        if((this.sayingTimeleft -= e) <= 0){
            this.say(this.saying.slice(1));
        }

        if(this.dead){
            this.direction = 0;
        }

        // Movement

        // Friction
        var frictionFactor = this.frictionFactor * this.speed,
            targetSpeed = this.direction * this.speed,
            diff = targetSpeed - this.vX,
            appliedDiff = between(-frictionFactor * e, diff, frictionFactor * e);

        this.vX = between(-this.speed, this.vX + appliedDiff, this.speed);

        this.x += this.vX * e;

        if(this.direction == -this.facing){
            interp(this, 'scaleFactorX', -1, 1, 0.1);
        }

        this.facing = this.direction || this.facing;

        // Vertical movement
        this.vY += e * 7500;
        this.y += this.vY * e;

        // Collisions
        this.lastAdjustment = this.readjust(before);

        // If there has been no adjustment for up or down, it means we're in the air
        if(!(this.lastAdjustment & 2) && !(this.lastAdjustment & 1)){
            jumpCount = max(1, jumpCount);
        }
    };

    this.jump = function(p, f){
        if(f){
            jumpCount = 0;
        }

        if(jumpCount++ <= 1){
            this.vY = p * -1700;
            previousFloorY = -1;

            var y = this.y + 26;
            for(var i = 0 ; i < 5 ; i++){
                var x = rand(this.x - 20, this.x + 20);
                particle(3, '#888', [
                    ['x', x, x, 0.3],
                    ['y', y, y - rand(40, 80), 0.3],
                    ['s', 12, 0, 0.3]
                ]);
            }

            return 1;
        }
    };

    this.throwAway = function(angle, force){
        this.vX = cos(angle) * force;
        this.vY = sin(angle) * force;
        this.facing = this.vX < 0 ? -1 : 1;
    };

    this.hurt = function(source, power){
        var facing = this.facing;
        if(this.recoveryTime <= 0 && !this.dead && !this.fixing){
            hitSound.play();

            this.throwAway(atan2(
                this.y - source.y,
                this.x - source.x
            ), 1500);

            this.recoveryTime = 2;

            if((this.health -= power || 1) <= 0){
                this.die();
                this.facing = facing;
            }else{
                this.say(pick([
                    /*nomangle*/'Ouch!'/*/nomangle*/,
                    /*nomangle*/'health--'/*/nomangle*/
                ]));
            }
        }
    };

    this.landOn = function(tiles){
        this.vY = 0;
        jumpCount = 0;

        // Find the tile that is the closest
        var tile = tiles.sort(function(a, b){
            return abs(a.center.x - P.x) - abs(b.center.x - P.x);
        })[0];

        tile.landed(this);

        if(tile.y === previousFloorY){
            return;
        }

        if(!this.dead){
            interp(this, 'bodyOffsetY', 0, 8, 0.1);
            interp(this, 'bodyOffsetY', 8, 0, 0.1, 0.1);

            for(var i = 0 ; i < 5 ; i++){
                var x = rand(this.x - 20, this.x + 20);
                particle(3, '#888', [
                    ['x', x, x, 0.3],
                    ['y', tile.y, tile.y - rand(40, 80), 0.3],
                    ['s', 12, 0, 0.3]
                ]);
            }
        }

        previousFloorY = tile.y;

        return 1;
    };

    this.tapOn = function(tiles){
        this.vY = 0; // prevent from pushing that tile

        // Find the tile that was the least dangerous
        // We assume types are sorted from non lethal to most lethal
        var tile = tiles.sort(function(a, b){
            return abs(a.center.x - P.x) - abs(b.center.x - P.x);
        })[0];

        tile.tapped(this);
    };

    this.readjust = function(before){
        var leftX = this.x - 20,
            rightX = this.x + 20,
            topY = this.y - 26,
            bottomY = this.y + 26;

        var topLeft = W.tileAt(leftX, topY),
            topRight = W.tileAt(rightX, topY),
            bottomLeft = W.tileAt(leftX, bottomY),
            bottomRight = W.tileAt(rightX, bottomY);

        var t = 0;

        if(topRight && bottomLeft && !bottomRight && !topLeft){
            t |= topRight.pushAway(this);
            t |= bottomLeft.pushAway(this);
        }

        else if(topLeft && bottomRight && !topRight && !bottomLeft){
            t |= topLeft.pushAway(this);
            t |= bottomRight.pushAway(this);
        }

        else if(topLeft && topRight){
            this.y = ceil(topY / 80) * 80 + 26;
            t |= 2;

            if(bottomLeft){
                this.x = ceil(leftX / 80) * 80 + 20;
                t |= 8;
            }else if(bottomRight){
                this.x = floor(rightX / 80) * 80 - 20;
                t |= 4;
            }

            //this.tapOn([topLeft, topRight]);
        }

        else if(bottomLeft && bottomRight){
            this.y = floor(bottomY / 80) * 80 - 26;
            t |= 1;

            if(topLeft){
                this.x = ceil(leftX / 80) * 80 + 20;
                t |= 8;
            }else if(topRight){
                this.x = floor(rightX / 80) * 80 - 20;
                t |= 4;
            }

            //this.landOn([bottomLeft, bottomRight]);
        }

        // Collision against a wall
        else if(topLeft && bottomLeft){
            this.x = ceil(leftX / 80) * 80 + 20;
            t |= 8;
        }

        else if(topRight && bottomRight){
            this.x = floor(rightX / 80) * 80 - 20;
            t |= 4;
        }

        // 1 intersection
        else if(bottomLeft){
            t |= bottomLeft.pushAway(this);
        }

        else if(bottomRight){
            t |= bottomRight.pushAway(this);
        }

        else if(topLeft){
            t |= topLeft.pushAway(this);
        }

        else if(topRight){
            t |= topRight.pushAway(this);
        }

        // Based on the adjustment, fire some tile events
        if(t & 1){
            this.landOn([bottomLeft, bottomRight].filter(Boolean));
        }else if(t & 2){
            this.tapOn([topLeft, topRight].filter(Boolean));
        }

        return t;
    };

    this.die = function(){
        // Can't die twice, avoid deaths while fixing bugs
        if(this.dead || this.fixing){
            return;
        }

        this.controllable = 0;
        this.dead = 1;
        this.health = 0;

        for(var i = 0 ; i < 40 ; i++){
            var x = rand(this.x - 20, this.x + 20),
                y = rand(this.y - 26, this.y + 26),
                yUnder = W.firstYUnder(x, this.y),
                d = rand(0.5, 1);
            particle(3, '#900', [
                ['x', x, x, 0.5],
                ['y', y, y - rand(40, 80), 0.5],
                ['s', 12, 0, 0.5]
            ]);
            particle(3, '#900', [
                ['x', x, x, d],
                ['y', y, yUnder, d, 0, easeOutBounce],
                ['s', 12, 0, d]
            ]);
        }

        this.bodyOffsetY = 8;

        interp(this, 'bodyRotation', 0, -PI / 2, 0.3);

        this.say(pick([
            /*nomangle*/'...'/*/nomangle*/,
            /*nomangle*/'exit(1)'/*/nomangle*/,
            /*nomangle*/'NULL'/*/nomangle*/,
            /*nomangle*/'Fatal error'/*/nomangle*/
        ]));
    };

    this.say = function(s){
        this.saying = s.push ? s : [s];
        this.sayingTimeleft = this.saying.length ? 3 : 0;
        if(this.saying.length){
            interp(this, 'bubbleTailLength', 0, 56, 0.3, 0, easeOutBack);
        }
    };

    return proto(this);
}

function Enemy(x, y){
    var sup = Character.call(this);

    this.x = x;
    this.y = y;

    this.bodyColor = '#f00';
    this.legColor = '#b22';
    this.halo = redHalo;
    this.health = 1;
    this.speed = 0;

    this.cycle = function(e){
        // Skipping cycles for far enemies
        if(V.contains(this.x, this.y, 20)){
            sup.cycle(e);

            if(!this.dead){
                var dX = abs(P.x - this.x),
                    dY = abs(P.y - this.y);
                if(dX < 40 && dY < 52){
                    // Okay there's a collision, but is he landing on me or is he colliding with me?
                    if(dX < dY && P.y < this.y && P.vY > 0){
                        P.jump(0.8, 1);
                        this.hurt(P);
                    }else{
                        P.hurt(this);
                        this.direction = this.x > P.x ? 1 : -1;
                    }
                }

                // Say random shit
                if(this.sayingTimeleft <= 0){
                    this.say('0x' + (~~rand(0x100000, 0xffffff)).toString(16));
                }
            }
        }
    };

    this.die = function(){
        if(!this.dead){
            sup.die();

            var s = this;

            delayed(function(){
                s.say([]);

                // Fly away animation
                interp(s, 'scaleFactorX', 1, 0, 0.4);
                interp(s, 'scaleFactorY', 1, 5, 0.3, 0.1);
                interp(s, 'offsetY', 0, -400, 0.3, 0.1, 0, function(){
                    delayed(function(){
                        G.remove(s);
                    }, 0);
                });

                // Item drop
                G.droppable(s.x, s.y, 0.5, 1);
            }, 500);
        }
    };

    return proto(this);
}

function WalkingEnemy(x, y){
    var sup = Enemy.call(this, x, y);

    this.speed = 120;

    this.direction = pick([-1, 1]);

    this.cycle = function(e){
        sup.cycle(e);

        if(!this.dead){
            var leftX = this.x - 40,
                rightX = this.x + 40,
                bottomY = this.y + 52 / 2,

                bottomLeft = W.tileAt(leftX, bottomY),
                bottomRight = W.tileAt(rightX, bottomY);

            if(this.lastAdjustment & 4 || !bottomRight || bottomRight.type > 6){
                this.direction = -1;
            }
            if(this.lastAdjustment & 8 || !bottomLeft || bottomLeft.type > 6){
                this.direction = 1;
            }
        }
    };
}

function JumpingEnemy(x, y){
    var sup = Enemy.call(this, x, y);

    this.nextJump = 4;
    this.frictionFactor = 0;

    this.speed = 480;

    this.cycle = function(e){
        sup.cycle(e);

        if((this.nextJump -= e) <= 0 && !this.dead){
            this.vX = (this.direction = this.facing = pick([-1, 1])) * this.speed;

            this.jump(0.8);
            this.nextJump = rand(1.5, 2.5);
        }
    };

    this.landOn = function(t){
        sup.landOn(t);
        this.vX = 0;
        this.direction = 0;
    };
}

function Player(){
    var sup = Character.call(this);

    this.controllable = 1;

    this.grenades = 0;
    this.health = 5;

    this.bodyColor = '#fff';
    this.legColor = '#aaa';
    this.halo = whiteHalo;

    this.speed = 560;

    this.preparingGrenade = 0;
    this.grenadePreparation = 0;

    this.cycle = function(e){
        if(!this.controllable){
            this.direction = 0;
        }else{
            if(this.direction){
                V.targetted = 0;
            }

            var d = dist(this, W.exit.center);
            if(d < 40){
                this.controllable = 0;
                this.fixing = 1;

                this.say([
                    /*nomangle*/'Let\'s fix this...'/*/nomangle*/,
                    /*nomangle*/'Done!'/*/nomangle*/
                ]);

                interp(this, 'x', this.x, W.exit.center.x, 1);
                interp(W.exit, 'alpha', 1, 0, 3);

                delayed(function(){
                    fixedSound.play();
                    G.bugFixed();
                }, 3500);
            }else if(d < (CANVAS_WIDTH / 2) && !this.found){
                this.found = 1;
                this.say(/*nomangle*/'You found the bug!'/*/nomangle*/); // TODO more strings
            }
        }

        this.grenadePreparation = (this.grenadePreparation + e / 4) % 1;

        sup.cycle(e);
    };

    this.die = function(){
        sup.die();
        G.playerDied();
    };

    this.jump = function(p, f){
        if(this.controllable && sup.jump(p, f)){
            jumpSound.play();
        }
    };

    this.prepareGrenade = function(){
        if(this.grenades){
            this.preparingGrenade = 1;
            this.grenadePreparation = 0;
        }else{
            P.say(pick([
                /*nomangle*/'You don\'t have any breakpoints'/*/nomangle*/,
                /*nomangle*/'breakpoints.count == 0'/*/nomangle*/,
                /*nomangle*/'NoBreakpointException'/*/nomangle*/
            ]));
        }
    };

    this.grenadePower = function(){
        return 500 + (1 - abs((this.grenadePreparation - 0.5) * 2)) * 1500;
    };

    this.throwGrenade = function(){
        if(this.preparingGrenade && !this.dead){
            var g = new Grenade(
                this.x,
                this.y,
                -PI / 2 + this.facing * PI / 4,
                this.grenadePower()
            );
            G.add(g, 3);

            V.targetted = g; // make the camera target the grenade

            this.preparingGrenade = 0;
            this.grenades = max(0, this.grenades - 1);
        }
    };

    this.say = function(a){
        sup.say(a);
        if(a && a.length){
            saySound.play();
        }
    };

    this.landOn = function(t){
        if(sup.landOn(t)){
            landSound.play();
        }
    };

    this.render = function(e){
        sup.render(e);

        if(this.preparingGrenade){
            var g = new Grenade(
                this.x,
                this.y,
                -PI / 2 + this.facing * PI / 4,
                this.grenadePower(),
                1
            );

            R.fillStyle = '#fff';
            for(var i = 0 ; i < 40 && !g.stuck ; i++){
                g.cycle(1 / 60);

                if(!(i % 2)){
                    fillRect(~~g.x - 2, ~~g.y - 2, 4, 4);
                }
            }
        }
    };
}

function sliceGlitch(){
    var sh = CANVAS_HEIGHT / 10;

    drawImage(cache(CANVAS_WIDTH, CANVAS_HEIGHT, function(r){
        for(var y = 0 ; y < CANVAS_HEIGHT ; y += sh){
            r.drawImage(
                C,
                0, y, CANVAS_WIDTH, sh,
                rand(-100, 100), y, CANVAS_WIDTH, sh
            );
        }
    }), 0, 0);
}

function noiseGlitch(){
    R.fillStyle = noisePattern;

    var x = ~~rand(-400, 400),
        y = ~~rand(-400, 400);

    save();
    translate(x, y);
    R.globalAlpha = rand(0.5);
    fillRect(-x, -y, CANVAS_WIDTH, CANVAS_HEIGHT);
    restore();
}

function Game(){
    G = this;

    var glitchEnd,
        nextGlitch = 0,
        glitchTimeleft = 0;

    G.currentLevel = 0;
    G.resolution = 1;

    G.t = 0;
    //G.frameCount = 0;
    //G.frameCountStart = Date.now();

    V = new Camera();
    P = new Player();
    P.controllable = 0;

    G.tutorial = function(){
        G.newGame(1);
    };

    G.newGame = function(tutorial){
        P = new Player();

        G.currentLevel = tutorial ? -1 : 0;
        G.totalTime = 0;
        G.startNewWorld();
        interp(G.menu, 'alpha', 1, 0, 0.5, 0, 0, function(){
            G.menu = 0;
        });

        G.add(new SpawnAnimation(P.x, P.y), 1);
    };

    G.startNewWorld = function(dummy){
        G.cyclables = [];
        G.killables = [];
        G.renderables = [];
        G.timeLeft = 105;

        G.applyGlitch(0, 0.5);

        if(dummy){
            return;
        }

        // World
        W = new World(generateWorld(++G.currentLevel));

        // Keeping track of the items we can spawn
        W.itemsAllowed = {
            1: 8 - P.health, // max 6 health
            2: 10 - P.grenades // max 5 nades
        };

        G.hideTiles = 0;

        // Player
        P.x = W.spawn.x + 80 / 2;
        P.y = W.spawn.y + 80 - 40 / 2;
        P.controllable = 1;
        P.fixing = 0;

        G.add(V, 2);
        G.add(P, 7);

        // Prevent camera from lagging behind
        V.forceCenter();

        // Enemies
        if(!G.currentLevel){
            // Put the enemies at the right spots
            var e1;

            G.add(e1 = new WalkingEnemy(4500, 800), 7);
            G.add(new JumpingEnemy(5700, 800), 7);

            var metEnemy;
            G.add({
                cycle: function(){
                    if(!metEnemy && abs(P.x - e1.x) < CANVAS_WIDTH){
                        metEnemy = 1;

                        P.say([
                            /*nomangle*/'Watch out for the pointers!'/*/nomangle*/,
                            /*nomangle*/'They\'re super dangerous!'/*/nomangle*/,
                            /*nomangle*/'Either avoid them or kill them'/*/nomangle*/
                        ]);
                    }
                }
            }, 2);
        }else{
            delayed(function(){
                P.say(pick([
                    /*nomangle*/'There\'s more?!'/*/nomangle*/,
                    /*nomangle*/'Yay more bugs'/*/nomangle*/,
                    /*nomangle*/'Okay one more bug...'/*/nomangle*/
                ]));
            }, 500);

            // Add enemies
            W.detectPaths(2).forEach(function(path){
                var enemy = new (pick([WalkingEnemy, JumpingEnemy]))(
                    80 * rand(path.colLeft, path.colRight),
                    80 * (path.row + 1) - 52 / 2
                );
                if(rand() < 0.2 && dist(enemy, P) > CANVAS_WIDTH / 2){
                    G.add(enemy, 7);
                }
            });

            // Add items for pickup
            var itemPaths = W.detectPaths(1);
            pick(itemPaths, itemPaths.length).forEach(function(path){
                // Create the item and place it on the path
                G.droppable(
                    (~~rand(path.colLeft, path.colRight) + 0.5) * 80,
                    (path.row + 0.5) * 80,
                    0.05
                );
            });
        }
    };

    // Game loop
    G.cycle = function(e){
        G.t += e;

        /*// 100th frame, checking if we are in a bad situation, and if yes, enable shitty mode
        if(++G.frameCount == 100 && (G.frameCount / ((Date.now() - G.frameCountStart) / 1000) < 30)){
            G.setResolution(G.resolution * 0.5);
            shittyMode = 1;
        }*/

        glitchTimeleft -= e;
        if(glitchTimeleft <= 0){
            glitchEnd = 0;

            nextGlitch -= e;
            if(nextGlitch <= 0){
                G.applyGlitch();
            }
        }

        var maxDelta = 1 / 120, // TODO adjust
            deltas = ~~(e / maxDelta);
        while(e > 0){
            G.doCycle(min(e, maxDelta));
            e -= maxDelta;
        }

        // Rendering
        save();
        scale(G.resolution, G.resolution);

        // Font settings are common across the game
        R.textAlign = /*nomangle*/'center'/*/nomangle*/;
        R.textBaseline = /*nomangle*/'middle'/*/nomangle*/;

        if(W){
            W.render();
        }

        if(G.menu){
            G.menu.render();
        }else{
            // HUD

            // Health string
            var healthString = '';
            for(i = 0 ; i < P.health ; i++){
                healthString += '!';
            }

            // Timer string
            var timerString = formatTime(G.timeLeft, 1),
                progressString = /*nomangle*/'progress: '/*/nomangle*/ + G.currentLevel + '/13',
                grenadesString = /*nomangle*/'breakpoints: '/*/nomangle*/ + P.grenades;

            drawText(R, timerString, (CANVAS_WIDTH - requiredCells(timerString) * 10) / 2, mobile ? 50 : 10, 10, G.timeLeft > 30 ? '#fff' : '#f00');
            drawCachedText(R, healthString, (CANVAS_WIDTH - requiredCells(healthString) * 5) / 2, mobile ? 120 : 80, 5, P.health < 3 || P.recoveryTime > 1.8 ? '#f00' : '#fff');

            drawCachedText(R, progressString, (CANVAS_WIDTH - requiredCells(progressString) * 4) - 10, 10, 4, '#fff');
            drawCachedText(R, grenadesString, 10, 10, 4, '#fff');

            if(G.touch){
                // Mobile controls
                [leftArrow, rightArrow, grenadeButton, jumpArrow].forEach(function(b, i){
                    R.globalAlpha = touchButtons[i] ? 1 : 0.5;
                    drawImage(b, (i + 0.5) * CANVAS_WIDTH / 4 - 80 / 2, CANVAS_HEIGHT - 100);
                });

                R.globalAlpha = 1;
            }
        }

        if(true){
            save();

            R.fillStyle = '#000';
            fillRect(CANVAS_WIDTH * 0.6, 0, CANVAS_WIDTH * 0.4, 120);

            R.fillStyle = 'white';
            R.textAlign = 'left';
            R.font = '18pt Courier New';
            fillText('FPS: ' + G.fps, CANVAS_WIDTH * 0.6, 20);
            fillText('Cyclables: ' + G.cyclables.length, CANVAS_WIDTH * 0.6, 40);
            fillText('Renderables: ' + G.renderables.length, CANVAS_WIDTH * 0.6, 60);
            fillText('Killables: ' + G.killables.length, CANVAS_WIDTH * 0.6, 80);
            fillText('Resolution: ' + G.resolution, CANVAS_WIDTH * 0.6, 100);

            restore();
        }

        restore();

        if(glitchEnd){
            glitchEnd();
        }
    };

    G.doCycle = function(e){
        // Cycles
        for(var i = G.cyclables.length ; --i >= 0 ;){
            G.cyclables[i].cycle(e);
        }

        if(!G.menu && P.controllable){
            if((G.timeLeft -= e) <= 0){
                G.timeLeft = 0;
                G.menu = new GameOverMenu(1);
                interp(G.menu, 'alpha', 0, 1, 0.5);
            }

            if(G.currentLevel){
                // Not counting the tutorial time because it's skippable anyway
                G.totalTime += e;
            }
        }
    };

    G.applyGlitch = function(id, t){
        var l = [function(){
            glitchEnd = noiseGlitch;
        }];

        if(!G.menu && !shittyMode){
            l.push(function(){
                glitchEnd = sliceGlitch;
            });
        }

        if(isNaN(id)){
            pick(l)();
        }else{
            l[id]();
        }

        glitchTimeleft = t || rand(0.1, 0.3);
        nextGlitch = G.currentLevel ? rand(4, 8) : 99;
    };

    G.playerDied = function(){
        delayed(function(){
            G.menu = new GameOverMenu(0);
            interp(G.menu, 'alpha', 0, 1, 0.5);
        }, 2000);
    };

    G.bugFixed = function(){
        if(G.currentLevel == 13){
            G.menu = new GameOverMenu(2);
            interp(G.menu, 'alpha', 0, 1, 0.5);
        }else{
            G.applyGlitch(0, 0.5);
            hideTilesAnimation();
            delayed(function(){
                G.startNewWorld();
                G.hideTiles = 1;
                delayed(showTilesAnimation, 500);
            }, 500);
        }
    };

    G.mainMenu = function(){
        G.menu = new MainMenu();
    };

    G.setResolution = function(r){
        G.resolution = r;
        C.width = CANVAS_WIDTH  * r;
        C.height = CANVAS_HEIGHT * r;
    };

    G.add = function(e, type){
        if(type & 1){
            G.renderables.push(e);
        }
        if(type & 2){
            G.cyclables.push(e);
        }
        if(type & 4){
            G.killables.push(e);
        }
    };

    G.remove = function(e){
        remove(G.cyclables, e);
        remove(G.killables, e);
        remove(G.renderables, e);
    };

    G.droppable = function(x, y, probability, particles){
        if(rand() < probability){
            var item = new (pick([GrenadeItem, HealthItem]))(x, y);
            if(--W.itemsAllowed[item.type] > 0){
                G.add(item, 3);
                if(particles){
                    item.particles();
                }
            }
        }
    };

    /*var displayablePixels = w.innerWidth * w.innerHeight * w.devicePixelRatio,
        gamePixels = CANVAS_WIDTH / CANVAS_HEIGHT,
        ratio = displayablePixels / gamePixels;
    if(ratio < 0.5){
        G.setResolution(ratio * 2);
    }*/

    G.startNewWorld(1);

    G.menu = new (mobile ? ModeMenu : MainMenu)();
    if(!mobile){
        shittyMode = 0;
    }

    glitchTimeleft = 0;
    nextGlitch = 1;

    var lf = Date.now();
    (function(){
        var n = Date.now(),
            e = (n - lf) / 1000;

        if(true){
            G.fps = ~~(1 / e);
        }

        lf = n;

        G.cycle(e);

        (requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame)(arguments.callee);
    })();
}

var touchButtons = {},
    downKeys = {};

function reevalControls(e){
    P.direction = 0;
    if(downKeys[37] || downKeys[65]){
        P.direction = -1;
    }
    if(downKeys[39] || downKeys[68]){
        P.direction = 1;
    }
    P.lookingDown = downKeys[40] || downKeys[83];
}

onkeydown = function(e){
    if(!downKeys[38] && e.keyCode == 38 || !downKeys[87] && e.keyCode == 87){
        P.jump(1);
    }

    if(!downKeys[32] && e.keyCode == 32){
        P.prepareGrenade();
    }

    if(true && e.keyCode === 68){
        P.die();
    }

    downKeys[e.keyCode] = 1;
    reevalControls(e);
};

onkeyup = function(e){
    if(e.keyCode == 32){
        P.throwGrenade();
    }

    downKeys[e.keyCode] = 0;
    reevalControls(e);
};

onclick = function(e){
    var rect = C.getBoundingClientRect();
    if(G.menu){
        var x = CANVAS_WIDTH * (e.pageX - rect.left) / rect.width,
            y = CANVAS_HEIGHT * (e.pageY - rect.top) / rect.height;

        G.menu.click(x, y);
    }
};

var touch = function(e){
    e.preventDefault();

    P.direction = 0;
    G.touch = 1;

    touchButtons = {};

    var rect = C.getBoundingClientRect();
    for(var i = 0 ; i < e.touches.length ; i++){
        var x = CANVAS_WIDTH * (e.touches[i].pageX - rect.left) / rect.width,
            col = ~~(x / (CANVAS_WIDTH / 4));

        if(!G.menu){
            if(!col){
                P.direction = -1;
            }else if(col == 1){
                P.direction = 1;
            }else if(col == 2){
                P.prepareGrenade();
            }else if(col == 3){
                P.jump(1);
            }

            touchButtons[col] = 1;
        }
    }

    if(P.preparingGrenade && !touchButtons[2]){
        P.throwGrenade();
    }
};

addEventListener('touchstart', function(e){
    onclick(e.touches[0]);
});
addEventListener('touchstart', touch);
addEventListener('touchmove', touch);
addEventListener('touchend', touch);

onload = function(){
    C = D.querySelector('canvas');
    C.width = CANVAS_WIDTH;
    C.height = CANVAS_HEIGHT;

    R = C.getContext('2d');

    // Shortcut for all canvas methods
    var p = CanvasRenderingContext2D.prototype;
    Object.getOwnPropertyNames(p).forEach(function(n){
        if(R[n] && R[n].call){
            w[n] = p[n].bind(R);
        }
    });

    onresize();

    new Game();
};
