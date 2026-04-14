import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

const chartStyle = {
    backgroundColor : '#ffffff',
    padding :'20px',
    borderRadius : '16px',
    boxShadow : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    height : '400px',
    marginTop : '20px'
}

function StockChart({data, symbol}) {
    if (!data || data.length ===0 ){
        return <div style={{ textAlign: 'center',height: '400px',padding: '100px',color:'#6b7280'}}></div>
    }

    const formateXAxis = (tickItem) => {
        if (!tickItem) return '';
        const date = new Date(tickItem);
        return `${date.getMonth()+1}/${date.getDate()}`
    }

    return (
        <div style={chartStyle}>
            <h3 style={{ margin:'0 0 20px 0',fontSize:'18px',color:'#111827'}}>{symbol}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data} margin={{top: 10,right: 30,left: 0,bottom: 0}}>
                    <CartesianGrid/>
                    <XAxis 
                    dataKey="date"          
                    tickFormatter={formateXAxis} 
                    stroke='#6b7280' 
                    fontSize={10} 
                    tickLine={false}        
                    axisLine={false} 
                    minTickGap={30}          // 💡 防止日期太擠堆疊在一起
                    />                     
                    <YAxis domain={['auto','auto']} tickFormatter={(value)=>`$${value}`} stroke= '#6b7280' fontSize={10}/>
                    <Tooltip 
                        contentStyle= {{borderRadius: '8px',border:'none',boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15'}}
                        labelFormatter={(Label) => `日期：${new Date (Label).toLocaleDateString()}`}
                        formatter={(value) => [`$${value}`,'收盤價']}
                    />

                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorClose)"
                    />

                    <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default StockChart;