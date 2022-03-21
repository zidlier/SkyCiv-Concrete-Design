/*
  SkyCiv Beam Calculator, Column Forces Sorter, and Column Interaction diagram generator
  Using ACE 318-14
  Created by Patrick Aylsworth C. Garcia. MSCE
*/

var PI = Math.PI;

var generateInteractionDiagram = function (mem_data, column_mark) {

    var column_width = mem_data.width;
    var column_depth = mem_data.depth;
    var db = mem_data.db;
    var ds = mem_data.ds;
    var fc = mem_data.fc;
    var fy = mem_data.fy;
    var fyt = mem_data.fyt;

    var no_rebar_b = mem_data.no_rebar_b;
    var no_rebar_h = mem_data.no_rebar_h;

    var cc = 40;
    var beta1 = 0.85;

    var d_prime = cc + ds + 0.5 * db;
    var d_h = column_depth - d_prime;
    var d_b = column_width - d_prime;

    var rebar_total = (2 * no_rebar_h) + ((no_rebar_b - 2) * 2);
    var rho = As / (column_width * column_depth);
    var Ab = 0.25 * PI * db * db;
    var As = (Ab * rebar_total);
    var Pn_zero = 0.001 * (0.85 * fc * (column_width * column_depth - As) + (As * fy));
    var Mn_zero = 0.0;
    var Pn_max = 0.8 * Pn_zero;

    function forceMomentSolver(c, depthofcolumn, widthofcolumn, layerofrebaralongdepth, layerofrebaralongwidth) {
        var results = {}
        var As_depth = {};
        var d_depth = {};
        var fs_depth = {};
        var lever_arm = {};
        var dist_h = (depthofcolumn - d_prime - d_prime) / (layerofrebaralongdepth - 1);
        var sumAsfsleverarm = 0;
        var sumAsfs = 0;
        for (var n = 1; n <= layerofrebaralongdepth; n++) {
            if (n == 1 || n == layerofrebaralongdepth) {
                As_depth[n] = Ab * layerofrebaralongwidth;
            } else {
                As_depth[n] = Ab * 2;
            }
            d_depth[n] = d_prime + (n - 1) * (dist_h);
            fs_depth[n] = (600 / c) * (d_depth[n] - c);
            if (fs_depth[n] > +fy) {
                fs_depth[n] = fy;
            } else if (fs_depth[n] < -fy) {
                fs_depth[n] = -fy;
            } else {
                fs_depth[n] = (600 / c) * (d_depth[n] - c);
            }

            lever_arm[n] = Math.abs(0.5 * depthofcolumn - d_depth[n]);

        }

        var a = c * beta1;

        if (a <= depthofcolumn) {
            var Pn_concrete = 0.85 * fc * a * widthofcolumn;
            var Mn_concrete = 0.85 * fc * (a * widthofcolumn) * 0.5 * (depthofcolumn - a);
        } else {
            var Pn_concrete = 0.85 * fc * depthofcolumn * widthofcolumn;
            var Mn_concrete = 0.85 * fc * (depthofcolumn * widthofcolumn) * (0.0);
        }

        for (p = 1; p <= layerofrebaralongdepth; p++) {
            sumAsfs = sumAsfs + As_depth[p] * fs_depth[p];
            if (c <= d_depth[p]) {
                sumAsfsleverarm = sumAsfsleverarm - (As_depth[p] * fs_depth[p] * lever_arm[p]);
            } else {
                sumAsfsleverarm = sumAsfsleverarm + (As_depth[p] * fs_depth[p] * lever_arm[p]);
            }

        }

        var Pn = (Pn_concrete - sumAsfs) * 0.001;
        var Mn = ((Mn_concrete - sumAsfsleverarm)) * 0.000001;

        var strain = (d_depth[layerofrebaralongdepth] - c) * (0.003 / c);

        if (strain <= (fy / 200000)) {
            var phi = 0.65;
        } else if (strain >= 0.005) {
            var phi = 0.90;
        } else {
            var phi = 0.65 + (0.25 / (0.005 - (fy / 200000))) * (strain - (fy / 200000));
        }

        results["Pn"] = Math.min(Pn_max, Pn);
        results["Mn"] = Mn;
        results["phi"] = phi;

        return results;
    }

    var result_filename = 'column'+ column_mark;

    var result_csv = '';
    var result_json_h = [];
    var result_json_b = [];
    result_csv += 'c_h'+ '\tMn' + '\tPn' + '\tphiMn' + '\tphiPn' +'\tc_b'+ '\tMnb' + '\tPnb' + '\tphiMnb' + '\tphiPnb' + '\tphiVh' + '\tphiVb' + '\n';

    result_json_h.push({
        'c': 999999999,
        'Mn': Mn_zero,
        'Pn': Pn_zero*0.8,
        'phi': 0.65,
        'phiMn': Mn_zero*0.65,
        'phiPn': Pn_zero*0.8*0.65,
        'x': Mn_zero*0.65,
        'y': Pn_zero*0.8*0.65,
    });

    result_json_b.push({
        'c': 999999999,
        'Mn': Mn_zero,
        'Pn': Pn_zero*0.8,
        'phi': 0.65,
        'phiMn': Mn_zero*0.65,
        'phiPn': Pn_zero*0.8*0.65,
        'x': Mn_zero*0.65,
        'y': Pn_zero*0.8*0.65,
    });

	result_csv += 999999999 + '\t' + Mn_zero + '\t' + Pn_zero*0.8 + '\t' + Mn_zero*0.65 + '\t' +  Math.min(Pn_max,Pn_zero*0.8*0.65) +'\t'+ 999999999 + '\t' + Mn_zero + '\t' + Pn_zero*0.8 + '\t' + Mn_zero*0.65 + '\t' +  Math.min(Pn_max,Pn_zero*0.8*0.65) + '\n';

    for (var N = 0; N < 300; N++) {

        var c_h = ((600 * d_h) / (600 - fy)) - N * (((600 * d_h) / (600 - fy)) * 0.01);
        var results_h = forceMomentSolver(c_h, column_depth, column_width, no_rebar_h, no_rebar_b);
        var c_b = ((600 * d_b) / (600 - fy)) - N * (((600 * d_b) / (600 - fy)) * 0.01);
        var results_b = forceMomentSolver(c_b, column_width, column_depth, no_rebar_b, no_rebar_h);

		let shear_conc_cap_h = 0.17*Math.pow(fc, 0.5)*column_width*d_h*0.001
		let shear_stirr_cap_h = ((2*PI*ds*ds*fyt*d_h)/100.0)*0.001
		var shear_h = 0.75*(shear_conc_cap_h + shear_stirr_cap_h)

		let shear_conc_cap_b = 0.17*Math.pow(fc, 0.5)*column_depth*d_b*0.001
		let shear_stirr_cap_b = ((2*PI*ds*ds*fyt*d_b)/100.0)*0.001
		var shear_b = 0.75*(shear_conc_cap_b + shear_stirr_cap_b)

        result_json_h.push({
            'c': c_h,
            'Mn': results_h["Mn"],
            'Pn': results_h["Pn"],
            'phi': results_h["phi"],
            'phiMn': results_h["phi"]*results_h["Mn"],
            'phiPn': Math.min(Pn_max,results_h["phi"]*results_h["Pn"]),
            'x': results_h["phi"]*results_h["Mn"],
            'y': Math.min(Pn_max,results_h["phi"]*results_h["Pn"]),
        });

        result_json_b.push({
            'c': c_b,
            'Mn': results_b["Mn"],
            'Pn': results_b["Pn"],
            'phi': results_b["phi"],
            'phiMn': results_b["phi"]*results_b["Mn"],
            'phiPn': Math.min(Pn_max,results_b["phi"]*results_b["Pn"]),
            'x': results_b["phi"]*results_b["Mn"],
            'y': Math.min(Pn_max,results_b["phi"]*results_b["Pn"])
        });

        result_csv += c_h + '\t' + results_h["Mn"] + '\t' + results_h["Pn"] + '\t' + results_h["phi"]*results_h["Mn"] + '\t' +  Math.min(Pn_max,results_h["phi"]*results_h["Pn"])  +'\t'+ c_b + '\t' + results_b["Mn"] + '\t' + results_b["Pn"] + '\t' + results_b["phi"]*results_b["Mn"] + '\t' +  Math.min(Pn_max,results_b["phi"]*results_b["Pn"]) + '\t' +  shear_h + '\t' +  shear_b + '\n';
    }

    var final = {
        'result_csv': result_csv,
        'result_json_h': result_json_h,
        'result_json_b': result_json_b,
        'filename': result_filename
    }
	console.log(final.result_filename)

    return final;
}


module.exports = {
    'generateInteractionDiagram': generateInteractionDiagram
}
