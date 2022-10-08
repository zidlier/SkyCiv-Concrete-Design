var prettyPrint = function(val) {
	if (typeof val == 'undefined' || val == null) return '-'
	val = parseFloat(val)
	if (isNaN(val)) return
	return val.toFixed(3);
}

const liquid_unit_weight = 13.7
const concrete_unit_weight = 23.6
const Na = 1.08
const Nv =1.36
const Cv = 0.870
const Ca = 0.475
const Z = 0.4
const I = 1.5
var Ti = 0.09
var Ts = 0.4*(Cv/Ca)
// From table 4.1.1(b)
const Ri = 3.0
const Rc = 1.0
var Ci = (Ti <= Ts) ? 2.5*Ca : Cv/Ti
Ci = (Z == 0.4) ? Math.min(1.6*Z*Nv,Ci): Ci
var tank_z_dim = 10
var tank_x_dim = 13.5
var HL = 4.7
var hr = 5.425
var hw = 2.675
var tw = 0.4
var Wr_total = 271
var Ww_total
var free_space = 5.35-HL
let Lx = 11.8
let Lz = 7.8
let L_HL_z = Lz/HL
let L_HL_x = Lx/HL
let epsilon_whole_z = calculateEffectiveMassEpsilon(L_HL_z)
let Pr = (Ci*I*epsilon_whole_z*Wr_total)/Ri

function calculateEffectiveMassEpsilon(L_HL) {
    // effective mass coefficient
    let epsilon = 0.0151*(L_HL*L_HL) - 0.1908*(L_HL) + 1.021
    epsilon = Math.min(1, epsilon)
    return epsilon  
}

function calculateLambda(HL_L) {
    let lambda = Math.pow(3.16*32.2*Math.tanh(3.16*HL_L),0.5)
    console.log(2*Math.PI/lambda)
    return lambda
}

calculateLambda(1/6)


let z_num = 1
let result = []
let Pc_sum = 0
let Pi_sum = 0

function calculateSeismicForcesTank (lengthOfTankInside, widthOfTank, wallThickness, weightLiquid) {
    let tw = wallThickness
    let L = lengthOfTankInside
    let B = widthOfTank
    var weight_of_liquid = (weightLiquid) ? weightLiquid : L*B*liquid_unit_weight*HL
    var weight_of_wall = ((L+tw*2)*(B+2*tw) - L*B)*concrete_unit_weight
    let WL = weight_of_liquid
    let L_HL = L/HL
    let HL_L = HL/L
    // calculate convective component Cc - TODO
    let lambda = calculateLambda(HL_L)
    let pi_lambda = (2*Math.PI/lambda)
    let Tc = (2*Math.PI/lambda)*Math.sqrt(L)
    var Cc = (Tc <= 1.6/Ts) ? Math.min(1.5*Cv/Tc, 3.75*Ca) : (6*Ca)/(Tc*Tc)
    // calculate epsilon
    let dmax = L*0.5*Cc*I
    let note = (dmax >= free_space) ? 'calculate acceleration' : 'freeboard ok!'
    
    // console.log(`Chamber ${z_num}: L = ${prettyPrint(L)}m B=${prettyPrint(B)}m free = ${prettyPrint(free_space)}m dmax = ${prettyPrint(dmax)}m diff: ${prettyPrint(dmax-free_space)}m Cc:${prettyPrint(Cc)}`)

    let Wi_WL = Math.tanh(0.866*L_HL)/(0.866*L_HL)
    let Wi = Wi_WL*weight_of_liquid
    let Wc_WL = 0.264*L_HL*Math.tanh(3.16*HL_L)
    let Wc = Wc_WL*weight_of_liquid
    // height to center of gravity EBB
    let hi_HL = (L_HL < 1.333) ? 0.5-0.09375*L_HL : 0.375
    let hi = hi_HL*HL
    let hc_HL = 1 - ((Math.cosh(3.16*HL_L)-1)/(3.16*HL_L*Math.sinh(3.16*HL_L)))
    let hc = HL*hc_HL
    // height to center of gravity IBP
    let hiprime_HL = (L_HL < 0.75) ? 0.45 : ((0.866*L_HL)/(2*Math.tanh(0.866*L_HL))) - (1/8)
    let hiprime = hiprime_HL*HL
    let hcprime_HL = 1 - (Math.cosh(3.16*HL_L)-2.01)/(3.16*HL_L*Math.sinh(3.16*HL_L))
    let hcprime = HL*hcprime_HL
    // effective mass coefficient
    let epsilon = calculateEffectiveMassEpsilon(L_HL)
    let Pi = (Ti <= Ts) ? (2.5*Ca*I*Wi)/Ri : Math.max( (Cv*I*Wi)/(Ri*Ti), 0.56*Ca*I*Wi)
    Pi = Math.max(Pi, (1.6*Z*Nv*I*Wi)/Ri)
    let Pc = (Tc > 1.6/Ts) ? Math.min((6*Ca*I*Wc)/(Rc*Tc*Tc), (1.5*2.5*Ca*I*Wc)/Rc) : (1.5*Cv*I*Wc)/(Rc*Tc)

    let res = {
        'Chamber': z_num,
        L: prettyPrint(L),
        HL: prettyPrint(HL),
        B: prettyPrint(B),
        WL: prettyPrint(WL),
        Wi: prettyPrint(Wi),
        Wc: prettyPrint(Wc),
        '2pi_lambda': prettyPrint(pi_lambda),
        lambda: prettyPrint(lambda),
        Tc: prettyPrint(Tc),
        Cc: prettyPrint(Cc),
        epsilon: prettyPrint(epsilon),
        hi: prettyPrint(hi),
        hiprime: prettyPrint(hiprime),
        Pi: prettyPrint(Pi),
        hc: prettyPrint(hc),
        hcprime: prettyPrint(hcprime),
        Pc: prettyPrint(Pc),
        dmax: prettyPrint(dmax),
    }
    result.push(res)
    Pc_sum += Pc
    Pi_sum += Pi
    
    z_num++

    return res
}



