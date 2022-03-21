/*
  SkyCiv Beam Calculator, Column Forces Sorter, and Column Interaction diagram generator
  Using ACE 318-14
  Created by Patrick Aylsworth C. Garcia. MSCE
*/


// FOR SEPARATION OF CALCULATIONS
const PI = Math.PI

const column_designer = require(`./column_design.js`);
const beam_designer = require(`./beam_design.js`);

var designBeamReinforcement =beam_designer.designBeamReinforcement;
var generateInteractionDiagram = column_designer.generateInteractionDiagram;

const fs = require("fs");

var start_val = "1";

function importForcesFromCSV(input_name, output_name, output_file_true_false) {
    var file = fs.readFileSync(__dirname + '/input_files/' + input_name + '.csv', 'utf8');
    file = file.split("\n");

    function removeNull (v) {
        // console.log(v)
        if (v != '' || v != null) return v;
    }

    var data = file.filter(v => removeNull(v));
    var final_data = [];
    var final_data_json = {};
    var started = false;
    var count;
    var cells;
    var member_id;

    for (var i = 0; i < data.length; i++) {
        cells = data[i].split(",");
        cells.pop()
        member_id = cells[0];
        if (member_id == start_val && count == null) {
            started = true;
            count = i;
        }

        if (!started || member_id == "" || member_id == null || cells.length == 0) continue;

        for (var k = 0; k < cells.length-1; k++) {
            if (!isNaN(parseFloat(cells[k]))) cells[k] = parseFloat(cells[k]);
        }

        var id = String(cells[0]);
        cells[0] =String(id);
        final_data.push(cells);
        // console.log(final_data[i].length)
    }

    if (output_file_true_false) fs.writeFileSync(__dirname + '/results/' + output_name + '.csv', final_data);
    // console.log('Done')

    if (final_data[0] == "" || final_data[0] == null) final_data.shift();

    return final_data
}

function sortMaxMinForces (force_array, member_array,max_min) {
    var mem_id = [];
    var final = [];
    var final_final = [];
    var final_obj = {};

    for (var i = 0; i < member_array.length; i++) {
        var dump = member_array[i];
        var mem_id_dump = dump[0];
        mem_id.push(mem_id_dump);
    }

    function sortForcesToMembers (obj, max_min) {
        var dump_result_obj = {};
        for (var keys in obj) {
            var arr = obj[keys];
			//[[id,forces,load_group],[],[],[],[]] // number of load cases
            var dump_result_array = [];

			for (var h=1; h < 11 - 1; h++) {
				var dump_2 = [];
				for (var m =0; m < arr.length; m++) {
					dump_2.push(arr[m][h]);
				}

				if (max_min == 'max') var temp1 = Math.max(...dump_2);
                if (max_min == 'min') var temp1 = Math.min(...dump_2);
                dump_result_array.push(temp1)
            }

            dump_result_obj[keys] = dump_result_array;
        }
        return dump_result_obj;
    }

    for (var i = 0; i < mem_id.length; i++) {
        var member_key = mem_id[i];
        var dump_1 = [];
        for (var j=0; j < force_array.length; j++) {
            var force_row = force_array[j];

            if (member_key == force_row[0]) {
                dump_1.push(force_row);
            }
        }
        final_obj[member_key] = dump_1;
    }

    return sortForcesToMembers(final_obj, max_min);
}

function generateMemberPropertiesObject (member_arr, material_properties) {
    var final = [];
    for (var i = 0; i < member_arr.length; i++) {
        var mem_temp = member_arr[i];

        var result = {
            "member_id": mem_temp[0],
            "A_node": mem_temp[1],
            "B_node": mem_temp[2],
            "section": mem_temp[4]
        }

        for (var keys in material_properties) {
            if (keys == result.section) {
                result['width'] = material_properties[keys].width;
                result['depth'] = material_properties[keys].depth;
                result['fc'] = material_properties[keys].fc;
                result['fy'] = material_properties[keys].fy;
                result['fyt'] = material_properties[keys].fyt;
                result['db'] = material_properties[keys].db;
                result['ds'] = material_properties[keys].ds;
                result['member_type'] = material_properties[keys].member_type;
                result['no_rebar_b'] = material_properties[keys].no_rebar_b;
                result['no_rebar_h'] = material_properties[keys].no_rebar_b;
            }
        }
        final.push(result);
    }
    return final;
}

