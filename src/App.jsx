import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// --- Reusable SVG Icon Components ---
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m11.5 0A5 5 0 0013 11.857m-3.5 0A5 5 0 007 11.857m-3.5 0A5 5 0 017 5.143m3.5 0A5 5 0 0113 5.143m0 0A5 5 0 0117 8.143" /></svg>
);
const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);
const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);


// --- Main App Component ---
const App = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kpi, setKpi] = useState(null);

    useEffect(() => {
        d3.csv("adult.csv").then(loadedData => {
            // --- Data Cleaning and Preparation ---
            loadedData.forEach(d => {
                d.age = +d.age;
                d['hours.per.week'] = +d['hours.per.week'];
                d['education.num'] = +d['education.num'];
                d['capital.gain'] = +d['capital.gain'];
                d['capital.loss'] = +d['capital.loss'];
                d.income = d.income ? d.income.trim() : 'N/A';
                d.education = d.education ? d.education.trim() : 'N/A';
                d.occupation = d.occupation ? d.occupation.trim() : 'N/A';
                d.sex = d.sex ? d.sex.trim() : 'N/A';
                d['marital.status'] = d['marital.status'] ? d['marital.status'].trim() : 'N/A';
            });
            setData(loadedData);

            // --- Calculate KPIs ---
            const total = loadedData.length;
            const highIncomeCount = loadedData.filter(d => d.income === '>50K').length;
            const medianAge = d3.median(loadedData, d => d.age);
            setKpi({
                total,
                highIncomePercent: (highIncomeCount / total) * 100,
                medianAge
            });

            setLoading(false);
        }).catch(err => {
            console.error("Error loading or parsing data:", err);
            setError("Could not load the dataset. Please ensure 'adult.csv' is in the 'public' folder.");
            setLoading(false);
        });
    }, []);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-gray-50 p-4 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* --- Header --- */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Income Analysis Dashboard</h1>
                    <p className="text-gray-600 mt-2">An interactive exploration of the Adult Census Dataset to identify factors correlated with income levels.</p>
                </header>

                {loading && <div className="text-center p-8 bg-white rounded-lg shadow">Loading interactive charts...</div>}
                {error && <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg shadow">{error}</div>}
                
                {data && kpi && (
                    <>
                        {/* --- KPI Cards --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <KpiCard title="Total Individuals" value={kpi.total.toLocaleString()} icon={<UsersIcon />} />
                            <KpiCard title="High-Income Rate" value={`${kpi.highIncomePercent.toFixed(1)}%`} icon={<TrendingUpIcon />} />
                            <KpiCard title="Median Age" value={kpi.medianAge} icon={<UserCircleIcon />} />
                        </div>
                        
                        {/* --- Data Description --- */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                           <h2 className="text-xl font-semibold text-gray-800 mb-2">About the Data</h2>
                           <p className="text-gray-700">
                               This dashboard visualizes the "Adult" dataset from the UCI Machine Learning Repository. Each row represents an individual, and the primary goal is to understand which factors—such as education, occupation, age, and marital status—are most strongly correlated with an individual earning more or less than $50,000 per year. The charts below break down these relationships.
                           </p>
                        </div>

                        {/* --- Charts Grid --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           <ChartContainer title="Overall Income Distribution" size="lg:col-span-1">
                               <IncomeDistributionChart data={data} />
                           </ChartContainer>
                           <ChartContainer title="High Income Rate by Education" size="lg:col-span-2">
                               <EducationChart data={data} />
                           </ChartContainer>
                           <ChartContainer title="High Income Rate by Sex" size="lg:col-span-1">
                               <SexChart data={data} />
                           </ChartContainer>
                           <ChartContainer title="High Income Rate by Marital Status" size="lg:col-span-2">
                               <MaritalStatusChart data={data} />
                           </ChartContainer>
                           <ChartContainer title="Income Distribution by Age" size="lg:col-span-3">
                               <AgeChart data={data} />
                           </ChartContainer>
                           <ChartContainer title="Distribution of Capital Gains by Income" size="lg:col-span-3">
                               <CapitalGainsChart data={data} />
                           </ChartContainer>
                           <ChartContainer title="High Income Rate by Occupation" size="lg:col-span-3">
                               <OccupationChart data={data} />
                           </ChartContainer>
                        </div>
                    </>
                )}
            </div>
            <Tooltip />
            <Chatbot />
        </div>
    );
};

// --- Reusable Components ---

const KpiCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:scale-105">
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const ChartContainer = ({ title, children, size }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl ${size}`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="w-full h-full">{children}</div>
    </div>
);

const Tooltip = () => (
    <div id="tooltip" className="absolute text-center p-2 text-sm bg-gray-800 text-white rounded-md pointer-events-none opacity-0 transition-opacity duration-200 z-10"></div>
);

// --- Chatbot Component ---
const Chatbot = () => {
    // ... (Chatbot code remains the same as previous version)
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "Hello! I'm your data guide. Ask me about the charts or for a key insight. Type 'help' to see what I can answer." }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatBodyRef = useRef(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);
    
    const getBotResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase().trim();
        if (lowerInput.includes('help')) return "You can ask me to explain charts like: 'What does the age chart show?', 'Tell me about capital gains', or ask for a 'key takeaway'.";
        if (lowerInput.includes('age')) return "The 'Income Distribution by Age' chart shows that the median age for individuals earning >$50K is higher than for those earning <=$50K. The box represents the middle 50% of people in each group.";
        if (lowerInput.includes('education')) return "The 'High Income Rate by Education Level' bar chart shows a strong trend: more education is highly correlated with a higher income rate.";
        if (lowerInput.includes('sex')) return "The 'High Income Rate by Sex' chart shows the percentage of men and women earning over $50K. It reveals a significant disparity between the two groups in this dataset.";
        if (lowerInput.includes('marital status')) return "This chart shows that individuals with a 'Married-civ-spouse' status have a substantially higher rate of earning >$50K compared to all other categories.";
        if (lowerInput.includes('capital gain')) return "This chart shows the distribution of capital gains. Notice that while most individuals in both income groups have zero gains, the >$50K group contains almost all of the individuals with significant capital gains, indicating a link between investment income and high earnings.";
        if (lowerInput.includes('occupation')) return "This chart ranks jobs by the percentage of workers earning >$50K. 'Exec-managerial' and 'Prof-specialty' roles have the highest rates of high-income earners.";
        if (lowerInput.includes('takeaway') || lowerInput.includes('insight')) return "A key insight is that being married, having a higher education level, and working in a managerial or professional specialty are the strongest predictors of earning over $50K in this dataset.";
        return "I'm sorry, I'm not sure how to answer that. Type 'help' to see example questions.";
    };
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        const botResponseText = getBotResponse(inputValue);
        const botMessage = { sender: 'bot', text: botResponseText };
        setTimeout(() => setMessages(prev => [...prev, botMessage]), 500);
        setInputValue('');
    };

    return (
        <>
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110 z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
            )}
            {isOpen && (
                <div className="fixed bottom-5 right-5 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col transition-all z-50">
                    <div className="flex justify-between items-center p-3 bg-blue-500 text-white rounded-t-lg">
                        <h3 className="font-semibold">Data Guide</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                                <div className={`py-2 px-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>{msg.text}</div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-lg">
                        <div className="flex">
                            <input type="text" placeholder="Ask a question..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button type="submit" className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600">Send</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

// --- D3 Chart Components ---

// Chart 1: Income Distribution (Pie Chart)
const IncomeDistributionChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const incomeCounts = d3.rollup(data, v => v.length, d => d.income);
        const incomeData = Array.from(incomeCounts, ([key, value]) => ({ key, value }));
        
        const width = 250, height = 250, margin = 10;
        const radius = Math.min(width, height) / 2 - margin;
        
        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width} ${height}`).html("").append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
        const color = d3.scaleOrdinal().domain(incomeData.map(d => d.key)).range(["#60a5fa", "#f472b6"]);
        const pie = d3.pie().value(d => d.value).sort(null);
        const data_ready = pie(incomeData);
        const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
        const tooltip = d3.select("#tooltip");

        svg.selectAll('path').data(data_ready).enter().append('path').attr('d', arc).attr('fill', d => color(d.data.key)).attr("stroke", "white").style("stroke-width", "2px")
            .on("mouseover", (event, d) => { tooltip.style("opacity", 1); d3.select(event.currentTarget).transition().duration(200).attr('d', d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 1.1)); })
            .on("mousemove", (event, d) => {
                const total = d3.sum(incomeData, d => d.value); const percent = (d.data.value / total * 100).toFixed(1);
                tooltip.html(`<b>${d.data.key}</b><br>${d.data.value.toLocaleString()} (${percent}%)`).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event, d) => { tooltip.style("opacity", 0); d3.select(event.currentTarget).transition().duration(200).attr('d', arc); });
    }, [data]);
    return <div className="flex justify-center items-center h-full"><svg ref={svgRef}></svg></div>;
};

// Chart 2: Education vs. Income
const EducationChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const educationGroups = d3.group(data, d => d.education);
        let educationRates = Array.from(educationGroups, ([education, values]) => ({ education, rate: values.filter(d => d.income === '>50K').length / values.length, total: values.length, educationNum: values[0]['education.num'] })).sort((a, b) => a.educationNum - b.educationNum);

        const margin = {top: 20, right: 30, bottom: 100, left: 60};
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).html("").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const x = d3.scaleBand().range([0, width]).domain(educationRates.map(d => d.education)).padding(0.2);
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text").attr("transform", "translate(-10,0)rotate(-45)").style("text-anchor", "end").style("font-size", "11px");
        const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".0%"))).style("font-size", "11px");
        
        const tooltip = d3.select("#tooltip");
        svg.selectAll("rect").data(educationRates).enter().append("rect").attr("x", d => x(d.education)).attr("y", y(0)).attr("width", x.bandwidth()).attr("height", 0).attr("fill", "#60a5fa")
            .on("mouseover", (event, d) => { tooltip.style("opacity", 1); d3.select(event.currentTarget).attr("fill", "#3b82f6"); })
            .on("mousemove", (event, d) => tooltip.html(`<b>${d.education}</b><br>High Income: ${(d.rate * 100).toFixed(1)}%`).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"))
            .on("mouseout", (event, d) => { tooltip.style("opacity", 0); d3.select(event.currentTarget).attr("fill", "#60a5fa"); })
            .transition().duration(750).attr("y", d => y(d.rate)).attr("height", d => height - y(d.rate));
    }, [data]);
    return <svg ref={svgRef}></svg>;
};

// --- NEW CHARTS ---

// Chart 3: High Income Rate by Sex
const SexChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const sexGroups = d3.group(data, d => d.sex);
        let sexRates = Array.from(sexGroups, ([sex, values]) => ({ sex, rate: values.filter(d => d.income === '>50K').length / values.length })).sort((a,b) => b.rate - a.rate);

        const margin = {top: 20, right: 30, bottom: 40, left: 60};
        const width = 300 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).html("").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const x = d3.scaleBand().range([0, width]).domain(sexRates.map(d => d.sex)).padding(0.4);
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).style("font-size", "11px");
        const y = d3.scaleLinear().domain([0, d3.max(sexRates, d => d.rate)]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".0%"))).style("font-size", "11px");

        const tooltip = d3.select("#tooltip");
        svg.selectAll("rect").data(sexRates).enter().append("rect").attr("x", d => x(d.sex)).attr("y", y(0)).attr("width", x.bandwidth()).attr("height", 0).attr("fill", d => d.sex === 'Male' ? "#818cf8" : "#f472b6")
            .on("mouseover", (event, d) => { tooltip.style("opacity", 1); d3.select(event.currentTarget).attr("fill", d => d.sex === 'Male' ? "#6366f1" : "#ec4899"); })
            .on("mousemove", (event, d) => tooltip.html(`<b>${d.sex}</b><br>High Income: ${(d.rate * 100).toFixed(1)}%`).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"))
            .on("mouseout", (event, d) => { tooltip.style("opacity", 0); d3.select(event.currentTarget).attr("fill", d => d.sex === 'Male' ? "#818cf8" : "#f472b6"); })
            .transition().duration(750).attr("y", d => y(d.rate)).attr("height", d => height - y(d.rate));
    }, [data]);
    return <svg ref={svgRef}></svg>;
};


// Chart 4: High Income Rate by Marital Status
const MaritalStatusChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const maritalGroups = d3.group(data, d => d['marital.status']);
        let maritalRates = Array.from(maritalGroups, ([status, values]) => ({ status, rate: values.filter(d => d.income === '>50K').length / values.length })).sort((a,b) => a.rate - b.rate);

        const margin = {top: 20, right: 30, bottom: 40, left: 150};
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).html("").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const y = d3.scaleBand().range([height, 0]).domain(maritalRates.map(d => d.status)).padding(0.2);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "11px");
        const x = d3.scaleLinear().domain([0, d3.max(maritalRates, d => d.rate)]).range([0, width]);
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format(".0%"))).style("font-size", "11px");

        const tooltip = d3.select("#tooltip");
        svg.selectAll("rect").data(maritalRates).enter().append("rect").attr("y", d => y(d.status)).attr("x", x(0)).attr("height", y.bandwidth()).attr("width", 0).attr("fill", "#2dd4bf")
            .on("mouseover", (event, d) => { tooltip.style("opacity", 1); d3.select(event.currentTarget).attr("fill", "#14b8a6"); })
            .on("mousemove", (event, d) => tooltip.html(`<b>${d.status}</b><br>High Income: ${(d.rate * 100).toFixed(1)}%`).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"))
            .on("mouseout", (event, d) => { tooltip.style("opacity", 0); d3.select(event.currentTarget).attr("fill", "#2dd4bf"); })
            .transition().duration(750).attr("width", d => x(d.rate));
    }, [data]);
    return <svg ref={svgRef}></svg>;
};

// Chart 5: Capital Gains Distribution
const CapitalGainsChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const gainsData = data.filter(d => d['capital.gain'] > 0);
        
        const margin = {top: 20, right: 30, bottom: 50, left: 60};
        const width = 1100 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).html("").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        
        const y = d3.scaleBand().range([height, 0]).domain(["<=50K", ">50K"]).padding(.1);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");
        
        const x = d3.scaleLinear().domain([0, 100000]).range([0, width]);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x).tickFormat(d3.format("$,.0f"))).style("font-size", "12px");
        svg.append("text").attr("text-anchor", "middle").attr("x", width/2).attr("y", height + margin.top + 20).text("Capital Gain").style("font-size", "12px");

        const sumstat = d3.rollup(gainsData, d => {
            const q1 = d3.quantile(d.map(g => g['capital.gain']).sort(d3.ascending), .25);
            const median = d3.quantile(d.map(g => g['capital.gain']).sort(d3.ascending), .5);
            const q3 = d3.quantile(d.map(g => g['capital.gain']).sort(d3.ascending), .75);
            return {q1, median, q3, min: d3.min(d, g => g['capital.gain']), max: d3.max(d, g => g['capital.gain'])};
        }, d => d.income);

        const sumstatArray = Array.from(sumstat, ([key, value]) => ({ key, value }));

        svg.selectAll("vertLines").data(sumstatArray).enter().append("line").attr("y1", d => y(d.key) + y.bandwidth()/2).attr("y2", d => y(d.key) + y.bandwidth()/2).attr("x1", d => x(d.value.min)).attr("x2", d => x(d.value.max)).attr("stroke", "black").style("width", 40);
        svg.selectAll("boxes").data(sumstatArray).enter().append("rect").attr("y", d => y(d.key)).attr("x", d => x(d.value.q1)).attr("width", d => (x(d.value.q3) - x(d.value.q1))).attr("height", y.bandwidth()).attr("stroke", "black").style("fill", "#fb923c");
        svg.selectAll("medianLines").data(sumstatArray).enter().append("line").attr("y1", d => y(d.key)).attr("y2", d => y(d.key) + y.bandwidth()).attr("x1", d => x(d.value.median)).attr("x2", d => x(d.value.median)).attr("stroke", "black").style("width", 80);

    }, [data]);
    return <svg ref={svgRef}></svg>;
};


// --- Original Charts (Adjusted for new layout) ---

const AgeChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const margin = {top: 20, right: 30, bottom: 50, left: 60};
        const width = 1100 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;
        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).html("").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        
        const y = d3.scaleBand().range([height, 0]).domain(["<=50K", ">50K"]).padding(.1);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");
        const x = d3.scaleLinear().domain([15, 95]).range([0, width]);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).style("font-size", "12px");
        svg.append("text").attr("text-anchor", "middle").attr("x", width/2).attr("y", height + margin.top + 20).text("Age").style("font-size", "12px");
        
        const sumstat = d3.rollup(data, d => ({ q1: d3.quantile(d.map(g => g.age).sort(d3.ascending), .25), median: d3.quantile(d.map(g => g.age).sort(d3.ascending), .5), q3: d3.quantile(d.map(g => g.age).sort(d3.ascending), .75), min: d3.min(d, g => g.age), max: d3.max(d, g => g.age) }), d => d.income);
        const sumstatArray = Array.from(sumstat, ([key, value]) => ({ key, value }));

        svg.selectAll("vertLines").data(sumstatArray).enter().append("line").attr("y1", d => y(d.key) + y.bandwidth()/2).attr("y2", d => y(d.key) + y.bandwidth()/2).attr("x1", d => x(d.value.min)).attr("x2", d => x(d.value.max)).attr("stroke", "black").style("width", 40);
        svg.selectAll("boxes").data(sumstatArray).enter().append("rect").attr("y", d => y(d.key)).attr("x", d => x(d.value.q1)).attr("width", d => (x(d.value.q3) - x(d.value.q1))).attr("height", y.bandwidth()).attr("stroke", "black").style("fill", "#60a5fa");
        svg.selectAll("medianLines").data(sumstatArray).enter().append("line").attr("y1", d => y(d.key)).attr("y2", d => y(d.key) + y.bandwidth()).attr("x1", d => x(d.value.median)).attr("x2", d => x(d.value.median)).attr("stroke", "black").style("width", 80);
    }, [data]);
    return <svg ref={svgRef}></svg>;
};

const OccupationChart = ({ data }) => {
    const svgRef = useRef();
    useEffect(() => {
        if (!data) return;
        const occupationData = data.filter(d => d.occupation && d.occupation !== '?');
        const occupationGroups = d3.group(occupationData, d => d.occupation);
        let occupationRates = Array.from(occupationGroups, ([occupation, values]) => ({ occupation, rate: values.filter(d => d.income === '>50K').length / values.length })).sort((a, b) => b.rate - a.rate);

        const margin = {top: 20, right: 30, bottom: 40, left: 120};
        const width = 1100 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current).attr("width", "100%").attr("height", "100%").attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`).html("").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        
        const y = d3.scaleBand().range([0, height]).domain(occupationRates.map(d => d.occupation)).padding(0.1);
        svg.append("g").call(d3.axisLeft(y)).style("font-size", "12px");
        const x = d3.scaleLinear().domain([0, d3.max(occupationRates, d => d.rate)]).range([0, width]);
        svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format(".0%"))).style("font-size", "12px");
        
        const tooltip = d3.select("#tooltip");
        svg.selectAll("rect").data(occupationRates).enter().append("rect").attr("y", d => y(d.occupation)).attr("x", 0).attr("height", y.bandwidth()).attr("width", 0).attr("fill", "#818cf8")
            .on("mouseover", (event, d) => { tooltip.style("opacity", 1); d3.select(event.currentTarget).attr("fill", "#6366f1"); })
            .on("mousemove", (event, d) => tooltip.html(`<b>${d.occupation}</b><br>High Income: ${(d.rate * 100).toFixed(1)}%`).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"))
            .on("mouseout", (event, d) => { tooltip.style("opacity", 0); d3.select(event.currentTarget).attr("fill", "#818cf8"); })
            .transition().duration(750).attr("width", d => x(d.rate));
    }, [data]);
    return <svg ref={svgRef}></svg>;
};

export default App;

