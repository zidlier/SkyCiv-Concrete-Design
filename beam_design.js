var PI = 3.14159265358979;

function interpolate(x1, y1, x3, x2, y2) {
    var y2 = (((x2 - x1) * (y3 - y1)) / (x3 - x1)) + y1;
    return y2;
}

function AsSolver(moment, fc, fy, b, d, rhomininimum) {
    var a = 50.0;
    for (var e = 1; e <= 12; e++) {
        var As = (moment * 1000000.0) / (0.9 * fy * (d - 0.5 * a));
        a = (As * fy) / (0.85 * fc * b);
    }
    var rho = As / (b * d);
    if (rho < rhomininimum) {
        Asfinal = rhomininimum * b * d;
    } else {
        Asfinal = As;
    }
    return Asfinal;
}



function AsSelect(as, b, d, rhominimum) {
    if (as < rhominimum) as = rhominimum * b * d;
    return as;
}

function maxRebarPerLayer(widthprime, diameter) {
    var i = 2;
    do {
        var diff = widthprime - (i - 1) * (25 + diameter);
        i++;
    }
    while (diff >= 0);
    return i;
}


var designBeamReinforcement = function (mem_data, moment_max, moment_min, shear_max, shear_min) {
    
    var beam_mark = mem_data.member_id;
    var beam_width = mem_data.width;
    var beam_depth = mem_data.depth;
    var db = mem_data.db;
    var ds = mem_data.ds;
    var fc = mem_data.fc;
    var fy = mem_data.fy;
    var fyt = mem_data.fyt;

    var Ab = 0.25 * PI * db * db;
    var Av = 0.25 * PI * ds * ds * 2;
    var cc = 40.0;
    var dprime = cc + ds + 0.5 * db;
    var effectivedepth = beam_depth - cc - ds - (0.5 * db);

    var final = {
        'beam_mark': beam_mark,
        'beam_width': beam_width,
        'beam_depth': beam_depth,
        'db': db
    }

    var support1_moment_pos = Math.abs(Math.max(moment_max[0], moment_max[1], moment_max[2]));
    var midspan_moment_pos = Math.abs(Math.max(moment_max[3], moment_max[4], moment_max[5]));

    var support1_moment_neg = Math.abs(Math.min(moment_min[0], moment_min[1], moment_min[2]));
    var midspan_moment_neg = Math.abs(Math.min(moment_min[3], moment_min[4], moment_min[5]));
	
	if (isNaN(moment_min[8])) {
		var support2_moment_neg = Math.abs(Math.min(moment_min[6], moment_min[7]));
		var support2_moment_pos = Math.abs(Math.max(moment_max[6], moment_max[7]));
	} else {
		var support2_moment_neg = Math.abs(Math.min(moment_min[6], moment_min[7], moment_min[8]));
		var support2_moment_pos = Math.abs(Math.max(moment_max[6], moment_max[7], moment_max[8]));
	}
	

    if (fc <= 28) {
        var beta1 = 0.85
    } else if (fc >= 56) {
        var beta1 = 0.65;
    } else {
        var beta1 = interpolate(28, 0.85, fc, 56, 0.65);
    }

    var rho_min = Math.max(1.4 / fy, Math.pow(fc, 0.5) / (4 * fy));
    var rho_max = 0.85 * beta1 * (fc / fy) * (3 / 7);

    var As_support1_top = AsSolver(support1_moment_neg, fc, fy, beam_width, effectivedepth, rho_min);
    var As_support1_bot = AsSolver(Math.max(support1_moment_pos, 0.5 * support1_moment_neg), fc, fy, beam_width, effectivedepth, rho_min);
    var As_midspan_bot = AsSolver(midspan_moment_pos, fc, fy, beam_width, effectivedepth, rho_min);
    var As_midspan_top = AsSelect(Math.max(midspan_moment_neg, 0.5 * midspan_moment_pos), beam_width, effectivedepth, rho_min);
    var As_support2_top = AsSolver(support2_moment_neg, fc, fy, beam_width, effectivedepth, rho_min);
    var As_support2_bot = AsSolver(Math.max(support2_moment_pos, 0.5 * support2_moment_neg), fc, fy, beam_width, effectivedepth, rho_min);

    var b_prime = beam_width - dprime - dprime - db;
    var max_rebar_per_layer = maxRebarPerLayer(b_prime, db);

    var support1_top = Math.max(2, Math.ceil(As_support1_top / Ab));
    var support1_bot = Math.max(2, Math.ceil(As_support1_bot / Ab));
    var support2_top = Math.max(2, Math.ceil(As_support2_top / Ab));
    var support2_bot = Math.max(2, Math.ceil(As_support2_bot / Ab));
    var midspan_bot = Math.max(2, Math.ceil(As_midspan_bot / Ab));
    var midspan_top = Math.max(2, Math.ceil(As_midspan_top / Ab));

    final.support1_top = support1_top;
    final.support1_bot = support1_bot;
    final.midspan_top = midspan_top;
    final.midspan_bot = midspan_bot;
    final.support2_top = support2_top;
    final.support2_bot = support2_bot; 
    final.ds = ds;


    var shear_result = [];

    function calculateStirrupSpacing (shear) {
        var Vc = 0.75 * 0.17 * Math.pow(fc, 0.5) * beam_width * effectivedepth * 0.001;
        var ph = 2 * (beam_width - cc - ds) + 2 * (beam_depth - cc - ds)
        var s_max = ph / 8;
        var Vs = (Math.abs(shear) / 0.75) - Vc;
        if (Vs > 0) {
            var dump = (Vs * 1000) / (Av * fyt * effectivedepth);
            var spacing = Math.min(s_max, dump);
        } else {
            var spacing = s_max;
        }
        return spacing;
    }
    //SHEAR

    for (var j = 0; j < shear_max.length; j++) {
        shear_result.push(Math.max(calculateStirrupSpacing(shear_max[j]), calculateStirrupSpacing(shear_min[j])));
    }

    final.spacing = shear_result;

    return final;

}

module.exports = {
    'designBeamReinforcement': designBeamReinforcement
}