# SkyCiv-Concrete-Design
My own concrete design based on SkyCiv S3D analysis output using nodejs

#### SkyCiv Beam Calculator, Column Forces Sorter, and Column Interaction diagram generator using ACI 318-14
##### written by Patrick Aylsworth C. Garcia, MSCE
https://www.linkedin.com/in/patrick-aylsworth-garcia/

*****************************************************************************************************************************************
### SETUP:
- Install Nodejs
- Install python3
- `npm install`

### INPUT:

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

Step 4: To run, go to directory, open terminal and type `node design` - take note, nodejs should be installed on your computer.



*****************************************************************************************************************************************
### OUTPUT:

##### For Beam Design:
On your terminal, you can obtain the result for beam design as table:
![image](https://user-images.githubusercontent.com/38188145/159314302-548b0ff1-0c0b-4263-bdf2-af7aa6a65cf5.png)


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



#### For Column Forces:
In order to easily plot the Pu-Mu forces on column interaction diagram for phiMn about z and phiMn about y, forces are sorted for eact section with Pu, My, and Mz.
"member_id	Pu	My	Mz	section"
"3	90.511	0.034	4.365	column1"
"3	88.619	0.113	3.313	column1"

For post-processing, column_forces.csv is generated for plotting of forces in alongside with interaction diagram.



#### For Column Design:
On your terminal, you can obtain the result for column interaction for phiMn about z and phiMn about y and as table:
![image](https://user-images.githubusercontent.com/38188145/159314929-f86a5bad-9c88-45c8-9d7a-c8c64f5641f4.png)

Results are stored in column1.csv (column + member_id) for post-processing and generation of interaction diagram.


#### Column Interaction Diagram and Shear Envelope
To automatically create the column interaction diagram and shear envelope with the loads:

`python column_interaction.py` or `python3 column_interaction.py`

Just install dependencies like pandas etc.

![column1-My-Pu](https://user-images.githubusercontent.com/38188145/159315912-fdb9dfb8-7cda-4a1c-893a-799d2e68f0a2.png)

![column1-Mz-Pu](https://user-images.githubusercontent.com/38188145/159315976-7df7b720-af2d-447f-b974-689a22b1e520.png)

![column1-shear-envelope](https://user-images.githubusercontent.com/38188145/159316049-2169b09c-67f8-4808-a2db-c15d7ca60144.png)
