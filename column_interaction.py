import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

column_forces = pd.read_csv("results/column_forces.csv", sep="\t")
column_count = column_forces.section.value_counts()
num_of_column = len(column_count)

def plot_interaction_diagram(sectionid):
	#1. prepare data
    moment_x1 = column_forces[column_forces["section"] == sectionid].My
    moment_y = column_forces[column_forces["section"] == sectionid].Pu
    
    interaction_filename = "results/"+ sectionid +'.csv'
    interaction_data = pd.read_csv(interaction_filename, sep="\t")
    interaction_h_x = interaction_data["phiMn"]
    interaction_h_y = interaction_data["phiPn"]
    
    figy, axy = plt.subplots(figsize=(10,10))
    axy.scatter(moment_x1,moment_y)
    axy.plot(interaction_h_x,interaction_h_y)
    axy.set(title="Interaction Diagram", xlabel="My, kN-m", ylabel="Pu, kN")

    plt.ylim(bottom=0)
    plt.xlim(left=0)
    
    #Moment about B
    moment_x2 = column_forces[column_forces["section"] == sectionid].Mz
    interaction_b_x = interaction_data["phiMnb"]
    interaction_b_y = interaction_data["phiPnb"]
    figz, axz = plt.subplots(figsize=(10,10))
    axz.scatter(moment_x2,moment_y)
    axz.plot(interaction_b_x,interaction_b_y)
    axz.set(title="Interaction Diagram", xlabel="Mz, kN-m", ylabel="Pu, kN")
    
    plt.ylim(bottom=0)
    plt.xlim(left=0)
    
    figy.savefig("results/"+sectionid + "-My-Pu.png")
    figz.savefig("results/"+sectionid + "-Mz-Pu.png")
    
    shear_h = column_forces[column_forces["section"] == sectionid].Sy
    shear_b = column_forces[column_forces["section"] == sectionid].Sz
    
    phiVh = interaction_data.phiVh[1]
    phiVb = interaction_data.phiVb[1]
    print(shear_b)
    print(phiVb)
    
    naturalized_shear_h = abs(shear_h/phiVh)
    naturalized_shear_b = abs(shear_b/phiVh)
    
    print(naturalized_shear_b)
    
    figshear, ax_shear = plt.subplots(figsize=(10,10))
    ax_shear.scatter(naturalized_shear_h,naturalized_shear_b)
    ax_shear.plot([0,1],[1,0])
    ax_shear.set(title="Shear Envelope Diagram", xlabel="Shear y, kN-m", ylabel="Shear z, kN")

    plt.ylim(bottom=0)
    plt.xlim(left=0)
    figshear.savefig("results/"+sectionid + "-shear-envelope.png")


plot_interaction_diagram("column1")
plot_interaction_diagram("column2")
plot_interaction_diagram("column3")
plot_interaction_diagram("column4")
plot_interaction_diagram("column5")
plot_interaction_diagram("column6")
plot_interaction_diagram("column7")
plot_interaction_diagram("column8")
plot_interaction_diagram("column9")
plot_interaction_diagram("column10")
plot_interaction_diagram("column11")
plot_interaction_diagram("column12")
