function H(s){
        return s.split(',').map(function(r){
            return r.split('').map(function(v){
                return parseInt(v);
            });
        });
    }

/**
* dm
*
* iA 2010 dl dk
*
* iz bd B iy _u, ix 2.0 (B "_u");
* iw dj fm iv this iu ir in iq with B _u.
* ip dj io a im of B _u bc
*
*   fl://il.ik.org/ij/ii-2.0
*
* ih required _Q ig ie di ic _l in ib, ia
* dh bd B _u is dh dg i_ "AS IS" i$,
* hZ hY hX hW hV hU hT, hS hR di hQ.
* hP B _u for B hO language hN hM _L
* hL bd B _u.
*
* @hK dl dk
*/
/** @constructor */
function dm() {
    //--------------------------------------------------------------------------
    //
    //  lz String Methods
    //
    //--------------------------------------------------------------------------

    /**
    * ly a df hJ hI B hH
    * @hG hJ Array of B df values, lx elements 0 - 23 de
    *                a: lw
    *                b: lv
    *                c: lu
    *                d: lt
    *                e: ls
    *                f: lr
    *                g: fk
    *                h: dd
    *                i: lq
    *                j: lp
    *                k: lo
    *                l: ln
    *                m: lm
    *                n: ll
    *                o: lk
    *                p: lj
    *                q: li
    *                r: lh
    *                s: lg
    *                t: le
    *                u: ld
    *                v: lc
    *                w: lb
    *                x: fj
    * @return ay B hF la l_
    */
    this.hE = function(values){
        for(var i = 0 ; i < 24 ; i++){
            this[String.fromCharCode(97 + i)] = values[i] || 0;
        }

        // I hD this dc from B reset(1) function
        if (this.c < 0.01) {
            this.c = 0.01;
        }

        var bb = this.b + this.c + this.e;
        if (bb < 0.18) {
            var ab = 0.18 / bb;
            this.b *= ab;
            this.c *= ab;
            this.e *= ab;
        }
    };
}

/**
* fi
*
* iA 2010 dl dk
*
* iz bd B iy _u, ix 2.0 (B "_u");
* iw dj fm iv this iu ir in iq with B _u.
* ip dj io a im of B _u bc
*
*   fl://il.ik.org/ij/ii-2.0
*
* ih required _Q ig ie di ic _l in ib, ia
* dh bd B _u is dh dg i_ "AS IS" i$,
* hZ hY hX hW hV hU hT, hS hR di hQ.
* hP B _u for B hO language hN hM _L
* hL bd B _u.
*
* @hK dl dk
*/
/** @constructor */
function fi() {
    // l$ hC de kZ kY ax function kX

    //--------------------------------------------------------------------------
    //
    //  kW kV
    //
    //--------------------------------------------------------------------------

    this.bR = new dm();  // kU kT

    //--------------------------------------------------------------------------
    //
    //  hB kS
    //
    //--------------------------------------------------------------------------

    var bQ, // da of B attack ba
        bP, // da of B fh ba
        bO, // da of B hA ba

        aw,          // hz of B O
        d_,       // kR d$ aa bN hy (from fk)

        cZ,           // kQ dd
        fg,      // ff in dd

        fe,    // fd _l cY B note _Q
        fc,      // Counter for B note cY
        b_,     // hx B time hw this hv, B note kP

        a_,      // kO of _h kN kM in B hu O
        fb;       // fd _l cY B ht _Q

    //--------------------------------------------------------------------------
    //
    //  hB Methods
    //
    //--------------------------------------------------------------------------

    /**
    * kL B kK hC from B kJ
    * kI kH bc B start (total reset) _L for B repeat cX (kG reset)
    */
    this.fa = function() {
        // f_ f$
        var p = this.bR;

        aw       = 100 / (p.f * p.f + 0.001);
        d_    = 100 / (p.g   * p.g   + 0.001);

        cZ        = 1 - p.h * p.h * p.h * 0.01;
        fg   = -p.i * p.i * p.i * 0.000001;

        if(!p.a){
            a_ = 0.5 - p.n / 2;
            fb  = -p.o * 0.00005;
        }

        fe = 1 + p.l * p.l * (p.l > 0 ? -0.9 : 10);
        fc   = 0;
        b_  = p.m == 1 ? 0 : (1 - p.m) * (1 - p.m) * 20000 + 32;
    };

    // I split B reset() function hI eZ hs for kF kE
    this.hr = function() {
        this.fa();

        // f_ f$
        var p = this.bR;

        // kD B length is all kC kB dc, kA else hD kz
        bQ = p.b  * p.b  * 100000;
        bP = p.c * p.c * 100000;
        bO = p.e   * p.e   * 100000 + 12;
        // ky length of B volume kx (_L kw bN)
        // kv ku B length cW kt ks _Q 3 kr kq kp fm ko B padding "==" b$ kn encode
        return ((bQ + bP + bO) / 3 | 0) * 3;
    };

    /**
    * km B O _l B kl buffer hq
    * @hG buffer A hq _l write B O _l
    * @return ay B O is hp
    */
    this.ho = function(buffer, length) {
        // f_ f$
        var p = this.bR;

        // ay B filters de active
        var eY = p.s != 1 || p.v,
            // hn ab which hm B hl B O position cW move
            av = p.v * p.v * 0.1,

            // eX of B high-_P cV ab
            eW = 1 + p.w * 0.0003,

            // hn ab which hm B hl B O position cW move
            a$ = p.s * p.s * p.s * 0.1,

            // eX of B low-_P cV ab
            hk = 1 + p.t * 0.0001,

            // ay B low _P filter is active
            hj = p.s != 1,

            // fj * fj (for cU cT)
            hi = p.x * p.x,

            // kk frequency aa kj
            hh = p.g,

            // ay B aZ is active
            eV = p.q || p.r,

            // ff in eU offset
            hg = p.r * p.r * p.r * 0.2,

            // cS offset for aZ cX
            eT = p.q * p.q * (p.q < 0 ? -1020 : 1020),

            // hx B time hw this hv, some of B    ki de reset
            cR = p.p ? ((1 - p.p) * (1 - p.p) * 20000 | 0) + 32 : 0,

            // hf kh kg (kf bc ke of fh)
            hd = p.d,

            // fd _l cY B d$ of B O _Q bc B kd of B bM O
            eS = p.j / 2,

            // eX bc which B bM eU kc
            hc = p.k * p.k * 0.01,

            // hf K of O _l hb
            cQ = p.a;

        var cP      = bQ,     // da of B cO bL ba
            ha = 1 / bQ, // (for cU cT)
            h_ = 1 / bP, // (for cU cT)
            h$ = 1 / bO; // (for cU cT)

        // kb ka which k_ k$ eR B O position cW move
        var aY = 5 / (1 + p.u * p.u * 20) * (0.01 + a$);
        if (aY > 0.8) {
            aY = 0.8;
        }
        aY = 1 - aY;

        var cN = 0,     // ay B bN has hp
            eQ    = 0, // eP ba of B bL (attack, fh, hA, end)
            aX     = 0, // eP time ax cO jZ ba
            aW   = 0, // eP volume of B bL
            cM      = 0, // gZ O position b$ high-_P filter
            bK = 0, // ff in low-_P O position, cL jY _Q B cV _L jX
            eO,       // jW low-_P O position
            aV      = 0, // gZ O position b$ low-_P filter
            _t,           // hz jV _Q bM
            _Z            = 0, // cS ax B O
            _Y,            // jU aZ offset, for jT jS
            cK        = 0, // jR ax B aZ buffer
            _K,                  // cS jQ cL a Number from 0-1, _o for eR sin gY
            eN       = 0, // Counter for B jP
            _d,               // jO-au jN 8 gX cJ jM au, jL eM _l get B super au
            aq,          // jK au jJ _l B O
            eL     = 0; // cS ax B bM jI O

        // gW of O values _o _l create B eM of eU gV O
        var bJ = new Array(1024),

            // gW of random values _o _l hb gU
            aU  = new Array(32);

        for (var i = bJ.length; i--; ) {
            bJ[i] = 0;
        }
        for (i = aU.length; i--; ) {
            aU[i] = F(-1, 1);
        }

        for (i = 0; i < length; i++) {
            if (cN) {
                return i;
            }

            // jH every cR gX, jG jF B bN hH
            if (cR) {
                if (++eN >= cR) {
                    eN = 0;
                    this.fa();
                }
            }

            // ay b_ is jE, jD B pitch
            if (b_) {
                if (++fc >= b_) {
                    b_ = 0;
                    aw *= fe;
                }
            }

            // jC _L apply dd
            cZ += fg;
            aw *= cZ;

            // jB for frequency jA gT low, _L hy B bN if a fk jz set
            if (aw > d_) {
                aw = d_;
                if (hh > 0) {
                    cN = 1;
                }
            }

            _t = aw;

            // eK B bM cX
            if (eS > 0) {
                eL += hc;
                _t *= 1 + sin(eL) * eS;
            }

            _t |= 0;
            if (_t < 8) {
                _t = 8;
            }

            // jy B hu ht
            if (!cQ) {
                a_ += fb;
                if (a_ < 0) {
                    a_ = 0;
                } else if (a_ > 0.5) {
                    a_ = 0.5;
                }
            }

            // eJ ax B jx jw of B volume bL
            if (++aX > cP) {
                aX = 0;

                switch (++eQ)  {
                    case 1:
                        cP = bP;
                        break;
                    case 2:
                        cP = bO;
                }
            }

            // jv B volume ju dg B position in B bL
            switch (eQ) {
                case 0:
                    aW = aX * ha;
                    break;
                case 1:
                    aW = 1 + (1 - aX * h_) * 2 * hd;
                    break;
                case 2:
                    aW = 1 - aX * h$;
                    break;
                case 3:
                    aW = 0;
                    cN = 1;
            }

            // eJ B aZ offset
            if (eV) {
                eT += hg;
                _Y = eT | 0;
                if (_Y < 0) {
                    _Y = -_Y;
                } else if (_Y > 1023) {
                    _Y = 1023;
                }
            }

            // eJ B high-_P filter cV
            if (eY && eW) {
                av *= eW;
                if (av < 0.00001) {
                    av = 0.00001;
                } else if (av > 0.1) {
                    av = 0.1;
                }
            }

            aq = 0;
            for (var j = 8; j--; ) {
                // jt ax B d$
                _Z++;
                if (_Z >= _t) {
                    _Z %= _t;

                    // js new random gU for this d$
                    if (cQ == 3) {
                        for (var n = aU.length; n--; ) {
                            aU[n] = F(-1, 1);
                        }
                    }
                }

                // jr B au from B jq
                switch (cQ) {
                    case 0: // jp O
                        _d = ((_Z / _t) < a_) ? 0.5 : -0.5;
                        break;
                    case 1: // jo O
                        _d = 1 - _Z / _t * 2;
                        break;
                    case 2: // jn O (eR _L jm gY)
                        _K = _Z / _t;
                        _K = (_K > 0.5 ? _K - 1 : _K) * 6.28318531;
                        _d = 1.27323954 * _K + 0.405284735 * _K * _K * (_K < 0 ? 1 : -1);
                        _d = 0.225 * ((_d < 0 ? -1 : 1) * _d * _d  - _d) + _d;
                        break;
                    case 3: // jl
                        _d = aU[abs(_Z * 32 / _t | 0)];
                }

                // eK B low _L high _P filters
                if (eY) {
                    eO = aV;
                    a$ *= hk;
                    if (a$ < 0) {
                        a$ = 0;
                    } else if (a$ > 0.1) {
                        a$ = 0.1;
                    }

                    if (hj) {
                        bK += (_d - aV) * a$;
                        bK *= aY;
                    } else {
                        aV = _d;
                        bK = 0;
                    }

                    aV += bK;

                    cM += aV - eO;
                    cM *= 1 - av;
                    _d = cM;
                }

                // eK B aZ cX
                if (eV) {
                    bJ[cK % 1024] = _d;
                    _d += bJ[(cK - _Y + 1024) % 1024];
                    cK++;
                }

                aq += _d;
            }

            // jk eM B super eI _L jj ji
            aq *= 0.125 * aW * hi;

            // jh if gT jg
            buffer[i] = aq >= 1 ? 32767 : aq <= -1 ? -32768 : aq * 32767 | 0;
        }

        return length;
    };
}