console.log(calculateSeismicForcesTank(7.8,11.8,0.4, 6064))

// ALONG Z DIRECTION
console.log('For Along Z-direction - Seismic 1 and 3')
z_num = 1
result=[]
Pc_sum = 0
Pi_sum = 0

calculateSeismicForcesTank(3.3,3.3,0.4)
calculateSeismicForcesTank(3.3,3.4,0.4)
calculateSeismicForcesTank(3.3,3,0.4)
calculateSeismicForcesTank(3.3,3.3,0.4)
calculateSeismicForcesTank(3.3,3.4,0.4)
calculateSeismicForcesTank(3.3,3,0.4)
calculateSeismicForcesTank(2,1.22,0.4)
calculateSeismicForcesTank(1.9,1.9,0.4)
calculateSeismicForcesTank(1.9,1.9,0.4)
calculateSeismicForcesTank(0.8,1.9,0.4)
calculateSeismicForcesTank(2.5,1.9,0.4)
calculateSeismicForcesTank(0.8,0.8,0.4)
calculateSeismicForcesTank(0.8,0.8,0.4)
calculateSeismicForcesTank(0.8,0.8,0.4)
calculateSeismicForcesTank(2,4.3,0.4)
calculateSeismicForcesTank(2,4.3,0.4)
console.table(result)
console.log(`Pc total = ${Pc_sum}  \tPi total = ${Pi_sum} \tP = ${Pc_sum+Pi_sum}`)


// along X-direction
console.log('For Along X-direction - Seismic 2 and 4')
z_num = 1
result=[]
Pc_sum = 0
Pi_sum = 0

calculateSeismicForcesTank(3.3,3.3,0.4)
calculateSeismicForcesTank(3.4,3.3,0.4)
calculateSeismicForcesTank(3,3.3,0.4)
calculateSeismicForcesTank(3.3,3.3,0.4)
calculateSeismicForcesTank(3.4,3.3,0.4)
calculateSeismicForcesTank(3,3.3,0.4)
calculateSeismicForcesTank(1.2,2,0.4)
calculateSeismicForcesTank(1.9,1.9,0.4)
calculateSeismicForcesTank(1.9,1.9,0.4)
calculateSeismicForcesTank(1.9,0.8,0.4)
calculateSeismicForcesTank(1.9,2.5,0.4)
calculateSeismicForcesTank(0.8,0.8,0.4)
calculateSeismicForcesTank(0.8,0.8,0.4)
calculateSeismicForcesTank(4.3,2,0.4)
calculateSeismicForcesTank(4.3,2,0.4)
console.table(result)
console.log(`Pc total = ${Pc_sum}  \tPi total = ${Pi_sum} \tP = ${Pc_sum+Pi_sum}`)