function sortForcesForColumnDesign (axial, bendingz, bendingy, sheary, shearz, member_array) {
    var mem_id = [];
    var final = [];
    var final_final = [];
    var final_obj = {};

    for (var i = 0; i < member_array.length; i++) {
        var dump = member_array[i];
        var mem_id_dump = dump[0];
        mem_id.push(mem_id_dump);
    }

    for (var i = 0; i < mem_id.length; i++) {
        var member_key = mem_id[i];
        var dump_obj = { 'axial': '', 'bending_z': '', 'bending_y': ''};
        var dump_1 = [];
        var dump_bdgz = [];
        var dump_bdgy = [];
		var dump_sheary = [];
		var dump_shearz = [];
        for (var j=0; j < axial.length; j++) {
            var force_row = axial[j];
            if (member_key == force_row[0]) {

                axial[j].shift();
                axial[j].pop()
                bendingz[j].shift();
                bendingz[j].pop()
                bendingy[j].shift();
                bendingy[j].pop()
				sheary[j].shift();
                sheary[j].pop()
				shearz[j].shift();
                shearz[j].pop()

                dump_1.push(axial[j]);
                dump_bdgz.push(bendingz[j]);
                dump_bdgy.push(bendingy[j]);
				dump_sheary.push(sheary[j]);
                dump_shearz.push(shearz[j]);
            }
        }

        dump_obj['axial'] = dump_1;
        dump_obj['bending_z'] = dump_bdgz;
        dump_obj['bending_y'] = dump_bdgy;
		dump_obj['shear_y'] = dump_sheary;
		dump_obj['shear_z'] = dump_shearz;
        final_obj[member_key] = dump_obj;
    }

    return final_obj;
}

// START OF CONCRETE DESIGN
console.log('START OF CONCRETE DESIGN')

// IMPORT SECTION AND MEMBER DATA
console.log('MPORTing SECTION AND MEMBER DATA ...')
var member_data = importForcesFromCSV('Members', 'members_sorted', false);
const section_material_prop = require(`./section_input.json`);

// IMPORT ALL MEMBER FORCES FOR BEAM DESIGN
console.log('MPORTing ALL MEMBER FORCES FOR BEAM DESIGN ...')
var bending_z = importForcesFromCSV('bending_z', 'bending_z_sorted', false);
var bending_y = importForcesFromCSV('bending_y', 'bending_y_sorted', false);
var shear_y = importForcesFromCSV('shear_y', 'shear_y_sorted', false);
var shear_z = importForcesFromCSV('shear_z', 'shear_z_sorted', false);
var torsion = importForcesFromCSV('torsion', 'torsion_sorted', false);
var axial = importForcesFromCSV('axial', 'axial_sorted', false);

// GENERATE SECTION AND MAT PROPERTIES FOR MEMBER DATA
console.log('GENERATING SECTION AND MAT PROPERTIES FOR MEMBER DATA ...')
var final_member_data = generateMemberPropertiesObject(member_data, section_material_prop);
console.log('MEMBER DATA GENERATED');


// ENVELOPE FORCES FOR BENDING MOMENT Z
var bending_z_sorted_max = sortMaxMinForces(bending_z,member_data, 'max');
var bending_z_sorted_min = sortMaxMinForces(bending_z,member_data, 'min');

//console.log(bending_z_sorted_min)
// ENVELOPE FORCES FOR SHEAR Y
var shear_y_sorted_max = sortMaxMinForces(shear_y,member_data, 'max');
var shear_y_sorted_min = sortMaxMinForces(shear_y,member_data, 'min');



// DESIGN OF BEAM
console.log('BEAM DESIGN INITIALIZING')
var beam_design_json = [];
var beam_design_csv = '';
beam_design_csv += 'beam_mark'+ '\tbeam_width' + '\tbeam_depth' + '\tdb' + '\tsupport1_top' + '\tsupport1_bot' + '\tmidspan_top' + '\tmidspan_bot' + '\tsupport2_top' + '\tsupport2_bot' + '\tds' + '\tstirrups_spacing' + '\n';
for (var i = 0; i < final_member_data.length; i++) {
    var mem_id = final_member_data[i].member_id;
    if (final_member_data[i].member_type == 'beam') {
        beam_design_json[i] = designBeamReinforcement(final_member_data[i],bending_z_sorted_max[mem_id],bending_z_sorted_min[mem_id],shear_y_sorted_max[mem_id],shear_y_sorted_min[mem_id]);
        beam_design_csv += beam_design_json[i].beam_mark+ '\t'+ beam_design_json[i].beam_width+ '\t'+ beam_design_json[i].beam_depth + '\t' +beam_design_json[i].db + '\t' + beam_design_json[i].support1_top + '\t' + beam_design_json[i].support1_bot + '\t' + beam_design_json[i].midspan_top + '\t'+ beam_design_json[i].midspan_bot + '\t' +beam_design_json[i].support2_top  + '\t' + beam_design_json[i].support2_bot + '\t' +beam_design_json[i].ds + '\t' +beam_design_json[i].spacing +'\n';
    }
}
console.table(beam_design_json)
console.log('BEAM DESIGN DONE')
fs.writeFileSync(__dirname + '/results/beam_results.txt', beam_design_csv);