// jf from fl://je.jd/jc/
var cI = new fi();

// jb for B ja j_
var _J = function(df) {
    // gS dm
    cI.bR.hE(df);

    // j$ iZ
    var eH = cI.hr();
    var aT = new Uint8Array(((eH + 1) / 2 | 0) * 4 + 44);
    var _o = cI.ho(new Uint16Array(aT.buffer, 44), eH) * 2;
    var _s = new Uint32Array(aT.buffer, 0, 44);

    // gS iY
    _s[0] = 0x46464952; // "RIFF"
    _s[1] = _o + 36;  // put total size dc
    _s[2] = 0x45564157; // "WAVE"
    _s[3] = 0x20746D66; // "fmt "
    _s[4] = 0x00000010; // size of B iX
    _s[5] = 0x00010001; // iW: 1 channel, iV format
    _s[6] = 0x0000AC44; // 44,100 eI cJ gV
    _s[7] = 0x00015888; // iU rate: eZ gR cJ au
    _s[8] = 0x00100002; // 16 iT cJ au, iS dg every eZ gR
    _s[9] = 0x61746164; // "aT"
    _s[10] = _o;      // put number of eI dc

    // iR encoding iQ _Q iP, @iO
    _o += 44;
    var i = 0,
        bI = /*nomangle*/'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'/*/nomangle*/,
        eG = /*nomangle*/'data:audio/wav;base64,'/*/nomangle*/;
    for (; i < _o; i += 3){
        var a = aT[i] << 16 | aT[i + 1] << 8 | aT[i + 2];
        eG += bI[a >> 18] + bI[a >> 12 & 63] + bI[a >> 6 & 63] + bI[a & 63];
    }

    var eF = new Audio();
    eF.src = eG;
    return eF;
};

// iN all iM hs _l B global scope
Object.getOwnPropertyNames(Math).forEach(function(n){
    if(Math[n].call){
        this[n] = Math[n];
    }
});

function _g(w, h, f){
    var c = D.createElement('canvas');
    c.width = w;
    c.height = h;

    f(c.getContext('2d'), c);

    return c;
}

function eE(w, h, f){
    var c = _g(w, h, f);
    return c.getContext('2d').createPattern(c, 'repeat');
}

function eD(m, n){
    var r = [];
    for(var $ = 0 ; $ < m.length + n * 2 ; $++){
        r.push([]);
        for(var _ = 0 ; _ < m[0].length + n * 2 ; _++){
            if($ < n || $ >= m.length + n || _ < n || _ >= m[0].length + n){
                r[$][_] = 2;
            }else{
                r[$][_] = m[$ - n][_ - n];
            }
        }
    }
    return r;
}

function eC(m){
    var cH = [];
    m.forEach(function($){
        cH = cH.concat($);
    });
    return cH;
}

