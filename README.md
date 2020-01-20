# SkyCiv-Concrete-Design
My own concrete design based on SkyCiv S3D analysis output using nodejs

# SkyCiv Beam Calculator, Column Forces Sorter, and Column Interaction diagram generator
# written by Patrick Aylsworth C. Garcia, MSCE



*****************************************************************************************************************************************
INPUT:

Step 1: From SkyCiv analysis results, select Output -> CSV Results and generate the following csv files:
	From Model: 
	- Nodes.csv, Members.csv, Sections.csv

	From Member Results:
	- Bending Moment Z.csv (select All Load Combinations) -> rename to bending_z.csv
	- Bending Moment Y.csv (select All Load Combinations) -> rename to bending_y.csv
	- Shear Force Z.csv (select All Load Combinations) -> rename to shear_z.csv
	- Shear Force Y.csv (select All Load Combinations) -> rename to shear_y.csv
	- Axial Force.csv (select All Load Combinations) -> rename to axial.csv
	- Torsion Force.csv (select All Load Combinations) -> rename to torsion.csv

	Copy all csv files to 'input' folder

Step 2: Edit the section_input.json with the following definition

 	"1": {					- the section id, should be consistent with properties in Sections.csv
        	"width": 350,			- width of RC section (mm)
        	"depth": 350,			- depth of RC section (mm)
        	"fc": 21,			- concrete compressive strength (MPa)
        	"fy": 275,			- yield strength of longitudinal reinf. (MPa)
        	"fyt": 230,			- yield strength of tranverse reinf. (MPa)
        	"db": 16,			- diameter of longitudinal reinf. (mm)
        	"ds": 10,			- diameter of transverse reinf. (mm)
        	"member_type": "column",	- "column" or "beam"
        	"no_rebar_b": 3,		- for columns only - number of rebar layer parallel to width direction
        	"no_rebar_h": 3			- for columns only - number of rebar layer parallel to depth direction
    	},

Step 3: Edit the variable "start_val" in design.js - this will be the first member id on the Members.csv

Step 4: To run, go to directory, open terminal and type "node design" - take note, nodejs should be installed on your computer.



*****************************************************************************************************************************************
OUTPUT:

# For Beam Design:
On your terminal, you can obtain the result for beam design as table:


┌─────────┬───────────┬────────────┬────────────┬────┬──────────────┬──────────────┬─────────────┬─────────────┬──────────────┬──────────────┬────┬───────────────────────────────────────────┐
│ (index) │ beam_mark │ beam_width │ beam_depth │ db │ support1_top │ support1_bot │ midspan_top │ midspan_bot │ support2_top │ support2_bot │ ds │                  spacing                  │
├─────────┼───────────┼────────────┼────────────┼────┼──────────────┼──────────────┼─────────────┼─────────────┼──────────────┼──────────────┼────┼───────────────────────────────────────────┤
│    1    │    '4'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│    2    │    '5'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│    3    │    '6'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│    6    │    '9'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│    7    │   '10'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│    8    │   '11'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│    9    │   '12'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   10    │   '13'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   15    │   '18'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   19    │   '22'    │    250     │    400     │ 16 │      3       │      3       │      2      │      3      │      3       │      3       │ 10 │ [ 137.5, 137.5, 137.5, ... 6 more items ] │
│   20    │   '23'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   21    │   '24'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   23    │   '26'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   24    │   '27'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   25    │   '28'    │    250     │    400     │ 16 │      3       │      3       │      2      │      3      │      3       │      3       │ 10 │ [ 137.5, 137.5, 137.5, ... 6 more items ] │
│   26    │   '29'    │    250     │    400     │ 16 │      3       │      3       │      2      │      3      │      3       │      3       │ 10 │ [ 137.5, 137.5, 137.5, ... 6 more items ] │
│   27    │   '30'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   29    │   '32'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   38    │   '41'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   39    │   '42'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │
│   54    │   '57'    │    250     │    300     │ 16 │      2       │      2       │      2      │      2      │      2       │      2       │ 10 │ [ 112.5, 112.5, 112.5, ... 6 more items ] │




where: 	beam_mark - is the member id
	db - longitudinal reinf. diameter
	support1_top - number of rebar required on top of support section (A node)
	support1_bot - number of rebar required on bottom of support section (A node)
	support2_top - number of rebar required on top of support section (B node)
	support2_bot - number of rebar required on bottom of support section (B node)
	midspan_top - number of rebar required on top of midspan section
	midspan_bot - number of rebar required on bottom of midspan section
	ds - transverse reinf. diameter
	spacing - an array of calculated required spacing of stirrups for each specific point [0%, 12.50%, 25%, 37.50%, 50%, 62.50%, 75%, 87.50%, 100%] of member length. Typically, it would be 1 @ 50mm, (2*beam_depth/100) @ 100mm, rest @ displayed maximum spacing to centerline

Results are stored in beam_results.csv for post-processing of the table.



# For Column Forces:
In order to easily plot the Pu-Mu forces on column interaction diagram for phiMn about z and phiMn about y, forces are sorted for eact section with Pu, My, and Mz.
"member_id	Pu	My	Mz	section"
"3	90.511	0.034	4.365	column1"
"3	88.619	0.113	3.313	column1"

For post-processing, column_forces.csv is generated for plotting of forces in alongside with interaction diagram.



# For Column Design:
On your terminal, you can obtain the result for column interaction for phiMn about z and phiMn about y and as table:
┌─────────┬────────────────────┬────────────────────┬─────────────────────┬────────────────────┬────────────────────┬─────────────────────┐
│ (index) │         c          │         Mn         │         Pn          │        phi         │       phiMn        │        phiPn        │
├─────────┼────────────────────┼────────────────────┼─────────────────────┼────────────────────┼────────────────────┼─────────────────────┤
│    0    │     999999999      │         0          │ 2080.1996816366036  │        0.65        │         0          │ 1352.1297930637925  │
│    1    │ 539.0769230769231  │ 38.815005553632574 │ 2080.1996816366036  │        0.65        │ 25.229753609861174 │ 1352.1297930637925  │
│    2    │ 533.6861538461538  │ 38.583327375396934 │ 2080.1996816366036  │        0.65        │ 25.079162794008006 │ 1352.1297930637925  │
│    3    │ 528.2953846153846  │ 38.346921071074846 │ 2080.1996816366036  │        0.65        │ 24.92549869619865  │ 1352.1297930637925  │
│    4    │ 522.9046153846155  │ 38.105640409962625 │ 2080.1996816366036  │        0.65        │ 24.76866626647571  │ 1352.1297930637925  │
│    5    │ 517.5138461538462  │ 37.85933306841056  │ 2080.1996816366036  │        0.65        │ 24.608566494466864 │ 1352.1297930637925  │
│    6    │  512.123076923077  │ 37.60784030914161  │ 2080.1996816366036  │        0.65        │ 24.445096200942046 │ 1352.1297930637925  │
│    7    │ 506.7323076923077  │ 37.35099664010097  │ 2080.1996816366036  │        0.65        │ 24.278147816065633 │ 1352.1297930637925  │
│    8    │ 501.34153846153845 │ 37.08862945129603  │ 2080.1996816366036  │        0.65        │ 24.10760914334242  │ 1352.1297930637925  │
│    9    │ 495.95076923076925 │ 36.820558627951854 │ 2080.1996816366036  │        0.65        │ 23.933363108168706 │ 1352.1297930637925  │



Results are stored in column1.csv (column + member_id) for post-processing and generation of interaction diagram.