// SORT COLUMN FORCES
console.log('COLUMN FORCES SORTING....')
var column_forces_csv = '';
var column_forces_json = [];
column_forces_csv += 'member_id' +  '\tPu'+ '\tMy' + '\tMz' + '\tSy'+ '\tSz'+ '\tsection' + '\n';

var column_forces = sortForcesForColumnDesign(axial, bending_z, bending_y,shear_y,shear_z, member_data)
for (var i = 0; i < final_member_data.length; i++) {
    var mem_id = final_member_data[i].member_id;
    var section = final_member_data[i].section;
    if (final_member_data[i].member_type == 'column') {
        var column_tem = column_forces[mem_id]
        for (var k =0; k < column_tem.axial.length; k++) {
            var axial_temp = column_tem.axial[k];
            var bendingy_temp = column_tem.bending_y[k];
            var bendingz_temp = column_tem.bending_z[k];

			var sheary_temp = column_tem.shear_y[k];
            var shearz_temp = column_tem.shear_z[k];

            for (var j =0; j < axial_temp.length; j++) {
                var section_name = 'column'+ section;
                column_forces_csv += mem_id + '\t' + axial_temp[j] + '\t' + Math.abs(bendingy_temp[j]) + '\t'+ Math.abs(bendingz_temp[j]) + '\t'+  Math.abs(sheary_temp[j]) + '\t' + Math.abs(shearz_temp[j]) + '\t' + section_name+'\n';
                column_forces_json.push({'member_id': mem_id, 'Pu': axial_temp[j], 'My': Math.abs(bendingy_temp[j]), 'Mz':  Math.abs(bendingz_temp[j]), 'Sy':  Math.abs(sheary_temp[j]), 'Sz':  Math.abs(shearz_temp[j]), 'section_name':  section_name})
            }
        }
    }
}

// column_forces_json[i].My
// column_forces_json[i].Pu

// column_forces_json[i].Mz
// column_forces_json[i].Pu

// console.table(column_forces_json)
console.log('COLUMN FORCES SORTING DONE')
fs.writeFileSync(__dirname + '/results/column_forces.csv', column_forces_csv);





// CALCULATE INTERACTION DIAGRAM OF COLUMN
var res = {};
var interaction_diag = {};

var chart_datasets = [];

for (var col_id in section_material_prop) {
    if (section_material_prop[col_id].member_type == 'column') {
        res[col_id] = generateInteractionDiagram(section_material_prop[col_id], col_id);
        console.log('results__b')
        console.table( res[col_id].result_json_b)
        console.log('results__h')
        console.table( res[col_id].result_json_h)
        fs.writeFileSync(__dirname + '/results/'+ res[col_id].filename+'.csv', res[col_id].result_csv);
		fs.writeFileSync(__dirname + '/results/'+ res[col_id].filename+'.txt', res[col_id].result_csv);

        let temp_h = [];
        let temp_b = [];

        res[col_id].result_json_h.map(v => temp_h.push({x: v.x, y: v.y}));
        res[col_id].result_json_b.map(v => temp_b.push({x: v.x, y: v.y}));

        interaction_diag[col_id] = {
            'results_b': temp_b,
            'results_h': temp_h,
        }

        chart_datasets.push({
            label: 'Moment about b',
            pointBorderColor: 'red',
            borderColor: 'red',
            data: temp_b,
            pointRadius: 3
        })


        chart_datasets.push({
            label: 'Moment about h',
            pointBorderColor: 'blue',
            borderColor: 'blue',
            data: temp_h,
            pointRadius: 3
        })

        console.table(temp_h)

    }
}
console.log('COLUMN INTERACTION DONE')





// PLOT INTERACTION DIAGRAM