function eB(o){
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
    _r = setTimeout,
    _k, // undefined _Q default
    C, // canvas
    R, // canvas context
    W, // world
    P, // player
    V, // camera
    PI = Math.PI,
    aS = navigator.userAgent.match(/*nomangle*//andro|ipho|ipa|ipo|windows ph/i/*/nomangle*/),
    J = aS ? 640 : 920,
    _c = 920;

var gQ = _J([0,,0.1434,,0.1212,0.4471,,0.2511,,,,,,0.0426,,,,,0.8862,,,,,0.5]),
    gP = _J([1,,0.0713,,0.1467,0.5483,,-0.4465,,,,,,,,,,,1,,,0.0639,,0.5]),
    gO = _J([0,,0.0224,0.441,0.1886,0.6932,,,,,,,,,,,,,1,,,,,0.5]),
    gN = _J([2,0.28,0.45,,0.56,0.35,,0.4088,,,,,0.03,0.1557,,0.5565,-0.02,-0.02,1,,,,,0.5]),
    gM = _J([3,,0.244,0.6411,0.2242,0.7416,,-0.2717,,,,0.0171,0.0346,,,,-0.0305,0.0244,1,,,0.0275,-0.0076,0.5]),
    gL = _J([0,,0.1394,,0.0864,0.48,,,,,,,,0.5326,,,,,1,,,0.1,,0.5]),
    gK = _J([2,0.03,0.1,0.14,0.25,0.54,0.3167,-0.02,0.3999,,0.05,,,0.1021,0.0684,,0.1287,-0.1816,1,,,,,0.46]),
    gJ = _J([3,,0.0118,0.03,0.1681,0.565,,-0.2343,,,,0.26,0.6855,,,,,,1,,,,,0.2]),
    gI = _J([0,,0.2098,,0.4725,0.3665,,0.1895,,,,,,0.0067,,0.5437,,,1,,,,,0.45]);

function _I(s, c, cL, gH){
    var p, n = X([0, 1]);

    // Add _l B list of bu
    G.add(p = {
        s: s,
        c: c,
        _f: function(){
            if(!V.bG(this.x, this.y, this.s)){
                return;
            }

            R.fillStyle = p.c;
            if(gH){
                fillText(n.toString(), p.x, p.y);
            }else{
                fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
            }
        }
    }, 1);

    // Interpolations
    cL.forEach(function(a, id){
        var eA = [p].concat(a);

        // Add B _z callback
        if(!id){
            eA[7] = function(){
                G._z(p);
            };
        }

        // Apply B interpolation
        N.apply(0, eA);
    });
}

var ez = eE(400, 400, function(r){
    with(r){
        fillStyle = '#000';
        fillRect(0, 0, 400, 400);

        fillStyle = '#fff';

        for(var x = 0 ; x < 400 ; x += 4){
            for(var y = 0 ; y < 400 ; y += 4){
                globalAlpha = F();
                fillRect(x, y, 4, 4);
            }
        }
    }
});

function ap(s, gG, gF){
    return _g(s, s, function(r){
        with(r){
            var g = createRadialGradient(
                s / 2, s / 2, 0,
                s / 2, s / 2, s / 2
            );

            g.addColorStop(0, gG);
            g.addColorStop(1, gF);

            fillStyle = g;
            fillRect(0, 0, s, s);
        }
    });
}

var cG = ap(160, 'rgba(255,255,255,.25)', 'rgba(255,255,255,0)'),
    gE = ap(160, 'rgba(255,0,0,.25)', 'rgba(255,0,0,0)'),
    gD = ap(1000, 'rgba(0,0,0,0)', 'rgba(0,0,0,1)');

var
    cF = _g(80, 80, function(r){
        with(r){
            fillStyle = '#fff';
            beginPath();
            moveTo(0, 0);
            lineTo(80, 80 / 2);
            lineTo(0, 80);
            fill();
        }
    }),
    gC = _g(80, 80, function(r){
        with(r){
            translate(80, 0);
            scale(-1, 1);
            drawImage(cF, 0, 0);
        }
    }),
    gB = _g(80, 80, function(r){
        with(r){
            translate(0, 80);
            rotate(-PI / 2);

            drawImage(cF, 0, 0);
        }
    }),
    gA = _g(80, 80, function(r){
        with(r){
            fillStyle = '#fff';
            beginPath();
            arc(80 / 2, 80 / 2, 80 / 2, 0, PI * 2, 1);
            fill();
        }
    })
    ;

var cE = {
    /*nomangle*/a/*/nomangle*/: H("111,101,111,101,101"),
    /*nomangle*/b/*/nomangle*/: H("111,101,110,101,111"),
    /*nomangle*/c/*/nomangle*/: H("111,100,100,100,111"),
    /*nomangle*/d/*/nomangle*/: H("110,101,101,101,111"),
    /*nomangle*/e/*/nomangle*/: H("111,100,110,100,111"),
    /*nomangle*/f/*/nomangle*/: H("111,100,110,100,100"),
    /*nomangle*/g/*/nomangle*/: H("111,100,100,101,111"),
    /*nomangle*/h/*/nomangle*/: H("101,101,111,101,101"),
    /*nomangle*/i/*/nomangle*/: H("111,010,010,010,111"),
    /*_j: [
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [1,0,1],
        [1,1,1]
    ],*/
    /*nomangle*/k/*/nomangle*/: H("101,101,110,101,101"),
    /*nomangle*/l/*/nomangle*/: H("100,100,100,100,111"),
    /*nomangle*/m/*/nomangle*/: H("101,111,101,101,101"),
    /*nomangle*/n/*/nomangle*/: H("111,101,101,101,101"),
    /*nomangle*/o/*/nomangle*/: H("111,101,101,101,111"),
    /*nomangle*/p/*/nomangle*/: H("111,101,111,100,100"),
    /*nomangle*/q/*/nomangle*/: H("111,101,101,111,001"),
    /*nomangle*/r/*/nomangle*/: H("111,101,110,101,101"),
    /*nomangle*/s/*/nomangle*/: H("111,100,111,001,111"),
    /*nomangle*/t/*/nomangle*/: H("111,010,010,010,010"),
    /*nomangle*/u/*/nomangle*/: H("101,101,101,101,111"),
    /*nomangle*/v/*/nomangle*/: H("101,101,101,101,010"),
    /*nomangle*/w/*/nomangle*/: H("10101,10101,10101,10101,01010"),
    /*nomangle*/x/*/nomangle*/: H("101,101,010,101,101"),
    /*nomangle*/y/*/nomangle*/: H("101,101,111,010,010"),
    /*'\'': H("1"),*/
    '.': H("0,0,0,0,1"),
    ' ': H("00,00,00,00,00"),
    '-': [
        [0,0],
        [0,0],
        [1,1],
        [0,0],
        [0,0]
    ],
    ':': H("0,1,,1,"),
    '?': H("111,111,111,111,111"),
    '!': H("01010,11111,11111,01110,00100"),
    '/': H("001,001,010,100,100"),
    '1': H("110,010,010,010,111"),
    '2': H("111,001,111,100,111"),
    '3': H("111,001,011,001,111"),
    '4': H("100,100,101,111,001"),
    '5': H("111,100,110,001,110"),
    '6': H("111,100,111,101,111"),
    '7': H("111,001,010,010,010"),
    '8': H("111,101,111,101,111"),
    '9': H("111,101,111,001,111"),
    '0': H("111,101,101,101,111"),
    '(': H("01,1,1,1,01"),
    ')': H("10,01,01,01,1")
};

if(true){
    (function(){
        _o = {};
        for(var i in cE){
            _o[i] = 0;
        }

        window.iF = function(){
            var ey = [];
            for(var i in _o){
                if(!_o[i]){
                    ey.push(i);
                }
            }
            return ey.sort();
        };
    })();
}

function _b(r, t, x, y, s, c){
    for(var i = 0 ; i < t.length ; i++){
        if(true){
            _o[t.charAt(i)] = 1;
        }

        var ex = gz(t.charAt(i), s, c);

        r.drawImage(ex, x, y);

        x += ex.width + s;
    }
}

var cD = {};
function cC(r, t, x, y, s, c){
    var key = t + s + c;
    if(!cD[key]){
        cD[key] = _g(s * _O(t, s), s * 5, function(r){
            _b(r, t, 0, 0, s, c);
        });
    }
    r.drawImage(cD[key], x, y);
}

function _O(t, s){
    var r = 0;
    for(var i = 0 ; i < t.length ; i++){
        r += cE[t.charAt(i)][0].length + 1;
    }
    return r - 1;
}

var cB = {};
function gz(t, s, c){
    var key = t + s + c;
    if(!cB[key]){
        var aR = cE[t];
        cB[key] = _g(aR[0].length * s, aR.length * s, function(r){
            r.fillStyle = c;
            for(var $ = 0 ; $ < aR.length ; $++){
                for(var _ = 0 ; _ < aR[$].length ; _++){
                    if(aR[$][_]){
                        r.fillRect(_ * s, $ * s, s, s);
                    }
                }
            }
        });
    }
    return cB[key];
}

function M(t, w){
    w = w || 440;
    return _g(w, 100, function(r){
        with(r){
            fillStyle = '#444';
            fillRect(0, 90, w, 10);

            fillStyle = '#fff';
            fillRect(0, 0, w, 90);

            _b(r, '::' + t + '()', 100, 20, 10, '#000');

            fillStyle = '#000';
            beginPath();
            moveTo(40, 20);
            lineTo(80, 45);
            lineTo(40, 70);
            fill();
        }
    });
}

function gy(){
    this._H = 1;
    this.gx = 400;

    this._f = function(){
        R.globalAlpha = this._H;
        R.fillStyle = '#fff';
        beginPath();
        arc(P.x, P.y, this.gx, 0, PI * 2, 1);
        fill();
        R.globalAlpha = 1;
    };

    var a = this;

    N(this, 'gx', 320, 0, 0.4, 1);
    N(this, '_H', 0, 1, 0.4, 1, 0, function(){
        P.cA = 1;

        for(var i = 0 ; i < 50 ; i++){
            var t = F(0.5, 1.5),
                a = F(-PI, PI),
                l = F(8, 80),
                x = cos(a) * l + P.x,
                y = sin(a) * l + P.y - 40;

            _I(4, '#fff', [
                ['x', x, x, t, 0, ew],
                ['y', y, y + F(80, 240), t, 0],
                ['s', F(8, 16), 0, t]
            ], 1);
        }
    });

    P.cA = P._q = 0;
    P.ev = 1;
    G.ao = 1;

    var eu = 500;
    if(!G._N){
        _r(function(){
            P._e([
                /*nomangle*/'Hello there!'/*/nomangle*/,
                /*nomangle*/'This code is falling apart!'/*/nomangle*/,
                /*nomangle*/'Let\'s fix the glitches before it\'s too late!'/*/nomangle*/
            ]);
        }, 2000);
        eu = 9000;
    }

    _r(function(){
        gN.play();
    }, 500);

    _r(function(){
        P.ev = 0;
        P._q = 1;
        et();
    }, eu);
}

function er(f){
    var aQ = V.x + J,
        aP = V.y + _c;

    for(var $ = ~~(V.y / 80) ; $ <  ~~(aP / 80) + 1 ; $++){
        for(var _ = ~~(V.x / 80) ; _ <  ~~(aQ / 80) + 1 ; _++){
            if(W.U[$] && W.U[$][_]){
                f(W.U[$][_]);
            }
        }
    }
}

function et(){
    G.ao = 0;

    er(function(t){
        var r = _G(t._h, P);
        t.bF = 0.5;
        N(t, 'bF', 0, 1, r / J, 0, bE);
    });
}

function gw(){
    G.ao = 0;

    er(function(t){
        var r = _G(t._h, P);
        t.bF = 0.5;
        N(t, 'bF', 1, 0, r / J, 0, bE);
    });
}

var eq = eE(400, 400, function(r){
    var ep = cz.toString().split(';').slice(0, 20),
        step = 400 / ep.length,
        y = step / 2;

    with(r){
        fillStyle = '#000';
        fillRect(0, 0, 400, 400);

        fillStyle = '#fff';
        globalAlpha = 0.1;
        font = '14pt Courier New';

        ep.forEach(function(l, i){
            fillText(l, 0, y);

            y += step;
        });
    }
});

var bD = [{
    "_y": H("0000000000,1103113011,1100000011,1100000011,1110000111,0000000000,0030000300,1110110111,1110000111,1110000111"),
    "_F": 15
}, {
    "_y": H("1111111111,1111111111,1111111111,0330000330,0000000000,0000000000,0330000330,1113003111,1110000111,1110000111"),
    "_F": 14
}, {
    "_y": H("1001111001,1000000001,1111001111,1000000001,1000000001,1000000000,1001111000,1001111001,1001111001,1111111111"),
    "_F": 9
}, {
    "_y": H("1111111111,1000000000,1000000000,1000000000,1001100300,1001100110,1001100110,1111111111,1111111111,1111111111"),
    "_F": 8
}, {
    "_y": H("1110000001,1111000011,0011000011,0000000001,0003000001,0011000011,0011000011,1111301111,1000000001,1000000001"),
    "_F": 7
}, {
    "_y": H("0000000000,0030000300,0111331110,0000000000,0000000000,0030000300,0111331110,0000000000,0000000000,0000000000"),
    "_F": 15
}, {
    "_y": H("1100000011,1100000011,0000000000,0000330000,0000110000,0000110000,0011111100,0000330000,0000000000,0000000000"),
    "_F": 15
}, {
    "_y": H("1000000001,1000000001,1000000001,1111001111,0000000000,0000000000,1110110111,1000000001,1000000001,1111111111"),
    "_F": 13
}, {
    "_y": H("0000000000,0000000000,0000000000,0000000000,0000330000,0110110110,0110000110,0110000110,1111111111,1111111111"),
    "_F": 13
}, {
    "_y": H("1300000011,1300000011,1000000011,1000000011,1100000011,1100000030,1100110000,1100110030,1100110011,1111111111"),
    "_F": 9
}, {
    "_y": H("1111111111,1111111111,1111111111,0000110000,0000110000,0000000000,0000000000,1110000111,1110330111,1111111111"),
    "_F": 12
}, {
    "_y": H("1111111111,0000000001,0000000001,0000000011,0000000001,0033000001,1111303111,1111000001,1111000001,1111000001"),
    "_F": 6
}, {
    "_y": H("0000000001,0000311301,0000000001,0000000001,0000000001,1110000301,1110000111,1110000001,1113300001,1111111111"),
    "_F": 5
}, {
    "_y": H("1111111111,0000000000,0000000000,0000110000,0000110000,0001111000,0000000000,0030000300,0110000110,1111111111"),
    "_F": 12
}, {
    "_y": H("1111111111,1110000111,1110000111,0000000000,0000000000,0000110000,0300110030,1100110011,1100110011,1111111111"),
    "_F": 12
}, {
    "_y": H("1111111111,1111111111,0000000000,0000000000,0000110000,0000000000,0110000110,0110000110,1110000111,1111111111"),
    "_F": 12
}, {
    "_y": H("1111111111,0000000000,0000000000,0000000000,0000000110,0000000110,0001100113,0001100111,1001100111,1111111111"),
    "_F": 12
}, {
    "_y": H("1111111111,0000000000,0000000000,1103113011,0000000000,0000000000,1103113011,0000000000,0000000000,1111111111"),
    "_F": 12
}, {
    "_y": H("1000000001,1113111001,1000000001,1000000001,1001111111,1000000000,1000000000,1111311001,1000000001,1000000001"),
    "_F": 11
}, {
    "_y": H("1111111111,1001111111,1000000000,1001000300,1111001110,1000001110,1000001111,1001111111,1001111111,1111111111"),
    "_F": 8
}, {
    "_y": H("1111111111,1000000001,1000000001,1113300111,1000000000,1000000000,1110033111,1000000001,1000000001,1111111111"),
    "_F": 8
}, {
    "_y": H("1110000111,1110000111,1110000111,0000000000,0030000300,0110000110,0110110110,1110000111,1110000111,1111111111"),
    "_F": 13
}, {
    "_y": H("1111111111,0000000001,0000000001,0111111001,0100000001,1100000001,1100113111,1100000001,1100000001,1111111001"),
    "_F": 6
}, {
    "_y": H("1100000011,0000110000,0000110000,0011111100,0011111100,0000110000,3300110033,0000000000,0000000000,1111111111"),
    "_F": 13
}];

var gv = H("11111111111111111111111111111111111111111111111111111111111111111111111111111111,11111111111111111111111111111000000000111111111111111111111111111111111111111111,11111111111111111111111111111000000000111111111111111111111111111111111111111111,10000000000000000000000001100000000000001100000000000000000000000000000000000001,10000000000000000000000001100000111000001100000000000000000000000000000000000001,10000000000000000000000006600000111000006600000000000000000000000000000000000001,10000000000000110000000000000111111111000000000111111100000000100000010000000001,10400000001100110011000000000111111111000000000111111100000000100000010000050001,11111111111177117711111111111111111111111111111111111111111111111111111111111111");

function F(a, b){
    // ~~b -> 0
    return random() * ((a || 1) - ~~b) + ~~b;
}

// jK distance
function _G(a, b){
    return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

onresize = function(){
    var eo = innerWidth,
        en = innerHeight,

        gu = eo / en, // available ratio
        cw = J / _c, // base ratio
        w,
        h,
        s = D.querySelector('#cc').style;

    if(gu <= cw){
        w = eo;
        h = w / cw;
    }else{
        h = en;
        w = h * cw;
    }

    s.width = w + 'px';
    s.height = h + 'px';
};

function X(bC, bB, gt){
    bC = bC.slice(0);
    bB = bB || 1;

    var aO = [];

    while(aO.length < bB){
        aO = aO.concat(
            bC.splice(~~(random() * bC.length), 1) // returns B hJ of deleted elements
        );
    }

    return bB === 1 && !gt ? aO[0] : aO;
}

function cv(a, b, c){
    if(b < a) return a;
    if(b > c ) return c;
    return b;
}

// Remove i_ element from i_ hJ
function _z(l, e){
    var i = l.indexOf(e);
    if(i >= 0) l.splice(i, 1);
}

function gs(t, b, c, d){
    return (t / d) * c + b;
}

function gr(t, b, c, d) {
    s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
}

function ew(t, b, c, d) {
    return sin((t / d) * PI * 4) * c + b;
}

function bE(t, b, c, d) {
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

function N(o, p, a, b, d, l, f, e){
    var i = {
        o: o, // object
        p: p, // property
        a: a, // from
        b: b, // _l
        d: d, // duration
        l: l || 0, // delay
        f: f || gs, // easing function
        e: e, // end callback
        t: 0,
        _$: function(e){
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
                    _z(G.am, i);
                }
            }
        }
    };
    G.add(i, 2);
}

function gq(n, l){
    n = '' + n;
    while(n.length < l){
        n = '0' + n;
    }
    return n;
}

function em(t, iE){
    var m = ~~(t / 60),
        s = ~~(t % 60);

    return gq(m, 2) + ':' + gq(s, 2) + (iE ? '.' + gq(~~(t % 1 * 100), 2) : '');
}

function cu(){
    this.al = [];

    this._H = 1;

    this.M = function(d, x, y, a){
        this.al.push({
            d: d, // iD
            x: x,
            y: y,
            a: a, // action
            o: 1 // opacity
        });
    };

    this.click = function(x, y){
        if(this._H == 1){
            this.al.forEach(function(b){
                if(x > b.x && y > b.y && x < b.x + b.d.width && y < b.y + b.d.height){
                    gL.play();
                    b.a.call(b);
                }
            });
        }
    };

    this._f = function(){
        R.globalAlpha = this._H;

        R.fillStyle = eq;
        fillRect(0, 0, J, _c);

        var a = this._H;
        this.al.forEach(function(b){
            R.globalAlpha = a * b.o;
            drawImage(b.d, b.x, b.y);
        });

        R.globalAlpha = 1;
    };

    this.ct = function(){
        this.al.forEach(function(b, i){
            N(b, 'x', -b.d.width, 0, 0.25, i * 0.25 + 0.5);
        });
    };
}

function cs(cr){
    cu.call(this);

    var bA = [
        [/*nomangle*/'critical'/*/nomangle*/, /*nomangle*/'mental health'/*/nomangle*/],
        [/*nomangle*/'time'/*/nomangle*/, /*nomangle*/'expired'/*/nomangle*/],
        [/*nomangle*/'code fixed'/*/nomangle*/, '!!!']
    ][cr];

    var t = em(G.bb);

    this.M(M(/*nomangle*/'retry'/*/nomangle*/), 0, 420, G.cq);
    this.M(M(/*nomangle*/'back'/*/nomangle*/), 0, 560, G.cp);
    this.M(M(/*nomangle*/'share'/*/nomangle*/), 0, 700, function(){
        open(/*nomangle*/'//twitter.com/intent/tweet?'/*/nomangle*/ +
            /*nomangle*/'hashtags=js13k'/*/nomangle*/ +
            /*nomangle*/'&url='/*/nomangle*/ + encodeURIComponent(/*nomangle*/'http://js13kgames.com/entries/glitchbuster'/*/nomangle*/) +
            /*nomangle*/'&text='/*/nomangle*/ + encodeURIComponent(
                (cr == 2 ? /*nomangle*/'I fixed all glitches in '/*/nomangle*/ + t : /*nomangle*/'I fixed '/*/nomangle*/ + (G._N - 1) + /*nomangle*/'/13 glitches'/*/nomangle*/) + /*nomangle*/' on Glitchbuster!'/*/nomangle*/
            )
        );
    });

    /*var b;
    this.M(M(nomangleing('foo')), 0, 700, function(){
        this.d = M((b = !b) ? 'bar' : 'foo');
    });*/

    this.ct();

    bA.push(cr == 2 ? /*nomangle*/'time: '/*/nomangle*/ + t : /*nomangle*/'fixed '/*/nomangle*/ + (G._N - 1) + '/13');

    var co = bA[0],
        bz = 10,
        el = _O(co) * bz,
        cn = bA[1],
        bx = 10,
        ek = _O(cn) * bx,
        cm = bA[2],
        bw = 5,
        ej = _O(cm) * bw;

    this.M(_g(el, bz * 5 + 5, function(r){
    	_b(r, co, 0, 5, bz, '#444');
        _b(r, co, 0, 0, bz, '#fff');
    }), (J - el) / 2, 120);

    this.M(_g(ek, bx * 5 + 5, function(r){
        _b(r, cn, 0, 5, bx, '#444');
        _b(r, cn, 0, 0, bx, '#fff');
    }), (J - ek) / 2, 200);

    this.M(_g(ej, bw * 5 + 5, function(r){
        _b(r, cm, 0, 5, bw, '#444');
        _b(r, cm, 0, 0, bw, '#fff');
    }), (J - ej) / 2, 280);
}

function ei(){
    cu.call(this);

    this.M(M(/*nomangle*/'learn'/*/nomangle*/), 0, 420, G.cl);
    this.M(M(/*nomangle*/'start'/*/nomangle*/), 0, 560, G.cq);
    this.M(M(/*nomangle*/'whois'/*/nomangle*/), 0, 700, function(){
        open(/*nomangle*/'//goo.gl/QRxjGP'/*/nomangle*/);
    });

    this.ct();

    var bv = (J - 460) / 2;
    this.M(_g(460, 230, function(r){
    	_b(r, 'glitch', 0, 10, 20, '#444');
    	_b(r, 'glitch', 0, 0, 20, '#fff');

    	_b(r, 'buster', 0, 130, 20, '#444');
    	_b(r, 'buster', 0, 120, 20, '#fff');
    }), bv, 90);

    N(this.al[this.al.length - 1], 'o', 0, 1, 0.25, 0.5);
}

function gp(){
    cu.call(this);

    this.M(M(/*nomangle*/'high'/*/nomangle*/, 500), 0, 420, function(){
        _k = 0; // ko _l switch from undefined
        G.cp();
    });
    this.M(M(/*nomangle*/'low'/*/nomangle*/, 500), 0, 560, function(){
        G.gn(0.5);
        _k = 1;
        G.cp();
    });

    this.ct();

    var bv = (J - 270) / 2;
    this.M(_g(270, 55, function(r){
        _b(r, /*nomangle*/'quality'/*/nomangle*/, 0, 5, 10, '#444');
        _b(r, /*nomangle*/'quality'/*/nomangle*/, 0, 0, 10, '#fff');
    }), bv, bv);
}

function eh(x, y, K){
    this.x = x;
    this.y = y;
    this.K = K;

    this._f = function(){
        if(!V.bG(this.x, this.y, 80)){
            return;
        }

        save();
        translate(x, y);

        if(!_k){
            drawImage(cG, -80, -80);
        }

        var ck = sin(G.t * PI * 2 * 0.5) * 10 + -40;

        // Arrow
        R.fillStyle = '#fff';
        beginPath();
        moveTo(-20 / 2, -20 / 2 + ck);
        lineTo(20 / 2, -20 / 2 + ck);
        lineTo(0, ck);
        fill();

        this.eg(); // defined in subclasses

        restore();
    };

    this._$ = function(){
        if(_G(this, P) < 40 && !this.gm){
            G._z(this);

            this.bu();

            this.gm = 1;
            gO.play();

            this.ef(); // defined in subclasses
        }
    };

    this.bu = function(){
        for(var i = 0 ; i < 10 ; i++){
            var x = F(this.x - 80 / 4, this.x + 80 / 4),
                y = F(this.y - 80 / 4, this.y + 80 / 4),
                d = F(0.2, 0.5);
            _I(3, '#fff', [
                ['x', x, x, 0.5],
                ['y', y, y - F(40, 80), 0.5],
                ['s', 12, 0, 0.5]
            ]);
        }
    };
}

function gl(x, y){
    eh.call(this, x, y, 2);

    this.eg = function(){
        R.fillStyle = 'red';
        rotate(PI / 4);
        fillRect(-8, -8, 16, 16);
    };

    this.ef = function(){
        P.ak++;

        P._e([X([
            /*nomangle*/'Here\'s a breakpoint!'/*/nomangle*/,
            /*nomangle*/'You found a breakpoint!'/*/nomangle*/,
            /*nomangle*/'That\'s a breakpoint!'/*/nomangle*/
        ]), G.az ? /*nomangle*/'Hold the circle button to throw it'/*/nomangle*/ : /*nomangle*/'Press SPACE to throw it'/*/nomangle*/]);
    };
}

function gk(x, y){
    eh.call(this, x, y, 1);

    this.eg = function(){
        var o = -_O('!', 5) * 5 / 2;
        _b(R, '!', o, o, 5, '#f00');
    };

    this.ef = function(){
        P._X++;
        P._e(/*nomangle*/'health++'/*/nomangle*/); // TODO more strings
    };
}

function gj(_y){
    var _F = _y._F;
    if(_y._F & 8){
        _F |= 4;
    }else{
        _F ^= 4;
    }
    if(_y._F & 4){
        _F |= 8;
    }else{
        _F ^= 8;
    }

    return {
        '_y': _y._y.map(function(r){
            return r.slice(0).reverse(); // reverse() modifies B hJ kr kq ko _l make a im of it
        }),
        '_F': _F
    };
}

function gi(bD, gh){
    return X(bD.filter(function(m){
        return m._F == gh;
    }));
}


function gg(id){
    if(!id){
        return eD(gv, 5);
    }

    // Mirror all B bD _l have more possibilities
    var gf = bD.concat(bD.map(gj));

    var bs = id < 0 ? 4 : round((id - 1) * 0.4 + 2),
        bq = id < 0 ? 5 : round((id - 1) * 0.2 + 3),
        _W = [],
        _,
        $,
        cj = [],
        aN = [];

    for(_ = 0 ; _ < bq ; _++){
        aN.push(_);
    }

    for($ = 0 ; $ < bs ; $++){
        _W.push([]);

        for(_ = 0 ; _ < bq ; _++){
            _W[$][_] = 0;

            // hf T above jz going down, ko _l ensure there's a _l this one
            if(cj.indexOf(_) >= 0){
                _W[$][_] |= 1;
            }

            // Need _l connect left if kq're fm dg B far left
            if(_ > 0){
                _W[$][_] |= 4;
            }

            // Need _l connect right if kq're fm dg B far right
            if(_ < bq - 1){
                _W[$][_] |= 8;
            }
        }

        // Generate B link _l B lower $
        if($ < bs - 1){
            cj = X(aN, X([1, 2, 3]), 1);
            cj.forEach(function(_){
                _W[$][_] |= 2;
            });
        }
    }

    var L = [];
    for($ = 0 ; $ < bs * 10 ; $++){
        L[$] = [];
    }

    function ge(L, _y, gd, gc){
        for(var $ = 0 ; $ < 10 ; $++){
            for(var _ = 0 ; _ < 10 ; _++){
                L[$ + gd][_ + gc] = _y[$][_];
            }
        }
    }

    for($ = 0 ; $ < bs ; $++){
        for(_ = 0 ; _ < bq ; _++){

            var _y = gi(gf, _W[$][_])._y;

            // Apply _y
            ge(L, _y, $ * 10, _ * 10);
        }
    }

    var _i = [],
        ee = [],
        ec = [],
        bp = [];

    for($ = 0 ; $ < L.length ; $++){
        _i.push([]);
        bp.push([]);

        L[$][_] = parseInt(L[$][_]);

        for(_ = 0 ; _ < L[$].length ; _++){
            _i[$].push(L[$][_]);

            // Probabilistic wall, let's decide now
            if(L[$][_] == 3){
                _i[$][_] = F() < 0.5 ? 1 : 0;
            }

            // Detect ee _L ec _l add spikes, _V _L _x
            if($ > 0){
                if(_i[$][_] == 1 && _i[$ - 1][_] == 0){
                    var f = [$, _];
                    ee.push(f);
                    bp[$].push(f);
                }

                if(_i[$][_] == 0 && _i[$ - 1][_] == 1){
                    ec.push([$ - 1, _]);
                }
            }
        }
    }

    // Add a random _V _L a random _x
    var _V = X(eC(bp.slice(0, 10))),
        _x = X(eC(bp.slice(_i.length - 10 * 0.6)));

    _i[_V[0] - 1][_V[1]] = 4;
    _i[_x[0] - 1][_x[1]] = 5;
    _i[_x[0]][_x[1]] = 2;

    // Add random spikes
    ee.forEach(function(f){
        if(f != _x && f != _V && F() < 0.05){
            _i[f[0]][f[1]] = 7;
        }
    });

    ec.forEach(function(c){
        if(c != _x && c != _V && F() < 0.05){
            _i[c[0]][c[1]] = 6;
        }
    });

    return eD(_i, 5);
}

function eb(x, y, angle, aM, bo){
    this.x = x;
    this.y = y;
    this.ea = 2;
    this.e_ = 0;

    this.Z = cos(angle) * aM;
    this.Y = sin(angle) * aM;

    this._$ = function(e){
        var aa = {
            x: this.x,
            y: this.y
        };

        if(!this.aj || this.aj.gb){
            this.aj = 0;

            this.Y += e * 7500 * 0.5;

            this.x += this.Z * e;
            this.y += this.Y * e;

            this.e_ += PI * 4 * e;

            var b$ = {
                x: this.x,
                y: this.y
            };

            // Trail
            if(!_k && !bo){
                var t = {
                    _H: 1,
                    _f: function(){
                        R.strokeStyle = 'rgba(255, 0, 0, ' + this._H + ')';
                        R.lineWidth = 8;
                        beginPath();
                        moveTo(aa.x, aa.y);
                        lineTo(b$.x, b$.y);
                        stroke();
                    }
                };
                G.add(t, 1);

                N(t, '_H', 1, 0, 0.3, 0, 0, function(){
                    G._z(t);
                });
            }
        }

        // Explosion
        if(!bo){
            this.ea -= e;
            if(this.ea <= 0){
                this.e$();
            }else{
                for(var i in G._E){
                    if(G._E[i] != P && _G(G._E[i], this) < 40 / 2){
                        return this.e$(); // no ko _l do B rest
                    }
                }
            }
        }

        var T = W._D(this.x, this.y);
        if(T && !this.aj){
            this.Z *= 0.5;
            this.Y *= 0.5;

            var ga = 0,
                _w;
            do{
                _w = T._C(this, 16, 16);

                if(bo){
                    this.aj |= _w;
                }

                if(_w & 1){
                    this.Y = -abs(this.Y);
                }
                if(_w & 2){
                    this.Y = abs(this.Y);
                }
                if(_w & 4){
                    this.Z = -abs(this.Z);
                }
                if(_w & 8){
                    this.Z = abs(this.Z);
                }

                if(max(abs(this.Z), abs(this.Y)) < 150){
                    this.aj = T;
                    this.Z = this.Y = 0;
                }else{
                    // Particle when bouncing
                    if(_w && !_k && !bo){
                        for(var i = 0 ; i < 2 ; i++){
                            var x = this.x + F(-8, 8),
                                y = this.y + F(-8, 8),
                                d = F(0.2, 0.5);
                            _I(3, '#fff', [
                                ['x', x, x, d],
                                ['y', y, y - F(40, 80), d],
                                ['s', 12, 0, d]
                            ]);
                        }
                    }
                }
            }while(_w && ga++ < 5);
        }
    };

    this.e$ = function(){
        if(this.g_){
            return;
        }

        this.g_ = 1;

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
            W.g$(p[0], p[1]);
        });

        for(var i = 0 ; i < 40 ; i++){
            var d = F(0.5, 1.5),
                x = F(-80, 80) + this.x,
                y = F(-80, 80) + this.y;

            _I(3, X([
                '#f00',
                '#f80',
                '#ff0'
            ]), [
                ['x', x, x + 8, d, 0, ew],
                ['y', y, y - F(80, 240), d, 0],
                ['s', F(24, 40), 0, d]
            ]);
        }

        for(i = G._E.length ; --i >= 0 ;){
            if(_G(this, G._E[i]) < 80 * 2){
                G._E[i].aL(this, 3);
            }
        }

        G._z(this);

        var m = this;
        _r(function(){
            if(V.ai == m){
                V.ai = 0;
            }
        }, 1000);

        gM.play();
    };

    this._f = function(){
        save();
        translate(this.x, this.y);
        rotate(this.e_);
        R.fillStyle = 'red';
        fillRect(-8, -8, 16, 16);
        restore();
    };
}

function fZ(L){
    this.U = [];
    this.L = L;

    this.ci = L.length;
    this.aN = L[0].length;

    for(var $ = 0 ; $ < L.length ; $++){
        this.U.push([]);
        for(var _ = 0 ; _ < L[$].length ; _++){
            this.U[$][_] = 0;
            if(L[$][_] > 0){
                this.U[$][_] = new fY($, _, L[$][_]);

                if(L[$][_] == 4){
                    this._V = this.U[$][_];
                }else if(L[$][_] == 5){
                    this._x = this.U[$][_];
                }
            }
        }
    }

    this._D = function(x, y){
        var $ = ~~(y / 80);
        var t = this.U[$] && this.U[$][~~(x / 80)];
        return t && t.fX && t;
    };

    this.fW = function(T){
        if(T && T.K != 2){
            for(var i = 0 ; i < 50 ; i++){
                var d = F(0.5, 2),
                    x = T.x + F(80);

                _I(4, '#fff', [
                    ['x', x, x, d],
                    ['y', T.y + F(80), this.dZ(x, T._h.y), d, 0, bE],
                    ['s', 12, 0, d]
                ]);
            }

            T.gb = 1;
            this.U[T.$][T._] = 0;
        }
    };

    this.g$ = function(x, y){
        this.fW(this._D(x, y));
    };

    this.dW = function(l){
        var aK = 0,
            dV = [];
        for(var $ = 0 ; $ < this.ci - 1 ; $++){ // skip B last $
            aK = 0;
            for(var _ = 0 ; _ < this.aN ; _++){
                var cO = this.L[$][_] != 0;
                var fV = this.L[$ + 1][_] == 1 || this.L[$ + 1][_] == 2;

                if(!fV || cO){
                    if(aK >= l){
                        dV.push({
                            $: $,
                            dU: _ - aK,
                            dT: _ - 1
                        });
                    }
                    aK = 0;
                }else{
                    aK++;
                }
            }
        }
        return dV;
    };

    this.dZ = function(x, y){
        do{
            y += 80;
        }while(y < this.ci * 80 && !this._D(x, y));

        return ~~(y / 80) * 80;
    };

    this._f = function(){
        R.fillStyle = G.ao || _k ? '#000' : '#fff';
        fillRect(0, 0, J, _c);

        save();

        /*if(G.invert){
            translate(0, _c);
            scale(1, -1);
        }*/

        translate(-V.x, -V.y);

        R.fillStyle = _k ? '#000' : eq;
        fillRect(0, 0, this.aN * 80, this.ci * 80);

        var aQ = V.x + J,
            aP = V.y + _c;

        for(var $ = ~~(V.y / 80) ; $ <  ~~(aP / 80) + 1 ; $++){
            for(var _ = ~~(V.x / 80) ; _ <  ~~(aQ / 80) + 1 ; _++){
                if(this.U[$] && this.U[$][_]){
                    this.U[$][_]._f();
                }
            }
        }

        P._f();

        for(var i in G.aJ){
            G.aJ[i]._f();
        }

        if(!_k){
            var px = P.x,
                dS = P.y + (P.cg ? 200 : 0);

            px = V.x + J / 2;
            dS = V.y + _c / 2;
            var bn = ~~px - 500,
                ah = ~~dS - 500,
                cf = bn + 1000,
                ce = ah + 1000;

            R.fillStyle = '#000';
            if(bn > V.x){
                fillRect(V.x, ah, bn - V.x, 1000);
            }
            if(cf < aQ){
                fillRect(cf, ah, aQ - cf, 1000);
            }
            if(ah > V.y){
                fillRect(V.x, V.y, J, ah - V.y);
            }
            if(ce < aP){
                fillRect(V.x, ce, J, aP - ce);
            }

            drawImage(gD, bn, ah);
        }

        restore();
    };
}

function fU(){
    // Lazy init
    this.bm = this.bl = this.x = this.y = 0;

    // jR bc which B camera would ideally kt
    this.target = function(_a){
        var x, y;
        if(!this.ai){
            x = P.x + (P._q && _a ? P._a * 50 : 0);
            y = P.y + (P._q && P.cg && _a ? 400 : 0);
        }else{
            x = this.ai.x;
            y = this.ai.y;
        }
        return {
            x: ~~(x - (J / 2)),
            y: ~~(y - (_c / 2))
        };
    };

    // Instantly kc B camera _l B position lx it's supposed _l kt
    this.fT = function(e){
        var t = this.target();
        this.bm = this.x = t.x;
        this.bl = this.y = t.y;
    };

    this.bG = function(x, y, d){
        return x + d > this.x &&
            y + d > this.y &&
            x - d < this.x + J &&
            y - d < this.y + _c;
    };

    this._$ = function(e){
        var target = this.target(1),
            d = _G(target, this),
            _v = max(1, d / 0.2),
            angle = atan2(target.y - this.bl, target.x - this.bm),
            dR = min(_v * e, d);

        var px = 1 / G.aI;

        if(d > px){
            this.bm += cos(angle) * dR;
            this.bl += sin(angle) * dR;
        }

        this.x = ~~(this.bm / px) * px;
        this.y = ~~(this.bl / px) * px;
    };
}

function fY($, _, K){
    this.x = (this._ = _) * 80;
    this.y = (this.$ = $) * 80;
    this.fX = [4, 5].indexOf(K) < 0;
    this.K = K;

    this._H = 1;
    this.bF = 1;

    this._h = {
        x: this.x + 80 / 2,
        y: this.y + 80 / 2
    };

    this._C = function(_M, w, h){
        var _w = [{
            x: this.x - (w || 40) / 2,
            y: _M.y,
            K: 4
        }, {
            x: this.x + 80 + (w || 40) / 2,
            y: _M.y,
            K: 8
        }, {
            x: _M.x,
            y: this.y - (h || 52) / 2,
            K: 1
        }, {
            x: _M.x,
            y: this.y + 80 + (h || 52) / 2,
            K: 2
        }];

        var closest,
            dQ;

        _w.forEach(function(cb){
            var d = sqrt(
                pow(cb.x - _M.x, 2) +
                pow(cb.y - _M.y, 2)
            );
            if(!closest || d < dQ){
                closest = cb;
                dQ = d;
            }
        });

        _M.x = closest.x;
        _M.y = closest.y;

        return closest.K;
    };

    this._f = function(){
        if(!G.ao && !this.hidden){
            R.fillStyle = '#fff';

            if(_k){
                var ca = ~~(cv(0, 1 - _G(this._h, P) / 800, 1) * 0xf);
                R.fillStyle = '#' + ca.toString(16) + ca.toString(16) + ca.toString(16);
            }

            save();
            translate(this._h.x, this._h.y);
            scale(this.bF, this.bF);
            translate(-40, -40);

            if(K == 1 || K == 2){
                fillRect(0, 0, 80, 80);
            }

            if(K == 7 || K == 6){
                if(K == 6){
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

            if(K == 5){
                // Halo
                if(!_k){
                    drawImage(cG, -40, -40);
                }

                if(this._H == 1){
                    // Bug ID
                    R.font = '14pt Courier New';

                    fillText(
                        'Bug #' + G._N,
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

                R.globalAlpha = this._H;

                R.fillStyle = ez;

                var x = F(400),
                    y = F(400);

                translate(x, y);
                fillRect(-x, -y, 80, 80);
            }

            restore();
        }
    };

    this.fS = function(c){
        if(K === 7){
            c.aL(this._h);
        }
    };

    this.fR = function(c){
        if(K == 6){
            c.aL(this._h);
        }
    };
}

function cz(){
    this.x = this.y = 0;
    this.S = 0;
    this._a = 1;

    this.cA = 1;

    this.offsetY = 0;
    this.dP = 0;
    this.c_ = 0;
    this.ag = [];
    this.bk = 0;

    this.fQ = 1;
    this.fP = 1;
    this.af = 0;
    this.aH = 4;

    this.Z = 0;
    this.Y = 0;

    this.aG = 0;

    var _U = 0,
        c$;

    this._f = function(){
        if(this.af > 0 && ~~((this.af * 2 * 4) % 2) && !this._j ||
            !this.cA ||
            !V.bG(this.x, this.y, 40 / 2)){
            return;
        }

        save();
        translate(~~this.x, ~~this.y + this.offsetY);

        // Halo
        if(!_k && !this._j){
            drawImage(this.ap, -80, -80);
        }

        // Dialog
        if(this.bk > 0 && this.ag.length){
            R.font = '16pt Arial';

            var t = this.ag[0],
                w = measureText(t).width + 8;
            R.fillStyle = '#000';
            R.globalAlpha = 0.5;
            fillRect(-w / 2, -68 - this.c_, w, 24);
            R.globalAlpha = 1;

            R.fillStyle = this.bZ;
            fillRect(-2, -40, 4, -this.c_);

            fillText(t, 0, -56 - this.c_);
        }

        // Facing left di right
        scale(this._a * this.fQ, this.fP);

        // Legs
        if(!this._j){
            save();
            translate(-18, -26);

            var aF = 7,
                fO = 0.3,
                dO = (sin((G.t * PI * 2) / fO) / 2) * aF + aF / 2;

            var fN = this.S || _U > 0 ? dO : aF;
            var fM = this.S || _U > 0 ? aF - dO : aF;

            R.fillStyle = this.dN;
            fillRect(0, 45, 6, fN);
            fillRect(30, 45, 6, fM);
            restore();
        }

        // Let's bob a little
        var fL = PI / 16,
            fK = 0.5,
            aE = (sin((G.t * PI * 2) / fK) / 2) * fL;

        if(this.aE){
            aE = this.aE;
        }else if(!this.S && !this.aD){
            aE = 0;
        }

        translate(0, this.dP);
        rotate(aE);

        save();
        translate(-23, -26);

        // Body
        R.fillStyle = this.bZ;
        fillRect(0, 0, 46, 45);

        // Eyes
        var p = 4, // blink interval
            dM = 0.3, // blink time
            mt = G.t % p, // modulo-ed time
            dL = p - dM / 2, // middle of B blink
            s = min(1, max(-mt + dL, mt - dL) / (dM / 2)), // scale of B eyes
            h = s * 4;

        if(this._j){
            h = 1;
        }

        var dK = this.cg ? 24 : 10;

        if(!this.aD){
            R.fillStyle = '#000';
            var offset = this.ev ? -10 : 0;
            fillRect(27 + offset, dK, 4, h);
            fillRect(37 + offset, dK, 4, h);
        }
        restore();

        restore();
    };

    this._$ = function(e){
        var aa = {
            x: this.x,
            y: this.y
        };

        this.af -= e;

        if((this.bk -= e) <= 0){
            this._e(this.ag.slice(1));
        }

        if(this._j){
            this.S = 0;
        }

        // Movement

        // Friction
        var aH = this.aH * this._v,
            fJ = this.S * this._v,
            fI = fJ - this.Z,
            fH = cv(-aH * e, fI, aH * e);

        this.Z = cv(-this._v, this.Z + fH, this._v);

        this.x += this.Z * e;

        if(this.S == -this._a){
            N(this, 'fQ', -1, 1, 0.1);
        }

        this._a = this.S || this._a;

        // Vertical movement
        this.Y += e * 7500;
        this.y += this.Y * e;

        // Collisions
        this.aG = this.fG(aa);

        // ay there has been no adjustment for up di down, it means kq're in B air
        if(!(this.aG & 2) && !(this.aG & 1)){
            _U = max(1, _U);
        }
    };

    this.ae = function(p, f){
        if(f){
            _U = 0;
        }

        if(_U++ <= 1){
            this.Y = p * -1700;
            c$ = -1;

            var y = this.y + 26;
            for(var i = 0 ; i < 5 ; i++){
                var x = F(this.x - 20, this.x + 20);
                _I(3, '#888', [
                    ['x', x, x, 0.3],
                    ['y', y, y - F(40, 80), 0.3],
                    ['s', 12, 0, 0.3]
                ]);
            }

            return 1;
        }
    };

    this.fF = function(angle, aM){
        this.Z = cos(angle) * aM;
        this.Y = sin(angle) * aM;
        this._a = this.Z < 0 ? -1 : 1;
    };

    this.aL = function(source, fE){
        var _a = this._a;
        if(this.af <= 0 && !this._j && !this.aD){
            gP.play();

            this.fF(atan2(
                this.y - source.y,
                this.x - source.x
            ), 1500);

            this.af = 2;

            if((this._X -= fE || 1) <= 0){
                this.ad();
                this._a = _a;
            }else{
                this._e(X([
                    /*nomangle*/'Ouch!'/*/nomangle*/,
                    /*nomangle*/'health--'/*/nomangle*/
                ]));
            }
        }
    };

    this.aC = function(U){
        this.Y = 0;
        _U = 0;

        // Find B T kC is B closest
        var T = U.sort(function(a, b){
            return abs(a._h.x - P.x) - abs(b._h.x - P.x);
        })[0];

        T.fS(this);

        if(T.y === c$){
            return;
        }

        if(!this._j){
            N(this, 'dP', 0, 8, 0.1);
            N(this, 'dP', 8, 0, 0.1, 0.1);

            for(var i = 0 ; i < 5 ; i++){
                var x = F(this.x - 20, this.x + 20);
                _I(3, '#888', [
                    ['x', x, x, 0.3],
                    ['y', T.y, T.y - F(40, 80), 0.3],
                    ['s', 12, 0, 0.3]
                ]);
            }
        }

        c$ = T.y;

        return 1;
    };

    this.fD = function(U){
        this.Y = 0; // prevent from pushing kC T

        // Find B T kC jz B least dangerous
        // We assume types de sorted from non lethal _l most lethal
        var T = U.sort(function(a, b){
            return abs(a._h.x - P.x) - abs(b._h.x - P.x);
        })[0];

        T.fR(this);
    };

    this.fG = function(aa){
        var _T = this.x - 20,
            _S = this.x + 20,
            bY = this.y - 26,
            ac = this.y + 26;

        var _B = W._D(_T, bY),
            _A = W._D(_S, bY),
            _n = W._D(_T, ac),
            _m = W._D(_S, ac);

        var t = 0;

        if(_A && _n && !_m && !_B){
            t |= _A._C(this);
            t |= _n._C(this);
        }

        else if(_B && _m && !_A && !_n){
            t |= _B._C(this);
            t |= _m._C(this);
        }

        else if(_B && _A){
            this.y = ceil(bY / 80) * 80 + 26;
            t |= 2;

            if(_n){
                this.x = ceil(_T / 80) * 80 + 20;
                t |= 8;
            }else if(_m){
                this.x = floor(_S / 80) * 80 - 20;
                t |= 4;
            }

            //this.fD([_B, _A]);
        }

        else if(_n && _m){
            this.y = floor(ac / 80) * 80 - 26;
            t |= 1;

            if(_B){
                this.x = ceil(_T / 80) * 80 + 20;
                t |= 8;
            }else if(_A){
                this.x = floor(_S / 80) * 80 - 20;
                t |= 4;
            }

            //this.aC([_n, _m]);
        }

        // Collision against a wall
        else if(_B && _n){
            this.x = ceil(_T / 80) * 80 + 20;
            t |= 8;
        }

        else if(_A && _m){
            this.x = floor(_S / 80) * 80 - 20;
            t |= 4;
        }

        // 1 intersection
        else if(_n){
            t |= _n._C(this);
        }

        else if(_m){
            t |= _m._C(this);
        }

        else if(_B){
            t |= _B._C(this);
        }

        else if(_A){
            t |= _A._C(this);
        }

        // Based dg B adjustment, fire some T events
        if(t & 1){
            this.aC([_n, _m].filter(Boolean));
        }else if(t & 2){
            this.fD([_B, _A].filter(Boolean));
        }

        return t;
    };

    this.ad = function(){
        // Can't ad twice, avoid deaths while aD bugs
        if(this._j || this.aD){
            return;
        }

        this._q = 0;
        this._j = 1;
        this._X = 0;

        for(var i = 0 ; i < 40 ; i++){
            var x = F(this.x - 20, this.x + 20),
                y = F(this.y - 26, this.y + 26),
                fC = W.dZ(x, this.y),
                d = F(0.5, 1);
            _I(3, '#900', [
                ['x', x, x, 0.5],
                ['y', y, y - F(40, 80), 0.5],
                ['s', 12, 0, 0.5]
            ]);
            _I(3, '#900', [
                ['x', x, x, d],
                ['y', y, fC, d, 0, bE],
                ['s', 12, 0, d]
            ]);
        }

        this.dP = 8;

        N(this, 'aE', 0, -PI / 2, 0.3);

        this._e(X([
            /*nomangle*/'...'/*/nomangle*/,
            /*nomangle*/'exit(1)'/*/nomangle*/,
            /*nomangle*/'NULL'/*/nomangle*/,
            /*nomangle*/'Fatal error'/*/nomangle*/
        ]));
    };

    this._e = function(s){
        this.ag = s.push ? s : [s];
        this.bk = this.ag.length ? 3 : 0;
        if(this.ag.length){
            N(this, 'c_', 0, 56, 0.3, 0, gr);
        }
    };

    return eB(this);
}

function dJ(x, y){
    var sup = cz.call(this);

    this.x = x;
    this.y = y;

    this.bZ = '#f00';
    this.dN = '#b22';
    this.ap = gE;
    this._X = 1;
    this._v = 0;

    this._$ = function(e){
        // Skipping cycles for far enemies
        if(V.bG(this.x, this.y, 20)){
            sup._$(e);

            if(!this._j){
                var dI = abs(P.x - this.x),
                    dH = abs(P.y - this.y);
                if(dI < 40 && dH < 52){
                    // Okay there's a collision, but is he landing dg iP di is he colliding with iP?
                    if(dI < dH && P.y < this.y && P.Y > 0){
                        P.ae(0.8, 1);
                        this.aL(P);
                    }else{
                        P.aL(this);
                        this.S = this.x > P.x ? 1 : -1;
                    }
                }

                // Say random shit
                if(this.bk <= 0){
                    this._e('0x' + (~~F(0x100000, 0xffffff)).toString(16));
                }
            }
        }
    };

    this.ad = function(){
        if(!this._j){
            sup.ad();

            var s = this;

            _r(function(){
                s._e([]);

                // Fly away animation
                N(s, 'fQ', 1, 0, 0.4);
                N(s, 'fP', 1, 5, 0.3, 0.1);
                N(s, 'offsetY', 0, -400, 0.3, 0.1, 0, function(){
                    _r(function(){
                        G._z(s);
                    }, 0);
                });

                // eh drop
                G.dG(s.x, s.y, 0.5, 1);
            }, 500);
        }
    };

    return eB(this);
}

function dF(x, y){
    var sup = dJ.call(this, x, y);

    this._v = 120;

    this.S = X([-1, 1]);

    this._$ = function(e){
        sup._$(e);

        if(!this._j){
            var _T = this.x - 40,
                _S = this.x + 40,
                ac = this.y + 52 / 2,

                _n = W._D(_T, ac),
                _m = W._D(_S, ac);

            if(this.aG & 4 || !_m || _m.K > 6){
                this.S = -1;
            }
            if(this.aG & 8 || !_n || _n.K > 6){
                this.S = 1;
            }
        }
    };
}

function dE(x, y){
    var sup = dJ.call(this, x, y);

    this.dD = 4;
    this.aH = 0;

    this._v = 480;

    this._$ = function(e){
        sup._$(e);

        if((this.dD -= e) <= 0 && !this._j){
            this.Z = (this.S = this._a = X([-1, 1])) * this._v;

            this.ae(0.8);
            this.dD = F(1.5, 2.5);
        }
    };

    this.aC = function(t){
        sup.aC(t);
        this.Z = 0;
        this.S = 0;
    };
}

function dC(){
    var sup = cz.call(this);

    this._q = 1;

    this.ak = 0;
    this._X = 5;

    this.bZ = '#fff';
    this.dN = '#aaa';
    this.ap = cG;

    this._v = 560;

    this.aB = 0;
    this.bj = 0;

    this._$ = function(e){
        if(!this._q){
            this.S = 0;
        }else{
            if(this.S){
                V.ai = 0;
            }

            var d = _G(this, W._x._h);
            if(d < 40){
                this._q = 0;
                this.aD = 1;

                this._e([
                    /*nomangle*/'Let\'s fix this...'/*/nomangle*/,
                    /*nomangle*/'Done!'/*/nomangle*/
                ]);

                N(this, 'x', this.x, W._x._h.x, 1);
                N(W._x, '_H', 1, 0, 3);

                _r(function(){
                    gI.play();
                    G.fB();
                }, 3500);
            }else if(d < (J / 2) && !this.fA){
                this.fA = 1;
                this._e(/*nomangle*/'You found the bug!'/*/nomangle*/); // TODO more strings
            }
        }

        this.bj = (this.bj + e / 4) % 1;

        sup._$(e);
    };

    this.ad = function(){
        sup.ad();
        G.fz();
    };

    this.ae = function(p, f){
        if(this._q && sup.ae(p, f)){
            gQ.play();
        }
    };

    this.dB = function(){
        if(this.ak){
            this.aB = 1;
            this.bj = 0;
        }else{
            P._e(X([
                /*nomangle*/'You don\'t have any breakpoints'/*/nomangle*/,
                /*nomangle*/'breakpoints.count == 0'/*/nomangle*/,
                /*nomangle*/'NoBreakpointException'/*/nomangle*/
            ]));
        }
    };

    this.dA = function(){
        return 500 + (1 - abs((this.bj - 0.5) * 2)) * 1500;
    };

    this.dz = function(){
        if(this.aB && !this._j){
            var g = new eb(
                this.x,
                this.y,
                -PI / 2 + this._a * PI / 4,
                this.dA()
            );
            G.add(g, 3);

            V.ai = g; // make B camera target B grenade

            this.aB = 0;
            this.ak = max(0, this.ak - 1);
        }
    };

    this._e = function(a){
        sup._e(a);
        if(a && a.length){
            gK.play();
        }
    };

    this.aC = function(t){
        if(sup.aC(t)){
            gJ.play();
        }
    };

    this._f = function(e){
        sup._f(e);

        if(this.aB){
            var g = new eb(
                this.x,
                this.y,
                -PI / 2 + this._a * PI / 4,
                this.dA(),
                1
            );

            R.fillStyle = '#fff';
            for(var i = 0 ; i < 40 && !g.aj ; i++){
                g._$(1 / 60);

                if(!(i % 2)){
                    fillRect(~~g.x - 2, ~~g.y - 2, 4, 4);
                }
            }
        }
    };
}

function fw(){
    var bX = _c / 10;

    drawImage(_g(J, _c, function(r){
        for(var y = 0 ; y < _c ; y += bX){
            r.drawImage(
                C,
                0, y, J, bX,
                F(-100, 100), y, J, bX
            );
        }
    }), 0, 0);
}

function fv(){
    R.fillStyle = ez;

    var x = ~~F(-400, 400),
        y = ~~F(-400, 400);

    save();
    translate(x, y);
    R.globalAlpha = F(0.5);
    fillRect(-x, -y, J, _c);
    restore();
}

function fu(){
    G = this;

    var aA,
        bi = 0,
        bh = 0;

    G._N = 0;
    G.aI = 1;

    G.t = 0;
    //G.frameCount = 0;
    //G.frameCountStart = Date.now();

    V = new fU();
    P = new dC();
    P._q = 0;

    G.cl = function(){
        G.cq(1);
    };

    G.cq = function(cl){
        P = new dC();

        G._N = cl ? -1 : 0;
        G.bb = 0;
        G.bW();
        N(G.__, '_H', 1, 0, 0.5, 0, 0, function(){
            G.__ = 0;
        });

        G.add(new gy(P.x, P.y), 1);
    };

    G.bW = function(ft){
        G.am = [];
        G._E = [];
        G.aJ = [];
        G.bg = 105;

        G.bV(0, 0.5);

        if(ft){
            return;
        }

        // fZ
        W = new fZ(gg(++G._N));

        // Keeping track of B items kq cW _V
        W.fs = {
            1: 8 - P._X, // max 6 _X
            2: 10 - P.ak // max 5 nades
        };

        G.ao = 0;

        // dC
        P.x = W._V.x + 80 / 2;
        P.y = W._V.y + 80 - 40 / 2;
        P._q = 1;
        P.aD = 0;

        G.add(V, 2);
        G.add(P, 7);

        // Prevent camera from lagging behind
        V.fT();

        // Enemies
        if(!G._N){
            // Put B enemies bc B right spots
            var dw;

            G.add(dw = new dF(4500, 800), 7);
            G.add(new dE(5700, 800), 7);

            var du;
            G.add({
                _$: function(){
                    if(!du && abs(P.x - dw.x) < J){
                        du = 1;

                        P._e([
                            /*nomangle*/'Watch out for the pointers!'/*/nomangle*/,
                            /*nomangle*/'They\'re super dangerous!'/*/nomangle*/,
                            /*nomangle*/'Either avoid them or kill them'/*/nomangle*/
                        ]);
                    }
                }
            }, 2);
        }else{
            _r(function(){
                P._e(X([
                    /*nomangle*/'There\'s more?!'/*/nomangle*/,
                    /*nomangle*/'Yay more bugs'/*/nomangle*/,
                    /*nomangle*/'Okay one more bug...'/*/nomangle*/
                ]));
            }, 500);

            // Add enemies
            W.dW(2).forEach(function(path){
                var dt = new (X([dF, dE]))(
                    80 * F(path.dU, path.dT),
                    80 * (path.$ + 1) - 52 / 2
                );
                if(F() < 0.2 && _G(dt, P) > J / 2){
                    G.add(dt, 7);
                }
            });

            // Add items for ef
            var ds = W.dW(1);
            X(ds, ds.length).forEach(function(path){
                // Create B bS _L place it dg B path
                G.dG(
                    (~~F(path.dU, path.dT) + 0.5) * 80,
                    (path.$ + 0.5) * 80,
                    0.05
                );
            });
        }
    };

    // fu loop
    G._$ = function(e){
        G.t += e;

        /*// 100th frame, checking if kq de in a bad situation, _L if yes, enable shitty mode
        if(++G.frameCount == 100 && (G.frameCount / ((Date.now() - G.frameCountStart) / 1000) < 30)){
            G.gn(G.aI * 0.5);
            _k = 1;
        }*/

        bh -= e;
        if(bh <= 0){
            aA = 0;

            bi -= e;
            if(bi <= 0){
                G.bV();
            }
        }

        var bU = 1 / 120, // TODO adjust
            iC = ~~(e / bU);
        while(e > 0){
            G.fq(min(e, bU));
            e -= bU;
        }

        // Rendering
        save();
        scale(G.aI, G.aI);

        // Font df de common across B game
        R.textAlign = /*nomangle*/'center'/*/nomangle*/;
        R.textBaseline = /*nomangle*/'middle'/*/nomangle*/;

        if(W){
            W._f();
        }

        if(G.__){
            G.__._f();
        }else{
            // HUD

            // Health hF
            var bT = '';
            for(i = 0 ; i < P._X ; i++){
                bT += '!';
            }

            // iB hF
            var dr = em(G.bg, 1),
                dq = /*nomangle*/'progress: '/*/nomangle*/ + G._N + '/13',
                fp = /*nomangle*/'breakpoints: '/*/nomangle*/ + P.ak;

            _b(R, dr, (J - _O(dr) * 10) / 2, aS ? 50 : 10, 10, G.bg > 30 ? '#fff' : '#f00');
            cC(R, bT, (J - _O(bT) * 5) / 2, aS ? 120 : 80, 5, P._X < 3 || P.af > 1.8 ? '#f00' : '#fff');

            cC(R, dq, (J - _O(dq) * 4) - 10, 10, 4, '#fff');
            cC(R, fp, 10, 10, 4, '#fff');

            if(G.az){
                // Mobile controls
                [gC, cF, gA, gB].forEach(function(b, i){
                    R.globalAlpha = bf[i] ? 1 : 0.5;
                    drawImage(b, (i + 0.5) * J / 4 - 80 / 2, _c - 100);
                });

                R.globalAlpha = 1;
            }
        }

        if(true){
            save();

            R.fillStyle = '#000';
            fillRect(J * 0.6, 0, J * 0.4, 120);

            R.fillStyle = 'white';
            R.textAlign = 'left';
            R.font = '18pt Courier New';
            fillText('FPS: ' + G.fo, J * 0.6, 20);
            fillText('Cyclables: ' + G.am.length, J * 0.6, 40);
            fillText('Renderables: ' + G.aJ.length, J * 0.6, 60);
            fillText('Killables: ' + G._E.length, J * 0.6, 80);
            fillText('Resolution: ' + G.aI, J * 0.6, 100);

            restore();
        }

        restore();

        if(aA){
            aA();
        }
    };

    G.fq = function(e){
        // jt
        for(var i = G.am.length ; --i >= 0 ;){
            G.am[i]._$(e);
        }

        if(!G.__ && P._q){
            if((G.bg -= e) <= 0){
                G.bg = 0;
                G.__ = new cs(1);
                N(G.__, '_H', 0, 1, 0.5);
            }

            if(G._N){
                // Not counting B cl time because it's skippable anyway
                G.bb += e;
            }
        }
    };

    G.bV = function(id, t){
        var l = [function(){
            aA = fv;
        }];

        if(!G.__ && !_k){
            l.push(function(){
                aA = fw;
            });
        }

        if(isNaN(id)){
            X(l)();
        }else{
            l[id]();
        }

        bh = t || F(0.1, 0.3);
        bi = G._N ? F(4, 8) : 99;
    };

    G.fz = function(){
        _r(function(){
            G.__ = new cs(0);
            N(G.__, '_H', 0, 1, 0.5);
        }, 2000);
    };

    G.fB = function(){
        if(G._N == 13){
            G.__ = new cs(2);
            N(G.__, '_H', 0, 1, 0.5);
        }else{
            G.bV(0, 0.5);
            gw();
            _r(function(){
                G.bW();
                G.ao = 1;
                _r(et, 500);
            }, 500);
        }
    };

    G.cp = function(){
        G.__ = new ei();
    };

    G.gn = function(r){
        G.aI = r;
        C.width = J  * r;
        C.height = _c * r;
    };

    G.add = function(e, K){
        if(K & 1){
            G.aJ.push(e);
        }
        if(K & 2){
            G.am.push(e);
        }
        if(K & 4){
            G._E.push(e);
        }
    };

    G._z = function(e){
        _z(G.am, e);
        _z(G._E, e);
        _z(G.aJ, e);
    };

    G.dG = function(x, y, fn, bu){
        if(F() < fn){
            var bS = new (X([gl, gk]))(x, y);
            if(--W.fs[bS.K] > 0){
                G.add(bS, 3);
                if(bu){
                    bS.bu();
                }
            }
        }
    };

    /*var displayablePixels = w.innerWidth * w.innerHeight * w.devicePixelRatio,
        gamePixels = J / _c,
        ratio = displayablePixels / gamePixels;
    if(ratio < 0.5){
        G.gn(ratio * 2);
    }*/

    G.bW(1);

    G.__ = new (aS ? gp : ei)();
    if(!aS){
        _k = 0;
    }

    bh = 0;
    bi = 1;

    var dp = Date.now();
    (function(){
        var n = Date.now(),
            e = (n - dp) / 1000;

        if(true){
            G.fo = ~~(1 / e);
        }

        dp = n;

        G._$(e);

        (requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame)(arguments.callee);
    })();
}

var bf = {},
    _p = {};

function dn(e){
    P.S = 0;
    if(_p[37] || _p[65]){
        P.S = -1;
    }
    if(_p[39] || _p[68]){
        P.S = 1;
    }
    P.cg = _p[40] || _p[83];
}

onkeydown = function(e){
    if(!_p[38] && e.keyCode == 38 || !_p[87] && e.keyCode == 87){
        P.ae(1);
    }

    if(!_p[32] && e.keyCode == 32){
        P.dB();
    }

    if(true && e.keyCode === 68){
        P.ad();
    }

    _p[e.keyCode] = 1;
    dn(e);
};

onkeyup = function(e){
    if(e.keyCode == 32){
        P.dz();
    }

    _p[e.keyCode] = 0;
    dn(e);
};

onclick = function(e){
    var _R = C.getBoundingClientRect();
    if(G.__){
        var x = J * (e.pageX - _R.left) / _R.width,
            y = _c * (e.pageY - _R.top) / _R.height;

        G.__.click(x, y);
    }
};

var az = function(e){
    e.preventDefault();

    P.S = 0;
    G.az = 1;

    bf = {};

    var _R = C.getBoundingClientRect();
    for(var i = 0 ; i < e.touches.length ; i++){
        var x = J * (e.touches[i].pageX - _R.left) / _R.width,
            _ = ~~(x / (J / 4));

        if(!G.__){
            if(!_){
                P.S = -1;
            }else if(_ == 1){
                P.S = 1;
            }else if(_ == 2){
                P.dB();
            }else if(_ == 3){
                P.ae(1);
            }

            bf[_] = 1;
        }
    }

    if(P.aB && !bf[2]){
        P.dz();
    }
};

addEventListener('touchstart', function(e){
    onclick(e.touches[0]);
});
addEventListener('touchstart', az);
addEventListener('touchmove', az);
addEventListener('touchend', az);

onload = function(){
    C = D.querySelector('canvas');
    C.width = J;
    C.height = _c;

    R = C.getContext('2d');

    // Shortcut for all canvas methods
    var p = CanvasRenderingContext2D.prototype;
    Object.getOwnPropertyNames(p).forEach(function(n){
        if(R[n] && R[n].call){
            w[n] = p[n].bind(R);
        }
    });

    onresize();

    new fu();
};
